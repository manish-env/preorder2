// Preorder Settings Model
class PreorderSettings {
  constructor(env) {
    this.db = env.DB;
  }

  async create(settingData) {
    const { storeUrl, productHandle, variantTitle, variantSku, isPreorderEnabled, preorderLimit, preorderText } = settingData;
    
    return await this.db.prepare(`
      INSERT OR REPLACE INTO preorder_settings 
      (store_url, product_handle, variant_title, variant_sku, is_preorder_enabled, preorder_limit, preorder_text, last_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(storeUrl, productHandle, variantTitle, variantSku, isPreorderEnabled, preorderLimit, preorderText).run();
  }

  async findByStoreUrl(storeUrl) {
    return await this.db.prepare(`
      SELECT * FROM preorder_settings WHERE store_url = ?
    `).bind(storeUrl).all();
  }

  async findByUserStore(userId) {
    return await this.db.prepare(`
      SELECT ps.* FROM preorder_settings ps
      JOIN users u ON ps.store_url = u.store_url
      WHERE u.id = ?
    `).bind(userId).all();
  }

  async deleteByStoreUrl(storeUrl) {
    return await this.db.prepare(`
      DELETE FROM preorder_settings WHERE store_url = ?
    `).bind(storeUrl).run();
  }
}

export default PreorderSettings;
