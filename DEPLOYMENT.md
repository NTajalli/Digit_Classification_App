# Deployment Guide

This guide explains how to deploy the Digit Classification App with the backend on Render (free) and frontend on Vercel (free).

## Architecture

- **Backend**: Flask API with TensorFlow model → Deployed on Render
- **Frontend**: Static HTML/CSS/JS → Deployed on Vercel
- **Model**: MNIST digit classification model (stored in backend)

## Prerequisites

- Git repository pushed to GitHub
- Render account (free)
- Vercel account (free)

## Step 1: Deploy Backend to Render

### 1.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Authorize Render to access your repositories

### 1.2 Deploy Backend Service
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `digit-classifier-backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && python app.py`
   - **Plan**: Free
4. Click "Deploy"

### 1.3 Configure Environment (Optional)
If needed, add environment variables:
- `FLASK_ENV=production`
- `PORT` (automatically set by Render)

### 1.4 Get Your Backend URL
After deployment, your backend will be available at:
```
https://digit-classifier-backend.onrender.com
```

## Step 2: Update Frontend Configuration

The frontend is already configured to use the Render backend URL:
```javascript
const BACKEND_URL = 'https://digit-classifier-backend.onrender.com/predict';
```

If you need to change the backend URL, update it in:
- `frontend/script.js`
- `script.js`

## Step 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Authorize Vercel to access your repositories

### 3.2 Deploy Frontend
1. Click "New Project"
2. Select your repository
3. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (keep as root)
   - **Build Command**: Leave empty
   - **Output Directory**: `./`
4. Click "Deploy"

### 3.3 Configure Domain (Optional)
- Use the provided `.vercel.app` domain
- Or configure a custom domain in project settings

## Step 4: Test the Deployment

1. Visit your Vercel frontend URL
2. Draw a digit on the canvas
3. Click "Submit" to test the prediction
4. The frontend should successfully call the Render backend

## Troubleshooting

### Backend Issues
- Check Render logs for errors
- Ensure `mnist_model.h5` is in the `backend/` directory
- Verify all dependencies are in `backend/requirements.txt`

### Frontend Issues
- Check browser console for CORS errors
- Verify the backend URL is correct
- Ensure the backend is running and accessible

### CORS Issues
The backend is configured with `CORS(app, origins=['*'])` to allow all origins.

## Free Tier Limitations

### Render Free Tier
- 750 hours/month (enough for continuous deployment)
- Service spins down after 15 minutes of inactivity
- Cold start time: ~30 seconds
- 512MB RAM, 0.1 CPU

### Vercel Free Tier
- 100GB bandwidth/month
- 1000 deployments/month
- No cold start (static files)

## Costs

Both services are completely free for this use case. No credit card required.

## Monitoring

- **Render**: Check service status and logs in dashboard
- **Vercel**: Monitor deployments and analytics in dashboard
- **Uptime**: Consider using a service like UptimeRobot for monitoring

## Updates

To update the application:
1. Push changes to GitHub
2. Render will automatically redeploy the backend
3. Vercel will automatically redeploy the frontend

## Security Notes

- The backend allows all CORS origins for simplicity
- In production, you might want to restrict CORS to your frontend domain
- No authentication is required for this demo application 