// Authentication Controller
import User from '../models/User.js';
import Session from '../models/Session.js';
import Store from '../models/Store.js';

class AuthController {
  constructor(env) {
    try {
      this.userModel = new User(env);
      this.sessionModel = new Session(env);
      this.storeModel = new Store(env);
    } catch (error) {
      console.error('AuthController initialization failed:', error);
      throw error;
    }
  }

  async signup(request, corsHeaders) {
    try {
      console.log('Signup request received');
      const { email, password, storeName } = await request.json();
      console.log('Signup data:', { email, storeName });
      
      // Check if user already exists
      console.log('Checking if user exists...');
      if (await this.userModel.exists(email)) {
        console.log('User already exists');
        return new Response(JSON.stringify({ 
          success: false,
          error: 'User with this email already exists' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      // Hash password
      console.log('Hashing password...');
      const passwordHash = await this.hashPassword(password);
      
      // Create user
      console.log('Creating user...');
      const userId = await this.userModel.create({
        email,
        passwordHash,
        storeName,
        shopifyStoreUrl: null,
        shopifyApiKey: null
      });
      console.log('User created with ID:', userId);
      
      // Create session
      console.log('Creating session...');
      const sessionId = this.generateSessionId();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      await this.sessionModel.create(sessionId, userId, expiresAt);
      console.log('Session created');
      
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Account created successfully',
        userId: userId,
        redirectTo: '/connect-shopify'
      }), {
        headers: { 
          'Content-Type': 'application/json', 
          'Set-Cookie': this.createSessionCookie(sessionId),
          ...corsHeaders 
        }
      });
      
    } catch (error) {
      console.error('Error in signup:', error);
      console.error('Error stack:', error.stack);
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
      console.log('ConnectShopify request received');
      console.log('Session data:', sessionData);
      
      const { shopifyStoreUrl, shopifyApiKey } = await request.json();
      console.log('Shopify store URL:', shopifyStoreUrl);
      console.log('API key provided:', shopifyApiKey ? 'Yes' : 'No');
      
      if (!sessionData || !sessionData.valid) {
        console.log('Invalid session data, returning 401');
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Unauthorized - please sign in first' 
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      // Update user with Shopify details
      console.log('Processing store URL...');
      const fullStoreUrl = shopifyStoreUrl.startsWith('https://') ? 
        shopifyStoreUrl : 
        `https://${shopifyStoreUrl}`;
      console.log('Full store URL:', fullStoreUrl);
      
      console.log('Updating user Shopify details...');
      await this.userModel.updateShopifyDetails(
        sessionData.userId, 
        fullStoreUrl, 
        shopifyApiKey
      );
      console.log('User details updated successfully');
      
      // Store credentials are now saved in the users table
      // No need for separate stores table
      
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
      console.error('Error stack:', error.stack);
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
      console.log('Login request received');
      const { email, password } = await request.json();
      console.log('Login attempt for email:', email);
      
      // Find user by email
      console.log('Looking up user in database...');
      const user = await this.userModel.findByEmail(email);
      console.log('User lookup result:', user ? 'User found' : 'User not found');
      
      if (!user) {
        console.log('User not found, returning 401');
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Invalid credentials' 
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      // Verify password
      console.log('Verifying password...');
      const passwordHash = await this.hashPassword(password);
      console.log('Password verification complete');
      
      if (user.password_hash !== passwordHash) {
        console.log('Password mismatch, returning 401');
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Invalid credentials' 
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
      // Create session
      console.log('Creating session...');
      const sessionId = this.generateSessionId();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      
      await this.sessionModel.create(sessionId, user.id, expiresAt);
      console.log('Session created successfully');
      
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
      console.error('Error stack:', error.stack);
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

  async updateSettings(request, corsHeaders) {
    try {
      const sessionId = this.getSessionIdFromCookie(request);
      const sessionData = await this.authMiddleware.verifySession(sessionId);
      
      if (!sessionData || !sessionData.valid) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Unauthorized - please sign in first' 
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const { storeName, shopifyStoreUrl, shopifyApiKey } = await request.json();
      
      if (!storeName || !shopifyStoreUrl || !shopifyApiKey) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'All fields are required' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Update user settings
      await this.userModel.updateShopifyDetails(sessionData.userId, {
        storeName: storeName,
        shopifyStoreUrl: shopifyStoreUrl,
        shopifyApiKey: shopifyApiKey
      });

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Settings updated successfully'
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
      
    } catch (error) {
      console.error('Error in updateSettings:', error);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Failed to update settings',
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }

  async getUserInfo(request, corsHeaders) {
    try {
      const sessionId = this.getSessionIdFromCookie(request);
      const sessionData = await this.authMiddleware.verifySession(sessionId);
      
      if (!sessionData || !sessionData.valid) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'Unauthorized - please sign in first' 
        }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Get user details
      const user = await this.userModel.findById(sessionData.userId);
      
      if (!user) {
        return new Response(JSON.stringify({ 
          success: false,
          error: 'User not found' 
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      return new Response(JSON.stringify({ 
        success: true,
        user: {
          id: user.id,
          email: user.email,
          storeName: user.store_name,
          shopifyStoreUrl: user.shopify_store_url,
          shopifyApiKey: user.shopify_api_key ? '***' + user.shopify_api_key.slice(-4) : null
        }
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
      
    } catch (error) {
      console.error('Error in getUserInfo:', error);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Failed to get user info',
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
