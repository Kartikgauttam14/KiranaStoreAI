#!/bin/bash
# KiranaAI APK Quick Commands - March 21, 2026

echo "=== KiranaAI APK Build Quick Reference ==="

# Check build status
echo ""
echo "1. CHECK BUILD STATUS"
echo "cd D:\KiranaStore\KiranaAI"
echo "eas build:list"
echo "# or visit: https://expo.dev/accounts/kartikgauttam/projects/KiranaAI"

# Start new build
echo ""
echo "2. START NEW BUILD (if needed)"
echo "cd D:\KiranaStore\KiranaAI"
echo '$env:EAS_BUILD_NO_EXPO_GO_WARNING = "true"'
echo 'eas build --platform android --clear-cache'

# Install APK via ADB
echo ""
echo "3. INSTALL APK ON DEVICE"
echo "adb devices                    # List connected devices"
echo "adb install -r KiranaAI.apk    # Install APK"
echo 'adb shell am start -n com.kiranaai.store/.MainActivity  # Launch app'

# View latest build info
echo ""
echo "4. VIEW BUILD DETAILS"
echo "eas build:view <BUILD_ID>"

# Alternative: Expo Go for testing
echo ""
echo "5. TEST WITH EXPO GO (No APK needed)"
echo 'eas build --platform android --profile preview'
echo "# Scan QR code on Android device with Expo Go app"

echo ""
echo "=== APK Download Steps ==="
echo "1. Open: https://expo.dev/accounts/kartikgauttam/projects/KiranaAI"
echo "2. Click 'Builds' tab"
echo "3. Find Android build with status 'Finished'"
echo "4. Click build and press 'Download'"
echo "5. Use ADB or drag-drop to install on device"

echo ""
echo "=== Project Info ==="
echo "Package: com.kiranaai.store"
echo "Version: 1.0.0"
echo "Min SDK: API 33 (Android 13)"
echo "Target SDK: API 34 (Android 14)"

echo ""
echo "✅ BUILD SUBMITTED AND PROCESSING!"
echo "⏱️  ETC: 10-15 minutes for completion"
