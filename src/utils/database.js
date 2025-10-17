// Database Utilities
export async function initializeDatabase(env) {
  try {
    console.log('Initializing database...');
    
    // Create users table
    console.log('Creating users table...');
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        store_name TEXT NOT NULL,
        shopify_store_url TEXT,
        shopify_api_key TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    console.log('Users table created/verified');

    // Create user_sessions table
    console.log('Creating user_sessions table...');
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT UNIQUE NOT NULL,
        user_id INTEGER NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `).run();
    console.log('User_sessions table created/verified');

    // Create stores table
    console.log('Creating stores table...');
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS stores (
        store_url TEXT PRIMARY KEY,
        access_token TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        webhook_secret TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `).run();
    console.log('Stores table created/verified');

    // Create preorder_settings table
    console.log('Creating preorder_settings table...');
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS preorder_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        store_url TEXT NOT NULL,
        product_handle TEXT NOT NULL,
        variant_title TEXT,
        variant_sku TEXT,
        is_preorder_enabled BOOLEAN DEFAULT FALSE,
        preorder_limit INTEGER DEFAULT 0,
        preorder_text TEXT DEFAULT '',
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `).run();
    console.log('Preorder_settings table created/verified');

    // Create indexes
    console.log('Creating indexes...');
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at)`).run();
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_preorder_settings_user ON preorder_settings(user_id)`).run();
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_preorder_settings_store ON preorder_settings(store_url)`).run();
    await env.DB.prepare(`CREATE INDEX IF NOT EXISTS idx_preorder_settings_handle ON preorder_settings(product_handle)`).run();
    console.log('Indexes created/verified');

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}
