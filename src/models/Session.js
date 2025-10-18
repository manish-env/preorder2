import { getDatabase } from '../utils/database.js';

// Session Model
class Session {
  constructor() {
    this.db = getDatabase();
  }

  async create(sessionId, userId, expiresAt) {
    const session = {
      sessionId,
      userId,
      expiresAt: new Date(expiresAt),
      createdAt: new Date()
    };
    
    return await this.db.collection('user_sessions').insertOne(session);
  }

  async findBySessionId(sessionId) {
    const session = await this.db.collection('user_sessions').findOne({
      sessionId,
      expiresAt: { $gt: new Date() }
    });
    
    if (!session) return null;
    
    // Get user details
    const user = await this.db.collection('users').findOne({ _id: session.userId });
    if (!user) return null;
    
    return {
      ...session,
      email: user.email,
      storeName: user.storeName,
      shopifyStoreUrl: user.shopifyStoreUrl,
      shopifyApiKey: user.shopifyApiKey
    };
  }

  async delete(sessionId) {
    return await this.db.collection('user_sessions').deleteOne({ sessionId });
  }

  async cleanup() {
    return await this.db.collection('user_sessions').deleteMany({
      expiresAt: { $lt: new Date() }
    });
  }
}

export default Session;
