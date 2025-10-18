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
      
      // Get user's preorder settings through their store
      const dbResults = await this.preorderModel.findByUserStore(sessionData.userId);
      
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

  async uploadCsv(request, corsHeaders, sessionData) {
    try {
      if (!sessionData || !sessionData.valid) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      console.log('CSV upload request received');
      
      const formData = await request.formData();
      const file = formData.get('file');
      
      if (!file) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'No file provided' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      console.log('File received:', file.name, file.size, 'bytes');
      
      // Read and parse CSV
      const csvText = await file.text();
      const lines = csvText.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'CSV file is empty or invalid' 
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Parse header
      const headers = lines[0].split(',').map(h => h.trim());
      console.log('CSV headers:', headers);

      // Expected headers: handle,title,variant_title,variant_sku,preorder_enabled,preorder_limit,preorder_text
      const expectedHeaders = ['handle', 'title', 'variant_title', 'variant_sku', 'preorder_enabled', 'preorder_limit', 'preorder_text'];
      
      // Parse data rows
      const products = [];
      const storeUrl = sessionData.shopifyStoreUrl.startsWith('https://') ? 
        sessionData.shopifyStoreUrl : 
        `https://${sessionData.shopifyStoreUrl}`;

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        if (values.length >= 4) {
          const product = {
            handle: values[0] || '',
            title: values[1] || '',
            variant_title: values[2] || 'Default',
            variant_sku: values[3] || '',
            preorder_enabled: values[4] === 'true',
            preorder_limit: parseInt(values[5]) || 0,
            preorder_text: values[6] || ''
          };
          
          products.push(product);
        }
      }

      console.log(`Parsed ${products.length} products from CSV`);

      // Save to database
      let processed = 0;
      for (const product of products) {
        try {
          await this.preorderModel.create({
            storeUrl: storeUrl,
            productHandle: product.handle,
            variantTitle: product.variant_title,
            variantSku: product.variant_sku,
            isPreorderEnabled: product.preorder_enabled,
            preorderLimit: product.preorder_limit,
            preorderText: product.preorder_text
          });
          processed++;
        } catch (error) {
          console.error('Error saving product:', product.handle, error);
        }
      }

      console.log(`Successfully processed ${processed} products`);

      return new Response(JSON.stringify({ 
        success: true, 
        message: `Successfully uploaded ${processed} products`,
        processed: processed,
        total: products.length
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
      
    } catch (error) {
      console.error('Error in uploadCsv:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'CSV upload failed',
        details: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
  }
}

export default ProductController;
