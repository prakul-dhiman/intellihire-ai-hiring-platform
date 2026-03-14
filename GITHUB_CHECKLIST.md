# GitHub Upload Checklist - Before Pushing to Public Repository

## ✅ Critical Security Items

### Environment Variables
- [ ] **Server .env file exists LOCALLY ONLY** (not in repo)
  - Check: `server/.env` is in `.gitignore` ✓
- [ ] **Client .env file exists LOCALLY ONLY** (not in repo)  
  - Check: `client/.env` is in `.gitignore` ✓
- [ ] `.env.example` files are created (safe to share):
  - [x] `server/.env.example` ✓
  - [x] `client/.env.example` ✓

### Sensitive Information Audit
- [ ] No hardcoded MongoDB credentials in source code
- [ ] No hardcoded API keys in source code
- [ ] No hardcoded JWT secrets in source code
- [ ] Gmail app password not exposed in code
- [ ] No AWS/cloud credentials in code
- [ ] `docker-compose.yml` only uses `${VAR_NAME}` placeholders

### Build Artifacts
- [ ] `.gitignore` excludes `node_modules/` ✓
- [ ] `.gitignore` excludes `dist/` and `build/` ✓
- [ ] `.gitignore` excludes `.next/` and similar build outputs ✓
- [ ] `.gitignore` excludes log files (`.log`, `.txt`, etc.) ✓
- [ ] Removed: `build_err2.txt`, `build_output.txt`, `*.log` (temporary files)

### IDE & OS Files
- [ ] `.gitignore` excludes `.vscode/`, `.idea/`, `.DS_Store` ✓
- [ ] No IDE workspace files committed
- [ ] No OS-specific files (thumbs.db, .DS_Store, etc.)

### Code Quality
- [ ] `package.json` and `package-lock.json` are committed
- [ ] `Dockerfile` and `docker-compose.yml` are committed (no secrets!)
- [ ] README.md has clear setup instructions
- [ ] Code doesn't have console.log() with sensitive data
- [ ] Error messages don't expose internal system details

---

## 📋 Pre-Push Git Commands

### 1. Verify .gitignore is Working
```bash
# See what would be committed (should NOT show .env files or node_modules)
git status

# See all ignored files
git status --ignored
```

### 2. Check for Secrets in Committed History
```bash
# Scan for potential secrets (requires git-secrets or similar)
git log -p | grep -i "password\|secret\|api_key\|token" || echo "✓ No obvious secrets found"
```

### 3. Remove Temporary Files Before Commit
```bash
# Remove local build files
rm -rf client/dist
rm -rf server/dist
rm -rf client/node_modules
rm -rf server/node_modules

# Remove log files
find . -name "*.log" -delete
find . -name "*.txt" -delete
```

### 4. Final Check Before Push
```bash
# Add all tracked files (respects .gitignore)
git add .

# Review what's about to be committed
git diff --cached --name-only

# Commit with clear message
git commit -m "Initial commit: Full stack recruitment platform

- Setup: Intellihire platform with video interviews, coding challenges, and AI analytics
- Architecture: React/Vite frontend, Node.js/Express backend, MongoDB database
- Features: Real-time WebRTC, code execution via Judge0, email notifications
- Deployment: Docker Compose support for containerized deployment
- Security: All sensitive credentials removed, using .env files"

# Push to GitHub
git push origin main
```

---

## 🔍 Post-Push Verification

After pushing to GitHub, verify these on github.com:

1. [ ] `.env` files do NOT appear in repository
2. [ ] `.env.example` files ARE visible (for reference)
3. [ ] `node_modules/` directory is NOT visible
4. [ ] No `.log` or `.txt` build files
5. [ ] `DEPLOYMENT_GUIDE.md` is visible and helpful
6. [ ] No commit messages contain credentials

### Command to verify locally:
```bash
# What GitHub will show publicly
git ls-files --others --ignored --exclude-standard

# Should be empty if gitignore is correct
```

---

## 🚀 Setup Instructions for Others (Document in README)

Include in your main `README.md`:

```markdown
## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/intellihire.git
   cd intellihire
   ```

2. **Setup backend:**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your actual credentials
   npm install
   npm start
   ```

3. **Setup frontend:**
   ```bash
   cd client
   cp .env.example .env
   npm install
   npm run dev
   ```

4. **See DEPLOYMENT_GUIDE.md for detailed setup**
```

---

## ⚠️ If You Accidentally Pushed Secrets

**IMMEDIATE ACTION REQUIRED:**

1. **Rotate all exposed credentials:**
   - Change MongoDB password
   - Generate new JWT_SECRET
   - Revoke Gmail App Password
   - Regenerate API keys

2. **Remove from Git history:**
   ```bash
   # Using git-filter-branch or BFG Repo Cleaner
   bfg --delete-files .env
   git push --force-with-lease
   ```

3. **Notify GitHub Support** if serious secrets exposed

---

## 📚 Reference Files

- ✓ `server/.env.example` - Backend environment template
- ✓ `client/.env.example` - Frontend environment template  
- ✓ `DEPLOYMENT_GUIDE.md` - Full deployment documentation
- ✓ `.gitignore` files - Exclude sensitive files automatically

---

**Status: Ready for GitHub Upload! ✅**

Once you confirm all items above, you can safely push to GitHub.
