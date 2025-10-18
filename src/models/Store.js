import { getDatabase } from '../utils/database.js';

// Store Model
class Store {
  constructor() {
    this.db = getDatabase();
  }

  async create(storeData) {
    const { storeUrl, accessToken, userId, webhookSecret } = storeData;
    
    const store = {
      storeUrl,
      accessToken,
      userId,
      webhookSecret: webhookSecret || null,
      createdAt: new Date()
    };
    
    return await this.db.collection('stores').insertOne(store);
  }

  async findByUserId(userId) {
    return await this.db.collection('stores').findOne({ userId });
  }

  async findByUrl(storeUrl) {
    return await this.db.collection('stores').findOne({ storeUrl });
  }

  async update(userId, storeUrl, accessToken) {
    return await this.db.collection('stores').replaceOne(
      { userId },
      {
        storeUrl,
        accessToken,
        userId,
        updatedAt: new Date()
      },
      { upsert: true }
    );
  }
}

export default Store;
