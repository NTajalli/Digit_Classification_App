import json
import base64
import io
import requests
import numpy as np
from PIL import Image, ImageOps

def handler(request, response):
    # Handle CORS preflight requests
    if request.method == 'OPTIONS':
        response.status_code = 200
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'POST'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return ''
    
    if request.method != 'POST':
        response.status_code = 405
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Content-Type'] = 'application/json'
        return json.dumps({'error': 'Method not allowed'})
    
    try:
        # Parse the request body
        body = json.loads(request.body)
        image_data = body['image']
        
        # Decode the base64 image
        decoded_image = base64.b64decode(image_data.split(',')[1])
        image = Image.open(io.BytesIO(decoded_image))
        
        # Process the image
        image = image.convert('L')  # Convert to grayscale
        image = image.resize((28, 28))  # Resize to 28x28
        image = ImageOps.invert(image)  # Invert colors
        image_array = np.array(image) / 255.0  # Normalize
        
        # For now, implement a simple pattern matching approach
        # This is a basic fallback that looks for simple patterns
        prediction = predict_digit_simple(image_array)
        
        response.status_code = 200
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Content-Type'] = 'application/json'
        return json.dumps({'prediction': str(prediction)})
        
    except Exception as e:
        response.status_code = 500
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Content-Type'] = 'application/json'
        return json.dumps({'error': str(e)})

def predict_digit_simple(image_array):
    """
    Simple heuristic-based digit recognition
    This is a fallback method that uses basic image analysis
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
    # This is a very basic approach - in practice, you'd use ML
    
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
        # Random fallback - in practice, you'd use actual ML
        return int(np.random.choice([4, 6, 8, 9])) 