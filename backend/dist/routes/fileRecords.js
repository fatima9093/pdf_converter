"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const database_1 = __importDefault(require("../lib/database"));
const router = express_1.default.Router();
// Get all conversions (admin only) - includes both authenticated and anonymous conversions
router.get('/conversions', auth_1.authenticate, auth_1.adminOnly, async (req, res) => {
    try {
        const conversions = await database_1.default.conversion.findMany({
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
            }
        });
        // Transform data to match FileRecord interface for the component
        const transformedRecords = conversions.map(conversion => ({
            id: conversion.id,
            filename: conversion.originalFileName,
            fileType: transformToolToFileType(conversion.toolType),
            originalExtension: getFileExtensionFromName(conversion.originalFileName),
            uploadedBy: conversion.user ? {
                id: conversion.user.id,
                name: conversion.user.name,
                email: conversion.user.email
            } : {
                id: 'anonymous',
                name: 'Anonymous User',
                email: conversion.ipAddress || 'Unknown'
            },
            uploadedAt: conversion.createdAt,
            status: transformConversionStatus(conversion.status),
            fileSize: conversion.fileSize,
            downloadUrl: conversion.convertedFileName ? `/downloads/${conversion.convertedFileName}` : null,
            errorMessage: conversion.status === 'FAILED' ? 'Conversion failed' : null
        }));
        res.json({
            success: true,
            data: transformedRecords
        });
    }
    catch (error) {
        console.error('Failed to fetch conversions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch conversions'
        });
    }
});
// Get all file records (admin only)
router.get('/file-records', auth_1.authenticate, auth_1.adminOnly, async (req, res) => {
    try {
        const fileRecords = await database_1.default.fileRecord.findMany({
            include: {
                uploadedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                uploadedAt: 'desc'
            }
        });
        // Transform data to match FileRecord interface
        const transformedRecords = fileRecords.map(record => ({
            id: record.id,
            filename: record.filename,
            fileType: transformFileType(record.fileType),
            originalExtension: record.originalExtension,
            uploadedBy: {
                id: record.uploadedBy.id,
                name: record.uploadedBy.name,
                email: record.uploadedBy.email
            },
            uploadedAt: record.uploadedAt,
            status: transformFileStatus(record.status),
            fileSize: record.fileSize,
            downloadUrl: record.downloadUrl,
            errorMessage: record.errorMessage
        }));
        res.json({
            success: true,
            data: transformedRecords
        });
    }
    catch (error) {
        console.error('Failed to fetch file records:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch file records'
        });
    }
});
// Helper functions to transform enum values
function transformFileType(dbFileType) {
    const mapping = {
        'WORD': 'Word',
        'EXCEL': 'Excel',
        'POWERPOINT': 'PowerPoint',
        'PDF': 'PDF',
        'IMAGE': 'Image',
        'OTHER': 'Other'
    };
    return mapping[dbFileType] || 'Other';
}
function transformFileStatus(dbStatus) {
    const mapping = {
        'PENDING': 'Pending',
        'CONVERTING': 'Converting',
        'COMPLETED': 'Completed',
        'FAILED': 'Failed'
    };
    return mapping[dbStatus] || 'Pending';
}
// Helper functions for conversion data transformation
function transformToolToFileType(toolType) {
    const mapping = {
        'word-to-pdf': 'Word',
        'excel-to-pdf': 'Excel',
        'powerpoint-to-pdf': 'PowerPoint',
        'pdf-to-word': 'PDF',
        'pdf-to-excel': 'PDF',
        'pdf-to-powerpoint': 'PDF',
        'pdf-to-jpg': 'PDF',
        'jpg-to-pdf': 'Image',
        'compress-pdf': 'PDF',
        'split-pdf': 'PDF',
        'merge-pdf': 'PDF',
        'html-to-pdf': 'Other'
    };
    return mapping[toolType] || 'Other';
}
function getFileExtensionFromName(filename) {
    const parts = filename.split('.');
    return parts.length > 1 ? `.${parts[parts.length - 1].toLowerCase()}` : '.unknown';
}
function transformConversionStatus(status) {
    const mapping = {
        'PENDING': 'Pending',
        'PROCESSING': 'Converting',
        'COMPLETED': 'Completed',
        'FAILED': 'Failed'
    };
    return mapping[status] || 'Pending';
}
exports.default = router;
//# sourceMappingURL=fileRecords.js.map