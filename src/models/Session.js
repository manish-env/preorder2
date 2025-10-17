// Session Model
class Session {
  constructor(env) {
    this.db = env.DB;
  }

  async create(sessionId, userId, expiresAt) {
    return await this.db.prepare(`
      INSERT INTO user_sessions (session_id, user_id, expires_at)
      VALUES (?, ?, ?)
    `).bind(sessionId, userId, expiresAt).run();
  }

  async findBySessionId(sessionId) {
    return await this.db.prepare(`
      SELECT us.*, u.email, u.store_name, u.shopify_store_url, u.shopify_api_key
      FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      WHERE us.session_id = ? AND us.expires_at > datetime('now')
    `).bind(sessionId).first();
  }

  async delete(sessionId) {
    return await this.db.prepare(`
      DELETE FROM user_sessions WHERE session_id = ?
    `).bind(sessionId).run();
  }

  async cleanup() {
    return await this.db.prepare(`
      DELETE FROM user_sessions WHERE expires_at < datetime('now')
    `).run();
  }
}

export default Session;
