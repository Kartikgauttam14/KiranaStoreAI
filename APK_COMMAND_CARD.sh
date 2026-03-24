#!/usr/bin/env bash
# KiranaAI APK Build - Command Reference Card

cat << 'EOF'
╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║              🚀 KiranaAI APK BUILD - COMMAND CARD 🚀              ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

┌─ SETUP (First Time Only) ────────────────────────────────────────┐
│                                                                   │
│  $ npm install -g eas-cli                                        │
│  $ eas login                                                     │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

┌─ BUILD APK (Recommended: Cloud Build) ────────────────────────────┐
│                                                                   │
│  $ cd D:\KiranaStore\KiranaAI                                    │
│  $ eas build --platform android                                  │
│                                                                   │
│  ⏱️  Time: 10-15 minutes                                          │
│  ✅ Android SDK needed: NO                                       │
│  📱 Output: ./dist/KiranaAI-1.0.0.apk                           │
│                                                                   │
│  [DOWNLOAD APK when build complete]                              │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

┌─ INSTALL ON DEVICE ──────────────────────────────────────────────┐
│                                                                   │
│  Option A (Using ADB):                                           │
│  $ adb install -r .\dist\KiranaAI-1.0.0.apk                     │
│                                                                   │
│  Option B (Manual):                                              │
│  1. Copy APK to phone (email, USB, etc)                         │
│  2. Open file manager on phone                                  │
│  3. Tap APK file → Install                                      │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

┌─ USEFUL COMMANDS ────────────────────────────────────────────────┐
│                                                                   │
│  List all builds:                                                │
│  $ eas build:list                                                │
│                                                                   │
│  View build details:                                             │
│  $ eas build:view <build-id>                                    │
│                                                                   │
│  Check connected devices:                                        │
│  $ adb devices                                                   │
│                                                                   │
│  View app logs:                                                  │
│  $ adb logcat | findstr "KiranaAI"                              │
│                                                                   │
│  Uninstall app:                                                  │
│  $ adb uninstall com.kiranaai.store                             │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

┌─ BUILD OPTIONS COMPARISON ───────────────────────────────────────┐
│                                                                   │
│ ☁️  CLOUD BUILD (Recommended)                                    │
│    Command:  eas build --platform android                        │
│    Time:     10-15 minutes                                       │
│    Android SDK: NO                                               │
│    Best For: Quick builds, no local setup                       │
│                                                                   │
│ 💻 LOCAL BUILD                                                   │
│    Command:  eas build --platform android --local               │
│    Time:     5-10 minutes                                        │
│    Android SDK: YES (need to install)                           │
│    Best For: Advanced users                                      │
│                                                                   │
│ 🧪 PREVIEW BUILD (For Testing)                                  │
│    Command:  eas build --platform android --profile preview     │
│    Time:     10-15 minutes                                       │
│    Android SDK: NO                                               │
│    Best For: Testing before release                             │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

┌─ APK SPECIFICATIONS ─────────────────────────────────────────────┐
│                                                                   │
│  Package Name:    com.kiranaai.store                            │
│  Version:         1.0.0                                          │
│  Build Number:    1                                              │
│  Size:            ~45-60 MB                                      │
│  Target API:      33+ (Android 13+)                             │
│  Minimum API:     33 (Android 13)                               │
│  Format:          APK (Universal)                               │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

┌─ TROUBLESHOOTING ────────────────────────────────────────────────┐
│                                                                   │
│ ❌ "eas: command not found"                                      │
│    → npm install -g eas-cli                                      │
│                                                                   │
│ ❌ "Not logged in"                                               │
│    → eas login                                                   │
│                                                                   │
│ ❌ "Build failed"                                                │
│    → Check internet connection                                   │
│    → Visit: https://expo.dev/dashboard                           │
│    → Check build logs                                            │
│                                                                   │
│ ❌ "APK won't install"                                           │
│    → Check Android API 33+                                       │
│    → Enable USB Debugging on phone                              │
│    → Try: adb install -r apk-file                               │
│                                                                   │
│ ❌ "App crashes"                                                 │
│    → Check logs: adb logcat | findstr "KiranaAI"               │
│    → Ensure backend is running                                  │
│    → Check internet connection                                  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

┌─ QUICK LINKS ────────────────────────────────────────────────────┐
│                                                                   │
│ 📖 Documentation:     D:\KiranaStore\KiranaAI\START_HERE_APK.md │
│ 📊 Expo Dashboard:    https://expo.dev/dashboard                │
│ 📚 EAS Docs:          https://docs.expo.dev/eas                 │
│ 🔗 React Native:      https://reactnative.dev                   │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

╔════════════════════════════════════════════════════════════════════╗
║                                                                    ║
║  📱 READY TO BUILD? RUN THIS:                                    ║
║                                                                    ║
║  eas build --platform android                                    ║
║                                                                    ║
║  ✨ Your APK will be ready in 10-15 minutes!                     ║
║                                                                    ║
╚════════════════════════════════════════════════════════════════════╝

EOF
