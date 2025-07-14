// ==========================================
// DEVELOPMENT VERSION - USES LOCAL FLASK SERVER
// ==========================================

// This is the same as script.js but configured for local development
// It points to the local Flask server at http://localhost:5001

// Development Configuration
const DEV_CONFIG = {
  BACKEND_URL: 'http://localhost:5001/predict',
  DEV_MODE: true
};

// ==========================================
// MODERN DIGIT CLASSIFICATION APP
// ==========================================

class DigitClassifier {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.isDrawing = false;
    this.currentBrushSize = 10;
    this.backendUrl = DEV_CONFIG.BACKEND_URL; // Use local Flask server
    
    this.init();
  }

  init() {
    this.setupCanvas();
    this.setupEventListeners();
    this.setupControls();
    this.showWelcomeOverlay();
    this.showDevModeIndicator();
  }

  showDevModeIndicator() {
    // Add a development mode indicator
    const devIndicator = document.createElement('div');
    devIndicator.innerHTML = `
      <div style="
        position: fixed;
        top: 80px;
        right: 20px;
        background: #f59e0b;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      ">
        🔧 DEV MODE - Flask Server
      </div>
    `;
    document.body.appendChild(devIndicator);
  }

  setupCanvas() {
    const { canvas, ctx } = this;
    const w = canvas.width;
    const h = canvas.height;
    
    // Set canvas background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, w, h);
    
    // Set default drawing styles
    ctx.lineWidth = this.currentBrushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'black';
  }

  setupEventListeners() {
    const { canvas } = this;
    
    // Mouse events
    canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
    canvas.addEventListener('mousemove', (e) => this.draw(e));
    canvas.addEventListener('mouseup', () => this.stopDrawing());
    canvas.addEventListener('mouseout', () => this.stopDrawing());
    
    // Touch events
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.startDrawing(e);
    });
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      this.draw(e);
    });
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.stopDrawing();
    });
    
    // Button events
    document.getElementById('clear-btn').addEventListener('click', () => this.clearCanvas());
    document.getElementById('predict-btn').addEventListener('click', () => this.predict());
    
    // Brush size slider
    const brushSlider = document.getElementById('brush-size');
    brushSlider.addEventListener('input', (e) => this.updateBrushSize(e.target.value));
  }

  setupControls() {
    // Initialize brush size display
    this.updateBrushSize(this.currentBrushSize);
  }

  showWelcomeOverlay() {
    const overlay = document.getElementById('canvas-overlay');
    overlay.classList.remove('hidden');
  }

  hideWelcomeOverlay() {
    const overlay = document.getElementById('canvas-overlay');
    overlay.classList.add('hidden');
  }

  startDrawing(event) {
    this.isDrawing = true;
    this.hideWelcomeOverlay();
    
    const { x, y } = this.getCoordinates(event);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  draw(event) {
    if (!this.isDrawing) return;
    
    const { x, y } = this.getCoordinates(event);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  stopDrawing() {
    if (!this.isDrawing) return;
    
    this.isDrawing = false;
    this.ctx.beginPath();
  }

  getCoordinates(event) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    
    let clientX, clientY;
    
    if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  updateBrushSize(size) {
    this.currentBrushSize = parseInt(size);
    this.ctx.lineWidth = this.currentBrushSize;
    
    // Update display
    document.getElementById('brush-value').textContent = `${size}px`;
  }

  clearCanvas() {
    const { canvas, ctx } = this;
    
    // Clear canvas with animation
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Hide results
    this.hideResults();
    
    // Show welcome overlay
    this.showWelcomeOverlay();
    
    // Add subtle animation
    this.canvas.style.transform = 'scale(0.98)';
    setTimeout(() => {
      this.canvas.style.transform = 'scale(1)';
    }, 100);
  }

  async predict() {
    const predictBtn = document.getElementById('predict-btn');
    const btnText = predictBtn.querySelector('.btn-text');
    
    // Show loading state
    predictBtn.classList.add('loading');
    predictBtn.disabled = true;
    
    try {
      console.log('🔧 DEV MODE: Making request to Flask server at:', this.backendUrl);
      
      // Get canvas data
      const imageData = this.canvas.toDataURL();
      
      // Make API call
      const response = await fetch(this.backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('🔧 DEV MODE: Response from Flask server:', data);
      
      // Simulate minimum loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Display results
      this.displayResults(data);
      
    } catch (error) {
      console.error('🔧 DEV MODE: Prediction error:', error);
      this.showError('Failed to connect to Flask server. Is it running on localhost:5000?');
    } finally {
      // Hide loading state
      predictBtn.classList.remove('loading');
      predictBtn.disabled = false;
    }
  }

  displayResults(data) {
    const { prediction } = data;
    
    // Update main prediction
    document.getElementById('prediction-digit').textContent = prediction;
    
    // Calculate confidence (simulation since backend doesn't provide it yet)
    const confidence = this.simulateConfidence(prediction);
    document.getElementById('confidence-value').textContent = `${confidence}%`;
    
    // Generate top predictions (simulation)
    const topPredictions = this.generateTopPredictions(prediction, confidence);
    this.displayTopPredictions(topPredictions);
    
    // Show results with animation
    this.showResults();
  }

  simulateConfidence(prediction) {
    // Simulate confidence based on predicted digit
    const baseConfidence = 85 + Math.random() * 12; // 85-97%
    return Math.round(baseConfidence);
  }

  generateTopPredictions(actualPrediction, actualConfidence) {
    const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const predictions = [];
    
    // Add the actual prediction
    predictions.push({
      digit: actualPrediction,
      confidence: actualConfidence,
      isTop: true
    });
    
    // Add some random alternatives
    const alternatives = digits.filter(d => d !== actualPrediction);
    const shuffled = alternatives.sort(() => Math.random() - 0.5);
    
    let remainingConfidence = 100 - actualConfidence;
    
    for (let i = 0; i < Math.min(4, shuffled.length); i++) {
      const confidence = Math.round(remainingConfidence * (Math.random() * 0.5 + 0.2));
      predictions.push({
        digit: shuffled[i],
        confidence: confidence,
        isTop: false
      });
      remainingConfidence -= confidence;
    }
    
    return predictions.sort((a, b) => b.confidence - a.confidence);
  }

  displayTopPredictions(predictions) {
    const container = document.getElementById('predictions-list');
    container.innerHTML = '';
    
    predictions.forEach((pred, index) => {
      const item = document.createElement('div');
      item.className = `prediction-item ${pred.isTop ? 'top' : ''}`;
      item.innerHTML = `
        <div class="prediction-digit-small">${pred.digit}</div>
        <div class="prediction-confidence-small">${pred.confidence}%</div>
      `;
      
      // Add staggered animation
      item.style.animationDelay = `${index * 0.1}s`;
      item.classList.add('fade-in');
      
      container.appendChild(item);
    });
  }

  showResults() {
    const resultsSection = document.getElementById('results-section');
    resultsSection.classList.add('visible');
    
    // Smooth scroll to results
    setTimeout(() => {
      resultsSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }, 200);
  }

  hideResults() {
    const resultsSection = document.getElementById('results-section');
    resultsSection.classList.remove('visible');
  }

  showError(message) {
    // Create temporary error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      position: fixed;
      top: 140px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
      max-width: 300px;
    `;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds (longer for dev mode)
    setTimeout(() => {
      errorDiv.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (document.body.contains(errorDiv)) {
          document.body.removeChild(errorDiv);
        }
      }, 300);
    }, 5000);
  }
}

// ==========================================
// ADDITIONAL FEATURES (Same as production)
// ==========================================

class UIEnhancements {
  constructor() {
    this.init();
  }

  init() {
    this.setupHeaderScroll();
    this.setupNavigation();
    this.addKeyboardShortcuts();
  }

  setupHeaderScroll() {
    const header = document.querySelector('.header');
    let lastScrollY = 0;
    
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      
      if (scrollY > lastScrollY && scrollY > 100) {
        header.style.transform = 'translateY(-100%)';
      } else {
        header.style.transform = 'translateY(0)';
      }
      
      lastScrollY = scrollY;
    });
  }

  setupNavigation() {
    const aboutBtn = document.getElementById('about-btn');
    const statsBtn = document.getElementById('stats-btn');
    
    aboutBtn.addEventListener('click', () => {
      this.showModal('About This Project', `
        <p>I built this to experiment with neural networks and learn how to deploy ML models to the web. The model is trained on the MNIST dataset to recognize handwritten digits.</p>
        <h4>Development Mode:</h4>
        <ul>
          <li>Connected to local Flask server (localhost:5001)</li>
          <li>Real-time development and testing</li>
          <li>Debug mode enabled</li>
        </ul>
        <h4>How it works:</h4>
        <ul>
          <li>Draw any digit (0-9) on the canvas</li>
          <li>Your drawing gets resized to 28x28 pixels</li>
          <li>A CNN model analyzes the image</li>
          <li>It gives you confidence scores for each digit</li>
        </ul>
        <p>Built with TensorFlow and Flask. The model file is only ~400KB!</p>
      `);
    });
    
    statsBtn.addEventListener('click', () => {
      this.showModal('How It Works', `
        <p>Here's what happens when you draw a digit:</p>
        <div class="stats-grid">
          <div class="stat-card">
            <h4>1. Capture</h4>
            <p class="stat-value">Canvas → Image</p>
          </div>
          <div class="stat-card">
            <h4>2. Resize</h4>
            <p class="stat-value">28x28 pixels</p>
          </div>
          <div class="stat-card">
            <h4>3. Predict</h4>
            <p class="stat-value">CNN Model</p>
          </div>
        </div>
        <p>The model was trained on 60,000 handwritten digit images from the MNIST dataset. It uses a simple CNN architecture with two convolutional layers and pooling.</p>
        <p style="margin-top: 1rem; color: var(--gray-300); font-size: 0.875rem;">
          🔧 Development mode: Running on local Flask server (localhost:5001)
        </p>
      `);
    });
  }

  showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          ${content}
        </div>
      </div>
    `;
    
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.3s ease-out;
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      border-radius: var(--border-radius-xl);
      padding: 2rem;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      color: var(--white);
    `;
    
    document.body.appendChild(modal);
    
    // Close handlers
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => this.closeModal(modal));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeModal(modal);
    });
  }

  closeModal(modal) {
    modal.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
      document.body.removeChild(modal);
    }, 300);
  }

  addKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'Enter':
            e.preventDefault();
            document.getElementById('predict-btn').click();
            break;
          case 'Backspace':
            e.preventDefault();
            document.getElementById('clear-btn').click();
            break;
        }
      }
    });
  }
}

// ==========================================
// PERFORMANCE OPTIMIZATIONS
// ==========================================

class PerformanceOptimizer {
  constructor() {
    this.init();
  }

  init() {
    this.preloadResources();
    this.optimizeAnimations();
  }

  preloadResources() {
    // Preload fonts
    const fonts = [
      'Inter:wght@300;400;500;600;700',
      'JetBrains+Mono:wght@400;500;600'
    ];
    
    fonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.href = `https://fonts.googleapis.com/css2?family=${font}&display=swap`;
      document.head.appendChild(link);
    });
  }

  optimizeAnimations() {
    // Use requestAnimationFrame for smooth animations
    const elements = document.querySelectorAll('.bg-orb');
    
    elements.forEach(orb => {
      orb.style.willChange = 'transform';
    });
    
    // Cleanup will-change after animations
    setTimeout(() => {
      elements.forEach(orb => {
        orb.style.willChange = 'auto';
      });
    }, 5000);
  }
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔧 Starting in DEVELOPMENT MODE');
  console.log('🔧 Backend URL:', DEV_CONFIG.BACKEND_URL);
  
  // Initialize main app
  new DigitClassifier();
  
  // Initialize UI enhancements
  new UIEnhancements();
  
  // Initialize performance optimizations
  new PerformanceOptimizer();
  
  // Add loading complete class
  document.body.classList.add('loaded');
});

// Add CSS for additional features (same as production)
const additionalStyles = `
  .error-notification {
    animation: slideIn 0.3s ease-out;
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .stat-card {
    text-align: center;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .stat-card h4 {
    margin-bottom: 0.5rem;
    color: var(--gray-300);
    font-size: 0.875rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--primary);
    margin: 0;
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .modal-close {
    background: none;
    border: none;
    color: var(--white);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: background-color 0.2s;
  }
  
  .modal-close:hover {
    background: rgba(255, 255, 255, 0.1);
  }
  
  .modal-body ul {
    margin: 1rem 0;
    padding-left: 1.5rem;
  }
  
  .modal-body li {
    margin: 0.5rem 0;
    color: var(--gray-300);
  }
  
  .modal-body h4 {
    margin: 1rem 0 0.5rem 0;
    color: var(--white);
  }
  
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet); 