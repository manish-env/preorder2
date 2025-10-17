// Authentication Middleware
import Session from '../models/Session.js';

export class AuthMiddleware {
  constructor(env) {
    this.sessionModel = new Session(env);
    this.env = env;
  }

  async verifySession(sessionId) {
    if (!sessionId) return { valid: false };
    
    try {
      const sessionData = await this.sessionModel.findBySessionId(sessionId);
      
      if (sessionData) {
        return {
          valid: true,
          userId: sessionData.user_id,
          email: sessionData.email,
          storeName: sessionData.store_name,
          shopifyStoreUrl: sessionData.shopify_store_url,
          shopifyApiKey: sessionData.shopify_api_key
        };
      }
      
      return { valid: false };
    } catch (error) {
      console.error('Error verifying session:', error);
      return { valid: false };
    }
  }

  getSessionIdFromCookie(request) {
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) return null;
    
    const sessionCookie = cookieHeader
      .split(';')
      .find(cookie => cookie.trim().startsWith('session='));
    
    if (!sessionCookie) return null;
    return sessionCookie.split('=')[1];
  }
}
