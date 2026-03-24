# 📱 KiranaAI APK Build - Quick Reference

## 🚀 BUILD IN 3 COMMANDS

```powershell
cd D:\KiranaStore\KiranaAI
npm install -g eas-cli        # Step 1: Install (first time only)
eas login                      # Step 2: Login (first time only)
eas build --platform android   # Step 3: BUILD!
```

**Then:** Wait 10-15 minutes → Download APK → Install on phone ✅

---

## 📋 CHECKLIST

- [ ] Navigate to project: `cd D:\KiranaStore\KiranaAI`
- [ ] Install EAS: `npm install -g eas-cli`
- [ ] Create free Expo account: https://expo.dev
- [ ] Login: `eas login`
- [ ] Build: `eas build --platform android`
- [ ] Download APK from `./dist/` or Expo dashboard
- [ ] Install: `adb install -r .\dist\KiranaAI-1.0.0.apk`
- [ ] Launch & test KiranaAI app

---

## 🎯 BUILD OPTIONS

| Option | Command | Time | Android SDK? |
|--------|---------|------|-------------|
| ☁️ Cloud (Recommended) | `eas build --platform android` | 10-15 min | ❌ No |
| 💻 Local | `eas build --platform android --local` | 5-10 min | ✅ Yes |
| 🧪 Preview | `eas build --platform android --profile preview` | 10-15 min | ❌ No |

---

## 📍 KEY LOCATIONS

```
Project:        D:\KiranaStore\KiranaAI
APK Output:     ./dist/KiranaAI-1.0.0.apk
APK Package:    com.kiranaai.store
Expo Dashboard: https://expo.dev/dashboard
Build Config:   app.json, eas.json
```

---

## 🔧 USEFUL COMMANDS

```powershell
# View build history
eas build:list

# View specific build details
eas build:view <build-id>

# Download specific build
eas build:download <build-id>

# Check connected devices
adb devices

# Install APK on device
adb install -r .\dist\KiranaAI-1.0.0.apk

# Uninstall from device
adb uninstall com.kiranaai.store

# View app logs
adb logcat | findstr "KiranaAI"
```

---

## ⚡ QUICKEST PATH

**Easiest Way (Recommended)**:
1. `npm install -g eas-cli` (first time)
2. `eas login` (first time)
3. `eas build --platform android`
4. **Done!** APK downloads automatically

**Total Time**: ~20 minutes ⏱️

---

## ✅ FEATURES IN APK

### 🏪 Owner Features
- 📊 Dashboard (KPIs, metrics)
- 📦 Inventory management
- 🧾 Billing/POS system
- 🔮 AI Forecasting
- 📈 Advanced Analytics
- 🔔 Real-time Notifications

### 👥 Customer Features
- 🗺️ Store Discovery
- 🛒 Shopping Cart
- 📍 Location Services
- 📦 Order Tracking
- 👤 User Profile

### 🔧 Advanced
- 📴 Offline Support (sync when online)
- 🌍 Bilingual (English + Hindi)
- 🔐 Secure authentication
- 🚀 Production-ready

---

## 🆘 QUICK FIX

| Problem | Fix |
|---------|-----|
| "eas not found" | `npm install -g eas-cli` |
| "Not logged in" | `eas login` |
| "Build failed" | Check internet, try again |
| "APK won't install" | `adb install -r apk-file` |
| "App crashes" | Check logs: `adb logcat | findstr "KiranaAI"` |

---

## 📊 APP INFO

```
Name:           KiranaAI
Version:        1.0.0
Package:        com.kiranaai.store
Target API:     33+ (Android 13+)
Size:           ~45-60 MB
Format:         APK (Universal)
Status:         ✅ Production Ready
```

---

## 🎬 NEXT STEPS

1. **Build**: `eas build --platform android`
2. **Download**: From `./dist/` or Expo dashboard
3. **Install**: Connect phone → `adb install -r apk`
4. **Test**: Open app → use features → report feedback
5. **Deploy**: Share APK or submit to Play Store

---

## 📞 NEED HELP?

- **Build fails?** Check: https://expo.dev/dashboard
- **App crashes?** View: `adb logcat`
- **Installation issues?** Enable USB Debug mode on phone
- **Feature bugs?** Check console: `adb logcat | findstr "KiranaAI"`

---

**Ready? Go build!** 🚀

```powershell
cd D:\KiranaStore\KiranaAI
eas build --platform android
```
