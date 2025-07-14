#!/bin/bash

echo "🚀 Deploying Digit Classification Backend to Render..."
echo "This script will try different Python/TensorFlow configurations"
echo ""

# Check current Python version
python_version=$(python3 --version 2>&1 | cut -d' ' -f2)
echo "Current Python version: $python_version"
echo ""

# Function to deploy with specific requirements
deploy_with_requirements() {
    local req_file=$1
    local description=$2
    
    echo "📦 Trying deployment with $description..."
    
    # Backup current requirements.txt
    cp backend/requirements.txt backend/requirements.txt.backup
    
    # Copy the specific requirements file
    cp "$req_file" backend/requirements.txt
    
    echo "Updated requirements.txt with $description"
    echo "Contents:"
    cat backend/requirements.txt
    echo ""
    
    # Instructions for manual deployment
    echo "Manual deployment steps:"
    echo "1. Go to https://render.com and log in"
    echo "2. Click 'New' > 'Web Service'"
    echo "3. Connect your GitHub repository"
    echo "4. Use these settings:"
    echo "   - Name: digit-classifier-backend"
    echo "   - Runtime: Python 3"
    echo "   - Build Command: pip install --upgrade pip setuptools wheel && pip install -r backend/requirements.txt"
    echo "   - Start Command: cd backend && python app.py"
    echo "   - Plan: Free"
    echo "5. Deploy and check logs"
    echo ""
    
    read -p "Press Enter after trying this configuration (or 'q' to quit): " user_input
    
    if [[ "$user_input" == "q" ]]; then
        # Restore original requirements.txt
        cp backend/requirements.txt.backup backend/requirements.txt
        rm backend/requirements.txt.backup
        echo "Deployment cancelled. Original requirements.txt restored."
        exit 0
    fi
    
    # Restore original requirements.txt
    cp backend/requirements.txt.backup backend/requirements.txt
    rm backend/requirements.txt.backup
}

echo "🎯 We'll try different configurations for maximum compatibility:"
echo ""

# Option 1: Python 3.10 with TensorFlow 2.10-2.13
echo "Option 1: Python 3.10 with TensorFlow 2.10-2.13 (most stable)"
deploy_with_requirements "backend/requirements.txt" "Python 3.10 + TensorFlow 2.10-2.13"

# Option 2: Python 3.13 with latest TensorFlow
echo "Option 2: Python 3.13 with latest TensorFlow (if Render forces Python 3.13)"
deploy_with_requirements "backend/requirements-py313.txt" "Python 3.13 + TensorFlow 2.15+"

echo "✅ Deployment attempts completed!"
echo ""
echo "💡 If all configurations fail, the backend will use a fallback prediction method"
echo "that doesn't require TensorFlow. The app will still work!"
echo ""
echo "🔍 To check deployment status:"
echo "- Visit your Render dashboard"
echo "- Check service logs for errors"
echo "- Test the /test endpoint"
echo ""
echo "📋 Backend URL format: https://digit-classifier-backend.onrender.com" 