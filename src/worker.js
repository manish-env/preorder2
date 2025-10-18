// Main Worker - MVC Architecture
import { initializeDatabase } from './utils/database.js';
import { AuthMiddleware } from './middleware/auth.js';
import { setupAuthRoutes } from './routes/auth.js';
import { setupProductRoutes } from './routes/products.js';

// Import HTML views
import loginHtml from './views/login.html';
import signupHtml from './views/signup.html';
import dashboardHtml from './views/dashboard.html';
import connectShopifyHtml from './views/connect-shopify.html';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Initialize database
    try {
      await initializeDatabase(env);
    } catch (error) {
      console.error('Database initialization failed:', error);
      return new Response(JSON.stringify({ 
        error: 'Database initialization failed', 
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Initialize middleware and routes
    let authMiddleware, authRoutes, productRoutes;
    try {
      authMiddleware = new AuthMiddleware(env);
      authRoutes = setupAuthRoutes(env);
      productRoutes = setupProductRoutes(env);
    } catch (error) {
      console.error('Route initialization failed:', error);
      return new Response(JSON.stringify({ 
        error: 'Route initialization failed', 
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Handle CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    // Route API requests
    if (url.pathname.startsWith('/api/')) {
      const sessionId = authMiddleware.getSessionIdFromCookie(request);
      const sessionData = await authMiddleware.verifySession(sessionId);

      // Auth routes
      if (url.pathname === '/api/auth/signup') {
        return await authRoutes.signup(request, corsHeaders);
      }
      
      if (url.pathname === '/api/auth/connect-shopify') {
        return await authRoutes.connectShopify(request, corsHeaders, sessionData);
    }
    
    if (url.pathname === '/api/auth/login') {
        return await authRoutes.login(request, corsHeaders);
    }
    
    if (url.pathname === '/api/auth/logout') {
        return await authRoutes.logout(request, corsHeaders);
      }

      // Product routes
      if (url.pathname === '/api/products') {
        return await productRoutes.getProducts(request, corsHeaders, sessionData);
      }

              // Test database connection
              if (url.pathname === '/api/test-db') {
                try {
                  const result = await env.DB.prepare('SELECT 1 as test').first();
                  return new Response(JSON.stringify({ 
                    success: true, 
                    message: 'D1 database connected',
                    result: result 
                  }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                  });
                } catch (error) {
                  return new Response(JSON.stringify({ 
                    success: false, 
                    error: 'D1 database connection failed',
                    details: error.message 
                  }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                  });
                }
              }

              // Reset database schema
              if (url.pathname === '/api/reset-db') {
                try {
                  console.log('FORCE RESETTING database schema...');
                  
                  // Force drop all tables in correct order
                  await env.DB.prepare('DROP TABLE IF EXISTS preorder_settings').run();
                  await env.DB.prepare('DROP TABLE IF EXISTS stores').run();
                  await env.DB.prepare('DROP TABLE IF EXISTS user_sessions').run();
                  await env.DB.prepare('DROP TABLE IF EXISTS users').run();
                  
                  console.log('All tables dropped, recreating...');
                  
                  // Reinitialize database
                  await initializeDatabase(env);
                  
                  // Verify the stores table has user_id
                  const storesInfo = await env.DB.prepare(`PRAGMA table_info(stores)`).all();
                  console.log('VERIFIED stores table schema:', storesInfo);
                  
                  return new Response(JSON.stringify({ 
                    success: true, 
                    message: 'Database schema FORCE reset successfully',
                    storesSchema: storesInfo.results
                  }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                  });
                } catch (error) {
                  return new Response(JSON.stringify({ 
                    success: false, 
                    error: 'Database reset failed',
                    details: error.message 
                  }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                  });
                }
              }

              // Test Shopify connection
              if (url.pathname === '/api/test-shopify') {
                try {
                  const sessionId = authMiddleware.getSessionIdFromCookie(request);
                  const sessionData = await authMiddleware.verifySession(sessionId);
                  
                  if (!sessionData || !sessionData.valid) {
                    return new Response(JSON.stringify({ 
                      success: false,
                      error: 'Unauthorized - please sign in first' 
                    }), {
                      status: 401,
                      headers: { 'Content-Type': 'application/json', ...corsHeaders }
                    });
                  }
                  
                  return new Response(JSON.stringify({ 
                    success: true, 
                    message: 'Session valid',
                    sessionData: {
                      userId: sessionData.userId,
                      email: sessionData.email,
                      storeName: sessionData.storeName,
                      hasShopifyUrl: !!sessionData.shopifyStoreUrl,
                      hasShopifyKey: !!sessionData.shopifyApiKey
                    }
                  }), {
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                  });
                } catch (error) {
                  return new Response(JSON.stringify({ 
                    success: false, 
                    error: 'Test failed',
                    details: error.message 
                  }), {
                    status: 500,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders }
                  });
                }
              }

      // Default API response
      return new Response(JSON.stringify({ error: 'API endpoint not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
      
    // Route page requests
    if (url.pathname === '/login') {
      return new Response(loginHtml, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });
    }

    if (url.pathname === '/signup') {
      return new Response(signupHtml, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });
    }

    if (url.pathname === '/connect-shopify') {
      // Check authentication for Shopify connection
      const sessionId = authMiddleware.getSessionIdFromCookie(request);
      const sessionData = await authMiddleware.verifySession(sessionId);
      
      if (!sessionData.valid) {
        return new Response(loginHtml, {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        });
      }
      
      return new Response(connectShopifyHtml, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });
    }

    // Dashboard route with authentication
    if (url.pathname === '/' || url.pathname === '/index.html') {
      const sessionId = authMiddleware.getSessionIdFromCookie(request);
      const sessionData = await authMiddleware.verifySession(sessionId);
      
      if (!sessionData.valid) {
        return new Response(loginHtml, {
          headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        });
      }
      
      return new Response(dashboardHtml, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });
    }

    // Handle favicon
    if (url.pathname === '/favicon.ico') {
      return new Response('', { status: 204 });
    }

    // 404 for all other routes
    return new Response('Not Found', { status: 404 });
  }
};
