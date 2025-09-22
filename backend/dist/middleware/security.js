"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.sanitizeInput = exports.corsOptions = exports.securityHeaders = exports.generalRateLimit = exports.authRateLimit = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
// Rate limiting for authentication endpoints
exports.authRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // 5 attempts per window
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// General rate limiting
exports.generalRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
        success: false,
        message: 'Too many requests, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
// Security headers
exports.securityHeaders = (0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"],
            connectSrc: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false,
});
// CORS configuration
exports.corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            process.env.FRONTEND_URL || 'http://localhost:3000',
            'http://localhost:3000',
            'http://localhost:3001',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:3001',
            'file://', // For local HTML files
            null,
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
// Input sanitization middleware
const sanitizeInput = (req, res, next) => {
    try {
        // Basic sanitization for common XSS patterns
        const sanitize = (obj) => {
            if (typeof obj === 'string') {
                return obj
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
                    .replace(/javascript:/gi, '')
                    .replace(/on\w+\s*=/gi, '');
            }
            if (typeof obj === 'object' && obj !== null) {
                const sanitized = Array.isArray(obj) ? [] : {};
                for (const key in obj) {
                    sanitized[key] = sanitize(obj[key]);
                }
                return sanitized;
            }
            return obj;
        };
        // Sanitize body (this can be reassigned)
        if (req.body) {
            req.body = sanitize(req.body);
        }
        // Sanitize query parameters (modify in place, don't reassign)
        if (req.query && typeof req.query === 'object') {
            for (const key in req.query) {
                if (Object.prototype.hasOwnProperty.call(req.query, key)) {
                    req.query[key] = sanitize(req.query[key]);
                }
            }
        }
        // Sanitize route parameters (modify in place, don't reassign)
        if (req.params && typeof req.params === 'object') {
            for (const key in req.params) {
                if (Object.prototype.hasOwnProperty.call(req.params, key)) {
                    req.params[key] = sanitize(req.params[key]);
                }
            }
        }
        next();
    }
    catch (error) {
        console.error('Error in sanitizeInput middleware:', error);
        next(error);
    }
};
exports.sanitizeInput = sanitizeInput;
// Error handling middleware
const errorHandler = (err, req, res, _next // eslint-disable-line @typescript-eslint/no-unused-vars
) => {
    console.error('Error:', err);
    // Default error
    let status = 500;
    let message = 'Internal server error';
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        status = 401;
        message = 'Invalid token';
    }
    else if (err.name === 'TokenExpiredError') {
        status = 401;
        message = 'Token expired';
    }
    // Validation errors
    if (err.name === 'ValidationError') {
        status = 400;
        message = 'Validation failed';
    }
    // Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        status = 400;
        message = 'Database error';
    }
    res.status(status).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=security.js.map