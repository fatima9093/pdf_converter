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
        console.error('❌ Google OAuth client not initialized. Check GOOGLE_CLIENT_ID environment variable.');
        throw new Error('Google OAuth client not initialized');
      }

      console.log('🔍 Verifying Google ID token...');
      const ticket = await this.client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      console.log('📥 Google token payload received:', { 
        email: payload?.email, 
        name: payload?.name,
        sub: payload?.sub ? 'present' : 'missing'
      });
      
      if (!payload || !payload.email || !payload.name || !payload.sub) {
        console.error('❌ Invalid Google token payload');
        return null;
      }

      console.log('✅ Google ID token verified successfully');
      return {
        email: payload.email,
        name: payload.name,
        googleId: payload.sub,
      };
    } catch (error: any) {
      console.error('❌ Error verifying Google ID token:', {
        message: error.message,
        code: error.code,
        details: error.details
      });
      return null;
    }
  }
}

// Initialize on import
GoogleAuthService.initialize();


