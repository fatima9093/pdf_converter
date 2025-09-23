"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const database_1 = __importDefault(require("./database"));
class AuthService {
    // Password hashing
    static async hashPassword(password) {
        const saltRounds = 12;
        return bcryptjs_1.default.hash(password, saltRounds);
    }
    static async comparePassword(password, hash) {
        return bcryptjs_1.default.compare(password, hash);
    }
    // JWT token generation
    static generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.JWT_SECRET, {
            expiresIn: this.JWT_EXPIRES_IN,
            issuer: 'pdf-converter-api',
            audience: 'pdf-converter-client',
        });
    }
    static generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.JWT_REFRESH_SECRET, {
            expiresIn: this.JWT_REFRESH_EXPIRES_IN,
            issuer: 'pdf-converter-api',
            audience: 'pdf-converter-client',
        });
    }
    // JWT token verification
    static verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.JWT_SECRET, {
                issuer: 'pdf-converter-api',
                audience: 'pdf-converter-client',
            });
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.TokenExpiredError) {
                throw new Error('Access token has expired');
            }
            else if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
                throw new Error('Invalid access token');
            }
            else {
                throw new Error('Token verification failed');
            }
        }
    }
    static verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.JWT_REFRESH_SECRET, {
                issuer: 'pdf-converter-api',
                audience: 'pdf-converter-client',
            });
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.TokenExpiredError) {
                throw new Error('Refresh token has expired');
            }
            else if (error instanceof jsonwebtoken_1.JsonWebTokenError) {
                throw new Error('Invalid refresh token');
            }
            else {
                throw new Error('Refresh token verification failed');
            }
        }
    }
    // Session management
    static async createSession(userId) {
        // Generate a secure random token for the session
        const sessionToken = crypto_1.default.randomBytes(32).toString('hex');
        // Set expiration date (7 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        // Update user's last login time
        await database_1.default.user.update({
            where: { id: userId },
            data: { lastLogin: new Date() },
        });
        // Create session in database
        await database_1.default.session.create({
            data: {
                userId,
                refreshToken: sessionToken,
                expiresAt,
            },
        });
        return sessionToken;
    }
    static async validateSession(sessionToken) {
        try {
            const session = await database_1.default.session.findUnique({
                where: { refreshToken: sessionToken },
            });
            if (!session) {
                return null;
            }
            // Check if session has expired
            if (session.expiresAt < new Date()) {
                // Remove expired session
                await this.revokeSession(sessionToken);
                return null;
            }
            return {
                id: session.id,
                userId: session.userId,
                token: session.refreshToken,
                expiresAt: session.expiresAt,
            };
        }
        catch (error) {
            console.error('Session validation error:', error);
            return null;
        }
    }
    static async revokeSession(sessionToken) {
        try {
            await database_1.default.session.delete({
                where: { refreshToken: sessionToken },
            });
            console.log('✅ Session revoked successfully');
        }
        catch (error) {
            // Check if it's a "record not found" error (P2025)
            if (error.code === 'P2025') {
                console.log('ℹ️ Session already revoked or does not exist');
                return; // This is fine, session is already gone
            }
            // For other errors, log them properly
            console.error('❌ Error revoking session:', error.message);
            throw error; // Re-throw unexpected errors
        }
    }
    static async revokeAllUserSessions(userId) {
        try {
            const result = await database_1.default.session.deleteMany({
                where: { userId },
            });
            console.log(`✅ Revoked ${result.count} sessions for user ${userId}`);
        }
        catch (error) {
            console.error('❌ Error revoking all user sessions:', error.message);
            throw error; // Re-throw for proper error handling upstream
        }
    }
    static async cleanExpiredSessions() {
        try {
            const result = await database_1.default.session.deleteMany({
                where: {
                    expiresAt: {
                        lt: new Date(),
                    },
                },
            });
            console.log(`🧹 Cleaned ${result.count} expired sessions`);
        }
        catch (error) {
            console.error('Error cleaning expired sessions:', error);
        }
    }
    // Utility methods
    static extractTokenFromHeader(authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        return authHeader.substring(7); // Remove 'Bearer ' prefix
    }
    static generateSecureToken(length = 32) {
        return crypto_1.default.randomBytes(length).toString('hex');
    }
}
exports.AuthService = AuthService;
AuthService.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
AuthService.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-this-in-production';
AuthService.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
AuthService.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
