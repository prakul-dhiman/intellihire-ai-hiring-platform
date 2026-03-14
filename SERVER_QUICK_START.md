# 🚀 QUICK START - GET SERVER RUNNING IN 5 MINUTES

## Prerequisites Check

```bash
# Check Node version (need 18+)
node --version

# Check npm version (need 9+)
npm --version

# Check git (for pushing changes)
git --version
```

If any are missing, install from [nodejs.org](https://nodejs.org)

---

## Step 1: Navigate to Server Directory

```bash
cd c:\Users\Ansh\Desktop\Intellihire\intellihire\server
```

---

## Step 2: Install Dependencies

```bash
npm install
```

**Expected Output** (first time):
```
added 156 packages, and audited 157 packages
up to date in 15.5s
```

---

## Step 3: Create Local .env File

```bash
# Copy template to actual .env
cp .env.example .env

# Open .env in your editor
# Update with:
# - Your MongoDB Atlas connection string
# - Your Gmail app password
# - A strong JWT secret (use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

---

## Step 4: Start the Server

```bash
# Development mode (auto-reload on file changes)
npm run dev

# OR production mode
npm start
```

**Expected Output**:
```
✅ All environment variables validated successfully

╔════════════════════════════════════════════════════════════════╗
║           🚀 IntelliHire Server Started Successfully           ║
╠════════════════════════════════════════════════════════════════╣
║  Server: http://localhost:5000
║  Environment: development
║  Socket.io: ws://localhost:5000/socket.io/
║  Frontend: http://localhost:5173
╚════════════════════════════════════════════════════════════════╝
```

---

## Step 5: Test the Server

In another terminal:

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Expected response:
# {
#   "status": "OK",
#   "timestamp": "2026-03-14T10:30:00.000Z",
#   "uptime": 2.345,
#   "database": "connected",
#   "environment": "development",
#   "version": "1.0.0"
# }
```

---

## Step 6: Start Frontend (in new terminal)

```bash
cd c:\Users\Ansh\Desktop\Intellihire\intellihire\client
npm install
npm run dev

# Opens: http://localhost:5173
```

---

## ✅ Success!

The platform is now running locally:
- 🖥️ **Frontend**: http://localhost:5173
- ⚙️ **Backend**: http://localhost:5000
- 🔗 **Socket.io**: ws://localhost:5000/socket.io/

---

## Common Issues & Fixes

### Issue: "Cannot find module 'express'"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "MongoDB connection refused"
```bash
# Option 1: Use MongoDB Atlas (cloud)
# Update MONGO_URI in .env with your cluster URL from:
# https://www.mongodb.com/cloud/atlas

# Option 2: Run MongoDB locally (Windows)
# Download from: https://www.mongodb.com/try/download/community
# Start MongoDB: mongod
```

### Issue: "CORS error in browser console"
```bash
# Ensure FRONTEND_URL in .env matches your frontend URL
# Should be: http://localhost:5173
```

### Issue: "Port 5000 already in use"
```bash
# Find what's using port 5000:
netstat -ano | findstr :5000

# Kill the process:
taskkill /PID <process_id> /F

# Or use different port:
PORT=5001 npm start
```

---

## 📚 Need Help?

- **Code Review Results**: See [CODE_REVIEW_FINDINGS.md](../../CODE_REVIEW_FINDINGS.md)
- **Security Info**: See [PRODUCTION_SECURITY_GUIDE.md](../../PRODUCTION_SECURITY_GUIDE.md)
- **Deployment**: See [DEPLOYMENT_GUIDE.md](../../DEPLOYMENT_GUIDE.md)

---

**Ready to code! Happy building! 🎉**
