let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
w = canvas.width;
h = canvas.height;
ctx.fillStyle = "white";
ctx.fillRect(0, 0, w, h);
let isDrawing = false;
var backendUrl = 'http://34.211.87.204/predict';

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
  
  fetch(backendUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 
    'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ image: drawnImage }),
  })
    .then((response) => response.json())
    .then((data) => displayPrediction(data)); 
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
  var message = "Did you draw a " + data.prediction + "?";
  document.getElementById('predictionMessage').innerText = message;
  document.getElementById("predictionMessage").style.display = "block";
}
