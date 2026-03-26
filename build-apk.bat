@echo off
REM KiranaAI APK Build Script - Windows Batch
REM Quick and easy APK building for Windows

Title KiranaAI APK Builder
Color 0A

echo.
echo ================================================
echo   KiranaAI APK Builder
echo ================================================
echo.

REM Check Node.js
echo [*] Checking Node.js...
where node >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install from https://nodejs.org
    pause
    exit /b 1
)
echo [OK] Node.js found
echo.

REM Check npm
echo [*] Checking npm...
where npm >nul 2>nul
if errorlevel 1 (
    echo [ERROR] npm not found
    pause
    exit /b 1
)
echo [OK] npm found
echo.

REM Navigate to project
cd /d D:\KiranaStore\KiranaAI
if errorlevel 1 (
    echo [ERROR] Project directory not found
    pause
    exit /b 1
)
echo [OK] In project directory
echo.

REM Menu
:menu
echo ================================================
echo   Choose Build Option
echo ================================================
echo.
echo 1. Cloud Build (Recommended - No local Android SDK needed)
echo 2. Local Build (Requires Android SDK/NDK)
echo 3. Preview Build (For testing)
echo 4. Install on Device (if APK exists)
echo 5. Exit
echo.

set /p choice="Enter choice (1-5): "

if "%choice%"=="1" goto cloud_build
if "%choice%"=="2" goto local_build
if "%choice%"=="3" goto preview_build
if "%choice%"=="4" goto install_apk
if "%choice%"=="5" goto end
echo Invalid choice. Try again.
goto menu

:cloud_build
echo.
echo [*] Installing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] npm install failed
    pause
    goto menu
)

echo.
echo [*] Checking EAS CLI...
where eas >nul 2>nul
if errorlevel 1 (
    echo [*] Installing EAS CLI...
    call npm install -g eas-cli
)

echo.
echo [*] Authenticating with Expo...
call eas login

echo.
echo [*] Configuring build...
if not exist eas.json (
    call eas build:configure
)

echo.
echo [*] Starting Cloud Build...
echo This will build on Expo servers.
echo Build time: 10-15 minutes
echo.
call eas build --platform android
if errorlevel 1 (
    echo [ERROR] Build failed
    pause
    goto menu
)
echo [OK] Cloud build started! Check https://expo.dev for downloads
pause
goto menu

:local_build
echo.
echo [*] Starting Local Build...
echo This requires Android SDK and NDK to be installed.
echo.
call npm install
call eas build --platform android --local
if errorlevel 1 (
    echo [ERROR] Build failed
    pause
    goto menu
)
echo [OK] Local build complete!
pause
goto menu

:preview_build
echo.
echo [*] Starting Preview Build...
echo This creates a development/testing APK.
echo.
call npm install
call eas build --platform android --profile preview
if errorlevel 1 (
    echo [ERROR] Build failed
    pause
    goto menu
)
echo [OK] Preview build complete!
pause
goto menu

:install_apk
echo.
echo [*] Checking for APK files...
if exist dist\*.apk (
    echo [OK] Found APK in dist folder
    set apk_found=1
) else if exist *.apk (
    echo [OK] Found APK in current directory
    set apk_found=1
) else (
    echo [ERROR] No APK file found
    echo Please build first using option 1, 2, or 3
    pause
    goto menu
)

echo.
echo [*] Checking for connected Android devices...
where adb >nul 2>nul
if errorlevel 1 (
    echo [ERROR] Android Debug Bridge (adb) not found
    echo Please check Android SDK installation
    pause
    goto menu
)

adb devices

echo.
set /p install_choice="Install APK on device? (y/n): "
if /i "%install_choice%"=="y" (
    if exist dist\*.apk (
        for %%f in (dist\*.apk) do (
            echo [*] Installing %%f...
            adb install -r "%%f"
            if errorlevel 1 (
                echo [ERROR] Installation failed
                pause
                goto menu
            )
        )
    )
    echo [OK] APK installed successfully!
    echo Launch 'KiranaAI' from your app drawer to test.
) else (
    echo Installation skipped.
)
pause
goto menu

:end
echo.
echo [*] Thank you for using KiranaAI APK Builder!
echo.
pause
exit /b 0
