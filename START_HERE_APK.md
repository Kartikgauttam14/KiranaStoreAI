# 🎯 START HERE - Build Your APK Now!

**Everything is configured and ready!** Just follow the steps below.

---

## ⚡ FASTEST WAY (3 Steps, 20 Minutes)

### Step 1️⃣: Open PowerShell

```powershell
cd D:\KiranaStore\KiranaAI
```

### Step 2️⃣: Install EAS (First Time Only)

```powershell
npm install -g eas-cli
```

### Step 3️⃣: Login (First Time Only)

```powershell
eas login
```

- Browser opens automatically
- Create free account OR login at https://expo.dev
- Return to PowerShell when done

### Step 4️⃣: BUILD! 🚀

```powershell
eas build --platform android
```

**Wait 10-15 minutes...**

```
Building...
✅ Build complete!
📱 APK ready to download
```

### Step 5️⃣: Download & Install

**Option A: Automatic**
```
APK downloads to: D:\KiranaStore\KiranaAI\dist\KiranaAI-1.0.0.apk
```

**Option B: Manual**
- Go to: https://expo.dev/dashboard
- Find your build
- Click Download

### Step 6️⃣: Install on Phone

```powershell
# If Android SDK installed (adb)
adb install -r .\dist\KiranaAI-1.0.0.apk

# Or manually:
# 1. Copy APK to phone (USB, email, etc)
# 2. Open file manager on phone
# 3. Tap APK file → Install
```

### Step 7️⃣: Launch & Enjoy! 🎉

- Find "KiranaAI" in app drawer
- Tap to open
- Test features!

---

## 🎯 THAT'S IT!

**Total time: 20-25 minutes**

---

## 🆘 SOMETHING DOESN'T WORK?

### "Command not found" / "npm: not installed"
1. Download Node.js from https://nodejs.org
2. Install it
3. Restart PowerShell
4. Try again

### "eas: command not found"
```powershell
npm install -g eas-cli
```

### "Need to login"
```powershell
eas login
```

### "Build failed"
- Check internet connection
- Try again: `eas build --platform android --force-new`
- Check Expo dashboard for error details

### "APK won't install on phone"
- Check Android version (requires Android 13+)
- Enable "Unknown Sources" in phone settings
- Try: `adb uninstall com.kiranaai.store` first
- Then: `adb install -r apk-file`

### "Can't find adb"
- Install Android Stud or Android SDK
- Or just manually copy APK to phone via email/USB

---

## 📱 TESTING THE APP

### Test Owner Features
1. Login with phone number + OTP
2. Select store from dashboard
3. Try:
   - Inventory → Add/Edit products
   - Billing → Create bill
   - Dashboard → Check KPIs
   - Forecast → View predictions
   - Analytics → Check trends
   - Notifications → Check alerts

### Test Customer Features
1. Login as customer (OTP)
2. Allow location permission
3. Try:
   - Home → Find nearby stores
   - Stores → Search/filter
   - Tap store → View products
   - Cart → Add items
   - Orders → Track orders
   - Profile → Update settings

### Test Advanced Features
- **Offline**: Disable WiFi/Mobile → App still works
- **i18n**: Change language in profile
- **Notifications**: Check notification hub
- **Location**: Verify maps work

---

## 📋 QUICK REFERENCE

| Task | Command |
|------|---------|
| Setup | `npm install -g eas-cli` |
| Login | `eas login` |
| Build | `eas build --platform android` |
| View builds | `eas build:list` |
| Check device | `adb devices` |
| Install APK | `adb install -r app.apk` |
| View logs | `adb logcat \| findstr "KiranaAI"` |
| Uninstall | `adb uninstall com.kiranaai.store` |

---

## ✅ You're All Set!

Everything is configured and ready to build.

**Next command:**
```powershell
eas build --platform android
```

---

## 📚 Need More Info?

Read these files in order:

1. **This file** - Quick start (you are here)
2. **APK_QUICK_REFERENCE.md** - One-page cheat sheet
3. **QUICK_APK_BUILD.md** - 5-minute detailed guide
4. **APK_BUILD_GUIDE.md** - Complete guide with all options
5. **APK_BUILD_READY.md** - Technical details

---

## 🎊 ENJOY YOUR APP!

Your APK is ready to build and share with users!

Questions? Check the guides above or visit https://expo.dev

**Let's build!** 🚀
