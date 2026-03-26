# KiranaAI - Quick APK Build (5 Minutes)

## The Easiest Way: Cloud Build

Follow these 5 simple steps to build your APK in the cloud (no Android SDK setup needed).

### Step 1: Open PowerShell in Project Directory

```powershell
cd D:\KiranaStore\KiranaAI
```

### Step 2: Install EAS CLI (One-Time Only)

```powershell
npm install -g eas-cli
```

### Step 3: Login to Expo Account

```powershell
eas login
```

- Browser opens automatically
- Sign up (free) or login to Expo at https://expo.dev
- Return to PowerShell - done!

### Step 4: Configure Build (One-Time Only)

```powershell
eas build:configure
```

- Choose "Android"
- Accept defaults
- Configuration saved

### Step 5: Build APK

```powershell
eas build --platform android
```

**Wait 10-15 minutes** ⏱️

When complete:
```
✅ APK ready for download!
```

### Step 6: Download & Install

**Option A: Automatic Download**
```
APK saves to: D:\KiranaStore\KiranaAI\dist\KiranaAI-1.0.0.apk
```

**Option B: Download from Dashboard**
- Go to https://expo.dev
- Find your build
- Click download

**Option C: Use ADB** (if Android SDK installed)
```powershell
adb install -r .\dist\KiranaAI-1.0.0.apk
```

---

## Running via Scripts (Even Easier!)

### Using PowerShell Script
```powershell
# Run build script
cd D:\KiranaStore\KiranaAI
.\build-apk.ps1

# Or specify build type:
.\build-apk.ps1 -BuildType cloud
.\build-apk.ps1 -BuildType local
.\build-apk.ps1 -BuildType preview
```

### Using Batch Script (Click to Run)
```
1. Navigate to: D:\KiranaStore\KiranaAI
2. Double-click: build-apk.bat
3. Choose option from menu
4. Follow prompts
```

---

## Expected Timeline

| Step | Time |
|------|------|
| EAS CLI install | 1 min |
| Expo login | 1 min |
| Build configure | 1 min |
| APK build | 10-15 min |
| Download | 1-2 min |
| **Total** | **15-20 minutes** |

---

## Verify Installation

### You Have Successfully Built APK If:

✅ Build completes without errors
✅ APK file exists in `dist/` folder
✅ File size: ~45-60 MB
✅ Can send to Android device

### Test on Real Device

1. Transfer APK to Android phone (USB, email, WhatsApp)
2. Open file manager on phone
3. Tap APK file
4. Tap "Install"
5. Launch "KiranaAI" from app drawer

---

## Troubleshooting Quick Fixes

### "eas not found"
```powershell
npm install -g eas-cli
```

### "Not logged in"
```powershell
eas login
```

### "eas.json missing"
```powershell
eas build:configure
```

### "Build failed"
- Check internet connection
- Try cloud build: `eas build --platform android`
- Check Expo dashboard for error details

### "Can't install on phone"
- Phone must have "Unknown Sources" enabled
- Try: `adb install -r path/to/apk`
- Uninstall old version first: `adb uninstall com.kiranaai.store`

---

## What's in the APK

✅ Complete KiranaAI app
✅ Owner features:
- Dashboard with KPIs
- Inventory management
- Billing/POS system
- Demand forecasting
- Analytics

✅ Customer features:
- Store discovery
- Product search
- Shopping cart
- Order management
- User profile

✅ Advanced features:
- Offline support (caching + sync)
- Real-time notifications
- Multi-language (English/Hindi)
- Location services

---

## Next Steps After Build

1. ✅ **Test on device**
   - All features working?
   - No crashes?
   - Performance OK?

2. ✅ **Gather feedback**
   - User testing
   - Bug reports
   - Feature requests

3. ✅ **Prepare for Play Store** (optional)
   - App Store listing
   - Screenshots
   - Description
   - Pricing

4. ✅ **Deploy & Monitor**
   - Track analytics
   - Monitor errors
   - Plan updates

---

## All Commands at a Glance

```powershell
# Setup (one-time)
npm install -g eas-cli
eas login
eas build:configure

# Build APK
eas build --platform android

# View builds
eas build:list

# Download specific build
eas build:download [build-id]

# Install on device
adb install -r path/to/apk

# Check connected devices
adb devices

# Uninstall from device
adb uninstall com.kiranaai.store
```

---

## Help & Support

**Build Failed?**
1. Check internet connection
2. Review Expo console output
3. Visit https://expo.dev/dashboard

**App Crashes?**
1. Check console logs: `adb logcat`
2. Review error in Expo dashboard
3. Check backend API is running

**Installation Issues?**
1. Enable USB Debugging on phone
2. Install USB drivers
3. Try: `adb install -r apk-file`

---

## Status

✅ **Project**: KiranaAI v1.0.0  
✅ **Package**: com.kiranaai.store  
✅ **Target**: Android 13+ (API 33+)  
✅ **Build Type**: Production APK  
✅ **Status**: Ready to deploy!  

**Your APK is ready!** 🚀
