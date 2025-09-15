"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleAuthService = void 0;
const google_auth_library_1 = require("google-auth-library");
class GoogleAuthService {
    static initialize() {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) {
            console.warn('GOOGLE_CLIENT_ID not set. Google authentication will not work.');
            return;
        }
        this.client = new google_auth_library_1.OAuth2Client(clientId);
    }
    static async verifyIdToken(idToken) {
        try {
            if (!this.client) {
                throw new Error('Google OAuth client not initialized');
            }
            const ticket = await this.client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload || !payload.email || !payload.name || !payload.sub) {
                return null;
            }
            return {
                email: payload.email,
                name: payload.name,
                googleId: payload.sub,
            };
        }
        catch (error) {
            console.error('Error verifying Google ID token:', error);
            return null;
        }
    }
}
exports.GoogleAuthService = GoogleAuthService;
// Initialize on import
GoogleAuthService.initialize();
//# sourceMappingURL=googleAuth.js.map