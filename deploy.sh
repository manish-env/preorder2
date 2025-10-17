#!/bin/bash

# Cloudflare Workers Deploy Script
echo "🚀 Deploying to Cloudflare Workers..."

# Install dependencies
npm install

# Deploy to Cloudflare
npx wrangler deploy

echo "✅ Deployment complete!"
