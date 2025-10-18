// User Model
class User {
  constructor(env) {
    this.db = env.DB;
  }

  async create(userData) {
    const { email, passwordHash, storeUrl } = userData;
    
    const result = await this.db.prepare(`
      INSERT INTO users (email, password_hash, store_url)
      VALUES (?, ?, ?)
    `).bind(email, passwordHash, storeUrl).run();
    
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

  async updateStoreUrl(userId, storeUrl) {
    return await this.db.prepare(`
      UPDATE users 
      SET store_url = ?
      WHERE id = ?
    `).bind(storeUrl, userId).run();
  }

  async exists(email) {
    const user = await this.findByEmail(email);
    return !!user;
  }
}

export default User;
