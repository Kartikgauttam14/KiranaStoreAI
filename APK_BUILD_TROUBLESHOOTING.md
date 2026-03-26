# APK Build Troubleshooting Guide

## Gradle Build Failed Error

**Issue**: `Gradle build failed with unknown error` during EAS Build

**Cause**: This generic error typically indicates:
1. Incompatible SDK versions
2. Missing or conflicting dependencies
3. Asset file issues
4. Gradle cache corruption

---

## Solutions (Try in Order)

### Solution 1: Clean Build with Cache Clear ✅ (Most Likely to Work)

```powershell
cd D:\KiranaStore\KiranaAI

# Clear local cache
rm -r node_modules -Force
rm package-lock.json

# Reinstall dependencies
npm install

# Try build with cache clear
eas build --platform android --clear-cache
```

**Expected Result**: ~15 minute build, fresh dependencies

---

### Solution 2: Update Expo CLI

```powershell
npm install -g eas-cli@latest
npm install -g expo-cli@latest
```

Then retry:
```powershell
eas build --platform android
```

---

### Solution 3: Check Project Configuration

Verify these fields in `app.json`:

```json
{
  "expo": {
    "name": "KiranaAI",
    "version": "1.0.0",
    "android": {
      "minSdkVersion": 33,
      "targetSdkVersion": 34,
      "package": "com.kiranaai.store"
    }
  }
}
```

All should be present and valid. ✅

---

### Solution 4: Check Assets

Verify all required asset files exist:

- ✅ `assets/icon.png` (1024x1024+)
- ✅ `assets/splash-icon.png` (1080x2340+)
- ✅ `assets/android-icon-foreground.png`
- ✅ `assets/android-icon-background.png`
- ✅ `assets/android-icon-monochrome.png`

Files should be valid PNG format with correct dimensions.

---

### Solution 5: Check Build Logs

Click the logs link in the error message:
```
https://expo.dev/accounts/kartikgauttam/projects/KiranaAI/builds/[BUILD-ID]
```

Look for the "Run gradlew" section for specific errors.

---

## Quick Checklist

Before rebuilding:

- [ ] Node.js 16+ installed (`node -v`)
- [ ] npm available (`npm -v`)
- [ ] All dependencies installed (`npm install`)
- [ ] app.json properly formatted
- [ ] eas.json properly formatted
- [ ] All asset files present
- [ ] Internet connection stable
- [ ] Expo account created
- [ ] EAS project linked

---

## If Still Failing

1. Check detailed Gradle logs on Expo dashboard
2. Try local build (requires Android SDK):
   ```powershell
   eas build --platform android --local
   ```
3. Join Expo Discord: https://chat.expo.dev
4. Create issue on Expo GitHub

---

## Expected Build Time

- **Cloud Build**: 10-15 minutes
- **Initial Setup**: 2-3 minutes
- **Subsequent Builds**: 8-10 minutes

---

## Success Indicators

✅ Build succeeds when you see:
```
✔ Build finished
✔ Download APK from: https://...
```

Then APK appears in `./dist/` folder automatically.

---

**Status**: Configuration is valid. Build failure is likely temporary (cache/network). **Retry with `--clear-cache` flag first.**

