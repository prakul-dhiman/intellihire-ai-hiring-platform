# Intellihire - Setup & Deployment Guide

## 🚀 Quick Start

This project is a full-stack recruitment platform with real-time video interviews, coding challenges, and AI-powered analytics.

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas account (free tier available)
- Docker & Docker Compose (optional, for containerized deployment)
- Gmail account (for sending emails)

---

## 📋 Environment Setup

### 1. Backend Setup

Navigate to the server directory and create a `.env` file:

```bash
cd intellihire/server
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
# MongoDB Connection String
# Get this from MongoDB Atlas: https://www.mongodb.com/cloud/atlas
MONGO_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/intellihire

# JWT Secret - Generate a strong random key
JWT_SECRET=your_super_secure_random_jwt_secret_key_123456789

# Judge0 API for code execution
JUDGE0_API_URL=https://ce.judge0.com  # or your self-hosted instance

# Email credentials (Gmail + App Password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password  # NOT your Gmail password

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Node environment
NODE_ENV=development
```

**To get Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Enable 2FA on your Google Account
3. Generate an app password for "Mail" and "Windows Computer"
4. Use this password in `EMAIL_PASS`

### 2. Frontend Setup

```bash
cd intellihire/client
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_ENV=development
```

---

## 🏃 Running Locally

### With Node.js

**Backend:**
```bash
cd intellihire/server
npm install
npm start
# Server runs on http://localhost:5000
```

**Frontend (in a new terminal):**
```bash
cd intellihire/client
npm install
npm run dev
# Client runs on http://localhost:5173
```

### With Docker Compose

```bash
cd intellihire
docker-compose up --build
# Frontend: http://localhost
# Backend: http://localhost:5000
```

---

## 🌐 Deployment to Production

### Option 1: Deploy with Docker Compose

Update your `.env` file with production values before deploying:

```bash
docker-compose up -d
```

### Option 2: Deploy on Render, Railway, Heroku, or Cloud Run

**Backend:** Deploy the `server/` folder
**Frontend:** Deploy the `client/` folder

Make sure to set environment variables in the deployment platform's settings.

---

## 📁 Project Structure

```
intellihire/
├── client/              # React + Vite frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── api/         # API calls via Axios
│   │   └── context/     # Auth context
│   └── .env.example
│
├── server/              # Node.js + Express backend
│   ├── controllers/     # Business logic
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middlewares/     # Auth, validation, error handling
│   ├── services/        # External integrations (Judge0, etc.)
│   └── .env.example
│
├── docker-compose.yml   # Container orchestration
└── mcp_config.json      # Model Context Protocol config
```

---

## 🔒 Security Checklist Before Deployment

- [ ] `.env` file is in `.gitignore` (never commit it)
- [ ] Use `.env.example` to show required variables
- [ ] All sensitive data is removed from code
- [ ] JWT_SECRET is a long, random string
- [ ] MONGO_URI uses a strong password
- [ ] EMAIL_PASS is an App Password, not Gmail password
- [ ] Database backups are configured
- [ ] CORS is properly configured for production URL
- [ ] Rate limiting is enabled
- [ ] Input validation is in place

---

## 📞 Support & Documentation

- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Judge0 API:** https://judge0.com
- **Node.js:** https://nodejs.org
- **React:** https://react.dev

---

## ⚠️ Important Security Notes

1. **Never commit `.env` files** - they contain sensitive credentials
2. **Keep `.env.example` updated** with all required variables (without values)
3. **Use different credentials for development, staging, and production**
4. **Rotate secrets regularly** for production deployments
5. **Monitor API keys** and revoke if exposed

---

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Check if MongoDB Atlas cluster is whitelisted your IP
- Verify MONGO_URI format and credentials

**Email not sending:**
- Use Gmail App Password, not regular password
- Enable "Less secure app access" if needed (not recommended)

**CORS errors:**
- Update FRONTEND_URL in backend .env
- Configure CORS in server code if needed

---

Happy Coding! 🎉
