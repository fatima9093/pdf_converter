"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../lib/database"));
const router = express_1.default.Router();
// Helper function to convert frontend enum values to database enum values
const convertLogType = (frontendType) => {
    const typeMapping = {
        'conversion_error': 'CONVERSION_ERROR',
        'login_failure': 'LOGIN_FAILURE',
        'system_error': 'SYSTEM_ERROR',
        'security_alert': 'SECURITY_ALERT',
        'user_action': 'USER_ACTION',
        'api_error': 'API_ERROR'
    };
    return typeMapping[frontendType] || frontendType.toUpperCase();
};
const convertLogSeverity = (frontendSeverity) => {
    const severityMapping = {
        'low': 'LOW',
        'medium': 'MEDIUM',
        'high': 'HIGH',
        'critical': 'CRITICAL'
    };
    return severityMapping[frontendSeverity] || frontendSeverity.toUpperCase();
};
// Get system logs with filtering and pagination (admin only)
router.get('/admin/logs', auth_1.authenticate, auth_1.adminOnly, async (req, res) => {
    try {
        const { type, severity, search, limit = '50', offset = '0', startDate, endDate } = req.query;
        // Build where clause for filtering
        const where = {};
        if (type && type !== 'all') {
            where.type = convertLogType(type);
        }
        if (severity && severity !== 'all') {
            where.severity = convertLogSeverity(severity);
        }
        if (search) {
            where.OR = [
                { message: { contains: search, mode: 'insensitive' } },
                { details: { contains: search, mode: 'insensitive' } },
                { userEmail: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                where.createdAt.lte = new Date(endDate);
            }
        }
        // Get logs with pagination
        console.log('Fetching logs with params:', { limit, offset, where });
        const logs = await database_1.default.systemLog.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: parseInt(limit),
            skip: parseInt(offset)
        });
        // Get total count for pagination
        const totalCount = await database_1.default.systemLog.count({ where });
        console.log('Query results:', {
            logsCount: logs.length,
            totalCount,
            limit: parseInt(limit),
            offset: parseInt(offset)
        });
        // Transform logs to match frontend interface
        const transformedLogs = logs.map((log) => ({
            id: log.id,
            type: log.type.toLowerCase(),
            message: log.message,
            details: log.details,
            userId: log.userId,
            userEmail: log.userEmail || log.user?.email,
            timestamp: log.createdAt,
            severity: log.severity.toLowerCase(),
            ipAddress: log.ipAddress,
            userAgent: log.userAgent
        }));
        res.json({
            success: true,
            data: {
                logs: transformedLogs,
                total: totalCount,
                hasMore: (parseInt(offset) + parseInt(limit)) < totalCount
            }
        });
    }
    catch (error) {
        console.error('Failed to fetch system logs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch system logs'
        });
    }
});
// Get system log by ID (admin only)
router.get('/admin/logs/:id', auth_1.authenticate, auth_1.adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const log = await database_1.default.systemLog.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        if (!log) {
            return res.status(404).json({
                success: false,
                error: 'Log not found'
            });
        }
        const transformedLog = {
            id: log.id,
            type: log.type.toLowerCase(),
            message: log.message,
            details: log.details,
            userId: log.userId,
            userEmail: log.userEmail || log.user?.email,
            timestamp: log.createdAt,
            severity: log.severity.toLowerCase(),
            ipAddress: log.ipAddress,
            userAgent: log.userAgent
        };
        res.json({
            success: true,
            data: transformedLog
        });
    }
    catch (error) {
        console.error('Failed to fetch system log:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch system log'
        });
    }
});
// Delete system log (admin only)
router.delete('/admin/logs/:id', auth_1.authenticate, auth_1.adminOnly, async (req, res) => {
    try {
        const { id } = req.params;
        const log = await database_1.default.systemLog.findUnique({
            where: { id }
        });
        if (!log) {
            return res.status(404).json({
                success: false,
                error: 'Log not found'
            });
        }
        await database_1.default.systemLog.delete({
            where: { id }
        });
        res.json({
            success: true,
            message: 'Log deleted successfully'
        });
    }
    catch (error) {
        console.error('Failed to delete system log:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete system log'
        });
    }
});
// Delete multiple system logs (admin only)
router.delete('/admin/logs', auth_1.authenticate, auth_1.adminOnly, async (req, res) => {
    try {
        const { logIds } = req.body;
        if (!Array.isArray(logIds) || logIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'logIds must be a non-empty array'
            });
        }
        const deleteResult = await database_1.default.systemLog.deleteMany({
            where: {
                id: {
                    in: logIds
                }
            }
        });
        res.json({
            success: true,
            message: `${deleteResult.count} log(s) deleted successfully`
        });
    }
    catch (error) {
        console.error('Failed to delete system logs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete system logs'
        });
    }
});
// Get system log statistics (admin only)
router.get('/admin/logs/stats', auth_1.authenticate, auth_1.adminOnly, async (req, res) => {
    try {
        const { timeRange = '7d' } = req.query;
        // Calculate date range
        const now = new Date();
        const startDate = new Date();
        switch (timeRange) {
            case '1d':
                startDate.setDate(now.getDate() - 1);
                break;
            case '7d':
                startDate.setDate(now.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(now.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(now.getDate() - 90);
                break;
            default:
                startDate.setDate(now.getDate() - 7);
        }
        // Get severity statistics
        const severityStats = await database_1.default.systemLog.groupBy({
            by: ['severity'],
            where: {
                createdAt: {
                    gte: startDate
                }
            },
            _count: {
                severity: true
            }
        });
        // Get type statistics
        const typeStats = await database_1.default.systemLog.groupBy({
            by: ['type'],
            where: {
                createdAt: {
                    gte: startDate
                }
            },
            _count: {
                type: true
            }
        });
        // Get daily log counts
        const dailyLogs = await database_1.default.$queryRaw `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM system_logs 
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;
        const transformedDailyLogs = dailyLogs.map(day => ({
            date: day.date.toISOString().split('T')[0],
            count: Number(day.count)
        }));
        // Transform statistics
        const severityCounts = {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
        };
        severityStats.forEach((stat) => {
            const severity = stat.severity.toLowerCase();
            if (severity in severityCounts) {
                severityCounts[severity] = stat._count.severity;
            }
        });
        const typeCounts = {
            conversion_error: 0,
            login_failure: 0,
            system_error: 0,
            security_alert: 0,
            user_action: 0,
            api_error: 0
        };
        typeStats.forEach((stat) => {
            const type = stat.type.toLowerCase();
            if (type in typeCounts) {
                typeCounts[type] = stat._count.type;
            }
        });
        res.json({
            success: true,
            data: {
                severityCounts,
                typeCounts,
                dailyLogs: transformedDailyLogs,
                totalLogs: severityStats.reduce((sum, stat) => sum + stat._count.severity, 0)
            }
        });
    }
    catch (error) {
        console.error('Failed to fetch system log statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch system log statistics'
        });
    }
});
// Test endpoint to create sample logs (for debugging pagination)
router.post('/admin/logs/test', auth_1.authenticate, auth_1.adminOnly, async (req, res) => {
    try {
        const testLogs = [];
        // Create 25 test logs with different types and severities
        for (let i = 1; i <= 25; i++) {
            const logTypes = ['CONVERSION_ERROR', 'LOGIN_FAILURE', 'SYSTEM_ERROR', 'SECURITY_ALERT', 'USER_ACTION', 'API_ERROR'];
            const severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
            const log = await database_1.default.systemLog.create({
                data: {
                    type: logTypes[i % logTypes.length],
                    message: `Test log message ${i}`,
                    details: `This is test log details for log number ${i}. It contains some additional information for testing purposes.`,
                    severity: severities[i % severities.length],
                    userEmail: i % 3 === 0 ? `testuser${i}@example.com` : null,
                    ipAddress: `192.168.1.${i % 255}`,
                    userAgent: `Mozilla/5.0 (Test Browser ${i})`
                }
            });
            testLogs.push(log);
        }
        res.json({
            success: true,
            message: `Created ${testLogs.length} test logs`,
            data: { count: testLogs.length }
        });
    }
    catch (error) {
        console.error('Failed to create test logs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create test logs'
        });
    }
});
exports.default = router;
