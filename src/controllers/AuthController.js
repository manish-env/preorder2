// Authentication Controller
import User from '../models/User.js';
import Session from '../models/Session.js';
import Store from '../models/Store.js';

class AuthController {
  constructor(env) {
    this.userModel = new User(env);
    this.sessionModel = new Session(env);
    this.storeModel = new Store(env);
    this.env = env;
  }

  async signup(request, corsHeaders) {
    try {
      const { email, password, storeName } = await request.json();
      
      // Check if user already exists
      if (await this.userModel.exists(email)) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'User with this email already exists' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      // Hash password
      const passwordHash = await this.hashPassword(password);
      
      // Create user
      const userId = await this.userModel.create({
        email,
        passwordHash,
        storeName,
        shopifyStoreUrl: null,
        shopifyApiKey: null
      });
      
      // Create session
      const sessionId = this.generateSessionId();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      await this.sessionModel.create(sessionId, userId, expiresAt);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Account created successfully',
        userId: userId
      }), {
        headers: { 
          'Content-Type': 'application/json', 
          'Set-Cookie': this.createSessionCookie(sessionId),
          ...corsHeaders 
        }
      });
      
    } catch (error) {
      console.error('Error in signup:', error);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Signup failed', 
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }

  async connectShopify(request, corsHeaders, sessionData) {
    try {
      const { shopifyStoreUrl, shopifyApiKey } = await request.json();
      
      if (!sessionData || !sessionData.valid) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Unauthorized - please sign in first' 
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      // Update user with Shopify details
      const fullStoreUrl = shopifyStoreUrl.startsWith('https://') ? 
        shopifyStoreUrl : 
        `https://${shopifyStoreUrl}`;
      
      await this.userModel.updateShopifyDetails(
        sessionData.userId, 
        fullStoreUrl, 
        shopifyApiKey
      );
      
      // Create or update store entry
      await this.storeModel.update(
        sessionData.userId, 
        fullStoreUrl, 
        shopifyApiKey
      );
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Shopify store connected successfully'
      }), {
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        }
      });
      
    } catch (error) {
      console.error('Error in connectShopify:', error);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Shopify connection failed', 
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }

  async login(request, corsHeaders) {
    try {
      const { email, password } = await request.json();
      
      // Find user by email
      const user = await this.userModel.findByEmail(email);
      
      if (!user) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Invalid credentials' 
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      // Verify password
      const passwordHash = await this.hashPassword(password);
      if (user.password_hash !== passwordHash) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Invalid credentials' 
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      // Create session
      const sessionId = this.generateSessionId();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      await this.sessionModel.create(sessionId, user.id, expiresAt);
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Login successful' 
      }), {
        headers: { 
          'Content-Type': 'application/json', 
          'Set-Cookie': this.createSessionCookie(sessionId),
          ...corsHeaders 
        }
      });
    } catch (error) {
      console.error('Error in login:', error);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Login failed', 
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }

  async logout(request, corsHeaders) {
    try {
      const sessionId = this.getSessionIdFromCookie(request);
      
      if (sessionId) {
        await this.sessionModel.delete(sessionId);
      }
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Logged out successfully' 
      }), {
        headers: { 
          'Content-Type': 'application/json', 
          'Set-Cookie': 'session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
          ...corsHeaders 
        }
      });
    } catch (error) {
      console.error('Error in logout:', error);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Logout failed', 
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }

  // Utility methods
  async hashPassword(password) {
    const passwordHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    return Array.from(new Uint8Array(passwordHash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  generateSessionId() {
    return crypto.randomUUID();
  }

  createSessionCookie(sessionId) {
    return `session=${sessionId}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`;
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

export default AuthController;
