# Deployment Guide - Render.com

This guide walks you through deploying the **Play with Friends Stream** application to Render's free tier.

## 📋 Prerequisites

- [x] GitHub account
- [x] Code pushed to GitHub repository: `github.com/sagardampba2022w/play-with-friends-stream`
- [ ] Render account (free at [render.com](https://render.com))

## 🚀 Deployment Steps

### Step 1: Push Latest Code to GitHub

Make sure all your latest changes are committed and pushed:

```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### Step 2: Create Render Account

1. Go to [render.com](https://render.com)
2. Click **"Get Started for Free"**
3. Sign up with your GitHub account (recommended for easier integration)

### Step 3: Connect Your Repository

1. From the Render dashboard, click **"New +"** → **"Blueprint"**
2. Click **"Connect a repository"**
3. If prompted, authorize Render to access your GitHub account
4. Select your repository: `sagardampba2022w/play-with-friends-stream`
5. Click **"Connect"**

### Step 4: Deploy from Blueprint

1. Render will automatically detect the `render.yaml` file
2. You'll see a preview showing:
   - **Database**: `play-with-friends-db` (PostgreSQL, Free tier)
   - **Web Service**: `play-with-friends-stream` (Docker, Free tier)
3. Click **"Apply"** to start the deployment

### Step 5: Monitor Build Progress

1. Render will create both services simultaneously
2. The build process will take approximately **5-10 minutes**:
   - **Database**: Usually ready in 1-2 minutes
   - **Web Service**: 
     - Building Docker image (Node frontend build + Python backend)
     - Installing dependencies
     - Running migrations (automatic on first start)
3. You can watch the live logs in the dashboard

### Step 6: Access Your Application

Once deployed, Render provides a URL:
- **Web Service URL**: `https://play-with-friends-stream.onrender.com` (or similar)
- Click the URL to open your application

> [!NOTE]
> On the free tier, services spin down after 15 minutes of inactivity. The first request after spin-down will take 30-60 seconds to respond while the service restarts.

## 🔍 Verification Checklist

After deployment, verify everything works:

- [ ] **Frontend loads**: Navigate to your Render URL
- [ ] **Health check**: Visit `https://your-app.onrender.com/api/health` → should return `{"status": "ok"}`
- [ ] **Database connection**: Check logs for successful database table creation
- [ ] **Create player**: Use the UI to create a new player
- [ ] **View leaderboard**: Verify leaderboard displays correctly
- [ ] **Play game**: Test the snake game functionality

## 📊 Monitoring & Logs

### View Logs

1. Go to your Render dashboard
2. Click on **"play-with-friends-stream"** service
3. Click the **"Logs"** tab
4. Monitor for any errors or warnings

### Database Access

To access your PostgreSQL database:

1. Click on **"play-with-friends-db"** in the dashboard
2. Under **"Info"**, you'll find:
   - **Internal Database URL**: Use this in your app (already configured via `render.yaml`)
   - **External Database URL**: Use this to connect from your local machine

## 🔄 Automatic Deployments

Every time you push to the `main` branch, Render will automatically:
1. Pull the latest code
2. Rebuild the Docker image
3. Deploy the new version
4. Run health checks

To disable auto-deploy, set `autoDeploy: false` in `render.yaml`.

## ⚙️ Environment Variables

The following environment variables are automatically configured:

| Variable | Source | Description |
|----------|--------|-------------|
| `DATABASE_URL` | Auto-generated from database | PostgreSQL connection string |
| `PYTHON_VERSION` | `render.yaml` | Python runtime version (3.13) |

To add custom environment variables:
1. Go to your web service in Render dashboard
2. Click **"Environment"** tab
3. Add key-value pairs
4. Click **"Save Changes"** (triggers a redeploy)

## 🐛 Troubleshooting

### Build Fails

**Problem**: Docker build fails  
**Solution**: Check the build logs for specific error messages. Common issues:
- Missing dependencies in `pyproject.toml` or `package.json`
- Docker syntax errors in `Dockerfile`

### Database Connection Errors

**Problem**: App can't connect to database  
**Solution**: 
1. Verify the database service is **"Available"** in Render dashboard
2. Check logs for the exact error message
3. Ensure `DATABASE_URL` environment variable is set correctly

### 503 Service Unavailable

**Problem**: App returns 503 error  
**Solution**: 
- Free tier services spin down after inactivity
- Wait 30-60 seconds for the service to restart
- Check if health check endpoint (`/api/health`) is responding

### Frontend Shows 404

**Problem**: Frontend routes return 404  
**Solution**:
- Verify the frontend build was successful (check build logs)
- Ensure `static` folder was created correctly in Docker image
- Check that the SPA catch-all route in `main.py` is working

## 💰 Free Tier Limits

Render's free tier includes:

| Resource | Limit |
|----------|-------|
| Web Service | 750 hours/month |
| Memory | 512 MB RAM |
| CPU | Shared |
| Database | 1 free PostgreSQL (expires after 90 days) |
| Bandwidth | 100 GB/month |
| Spin-down | After 15 min of inactivity |

> [!WARNING]
> **Database Expiration**: Free PostgreSQL databases expire after 90 days. You'll need to migrate to a paid plan or export/reimport your data before expiration.

## 🔗 Useful Links

- [Render Documentation](https://render.com/docs)
- [Docker Deployments on Render](https://render.com/docs/docker)
- [Blueprint Spec](https://render.com/docs/blueprint-spec)
- [PostgreSQL on Render](https://render.com/docs/databases)

## 📞 Support

If you encounter issues:
1. Check Render's [status page](https://status.render.com/)
2. Review the [community forum](https://community.render.com/)
3. Contact Render support (available on all plans, including free)

---

**Happy Deploying! 🎉**
