# Shopify Preorder Dashboard

A modern dashboard for managing preorder settings in Shopify stores, built with Vue.js and deployable on Cloudflare Workers.

## Features

- 🛍️ **Product Management**: View and manage all products and variants
- 🔍 **Smart Search**: Backend-powered search with suggestions
- 📦 **Preorder Controls**: Toggle preorder status and set limits
- 📊 **Real-time Stats**: Live product and variant counts
- 🎨 **Modern UI**: Dark theme with responsive design
- ⚡ **Fast Performance**: Built for Cloudflare Workers

## Quick Start

### Prerequisites

- Node.js 18+ 
- Cloudflare account
- Shopify store with Admin API access

### Installation

1. **Clone and install dependencies**:
   ```bash
   npm install
   ```

2. **Configure your Shopify credentials** in `wrangler.toml`:
   ```toml
   [vars]
   SHOPIFY_STORE_URL = "https://your-store.myshopify.com"
   SHOPIFY_ADMIN_API_ACCESS_TOKEN = "shpat_your_access_token"
   ```

3. **Deploy to Cloudflare Workers**:
   ```bash
   npm run deploy
   ```

### Development

```bash
# Start local development server
npm run dev

# Deploy to production
npm run deploy
```

## Configuration

### Shopify Setup

1. **Create a Private App** in your Shopify Admin:
   - Go to Apps → App and sales channel settings
   - Click "Develop apps" → "Create an app"
   - Enable Admin API access
   - Copy the Admin API access token

2. **Create Metafields** (optional, will be created automatically):
   - `custom.is_preorder` (Boolean) for product variants
   - `custom.preorder_limit` (Integer) for product variants

### Environment Variables

Set these in your `wrangler.toml`:

```toml
[vars]
SHOPIFY_STORE_URL = "https://your-store.myshopify.com"
SHOPIFY_ADMIN_API_ACCESS_TOKEN = "shpat_your_token"
```

## API Endpoints

- `GET /` - Dashboard interface
- `GET /api/products?search=query` - Fetch products with optional search
- `GET /api/search-suggestions?q=query` - Get search suggestions
- `POST /api/update-metafields` - Update preorder settings

## Deployment Options

### Cloudflare Workers (Recommended)

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler deploy
```

### Cloudflare Pages

1. Connect your GitHub repository
2. Set build command: `echo "Static deployment"`
3. Set output directory: `/`
4. Deploy!

## Usage

1. **Access your dashboard** at your deployed URL
2. **Search products** using the search bar
3. **Toggle preorder** on any variant
4. **Set preorder limits** for each variant
5. **Save changes** to update Shopify

## Features Explained

### Search Functionality
- **Backend search**: Uses Shopify's GraphQL API for fast, accurate results
- **Real-time suggestions**: Shows product suggestions as you type
- **Fuzzy matching**: Finds products even with typos

### Preorder Management
- **Toggle switches**: Easy on/off for preorder status
- **Limit setting**: Set maximum preorder quantities
- **Visual indicators**: Color-coded status indicators
- **Bulk operations**: Save multiple changes at once

### Stock Management
- **Real inventory**: Shows actual Shopify stock levels
- **Preorder override**: Allow preorders even when out of stock
- **Visual indicators**: Green (in stock), Red (out of stock), Orange (preorder)

## Troubleshooting

### Common Issues

1. **"Shopify store URL or Access Token is not configured"**
   - Check your `wrangler.toml` configuration
   - Verify your Shopify credentials

2. **"Error fetching data from Shopify"**
   - Check your Admin API access token permissions
   - Ensure your store URL is correct

3. **Metafields not saving**
   - Check your Admin API permissions for metafields
   - Verify the metafield namespace and keys

### Debug Mode

Enable debug logging by checking the browser console and Cloudflare Workers logs.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:
- Check the troubleshooting section
- Review Cloudflare Workers documentation
- Check Shopify Admin API documentation
