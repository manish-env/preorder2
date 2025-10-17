// Preorder Settings Model
class PreorderSettings {
  constructor(env) {
    this.db = env.DB;
  }

  async create(settingData) {
    const { userId, storeUrl, productHandle, variantTitle, variantSku, isPreorderEnabled, preorderLimit, preorderText } = settingData;
    
    return await this.db.prepare(`
      INSERT OR REPLACE INTO preorder_settings 
      (user_id, store_url, product_handle, variant_title, variant_sku, is_preorder_enabled, preorder_limit, preorder_text, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(userId, storeUrl, productHandle, variantTitle, variantSku, isPreorderEnabled, preorderLimit, preorderText).run();
  }

  async findByUserId(userId) {
    return await this.db.prepare(`
      SELECT * FROM preorder_settings WHERE user_id = ?
    `).bind(userId).all();
  }

  async findByStoreUrl(storeUrl) {
    return await this.db.prepare(`
      SELECT * FROM preorder_settings WHERE store_url = ?
    `).bind(storeUrl).all();
  }

  async findByUserAndStore(userId, storeUrl) {
    return await this.db.prepare(`
      SELECT * FROM preorder_settings WHERE user_id = ? AND store_url = ?
    `).bind(userId, storeUrl).all();
  }

  async deleteByUserId(userId) {
    return await this.db.prepare(`
      DELETE FROM preorder_settings WHERE user_id = ?
    `).bind(userId).run();
  }
}

export default PreorderSettings;
