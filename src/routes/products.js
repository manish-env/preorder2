// Product Routes
import ProductController from '../controllers/ProductController.js';

export function setupProductRoutes(env) {
  const productController = new ProductController(env);
  
  return {
    async getProducts(request, corsHeaders, sessionData) {
      return await productController.getProducts(request, corsHeaders, sessionData);
    },
    
    async uploadCsv(request, corsHeaders, sessionData) {
      return await productController.uploadCsv(request, corsHeaders, sessionData);
    }
  };
}
