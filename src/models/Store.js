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
    
    return await this.db.prepare(`
      INSERT OR REPLACE INTO stores (store_url, access_token)
      VALUES (?, ?)
    `).bind(storeUrl, accessToken).run();
  }
}

export default Store;
