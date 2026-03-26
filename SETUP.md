# 🚀 KiranaAI - Complete Setup Guide

Complete step-by-step guide to get KiranaAI running locally for development.

## ✅ System Requirements

Before starting, ensure you have:

```
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- PostgreSQL 14.0 or higher
- Git
- Expo CLI (optional, for enhanced development)
```

### Verify Installation
```bash
node --version      # Should be v18+
npm --version       # Should be 9+
postgres --version  # Should be 14+
git --version       # Any recent version
```

---

## 📦 Installation Steps

### Step 1: Clone & Navigate to Project

```bash
cd d:\KiranaStore\KiranaAI
```

### Step 2: Install Mobile Dependencies

```bash
# Install all mobile dependencies (123 packages)
npm install

# If you encounter issues, try:
npm install --legacy-peer-deps
npm cache clean --force && npm install
```

**Expected Output:**
```
added 672 packages, and audited 672 packages
0 vulnerabilities found
```

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### Step 4: Database Setup

#### Option A: Using PostgreSQL Locally

1. **Start PostgreSQL service**
   ```bash
   # Windows (PowerShell)
   Start-Service -Name PostgreSQL-x64-14
   
   # macOS (if installed with Homebrew)
   brew services start postgresql
   
   # Linux
   sudo systemctl start postgresql
   ```

2. **Create database**
   ```bash
   psql -U postgres
   postgres=# CREATE DATABASE kiranaai;
   postgres=# \q
   ```

3. **Get Database URL**
   ```
   postgresql://postgres:your_password@localhost:5432/kiranaai
   ```

#### Option B: Using Cloud Database (Recommended for Teams)

- [Railway.app](https://railway.app) - Free PostgreSQL database
- [Supabase](https://supabase.com) - Free tier with 500MB
- [Render](https://render.com) - Free PostgreSQL database

Get your DATABASE_URL from the cloud provider's console.

### Step 5: Configure Environment Variables

#### Mobile Configuration

```bash
# Copy template
cp .env.example .env

# Edit .env (use your editor)
```

**Content (.env):**
```
# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api

# Maps (optional, for nearby stores feature)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...

# Firebase (optional, for push notifications)
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project

# Environment
EXPO_PUBLIC_ENV=development
```

#### Backend Configuration

```bash
cd backend

# Copy template
cp .env.example .env

# Edit .env values
```

**Content (backend/.env):**
```
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/kiranaai

# JWT Configuration (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-secret-key-minimum-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-minimum-32-characters

# Third-party APIs
ANTHROPIC_API_KEY=sk-ant-v0-xxxx...          # Get from https://console.anthropic.com/
MSG91_AUTH_KEY=your-msg91-key                 # Get from https://msg91.com/
MSG91_ROUTE=4                                 # Default: 4

# Image Storage (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Firebase (optional)
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=your-firebase-service-account@...

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Step 6: Run Database Migration

```bash
cd backend

# Create tables from Prisma schema
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Optional: Open Prisma Studio to view/edit data
npx prisma studio
```

**Expected Output:**
```
Your database has been successfully migrated!

✔ Generated Prisma Client (5.x.x) to ./node_modules/@prisma/client in 450ms
```

---

## 🎬 Running the Application

### Start Backend Server (Terminal 1)

```bash
cd backend
npm run dev
```

**Expected Output:**
```
[2:45:30 PM] Starting...
✓ Compiled successfully in 1.23s

 🚀 Server running on http://localhost:3000
 🏥 Health check: GET http://localhost:3000/health
 📚 API docs: Check backend/src/routes
```

**Test it's working:**
```bash
# In another terminal
curl http://localhost:3000/health

# Should return:
# {"status":"ok","timestamp":"2025-01-15T..."}
```

---

### Start Mobile App (Terminal 2)

```bash
# From project root
npm start
```

**Expected Output:**
```
[2:45:35 PM] expo@51.0.0 start ./apts
[2:45:36 PM] Starting dev server on port 19000...
[2:45:40 PM] 
› Metro waiting on exp://192.168.x.x:19000

 Connection details:
  Logs
  › Press  j to jump to logs
  › Press  o to open on web
  › Press  a to open Android
  › Press  i to open iOS
  › Press  w to open web
  
Press ? to show all options
```

### Open on Emulator/Device

**Option 1: Expo Go App (Quickest)**
1. Download [Expo Go](https://expo.dev/client) on your phone
2. Press `w` in terminal to get QR code
3. Scan QR code with phone camera → Opens in Expo Go

**Option 2: Android Emulator**
```bash
# With Android Studio open & emulator running
# In Expo terminal, press: a
```

**Option 3: iOS Simulator (macOS only)**
```bash
# Requires Xcode
# In Expo terminal, press: i
```

**Option 4: Web Browser**
```bash
# In Expo terminal, press: w
# Opens http://localhost:19006
```

---

## 🧪 Testing the Full Flow

### 1. Test Mobile App → Backend Connection

**On Mobile App:**
1. Select "Store Owner" or "Customer"
2. Enter any phone number (test mode: no SMS sent)
3. Should hit: `POST /api/auth/send-otp` (check backend logs)

**In Backend Terminal:**
Look for:
```
POST /api/auth/send-otp 200 12.34ms
```

### 2. Test OTP Flow

**On Mobile App:**
1. Enter any 6-digit number for OTP
2. Backend will generate JWT tokens
3. Should navigate to dashboard/home

**Check localStorage (Web):**
```javascript
// In browser console
localStorage.getItem('authStore')  // Should have token, user data
```

### 3. Test API Endpoints Directly

```bash
# Prerequisites
API_URL="http://localhost:3000/api"

# 1. Send OTP
curl -X POST $API_URL/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","role":"STORE_OWNER"}'

# 2. Verify OTP (use 123456 in dev mode)
curl -X POST $API_URL/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","otp":"123456","role":"STORE_OWNER"}'

# Response includes JWT tokens:
# {"accessToken":"eyJ...","refreshToken":"eyJ...","user":{...}}

# 3. Get Profile (replace TOKEN)
curl -X GET $API_URL/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📂 Project Structure Quick Reference

```
Mobile App Root:
  app/                    # All screens (Expo Router)
  components/ui/          # Reusable components
  store/                  # Zustand stores (global state)
  services/               # API calls
  hooks/                  # Custom React hooks
  types/                  # TypeScript types
  utils/                  # Helper functions
  constants/              # Colors, categories, etc.
  i18n/                   # Translations
  package.json
  tsconfig.json           # TypeScript config

Backend Root:
  backend/src/
    index.ts              # Express app
    middlewares/          # Auth middleware
    routes/               # API routes
    controllers/          # Business logic (TODO)
    services/             # Database queries (TODO)
  backend/prisma/
    schema.prisma         # Database schema
  backend/package.json
  backend/tsconfig.json
```

---

## 🔍 Debugging Tips

### Backend Not Starting?

```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # macOS/Linux

# Kill process on port 3000
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                 # macOS/Linux

# Try different port
PORT=4000 npm run dev
```

### Mobile App Not Connecting to Backend?

1. **Check API URL in .env**
   ```
   EXPO_PUBLIC_API_BASE_URL=http://192.168.x.x:3000/api
   # (not localhost on phone, use computer's IP)
   ```

2. **Get Your Computer's IP**
   ```bash
   # Windows
   ipconfig | findstr IPv4
   
   # macOS/Linux
   ifconfig | grep "inet "
   ```

3. **Test connection from phone**
   - Use curl app on phone or browser
   - Try: `http://192.168.x.x:3000/health`

### Database Connection Issues?

```bash
# Check PostgreSQL is running
psql -U postgres -d kiranaai -c "SELECT 1"

# View database URL being used
cd backend
node -e "console.log(process.env.DATABASE_URL)"

# Recreate database
cd backend
npx prisma db push --skip-generate
npx prisma db seed  # If seed script exists
```

### TypeScript Errors?

```bash
# Rebuild TypeScript
npm run build

# Check for type issues
npx tsc --noEmit

# View specific file errors
npx tsc --noEmit app/_layout.tsx
```

---

## 📊 Monit Setup (Development)

### Using VS Code Tasks

1. **Open Command Palette**: `Ctrl+Shift+P`
2. **Type**: `Tasks: Run Task`
3. **Select**: `npm: start` (creates tasks.json)

### Using Terminal Panels

1. **Open Terminal**: `Ctrl+` (backtick)
2. **Split Terminal**: `Ctrl+Shift+5`

Terminal 1:
```bash
cd backend && npm run dev
```

Terminal 2:
```bash
npm start
```

Now you can see both running side-by-side.

---

## 🌍 Environment Configurations

### Development (.env)
```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
NODE_ENV=development
```

### Staging (.env.staging)
```
EXPO_PUBLIC_API_BASE_URL=https://api-staging.kiranaai.com
NODE_ENV=staging
```

### Production (.env.production)
```
EXPO_PUBLIC_API_BASE_URL=https://api.kiranaai.com
NODE_ENV=production
```

**Switch environments:**
```bash
# Before running
cp .env.production .env
npm start
```

---

## 📱 Device Testing Checklist

- [ ] Launch app on device
- [ ] Test OTP flow end-to-end
- [ ] Verify location permissions work
- [ ] Test barcode scanning
- [ ] Check offline handling
- [ ] Verify camera permissions
- [ ] Test navigation between tabs
- [ ] Check all screens load without errors

---

## 🚢 Deployment Preview

### Deploy Backend to Railway

```bash
# 1. Create Railway account (railway.app)
# 2. Connect GitHub repository
# 3. Create PostgreSQL plugin
# 4. Set environment variables
# 5. Push code:
git add .
git commit -m "Deploy to Railway"
git push origin main
```

### Deploy Mobile to Expo

```bash
# 1. Create Expo account (expo.dev)
# 2. Login via CLI:
eas login

# 3. Build for all platforms:
eas build --platform all

# 4. Submit to app stores:
eas submit --platform ios
eas submit --platform android
```

---

## 📞 Support

**Issue Tracker**: [GitHub Issues](https://github.com/your-org/kiranaai/issues)

**Community**: [Discord Server](https://discord.gg/your-server)

**Documentation**: [Full Docs](./README.md)

---

## ✨ Next Steps After Setup

1. **Explore the codebase**
   - Check out `app/(auth)/otp-verify.tsx` for OTP input example
   - Review `services/api.ts` for API patterns
   - Study `store/authStore.ts` for Zustand patterns

2. **Create your first feature**
   - Create a new screen in `app/(owner)/inventory/add.tsx`
   - Add a service in `services/inventoryService.ts`
   - Connect to backend

3. **Run tests**
   - Create test files: `__tests__/services/authService.test.ts`
   - Run: `npm test`

4. **Build for production**
   - Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
   - Test on physical devices
   - Submit to app stores

---

**Good luck! 🚀 You're ready to start developing KiranaAI!**

Last Updated: 2025-01-15  
Maintained by: KiranaAI Development Team
