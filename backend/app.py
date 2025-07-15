from flask import Flask, request, jsonify, send_from_directory, jsonify
from flask_cors import CORS
import numpy as np
import os
from flask import url_for
from PIL import Image, ImageOps
import io
import base64

app = Flask(__name__)

# Configure CORS for production
CORS(app, origins=['*'])

# Check if we should use fallback only
USE_FALLBACK_ONLY = os.environ.get('USE_FALLBACK_ONLY', '0') == '1'

# Try to load TensorFlow model, fall back to simple prediction if it fails
model = None
if not USE_FALLBACK_ONLY:
    try:
        import tensorflow as tf
        model = tf.keras.models.load_model('mnist_model.h5')
        print("✅ TensorFlow model loaded successfully")
    except Exception as e:
        print(f"⚠️ Could not load TensorFlow model: {e}")
        print("Using fallback prediction method")
else:
    print("🔄 Using fallback prediction method only (USE_FALLBACK_ONLY=1)")

def predict_digit_simple(image_array):
    """
    Simple heuristic-based digit recognition fallback
    """
    # Convert to binary
    binary_image = (image_array > 0.5).astype(int)
    
    # Count pixels in different regions
    height, width = binary_image.shape
    
    # Divide image into regions for analysis
    top_half = binary_image[:height//2, :]
    bottom_half = binary_image[height//2:, :]
    left_half = binary_image[:, :width//2]
    right_half = binary_image[:, width//2:]
    center = binary_image[height//4:3*height//4, width//4:3*width//4]
    
    # Count white pixels in each region
    top_pixels = np.sum(top_half)
    bottom_pixels = np.sum(bottom_half)
    left_pixels = np.sum(left_half)
    right_pixels = np.sum(right_half)
    center_pixels = np.sum(center)
    total_pixels = np.sum(binary_image)
    
    # Simple heuristics based on pixel distribution
    if total_pixels < 50:  # Very few pixels
        return 1
    elif center_pixels > total_pixels * 0.6:  # Dense center
        return 0
    elif top_pixels > bottom_pixels * 1.5:  # Top heavy
        return 7
    elif bottom_pixels > top_pixels * 1.5:  # Bottom heavy
        return 2
    elif left_pixels > right_pixels * 1.2:  # Left heavy
        return 5
    elif right_pixels > left_pixels * 1.2:  # Right heavy
        return 3
    else:
        # Fallback based on total pixels
        return int(np.random.choice([4, 6, 8, 9]))

@app.route('/predict', methods=['POST'])
def predict():
    try:
        image_data = request.json['image']
        decoded_image = base64.b64decode(image_data.split(',')[1])
        image = Image.open(io.BytesIO(decoded_image))
        image = image.convert('L')
        image = image.resize((28, 28))
        image = ImageOps.invert(image)
        image_array = np.array(image) / 255.0

        if model is not None:
            # Use TensorFlow model
            prediction = model.predict(image_array.reshape(1, 28, 28, 1)).argmax()
            prediction_method = "tensorflow"
        else:
            # Use fallback method
            prediction = predict_digit_simple(image_array)
            prediction_method = "fallback"

        return jsonify({
            "prediction": str(prediction),
            "method": prediction_method
        })
    except Exception as e:
        print(f"Error in prediction: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/test', methods=['GET'])
def test():
    model_status = "loaded" if model is not None else "fallback"
    return jsonify({
        "status": "success", 
        "message": "Digit classifier backend is running",
        "model_status": model_status,
        "fallback_only": USE_FALLBACK_ONLY
    })

@app.route('/', methods=['GET'])
def home():
    if USE_FALLBACK_ONLY:
        model_status = "Using fallback prediction only"
    else:
        model_status = "TensorFlow model loaded" if model is not None else "Using fallback prediction"
    
    return jsonify({
        "service": "Digit Classification Backend",
        "model_status": model_status,
        "fallback_only": USE_FALLBACK_ONLY,
        "endpoints": {
            "predict": "/predict",
            "test": "/test"
        }
    })

if __name__ == '__main__':
    # Get port from environment variable (Render sets this)
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
