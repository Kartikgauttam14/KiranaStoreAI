# KiranaAI - APK Build Guide

## Quick Start (Recommended Method: EAS Build)

### Option 1: Build APK Using EAS Build (Easiest)

EAS Build is the official Expo service for building production APKs without needing local Android Studio setup.

#### Prerequisites
1. Expo account (free) - Sign up at https://expo.dev
2. EAS CLI installed
3. Git version control

#### Step 1: Install EAS CLI
```powershell
npm install -g eas-cli
```

#### Step 2: Authenticate with Expo
```powershell
cd D:\KiranaStore\KiranaAI
eas login
```
- This will open a browser window
- Sign in or create a free Expo account
- Return to terminal - authentication complete

#### Step 3: Configure Your Project
```powershell
eas build:configure
```
- Select Android
- Choose "APK" when asked for build type
- Configuration saved to eas.json (already provided)

#### Step 4: Build the APK
```powershell
eas build --platform android --local
```

Or for cloud build (no local Android SDK needed):
```powershell
eas build --platform android
```

**Cloud Build Option** (Recommended for Windows):
- Builds on Expo servers (no local setup needed)
- Faster build process
- Takes 10-15 minutes
- APK downloads automatically

**Local Build Option**:
- Requires Android SDK/NDK
- Full control over build process
- Faster subsequent builds

#### Step 5: Download APK
When build completes:
```
✅ Build finished!
📱 APK URL: https://expo.dev/artifacts/[...].apk
```

Or with cloud build, the APK auto-downloads to:
```
./dist/KiranaAI-1.0.0.apk
```

Test on Android device:
```powershell
adb install .\dist\KiranaAI-1.0.0.apk
```

---

### Option 2: Local APK Build (If Installed Android SDK)

Requires: Android SDK, NDK, and build tools

#### Prerequisites
- Android SDK (API 33+)
- Android NDK
- ANDROID_HOME environment variable set
- Java SDK (version 11+)

#### Step 1: Prebuild the Project
```powershell
cd D:\KiranaStore\KiranaAI
expo prebuild --clean
```

This creates `android/` and `ios/` folders with native code.

#### Step 2: Build APK with Gradle
```powershell
cd android
gradlew.bat assembleRelease
```

APK output:
```
app\release\app-release.apk
```

#### Step 3: Install on Device
```powershell
adb install app\release\app-release.apk
```

---

### Option 3: Development APK (for Testing)

Build a faster development version:

#### Using EAS
```powershell
eas build --platform android --profile preview
```

#### Using Local Build
```powershell
cd android
gradlew.bat assembleDebug
# Output: app\debug\app-debug.apk
```

---

## Complete Step-by-Step Guide

### Full Production Build Workflow

#### 1. Prepare the Project
```powershell
cd D:\KiranaStore\KiranaAI

# Clean install
rm node_modules -r -Force
npm install

# Build backend (if needed)
cd backend
npm install
npm run build
cd ..

# Verify frontend
npm run web  # Test in web first
```

#### 2. Configure for Android
```powershell
# Install EAS if not already
npm install -g eas-cli

# Login to Expo
eas login

# Configure for Android
eas build:configure
```

#### 3. Build Options

**Option A: Cloud Build (Recommended)**
```powershell
# Fastest, no local setup
eas build --platform android
```

**Option B: Local Build with Prebuild**
```powershell
# Requires: Android SDK, NDK, Java
expo prebuild --clean
cd android
gradlew.bat assembleRelease
```

**Option C: EAS Local Build**
```powershell
# Uses local tools but EAS build system
eas build --platform android --local
```

#### 4. Install on Device
```powershell
# Connect Android device via USB
# Enable Developer Mode on phone
# Enable USB Debugging

# Install APK
adb install path/to/apk-file.apk

# Or drag & drop APK to phone via file manager
```

#### 5. Test the App
- Launch KiranaAI from app drawer
- Test owner features
- Test customer features
- Verify offline mode
- Check notifications

---

## Configuration Files

### app.json (Already Configured)
```json
{
  "expo": {
    "name": "KiranaAI",
    "slug": "KiranaAI",
    "version": "1.0.0",
    "android": {
      "package": "com.kiranaai.store",
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.CAMERA",
        "android.permission.POST_NOTIFICATIONS"
      ]
    }
  }
}
```

### eas.json (Already Configured)
```json
{
  "build": {
    "production": {
      "android": "production"
    },
    "preview": {
      "android": "internal"
    }
  }
}
```

---

## Expected Output

### Successful Build Signs
```
✅ Building app...
✅ Downloading dependencies...
✅ Compiling...
✅ Packaging...
✅ Build complete!

📊 Build Summary:
   Size: ~45-60 MB
   Format: APK
   Target: Android 13+ (API 33+)
   Version: 1.0.0
   Package: com.kiranaai.store
```

### APK Output Locations

**EAS Cloud Build:**
```
https://expo.dev/artifacts/[build-id].apk
or
./dist/KiranaAI-1.0.0.apk (auto-downloaded)
```

**Local Gradle Build:**
```
android/app/release/app-release.apk
android/app/debug/app-debug.apk
```

---

## Recommended: Use EAS Cloud Build

### Why EAS Cloud?

✅ **No Local Setup**
- No Android SDK installation needed
- No environment variables to configure
- Works on Windows, Mac, Linux

✅ **Fast**
- Builds on Expo servers (parallel builds available)
- 10-15 minutes for first build
- 5-10 minutes for subsequent builds

✅ **Reliable**
- Official Expo service
- Production-ready
- Free tier available

✅ **Easy Management**
- Track build history
- Download builds anytime
- Share with testers via links

### Quick EAS Cloud Build Command

```powershell
cd D:\KiranaStore\KiranaAI

# Login (one time)
eas login

# Configure (one time)
eas build:configure

# Build APK
eas build --platform android

# Build will start immediately
# Check status: eas build:list
```

Done! APK downloads automatically to `./dist/`

---

## Troubleshooting

### "Expo account required"
```powershell
# Create free account at https://expo.dev
eas login
```

### "EAS CLI not found"
```powershell
npm install -g eas-cli
```

### Build fails with "Out of memory"
```powershell
# For local Java builds
$env:_JAVA_OPTIONS = "-Xmx2048m"
```

### APK won't install on device
```powershell
# Check minimum API level
# KiranaAI requires Android 13+ (API 33)

# Test with adb
adb devices  # List connected devices
adb install -r app-release.apk  # Force reinstall
```

### "Gradle not found"
```powershell
# Use EAS Cloud Build instead (no Gradle needed)
# Or install Android Studio with build tools
```

---

## Distribution & Signing

### For Google Play Store

#### Step 1: Create Keystore (one-time)
```powershell
# Create signing key
expo config:set --android-package com.kiranaai.store
eas credentials
```

#### Step 2: Submit to Play Store
```powershell
eas submit --platform android
```

Requires:
- Google Play Developer Account ($25 one-time)
- Signed APK
- App Store listing

### For Direct Distribution

Share APK directly:
1. Build APK using methods above
2. Upload to file hosting (Google Drive, OneDrive)
3. Share link with users
4. Users download and install via file manager

Or use internal testing:
```powershell
eas build --platform android --profile preview
# Generates APK for testing before release
```

---

## Build Status & Monitoring

### Check Build Status
```powershell
# List recent builds
eas build:list

# Monitor build in progress
eas build:view [build-id]
```

### Download Artifacts
```powershell
# Download completed APK
eas build:download [build-id]

# Or access via Expo dashboard at https://expo.dev
```

---

## Summary

### Fastest Way (Recommended)
1. `npm install -g eas-cli`
2. `eas login` (one-time)
3. `eas build:configure` (one-time)
4. `eas build --platform android`
5. Download APK when ready
6. Install on Android device

**Total Time**: 15-20 minutes ⏱️

### Next Steps After APK Created
- [ ] Test on real Android device
- [ ] Verify all features work
- [ ] Get user feedback
- [ ] Prepare for Play Store (optional)
- [ ] Track analytics

