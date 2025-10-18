// Store Model
class Store {
  constructor(env) {
    this.db = env.DB;
  }

  async create(storeData) {
    const { storeUrl, accessToken, webhookAccessToken, metafieldA, metafieldB, metafieldC, metafieldD } = storeData;
    
    return await this.db.prepare(`
      INSERT OR REPLACE INTO stores (store_url, access_token, webhook_access_token, metafield_a, metafield_b, metafield_c, metafield_d)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(storeUrl, accessToken, webhookAccessToken, metafieldA, metafieldB, metafieldC, metafieldD).run();
  }

  async findByUrl(storeUrl) {
    return await this.db.prepare(`
      SELECT * FROM stores WHERE store_url = ?
    `).bind(storeUrl).first();
  }

  async update(storeData) {
    const { storeUrl, accessToken, webhookAccessToken, metafieldA, metafieldB, metafieldC, metafieldD } = storeData;
    
    return await this.db.prepare(`
      INSERT OR REPLACE INTO stores (store_url, access_token, webhook_access_token, metafield_a, metafield_b, metafield_c, metafield_d)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(storeUrl, accessToken, webhookAccessToken, metafieldA, metafieldB, metafieldC, metafieldD).run();
  }
}

export default Store;
