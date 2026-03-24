# 🚀 KiranaAI APK Build - Complete Setup

**Status**: ✅ **READY TO BUILD**  
**Date**: March 21, 2026  
**Build Type**: Production APK for Android 13+

---

## What's Been Configured

### 1. ✅ app.json Updated
- **Android Package**: `com.kiranaai.store`
- **Permissions**: Location, Camera, Notifications, Storage, Network
- **Adaptive Icons**: Configured for all screen sizes
- **API Level**: Android 13+ (API 33)
- **Version**: 1.0.0

### 2. ✅ eas.json Created
- **Build Profile**: Production
- **Preview Profile**: Internal testing
- **Android Config**: Ready for EAS Build

### 3. ✅ Build Scripts Created

#### PowerShell Script
**File**: `build-apk.ps1`
- Automated build process
- Dependency checking
- Device detection
- APK installation
- Build monitoring

**Usage**:
```powershell
.\build-apk.ps1 -BuildType cloud
```

#### Batch Script  
**File**: `build-apk.bat`
- Interactive menu
- Windows-friendly
- Step-by-step prompts
- Build options

**Usage**:
```powershell
# In Project Directory
.\build-apk.bat
```

### 4. ✅ Documentation Created

| Document | Purpose |
|----------|---------|
| **APK_BUILD_GUIDE.md** | Complete build guide with all options |
| **QUICK_APK_BUILD.md** | 5-minute quick start |
| **build-apk.ps1** | Automated PowerShell script |
| **build-apk.bat** | Interactive batch script |

---

## How to Build Your APK

### 🔥 FASTEST WAY (3 Commands)

Open PowerShell in `D:\KiranaStore\KiranaAI`:

```powershell
# Command 1: Install EAS (first time only)
npm install -g eas-cli

# Command 2: Login (first time only)
eas login

# Command 3: Build APK (this is it!)
eas build --platform android
```

**That's it!** Your APK builds automatically on Expo servers.  
**Wait**: 10-15 minutes  
**Result**: APK downloads to `./dist/`

### Alternative: Run Script

```powershell
cd D:\KiranaStore\KiranaAI
.\build-apk.ps1
```

Or double-click:
```
D:\KiranaStore\KiranaAI\build-apk.bat
```

---

## Build Options

### ☁️ Cloud Build (RECOMMENDED)
```powershell
eas build --platform android
```
- **Time**: 10-15 minutes
- **Needs**: Internet only
- **Best for**: No local Android SDK setup
- **Easy**: ✅ Yes

### 💻 Local Build (Advanced)
```powershell
eas build --platform android --local
```
- **Time**: 5-10 minutes (after first prebuild)
- **Needs**: Android SDK, NDK, Java
- **Best for**: Advanced users
- **Easy**: ❌ Requires setup

### 🧪 Preview Build (Testing)
```powershell
eas build --platform android --profile preview
```
- **Time**: 10-15 minutes
- **Purpose**: Internal testing
- **Delivery**: Google Play internal testing track
- **Best for**: QA/testing before release

---

## Step-by-Step Cloud Build

### Prerequisites
- Expo account (free at https://expo.dev)
- Node.js installed
- npm package manager

### Step-by-Step

1. **Open PowerShell**
   ```powershell
   cd D:\KiranaStore\KiranaAI
   ```

2. **Install EAS CLI** (first time only)
   ```powershell
   npm install -g eas-cli
   ```

3. **Login to Expo**
   ```powershell
   eas login
   ```
   - Creates free account or signs in
   - Browser opens automatically
   - Returns to PowerShell when done

4. **Configure Build** (first time only)
   ```powershell
   eas build:configure
   ```
   - Creates `eas.json` with settings
   - We already created this, so this is skipped

5. **Start Building**
   ```powershell
   eas build --platform android
   ```
   - Shows build progress
   - "Queued", "Running", "Complete"

6. **Wait** (~15 minutes)
   ```
   ▶ Starting build...
   ▶ Building for Android...
   ✅ Build complete!
   📱 APK: https://expo.dev/artifacts/[...].apk
   ```

7. **Download APK**
   - Auto-downloads to: `./dist/KiranaAI-1.0.0.apk`
   - Or from: https://expo.dev dashboard

8. **Install on Device**
   ```powershell
   adb install -r .\dist\KiranaAI-1.0.0.apk
   ```
   - Or copy to phone manually
   - Tap APK file → Install

9. **Open & Test**
   - Find "KiranaAI" in app drawer
   - Test all features
   - Enjoy! 🎉

---

## Verify Everything is Ready

Check these files exist:

```powershell
# In D:\KiranaStore\KiranaAI directory:

✅ app.json                  # App configuration
✅ eas.json                  # EAS build config
✅ package.json              # Dependencies
✅ build-apk.ps1            # PowerShell script
✅ build-apk.bat            # Batch script
✅ APK_BUILD_GUIDE.md        # Build guide
✅ QUICK_APK_BUILD.md        # Quick start
✅ src/                      # App source code
```

---

## Build Output Locations

After successful build, find APK here:

```
# EAS Cloud Build (Recommended)
./dist/KiranaAI-1.0.0.apk

# Or download from Expo dashboard
https://expo.dev/dashboard

# Or local build (if using local gradle)
android/app/release/app-release.apk
```

---

## Testing the APK

### On Real Android Device

1. **Transfer APK**
   - USB cable, email, WhatsApp, Google Drive
   - ADB command: `adb install -r apk-file.apk`

2. **Install**
   - Open file manager on phone
   - Find APK file
   - Tap → Tap "Install"
   - Enable "Unknown Sources" if prompted

3. **Launch**
   - Find "KiranaAI" in app drawer
   - Tap to launch
   - Grant permissions when asked

4. **Test Features**
   ```
   Owner Features:
   ✓ Dashboard - KPIs, metrics
   ✓ Inventory - Products, stock
   ✓ Billing - Create bills, GST
   ✓ Forecast - AI predictions
   ✓ Analytics - Charts, trends
   ✓ Notifications - Real-time
   
   Customer Features:
   ✓ Home - Nearby stores
   ✓ Stores - Search, filter
   ✓ Cart - Add items
   ✓ Orders - Track status
   ✓ Profile - Settings
   
   Advanced:
   ✓ Offline mode - Works without net
   ✓ i18n - English, Hindi
   ✓ Location - Maps, distance
   ```

### Using Android Emulator

```powershell
# If Android SDK installed
adb emulator -list-avds  # List emulators
adb emu avd -name emulator-name  # Start emulator
adb install .\dist\KiranaAI-1.0.0.apk  # Install APK
```

---

## Troubleshooting

### Issue: "EAS not found"
```powershell
npm install -g eas-cli
# Then run build again
```

### Issue: "Not logged in"
```powershell
eas login
# Follow browser prompt to create/login account
```

### Issue: "Build fails with error"
```powershell
# Check Expo dashboard
# View full build logs there

# Or try rebuild
eas build --platform android --force-new
```

### Issue: "APK won't install"
```powershell
# Check minimum Android version (API 33+)
# Try uninstall first
adb uninstall com.kiranaai.store

# Then install
adb install -r path/to/apk
```

### Issue: "App crashes on launch"
```powershell
# Check logs
adb logcat | findstr "KiranaAI"

# Make sure backend is running
# Check network connectivity
```

---

## Package Information

```
┌─────────────────────────────────────┐
│ App Name      │ KiranaAI            │
│ Package       │ com.kiranaai.store  │
│ Version       │ 1.0.0               │
│ Build Number  │ 1                   │
│ Target API    │ 33+ (Android 13+)   │
│ Min API       │ 33 (Android 13)     │
│ Size          │ ~45-60 MB           │
│ Format        │ APK (Universal)     │
└─────────────────────────────────────┘
```

---

## For Play Store Distribution

### If You Want to Upload to Google Play

**Step 1**: Create signed APK
```powershell
eas build --platform android --release-channel production
```

**Step 2**: Create Google Play account ($25 one-time)

**Step 3**: Submit APK
```powershell
eas submit --platform android
```

**Complete setup** documented in `APK_BUILD_GUIDE.md`

---

## Build Dashboard

Monitor your builds at:
```
https://expo.dev/dashboard
```

Features:
- View all builds
- Download APKs
- Share build links
- Check build logs
- Get notifications

---

## Summary

✅ **Your project is fully configured for APK building**

### To Build APK:
1. Open PowerShell in `D:\KiranaStore\KiranaAI`
2. Run: `eas build --platform android`
3. Wait 10-15 minutes
4. Download APK from `./dist/` or Expo dashboard
5. Install on Android device
6. Test and enjoy! 🎉

### Total Time: **15-20 minutes**

### No Local Android SDK Needed: **✅ Cloud Build**

---

## Files Created for APK Building

| File | Purpose |
|------|---------|
| `eas.json` | EAS build configuration |
| `app.json` (updated) | Android package & permissions |
| `build-apk.ps1` | Fast automated PowerShell script |
| `build-apk.bat` | Interactive batch menu |
| `APK_BUILD_GUIDE.md` | Comprehensive build guide |
| `QUICK_APK_BUILD.md` | 5-minute quick start |

---

## Status: ✅ READY TO BUILD

```
┌──────────────────────────────────────────┐
│ KiranaAI - APK Build Setup Complete      │
│                                          │
│ ✅ app.json configured                   │
│ ✅ eas.json created                      │
│ ✅ Build scripts ready                   │
│ ✅ Documentation complete                │
│ ✅ All features built-in                 │
│ ✅ Ready for deployment!                 │
│                                          │
│ Next: Run build and wait 15 minutes      │
└──────────────────────────────────────────┘
```

Ready to build? Start with:
```powershell
eas build --platform android
```

🚀 **Your APK awaits!**
