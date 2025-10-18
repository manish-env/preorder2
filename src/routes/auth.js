// Authentication Routes
import AuthController from '../controllers/AuthController.js';

export function setupAuthRoutes(env) {
  const authController = new AuthController(env);
  
  return {
    async signup(request, corsHeaders) {
      return await authController.signup(request, corsHeaders);
    },
    
    async connectShopify(request, corsHeaders, sessionData) {
      return await authController.connectShopify(request, corsHeaders, sessionData);
    },
    
    async login(request, corsHeaders) {
      return await authController.login(request, corsHeaders);
    },
    
    async logout(request, corsHeaders) {
      return await authController.logout(request, corsHeaders);
    },
    
    async updateSettings(request, corsHeaders) {
      return await authController.updateSettings(request, corsHeaders);
    },
    
    async getUserInfo(request, corsHeaders) {
      return await authController.getUserInfo(request, corsHeaders);
    }
  };
}
