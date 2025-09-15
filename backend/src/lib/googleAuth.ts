import { OAuth2Client } from 'google-auth-library';

export class GoogleAuthService {
  private static client: OAuth2Client;

  static initialize() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.warn('GOOGLE_CLIENT_ID not set. Google authentication will not work.');
      return;
    }
    
    this.client = new OAuth2Client(clientId);
  }

  static async verifyIdToken(idToken: string): Promise<{
    email: string;
    name: string;
    googleId: string;
  } | null> {
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
    } catch (error) {
      console.error('Error verifying Google ID token:', error);
      return null;
    }
  }
}

// Initialize on import
GoogleAuthService.initialize();


