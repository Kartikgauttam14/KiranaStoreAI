# KiranaAI APK Build Script
Set-Location D:\KiranaStore\KiranaAI
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host "Setting environment variables..." -ForegroundColor Yellow
$env:EAS_BUILD_NO_EXPO_GO_WARNING = "true"
$env:EAS_SKIP_AUTO_FINGERPRINT = "1"
Write-Host "Starting APK build (will NOT wait for completion)..." -ForegroundColor Green
Write-Host "Build will continue on EAS servers" -ForegroundColor Cyan
eas build --platform android --no-wait
