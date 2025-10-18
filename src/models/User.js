// User Model
class User {
  constructor(env) {
    this.db = env.DB;
  }

  async create(userData) {
    const { email, passwordHash, storeName, shopifyStoreUrl, shopifyApiKey } = userData;
    
    const result = await this.db.prepare(`
      INSERT INTO users (email, password_hash, store_name, shopify_store_url, shopify_api_key)
      VALUES (?, ?, ?, ?, ?)
    `).bind(email, passwordHash, storeName, shopifyStoreUrl, shopifyApiKey).run();
    
    return result.meta.last_row_id;
  }

  async findByEmail(email) {
    return await this.db.prepare(`
      SELECT * FROM users WHERE email = ?
    `).bind(email).first();
  }

  async findById(id) {
    return await this.db.prepare(`
      SELECT * FROM users WHERE id = ?
    `).bind(id).first();
  }

  async updateShopifyDetails(userId, shopifyStoreUrl, shopifyApiKey) {
    return await this.db.prepare(`
      UPDATE users 
      SET shopify_store_url = ?, shopify_api_key = ?
      WHERE id = ?
    `).bind(shopifyStoreUrl, shopifyApiKey, userId).run();
  }

  async exists(email) {
    const user = await this.findByEmail(email);
    return !!user;
  }
}

export default User;
