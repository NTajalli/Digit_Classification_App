# Digit Classification App

A web application for handwritten digit classification using a trained neural network. Draw digits 0-9 on the canvas and get real-time predictions!

## 🚀 Live Demo

- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render (free tier)

## 🏗️ Architecture

- **Frontend**: HTML/CSS/JavaScript with canvas drawing
- **Backend**: Flask API with TensorFlow/Keras model
- **Model**: CNN trained on MNIST dataset
- **Deployment**: Split deployment (frontend on Vercel, backend on Render)

## Features

- Interactive canvas for drawing digits (0-9)
- Real-time digit classification using TensorFlow/Keras
- Responsive design for desktop and mobile
- Modern glassmorphism UI design
- Free hosting on Render + Vercel

## Project Structure

```
├── frontend/
│   ├── index.html      # Simple frontend
│   ├── script.js       # Basic canvas functionality
│   └── style.css       # Basic styling
├── backend/
│   ├── app.py          # Flask API with ML model
│   ├── mnist_model.h5  # Trained MNIST model
│   └── requirements.txt # Python dependencies
├── api/
│   └── predict.py      # Fallback serverless function
├── index.html          # Main modern frontend
├── script.js           # Enhanced frontend JavaScript
├── style.css           # Modern styling
├── render.yaml         # Render deployment config
├── vercel.json         # Vercel deployment config
└── DEPLOYMENT.md       # Deployment instructions
```

## Quick Start

### Option 1: Use Deployed Version
Just visit the deployed frontend URL and start drawing!

### Option 2: Local Development
1. **Clone the repository**:
   ```bash
   git clone [your-repo-url]
   cd Digit_Classification_App
   ```

2. **Run the local development server**:
   ```bash
   python3 run_local.py
   ```

3. **Open the frontend**:
   - Open `index.html` in your browser
   - The app will connect to the local backend at `http://localhost:5000`

## Deployment

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deployment Summary:

1. **Backend to Render**:
   - Create Render account
   - Deploy as Web Service
   - Use `render.yaml` configuration

2. **Frontend to Vercel**:
   - Create Vercel account
   - Deploy from GitHub
   - Automatic deployment on push

## How it Works

1. User draws a digit on the HTML5 canvas
2. Frontend sends the canvas image data (base64) to the Render backend
3. Flask API processes the image:
   - Converts to grayscale
   - Resizes to 28x28 pixels
   - Inverts colors (white background → black)
   - Normalizes pixel values (0-1 range)
4. TensorFlow model predicts the digit
5. Result is returned to the frontend and displayed

## Model Details

- **Architecture**: Convolutional Neural Network (CNN)
- **Training Dataset**: MNIST (60,000 handwritten digits)
- **Input**: 28x28 grayscale images
- **Output**: Classification probabilities for digits 0-9
- **Model Size**: ~400KB

## Technologies Used

- **Frontend**: HTML5 Canvas, Vanilla JavaScript, CSS3
- **Backend**: Python, Flask, TensorFlow/Keras, PIL
- **Deployment**: Render (backend) + Vercel (frontend)
- **Model**: Pre-trained MNIST digit classification model

## Free Tier Benefits

- **Render**: 750 hours/month (sufficient for continuous deployment)
- **Vercel**: 100GB bandwidth, 1000 deployments/month
- **No credit card required** for either service
- **Automatic SSL** certificates
- **GitHub integration** for automatic deployments

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally using `python3 run_local.py`
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE). 