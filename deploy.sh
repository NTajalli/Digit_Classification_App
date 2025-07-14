#!/bin/bash

echo "🚀 Deploying Digit Classification App to Vercel..."
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed. Installing now..."
    npm install -g vercel
fi

echo "✅ Vercel CLI is ready"
echo ""

# Deploy to Vercel
echo "📦 Starting deployment..."
vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo "Your app should now be live at the provided URL."
echo ""
echo "To deploy updates in the future, simply run:"
echo "  vercel --prod" 