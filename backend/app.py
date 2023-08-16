from flask import Flask, request, jsonify, send_from_directory, jsonify
import tensorflow as tf
from PIL import Image
import io
import base64
from flask_cors import CORS
import numpy as np
import os
from flask import url_for
from PIL import ImageOps

app = Flask(__name__)


#CORS(app, resources={r"/predict/*": {"origins": "http://digit-classification-frontend.s3-website.us-east-2.amazonaws.com", "methods": "POST", "allow_headers": "Content-Type"}})
CORS(app)
# Load the trained model
model = tf.keras.models.load_model('mnist_model.h5')

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

        prediction = model.predict(image_array.reshape(1, 28, 28, 1)).argmax()

        # Return the prediction and the URL to the saved image
        return jsonify({"prediction": str(prediction)})
    except Exception as e:
        print(e)  # or log the exception
        return jsonify({"prediction": str(e)}), 500


@app.route('/test', methods=['GET'])
def test():    return "success"
if __name__ == '__main__':
    app.run(debug=True)
