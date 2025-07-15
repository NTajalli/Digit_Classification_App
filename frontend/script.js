let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
w = canvas.width;
h = canvas.height;
ctx.fillStyle = "white";
ctx.fillRect(0, 0, w, h);
let isDrawing = false;

// Configure backend URL based on environment
const BACKEND_URL = 'https://digit-classifier-backend.onrender.com/predict';

// Handle mouse events
canvas.addEventListener('mousedown', () => { isDrawing = true; });
canvas.addEventListener('mouseup', () => { isDrawing = false; ctx.beginPath(); });
canvas.addEventListener('mousemove', draw);

// Handle touch events
canvas.addEventListener('touchstart', (event) => {
  isDrawing = true;
  if (event.touches) {
    event.preventDefault(); // Prevent the default action
  }
});
canvas.addEventListener('touchend', () => {
  isDrawing = false;
  ctx.beginPath();
});
canvas.addEventListener('touchmove', (event) => {
  if (event.touches) {
    event.preventDefault(); // Prevent the default action
  }
  draw(event);
});

function draw(event) {
  if (!isDrawing) return;

  // Set drawing attributes
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'black';

  // Get the current coordinates
  const rect = canvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
  if (event.touches) {
    x = event.touches[0].clientX - rect.left;
    y = event.touches[0].clientY - rect.top;
  }

  // Draw a line to the new coordinates
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function submitDrawing() {
  var drawnImage = canvas.toDataURL();
  
  // Show loading state
  document.getElementById('predictionMessage').innerText = 'Predicting...';
  document.getElementById('predictionMessage').style.display = 'block';
  
  fetch(BACKEND_URL, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ image: drawnImage }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => displayPrediction(data))
    .catch((error) => {
      console.error('Error:', error);
      document.getElementById('predictionMessage').innerText = 'Error: Could not connect to prediction service. Please try again.';
      document.getElementById('predictionMessage').style.display = 'block';
    });
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  w = canvas.width;
  h = canvas.height;
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, w, h);
  isDrawing = false;
  document.getElementById("predictionMessage").style.display = "none";
}

function displayPrediction(data) {
  const { prediction, confidence, top_predictions, method } = data;
  
  // Show main prediction
  let message = `Did you draw a ${prediction}?`;
  
  // Add confidence if available
  if (confidence) {
    message += ` (${confidence}% confidence)`;
  }
  
  // Add method info
  if (method) {
    const methodText = method === 'tensorflow' ? 'Neural Network' : 'Heuristic Analysis';
    message += ` - ${methodText}`;
  }
  
  document.getElementById('predictionMessage').innerText = message;
  document.getElementById('predictionMessage').style.display = 'block';
  
  // Show top predictions if available
  if (top_predictions && top_predictions.length > 1) {
    let topPredictionsText = '\nTop predictions: ';
    top_predictions.slice(0, 3).forEach((pred, index) => {
      if (index > 0) topPredictionsText += ', ';
      topPredictionsText += `${pred.digit} (${pred.confidence}%)`;
    });
    
    document.getElementById('predictionMessage').innerText += topPredictionsText;
  }
}
