// Product Controller
import PreorderSettings from '../models/PreorderSettings.js';

class ProductController {
  constructor(env) {
    this.preorderModel = new PreorderSettings(env);
    this.env = env;
  }

  async getProducts(request, corsHeaders, sessionData) {
    try {
      if (!sessionData || !sessionData.valid) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      const url = new URL(request.url);
      const searchQuery = url.searchParams.get('search') || '';
      
      // Get user's preorder settings
      const storeUrl = sessionData.shopifyStoreUrl.startsWith('https://') ? 
        sessionData.shopifyStoreUrl : 
        `https://${sessionData.shopifyStoreUrl}`;
      
      const dbResults = await this.preorderModel.findByUserAndStore(
        sessionData.userId, 
        storeUrl
      );
      
      // Process and format products
      const productGroups = {};
      
      for (const row of dbResults.results) {
        const productHandle = row.product_handle;
        const productTitle = productHandle.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Apply search filter if provided
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          const matchesTitle = productTitle.toLowerCase().includes(searchLower);
          const matchesHandle = productHandle.toLowerCase().includes(searchLower);
          const matchesVariant = (row.variant_title || '').toLowerCase().includes(searchLower);
          
          if (!matchesTitle && !matchesHandle && !matchesVariant) {
            continue;
          }
        }
        
        if (!productGroups[productHandle]) {
          productGroups[productHandle] = {
            id: `db_${productHandle}`,
            title: productTitle,
            status: 'ACTIVE',
            variants: []
          };
        }
        
        productGroups[productHandle].variants.push({
          id: `db_${productHandle}_${row.variant_title || 'Default'}`,
          title: row.variant_title || 'Default Title',
          inventoryQuantity: 0,
          isPreorder: { value: row.is_preorder_enabled },
          preorderLimit: { value: row.preorder_limit },
          preorderText: { value: row.preorder_text },
          orders_quantity: 0,
          remaining_limit: row.preorder_limit,
          sold: 0,
          variant_sku: row.variant_sku
        });
      }
      
      const formattedProducts = Object.values(productGroups);
      
      return new Response(JSON.stringify(formattedProducts), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
      
    } catch (error) {
      console.error('Error in getProducts:', error);
      return new Response(JSON.stringify({
        error: 'Error fetching products',
        details: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
}

export default ProductController;
