// ==========================================
// MODERN DIGIT CLASSIFICATION APP
// ==========================================

class DigitClassifier {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.isDrawing = false;
    this.currentBrushSize = 10;
    
    // Configure backend URL for production
    this.backendUrl = 'https://digit-classification-app.onrender.com/predict';
    
    this.init();
  }

  init() {
    this.setupCanvas();
    this.setupEventListeners();
    this.setupControls();
    this.showWelcomeOverlay();
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
      // Get canvas data
      const imageData = this.canvas.toDataURL();
      
      // Make API call to Render backend
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
      
      // Simulate minimum loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Display results
      this.displayResults(data);
      
    } catch (error) {
      console.error('Prediction error:', error);
      this.showError('Failed to predict. Please check your connection and try again.');
    } finally {
      // Hide loading state
      predictBtn.classList.remove('loading');
      predictBtn.disabled = false;
    }
  }

  displayResults(data) {
    const { prediction, confidence, top_predictions, method } = data;
    
    // Update main prediction
    document.getElementById('prediction-digit').textContent = prediction;
    
    // Use actual confidence from backend
    document.getElementById('confidence-value').textContent = `${confidence}%`;
    
    // Show prediction method
    const methodElement = document.getElementById('prediction-method');
    if (methodElement) {
      methodElement.textContent = method === 'tensorflow' ? 'Neural Network' : 'Heuristic Analysis';
    }
    
    // Display real top predictions from backend
    if (top_predictions && top_predictions.length > 0) {
      this.displayTopPredictions(top_predictions);
    }
    
    // Show results with animation
    this.showResults();
  }

  displayTopPredictions(predictions) {
    const container = document.getElementById('predictions-list');
    container.innerHTML = '';
    
    predictions.forEach((pred, index) => {
      const item = document.createElement('div');
      item.className = `prediction-item ${index === 0 ? 'top' : ''}`;
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
      top: 100px;
      right: 20px;
      background: #ef4444;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
      errorDiv.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        document.body.removeChild(errorDiv);
      }, 300);
    }, 3000);
  }
}

// ==========================================
// ADDITIONAL FEATURES
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
        <h4>How it works:</h4>
        <ul>
          <li>Draw any digit (0-9) on the canvas</li>
          <li>Your drawing gets resized to 28x28 pixels</li>
          <li>A CNN model analyzes the image</li>
          <li>It gives you confidence scores for each digit</li>
        </ul>
        <p>Built with TensorFlow, backend deployed on Render, frontend on Vercel!</p>
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
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  optimizeAnimations() {
    // Reduce animations on slower devices
    const isSlowDevice = navigator.hardwareConcurrency < 4;
    
    if (isSlowDevice) {
      document.documentElement.style.setProperty('--animation-duration', '0.2s');
    }
  }
}

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  new DigitClassifier();
  new UIEnhancements();
  new PerformanceOptimizer();
});

// Add CSS for additional features
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