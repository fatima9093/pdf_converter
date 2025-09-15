import { $Enums } from '@prisma/client';
export type Role = $Enums.Role;
export declare const Role: {
    ADMIN: "ADMIN";
    USER: "USER";
};
export interface JWTPayload {
    userId: string;
    email: string;
    role: Role;
}
export interface SessionData {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
}
export declare class AuthService {
    private static readonly JWT_SECRET;
    private static readonly JWT_REFRESH_SECRET;
    private static readonly JWT_EXPIRES_IN;
    private static readonly JWT_REFRESH_EXPIRES_IN;
    static hashPassword(password: string): Promise<string>;
    static comparePassword(password: string, hash: string): Promise<boolean>;
    static generateAccessToken(payload: JWTPayload): string;
    static generateRefreshToken(payload: JWTPayload): string;
    static verifyAccessToken(token: string): JWTPayload;
    static verifyRefreshToken(token: string): JWTPayload;
    static createSession(userId: string): Promise<string>;
    static validateSession(sessionToken: string): Promise<SessionData | null>;
    static revokeSession(sessionToken: string): Promise<void>;
    static revokeAllUserSessions(userId: string): Promise<void>;
    static cleanExpiredSessions(): Promise<void>;
    static extractTokenFromHeader(authHeader: string | undefined): string | null;
    static generateSecureToken(length?: number): string;
}
//# sourceMappingURL=auth.d.ts.map