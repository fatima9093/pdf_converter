"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOrUser = exports.userOnly = exports.adminOnly = exports.authorize = exports.authenticate = void 0;
const auth_1 = require("../lib/auth");
const client_1 = require("@prisma/client");
const database_1 = __importDefault(require("../lib/database"));
const authenticate = async (req, res, next) => {
    try {
        // Try to get token from HTTP-only cookie first, then fall back to Authorization header
        let token = req.cookies?.accessToken;
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7); // Remove 'Bearer ' prefix
            }
        }
        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access token required'
            });
            return;
        }
        try {
            const payload = auth_1.AuthService.verifyAccessToken(token);
            // Verify user still exists and is not blocked
            const user = await database_1.default.user.findUnique({
                where: { id: payload.userId },
                select: { id: true, email: true, role: true, isBlocked: true },
            });
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
                return;
            }
            if (user.isBlocked) {
                res.status(403).json({
                    success: false,
                    message: 'Your account has been blocked. Please contact support.'
                });
                return;
            }
            req.user = {
                userId: user.id,
                email: user.email,
                role: user.role,
            };
            next();
        }
        catch (jwtError) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired token'
            });
            return;
        }
    }
    catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
exports.authenticate = authenticate;
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }
        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
exports.adminOnly = (0, exports.authorize)([client_1.Role.ADMIN]);
exports.userOnly = (0, exports.authorize)([client_1.Role.USER]);
exports.adminOrUser = (0, exports.authorize)([client_1.Role.ADMIN, client_1.Role.USER]);
