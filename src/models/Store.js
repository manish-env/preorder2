// Store Model
class Store {
  constructor(env) {
    this.db = env.DB;
  }

  async create(storeData) {
    const { storeUrl, accessToken, userId, webhookSecret } = storeData;
    
    return await this.db.prepare(`
      INSERT INTO stores (store_url, access_token, user_id, webhook_secret)
      VALUES (?, ?, ?, ?)
    `).bind(storeUrl, accessToken, userId, webhookSecret).run();
  }

  async findByUserId(userId) {
    return await this.db.prepare(`
      SELECT * FROM stores WHERE user_id = ?
    `).bind(userId).first();
  }

  async findByUrl(storeUrl) {
    return await this.db.prepare(`
      SELECT * FROM stores WHERE store_url = ?
    `).bind(storeUrl).first();
  }

  async update(userId, storeUrl, accessToken) {
    console.log('Store.update called with:', { userId, storeUrl, accessToken: accessToken ? 'provided' : 'missing' });
    
    // First check if the table has the correct schema
    try {
      const tableInfo = await this.db.prepare(`PRAGMA table_info(stores)`).all();
      console.log('Current stores table schema:', tableInfo);
      
      const hasUserId = tableInfo.results.some(col => col.name === 'user_id');
      if (!hasUserId) {
        console.log('ERROR: stores table missing user_id column!');
        throw new Error('stores table missing user_id column');
      }
    } catch (error) {
      console.error('Error checking stores table schema:', error);
      throw error;
    }
    
    return await this.db.prepare(`
      INSERT OR REPLACE INTO stores (store_url, access_token, user_id)
      VALUES (?, ?, ?)
    `).bind(storeUrl, accessToken, userId).run();
  }
}

export default Store;
