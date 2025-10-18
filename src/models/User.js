import { getDatabase } from '../utils/database.js';

// User Model
class User {
  constructor() {
    this.db = getDatabase();
  }

  async create(userData) {
    const { email, passwordHash, storeName, shopifyStoreUrl, shopifyApiKey } = userData;
    
    const user = {
      email,
      passwordHash,
      storeName,
      shopifyStoreUrl: shopifyStoreUrl || null,
      shopifyApiKey: shopifyApiKey || null,
      createdAt: new Date()
    };
    
    const result = await this.db.collection('users').insertOne(user);
    return result.insertedId;
  }

  async findByEmail(email) {
    return await this.db.collection('users').findOne({ email });
  }

  async findById(id) {
    return await this.db.collection('users').findOne({ _id: id });
  }

  async updateShopifyDetails(userId, shopifyStoreUrl, shopifyApiKey) {
    return await this.db.collection('users').updateOne(
      { _id: userId },
      { 
        $set: { 
          shopifyStoreUrl, 
          shopifyApiKey,
          updatedAt: new Date()
        } 
      }
    );
  }

  async exists(email) {
    const user = await this.findByEmail(email);
    return !!user;
  }
}

export default User;
