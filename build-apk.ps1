#!/usr/bin/env pwsh

# KiranaAI APK Build Script
# Automated APK building for Windows

param(
    [ValidateSet("cloud", "local", "preview")]
    [string]$BuildType = "cloud",
    
    [switch]$SkipInstall,
    [switch]$Offline
)

$ErrorActionPreference = "Stop"

function Write-Header {
    param([string]$Text)
    Write-Host "`n" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "  $Text" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
}

function Write-Step {
    param([string]$Text, [int]$Number)
    Write-Host "`n[Step $Number] $Text" -ForegroundColor Green -NoNewline
}

function Write-Success {
    Write-Host " ✓" -ForegroundColor Green
}

function Write-Error-Message {
    param([string]$Text)
    Write-Host "`n❌ ERROR: $Text" -ForegroundColor Red
    exit 1
}

# Start
Write-Header "KiranaAI APK Build Script"

# Check Node.js
Write-Step "Checking Node.js installation" 1
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error-Message "Node.js not found. Please install Node.js from https://nodejs.org"
}
$nodeVersion = node --version
Write-Host " (v$nodeVersion)" -ForegroundColor Green
Write-Success

# Check npm
Write-Step "Checking npm" 2
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error-Message "npm not found"
}
Write-Success

# Navigate to project
Write-Step "Navigating to project directory" 3
$projectPath = "D:\KiranaStore\KiranaAI"
if (-not (Test-Path $projectPath)) {
    Write-Error-Message "Project directory not found: $projectPath"
}
Push-Location $projectPath
Write-Host " at $projectPath" -ForegroundColor Green
Write-Success

# Check if dependencies installed
if (-not (Test-Path "node_modules")) {
    Write-Step "Installing dependencies" 4
    npm install
    Write-Success
}
else {
    Write-Step "Dependencies already installed" 4
    Write-Success
}

# Check EAS CLI
Write-Step "Checking EAS CLI" 5
if (-not (Get-Command eas -ErrorAction SilentlyContinue)) {
    Write-Host " not found, installing globally..." -ForegroundColor Yellow
    npm install -g eas-cli
    Write-Success
}
else {
    Write-Success
}

# Check EAS login
Write-Step "Checking Expo authentication" 6
try {
    $loginStatus = eas account:view 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " logged in" -ForegroundColor Green
        Write-Success
    }
    else {
        Write-Host " not logged in" -ForegroundColor Yellow
        Write-Host "Please login to Expo..." -ForegroundColor Yellow
        eas login
        Write-Success
    }
}
catch {
    Write-Host " login check skipped" -ForegroundColor Yellow
}

# Configure EAS
Write-Step "Checking EAS configuration" 7
if (-not (Test-Path "eas.json")) {
    Write-Host " config missing, running setup..." -ForegroundColor Yellow
    eas build:configure
    Write-Success
}
else {
    Write-Host " config found" -ForegroundColor Green
    Write-Success
}

# Select build type
Write-Header "Build Configuration"
Write-Host "`nBuild Type: $BuildType" -ForegroundColor Cyan

switch ($BuildType) {
    "cloud" {
        Write-Host "  • Server: Expo Cloud"
        Write-Host "  • Time: 10-15 minutes"
        Write-Host "  • Requires: Internet connection"
        Write-Host "  • Benefit: No local Android SDK needed"
    }
    "local" {
        Write-Host "  • Server: Local (requires Android SDK)"
        Write-Host "  • Time: 5-10 minutes (after first prebuild)"
        Write-Host "  • Requires: Android SDK, NDK"
        Write-Host "  • Benefit: Full control"
    }
    "preview" {
        Write-Host "  • Type: Development/Preview build"
        Write-Host "  • Time: 8-12 minutes"
        Write-Host "  • Use: For testing, not Play Store"
    }
}

# Build steps
Write-Header "Building APK"

Write-Step "Cleaning build cache" 8
if (Test-Path ".expo") {
    Remove-Item ".expo" -Recurse -Force -ErrorAction SilentlyContinue
}
Write-Success

# Main build command
Write-Step "Building APK" 9

switch ($BuildType) {
    "cloud" {
        Write-Host "`nStarting cloud build..." -ForegroundColor Cyan
        Write-Host "This will build on Expo servers. APK will download when ready.`n" -ForegroundColor Gray
        eas build --platform android
    }
    "local" {
        Write-Host "`nBuilding locally..." -ForegroundColor Cyan
        Write-Host "Requires Android SDK. If not installed, use: eas build --platform android`n" -ForegroundColor Gray
        eas build --platform android --local
    }
    "preview" {
        Write-Host "`nBuilding preview APK..." -ForegroundColor Cyan
        Write-Host "This creates an internal testing build.`n" -ForegroundColor Gray
        eas build --platform android --profile preview
    }
}

if ($LASTEXITCODE -ne 0) {
    Write-Error-Message "Build failed. Check output above for details."
}
Write-Success

# Find APK
Write-Step "Locating APK file" 10
$apkFiles = Get-ChildItem -Path "." -Filter "*.apk" -Recurse -ErrorAction SilentlyContinue
if ($apkFiles) {
    Write-Host "`nFound APK files:" -ForegroundColor Green
    $apkFiles | ForEach-Object {
        Write-Host "  📱 $($_.FullName)" -ForegroundColor Green
    }
    Write-Success
}
else {
    Write-Host " checking dist folder..." -ForegroundColor Yellow
    if (Test-Path "dist") {
        Get-ChildItem "dist" -Filter "*.apk" | ForEach-Object {
            Write-Host "  📱 $($_.FullName)" -ForegroundColor Green
        }
        Write-Success
    }
    else {
        Write-Host " APK not found locally (check Expo dashboard)" -ForegroundColor Yellow
    }
}

# Optional: Install on device
if (-not $SkipInstall -and $apkFiles) {
    Write-Header "Testing on Device"
    
    Write-Step "Checking for connected Android devices" 11
    $adbCheck = adb devices 2>&1
    if ($adbCheck -match "device$" -and -not ($adbCheck -match "offline")) {
        Write-Host " device(s) found" -ForegroundColor Green
        Write-Success
        
        $response = Read-Host "`nInstall APK on device? (y/n)"
        if ($response -eq 'y') {
            Write-Step "Installing APK" 12
            $apkFile = $apkFiles[0].FullName
            adb install -r $apkFile
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host " successfully installed" -ForegroundColor Green
                Write-Success
                
                Write-Host "`n✅ APP INSTALLED!" -ForegroundColor Green
                Write-Host "Launch 'KiranaAI' from your app drawer to test." -ForegroundColor Cyan
            }
            else {
                Write-Host " installation failed" -ForegroundColor Yellow
                Write-Host "Try: adb install -r '$apkFile'" -ForegroundColor Gray
            }
        }
    }
    else {
        Write-Host " no devices connected" -ForegroundColor Yellow
        Write-Host "Connect Android device with USB debugging enabled" -ForegroundColor Gray
    }
}

# Summary
Write-Header "Build Complete!"

Write-Host "`n✅ APK Build Successful" -ForegroundColor Green

Write-Host "`n📊 Build Summary:" -ForegroundColor Cyan
Write-Host "  • App: KiranaAI v1.0.0" -ForegroundColor Gray
Write-Host "  • Package: com.kiranaai.store" -ForegroundColor Gray
Write-Host "  • Target: Android 13+ (API 33+)" -ForegroundColor Gray
Write-Host "  • Build Type: $BuildType" -ForegroundColor Gray

Write-Host "`n🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Install APK on Android device" -ForegroundColor Gray
Write-Host "  2. Launch KiranaAI app" -ForegroundColor Gray
Write-Host "  3. Test all features" -ForegroundColor Gray
Write-Host "  4. Share feedback" -ForegroundColor Gray

Write-Host "`n📁 APK Location:" -ForegroundColor Cyan
if ($apkFiles) {
    $apkFiles | ForEach-Object {
        Write-Host "  $($_.FullName)" -ForegroundColor Green
    }
}
else {
    Write-Host "  Check https://expo.dev dashboard for downloads" -ForegroundColor Yellow
}

Write-Host "`n💡 Tip: Use 'eas build:list' to view build history" -ForegroundColor Cyan

Pop-Location

Write-Host "`n" -ForegroundColor Cyan
