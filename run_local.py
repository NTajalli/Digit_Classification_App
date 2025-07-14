#!/usr/bin/env python3
"""
Local Development Server for Digit Classification App
Run this script to start the Flask backend locally for development
"""

import os
import sys
import subprocess
from pathlib import Path

def setup_virtual_env():
    """Create and activate virtual environment using Python 3.11"""
    venv_path = Path('.venv')
    
    if not venv_path.exists():
        print("📦 Creating virtual environment with Python 3.11...")
        # Use Python 3.11 for better TensorFlow compatibility
        subprocess.run(['python3.11', '-m', 'venv', '.venv'], check=True)
        print("✅ Virtual environment created with Python 3.11")
    
    # Determine activation script based on OS
    if os.name == 'nt':  # Windows
        activate_script = venv_path / 'Scripts' / 'activate'
        pip_path = venv_path / 'Scripts' / 'pip'
        python_path = venv_path / 'Scripts' / 'python'
    else:  # macOS/Linux
        activate_script = venv_path / 'bin' / 'activate'
        pip_path = venv_path / 'bin' / 'pip'
        python_path = venv_path / 'bin' / 'python'
    
    return str(pip_path), str(python_path)

def install_dependencies(pip_path):
    """Install required dependencies"""
    print("📚 Installing dependencies...")
    
    # Upgrade pip first
    subprocess.run([pip_path, 'install', '--upgrade', 'pip'], check=True)
    
    # Install backend dependencies
    subprocess.run([pip_path, 'install', '-r', 'backend/requirements.txt'], check=True)
    
    print("✅ Dependencies installed successfully")

def start_flask_server(python_path):
    """Start the Flask development server"""
    print("🚀 Starting Flask development server...")
    print("📍 Backend will be available at: http://localhost:5000")
    print("🔍 API endpoint: http://localhost:5000/predict")
    print("🌐 Frontend (dev mode): Open index-dev.html in your browser")
    print("🛑 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    # Change to backend directory and run Flask app
    os.chdir('backend')
    
    # Set environment variables for Flask
    env = os.environ.copy()
    env['FLASK_APP'] = 'app.py'
    env['FLASK_ENV'] = 'development'
    env['FLASK_DEBUG'] = '1'
    
    try:
        subprocess.run([python_path, 'app.py'], env=env, check=True)
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")

def main():
    """Main function to set up and run local development server"""
    print("🎯 Digit Classification App - Local Development Setup")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not Path('backend/app.py').exists():
        print("❌ Error: Please run this script from the project root directory")
        sys.exit(1)
    
    # Check if Python 3.11 is available
    try:
        subprocess.run(['python3.11', '--version'], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("❌ Error: Python 3.11 is required but not found.")
        print("💡 Please install Python 3.11 or use: brew install python@3.11")
        sys.exit(1)
    
    try:
        # Setup virtual environment
        pip_path, python_path = setup_virtual_env()
        
        # Install dependencies
        install_dependencies(pip_path)
        
        # Start Flask server
        start_flask_server(python_path)
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error during setup: {e}")
        print("💡 Try running: rm -rf .venv && python3 run_local.py")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n👋 Setup cancelled by user")
        sys.exit(0)

if __name__ == '__main__':
    main() 