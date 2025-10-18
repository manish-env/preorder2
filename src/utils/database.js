// Database Utilities for D1
export async function initializeDatabase(env) {
  try {
    console.log('Initializing D1 database...');
    
    // Create users table
    console.log('Creating users table...');
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        store_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    console.log('Users table created/verified');

    // Create user_sessions table
    console.log('Creating user_sessions table...');
    
    // First, check if the table exists and has the correct schema
    try {
      const tableInfo = await env.DB.prepare(`PRAGMA table_info(user_sessions)`).all();
      console.log('Current user_sessions schema:', tableInfo);
      
      // If table exists but doesn't have user_id column, drop and recreate
      const hasUserId = tableInfo.results.some(col => col.name === 'user_id');
      if (tableInfo.results.length > 0 && !hasUserId) {
        console.log('Dropping old user_sessions table...');
        await env.DB.prepare(`DROP TABLE IF EXISTS user_sessions`).run();
      }
    } catch (error) {
      console.log('Table does not exist or error checking schema:', error.message);
    }
    
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    console.log('User_sessions table created/verified');

    // Create stores table
    console.log('Creating stores table...');
    
    // First, check if the table exists and has the correct schema
    try {
      const tableInfo = await env.DB.prepare(`PRAGMA table_info(stores)`).all();
      console.log('Current stores schema:', tableInfo);
      
      // If table exists but doesn't have user_id column, drop and recreate
      const hasUserId = tableInfo.results.some(col => col.name === 'user_id');
      if (tableInfo.results.length > 0 && !hasUserId) {
        console.log('Dropping old stores table...');
        await env.DB.prepare(`DROP TABLE IF EXISTS stores`).run();
      }
    } catch (error) {
      console.log('Table does not exist or error checking schema:', error.message);
    }
    
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS stores (
        store_url TEXT PRIMARY KEY,
        access_token TEXT NOT NULL,
        webhook_access_token TEXT,
        metafield_a TEXT,
        metafield_b TEXT,
        metafield_c TEXT,
        metafield_d TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    console.log('Stores table created/verified');

    // Create preorder_settings table
    console.log('Creating preorder_settings table...');
    
    // First, check if the table exists and has the correct schema
    try {
      const tableInfo = await env.DB.prepare(`PRAGMA table_info(preorder_settings)`).all();
      console.log('Current preorder_settings schema:', tableInfo);
      
      // If table exists but doesn't have user_id column, drop and recreate
      const hasUserId = tableInfo.results.some(col => col.name === 'user_id');
      if (tableInfo.results.length > 0 && !hasUserId) {
        console.log('Dropping old preorder_settings table...');
        await env.DB.prepare(`DROP TABLE IF EXISTS preorder_settings`).run();
      }
    } catch (error) {
      console.log('Table does not exist or error checking schema:', error.message);
    }
    
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS preorder_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        store_url TEXT NOT NULL,
        product_handle TEXT NOT NULL,
        variant_title TEXT,
        variant_sku TEXT,
        is_preorder_enabled BOOLEAN DEFAULT FALSE,
        preorder_limit INTEGER DEFAULT 0,
        preorder_text TEXT DEFAULT '',
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (store_url) REFERENCES stores(store_url)
      )
    `).run();
    console.log('Preorder_settings table created/verified');

    // Create indexes for better performance
    console.log('Creating indexes...');
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at)`).run();
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_users_store_url ON users(store_url)`).run();
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_preorder_settings_store_url ON preorder_settings(store_url)`).run();
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_preorder_settings_handle ON preorder_settings(product_handle)`).run();
    console.log('Indexes created/verified');

    console.log('D1 database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing D1 database:', error);
    return false;
  }
}
