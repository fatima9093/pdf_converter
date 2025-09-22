"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../lib/auth");
const googleAuth_1 = require("../lib/googleAuth");
const database_1 = __importDefault(require("../lib/database"));
const validation_1 = require("../lib/validation");
const auth_2 = require("../middleware/auth");
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
// Signup with email and password
router.post('/signup', validation_1.signupValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
            return;
        }
        const { name, email, password } = req.body;
        // Check if user already exists
        const existingUser = await database_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(409).json({
                success: false,
                message: 'User with this email already exists',
            });
            return;
        }
        // Hash password
        const passwordHash = await auth_1.AuthService.hashPassword(password);
        // Check if user should be admin (predefined admin emails)
        const adminEmails = ['fatimaahmad9093@gmail.com', 'admin@example.com'];
        const userRole = adminEmails.includes(email.toLowerCase()) ? client_1.Role.ADMIN : client_1.Role.USER;
        // Create user
        const user = await database_1.default.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: userRole,
                provider: client_1.Provider.EMAIL,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
        });
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                user,
            },
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
// Login with email and password
router.post('/login', validation_1.loginValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
            return;
        }
        const { email, password } = req.body;
        // Find user
        const user = await database_1.default.user.findUnique({
            where: { email },
        });
        if (!user || !user.passwordHash) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
            return;
        }
        // Check if user is blocked
        if (user.isBlocked) {
            res.status(403).json({
                success: false,
                message: 'Your account has been blocked. Please contact support.',
            });
            return;
        }
        // Verify password
        const isValidPassword = await auth_1.AuthService.comparePassword(password, user.passwordHash);
        if (!isValidPassword) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
            return;
        }
        // Generate tokens
        const accessToken = auth_1.AuthService.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        const refreshToken = auth_1.AuthService.generateRefreshToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        // Create session
        await auth_1.AuthService.createSession(user.id);
        // Set HTTP-only cookies for secure token storage
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProduction, // Only use HTTPS in production
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
            path: '/',
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
        });
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                },
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
// Google OAuth login
router.post('/google', validation_1.googleAuthValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array(),
            });
            return;
        }
        const { idToken } = req.body;
        // Verify Google token
        const googleUser = await googleAuth_1.GoogleAuthService.verifyIdToken(idToken);
        if (!googleUser) {
            res.status(401).json({
                success: false,
                message: 'Invalid Google token',
            });
            return;
        }
        // Check if user exists
        let user = await database_1.default.user.findUnique({
            where: { email: googleUser.email },
        });
        if (!user) {
            // Check if user should be admin (predefined admin emails)
            const adminEmails = ['fatimaahmad9093@gmail.com', 'admin@example.com'];
            const userRole = adminEmails.includes(googleUser.email.toLowerCase()) ? client_1.Role.ADMIN : client_1.Role.USER;
            // Create new user
            user = await database_1.default.user.create({
                data: {
                    name: googleUser.name,
                    email: googleUser.email,
                    googleId: googleUser.googleId,
                    role: userRole,
                    provider: client_1.Provider.GOOGLE,
                },
            });
        }
        else if (!user.googleId) {
            // Link Google account to existing user
            user = await database_1.default.user.update({
                where: { id: user.id },
                data: { googleId: googleUser.googleId },
            });
        }
        // Check if user is blocked
        if (user.isBlocked) {
            res.status(403).json({
                success: false,
                message: 'Your account has been blocked. Please contact support.',
            });
            return;
        }
        // Generate tokens
        const accessToken = auth_1.AuthService.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        const refreshToken = auth_1.AuthService.generateRefreshToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        // Create session
        await auth_1.AuthService.createSession(user.id);
        // Set HTTP-only cookies for secure token storage
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
            path: '/',
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
        });
        res.json({
            success: true,
            message: 'Google login successful',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                },
            },
        });
    }
    catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
// Refresh token
router.post('/refresh-token', async (req, res) => {
    try {
        // Get refresh token from HTTP-only cookie
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(401).json({
                success: false,
                message: 'Refresh token not found',
            });
            return;
        }
        // Validate session
        const session = await auth_1.AuthService.validateSession(refreshToken);
        if (!session) {
            res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token',
            });
            return;
        }
        // Get user
        const user = await database_1.default.user.findUnique({
            where: { id: session.userId },
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        // Generate new tokens
        const newAccessToken = auth_1.AuthService.generateAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        const newRefreshToken = auth_1.AuthService.generateRefreshToken({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        // Revoke old session and create new one
        await auth_1.AuthService.revokeSession(refreshToken);
        await auth_1.AuthService.createSession(user.id);
        // Set new HTTP-only cookies
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 15 * 60 * 1000, // 15 minutes
            path: '/',
        });
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: '/',
        });
        res.json({
            success: true,
            message: 'Tokens refreshed successfully',
        });
    }
    catch (error) {
        console.error('Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
// Logout
router.post('/logout', auth_2.authenticate, async (req, res) => {
    try {
        // Get refresh token from cookie
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            await auth_1.AuthService.revokeSession(refreshToken);
        }
        else {
            // Revoke all sessions for the user
            await auth_1.AuthService.revokeAllUserSessions(req.user.userId);
        }
        // Clear HTTP-only cookies
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            path: '/',
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
            path: '/',
        });
        res.json({
            success: true,
            message: 'Logout successful',
        });
    }
    catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
// Get current user profile
router.get('/me', auth_2.authenticate, async (req, res) => {
    try {
        const user = await database_1.default.user.findUnique({
            where: { id: req.user.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                provider: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found',
            });
            return;
        }
        res.json({
            success: true,
            data: { user },
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map