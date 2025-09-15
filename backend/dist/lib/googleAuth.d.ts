export declare class GoogleAuthService {
    private static client;
    static initialize(): void;
    static verifyIdToken(idToken: string): Promise<{
        email: string;
        name: string;
        googleId: string;
    } | null>;
}
//# sourceMappingURL=googleAuth.d.ts.map