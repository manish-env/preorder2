# Shopify Preorder Dashboard

A modern, professional dashboard for managing preorder settings in Shopify stores, built with Vue.js and deployable on Cloudflare Workers.

## 🎯 Features

- **Professional Dark Theme** - Modern glass morphism design
- **Real-time Search** - Backend-powered search with suggestions
- **Preorder Management** - Toggle preorder status and set limits
- **Live Statistics** - Product and variant counts
- **Responsive Design** - Works on all devices
- **Cloudflare Workers** - Fast, global deployment

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Cloudflare account
- Shopify store with Admin API access

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/manish-env/preorder2.git
   cd preorder2
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure your Shopify credentials** in `wrangler.toml`:
   ```toml
   [vars]
   SHOPIFY_STORE_URL = "https://your-store.myshopify.com"
   SHOPIFY_ADMIN_API_ACCESS_TOKEN = "shpat_your_access_token"
   ```

4. **Start development server**:
   ```bash
   wrangler dev
   ```

5. **Deploy to production**:
   ```bash
   wrangler deploy
   ```

## 🔧 Configuration

### Shopify Setup

1. **Create a Private App** in your Shopify Admin:
   - Go to Apps → App and sales channel settings
   - Click "Develop apps" → "Create an app"
   - Enable Admin API access
   - Copy the Admin API access token

2. **Update `wrangler.toml`** with your credentials:
   ```toml
   [vars]
   SHOPIFY_STORE_URL = "https://your-store.myshopify.com"
   SHOPIFY_ADMIN_API_ACCESS_TOKEN = "shpat_your_token"
   ```

## 📁 Project Structure

```
├── src/
│   └── worker.js          # Cloudflare Worker (API endpoints)
├── index.html             # Professional dashboard UI
├── app.js                 # Express.js server (alternative)
├── wrangler.toml          # Cloudflare Workers configuration
├── package.json           # Dependencies
└── README.md              # This file
```

## 🎨 Design Features

- **Dark Theme** with professional color scheme
- **Glass Morphism** effects throughout
- **Smooth Animations** and micro-interactions
- **Professional Typography** with Inter font
- **Responsive Layout** for all devices
- **Modern UI Components** (toggles, badges, buttons)

## 🔌 API Endpoints

- `GET /` - Dashboard interface
- `GET /api/products?search=query` - Fetch products with optional search
- `GET /api/search-suggestions?q=query` - Get search suggestions
- `POST /api/update-metafields` - Update preorder settings

## 🚀 Deployment Options

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

## 🛠️ Development

```bash
# Start local development
wrangler dev

# Deploy to production
wrangler deploy

# View logs
wrangler tail
```

## 🔒 Security

- **No hardcoded credentials** in the repository
- **Environment variables** for sensitive data
- **CORS protection** built-in
- **Input validation** on all endpoints

## 📝 Usage

1. **Access your dashboard** at the deployed URL
2. **Search products** using the search bar
3. **Toggle preorder** on any variant
4. **Set preorder limits** for each variant
5. **Save changes** to update Shopify

## 🐛 Troubleshooting

### Common Issues

1. **"Shopify store URL or Access Token is not configured"**
   - Check your `wrangler.toml` configuration
   - Verify your Shopify credentials

2. **"Error fetching data from Shopify"**
   - Check your Admin API access token permissions
   - Ensure your store URL is correct

3. **"Save failed: Network Error"**
   - Check Cloudflare Workers logs: `wrangler tail`
   - Verify API endpoint responses

### Debug Mode

Enable debug logging by checking the browser console and Cloudflare Workers logs.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
- Check the troubleshooting section
- Review Cloudflare Workers documentation
- Check Shopify Admin API documentation

## 🎉 Features in Detail

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