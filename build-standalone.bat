@echo off
echo Building standalone Pixivloader app (no backend hosting needed)...

echo.
echo 1. Installing dependencies...
npm install

echo.
echo 2. Building frontend for production...
npm run build

echo.
echo 3. Copying to Capacitor...
npx cap copy

echo.
echo 4. Syncing Capacitor...
npx cap sync

echo.
echo ✅ Build complete! 
echo.
echo Next steps:
echo 1. Run: npx cap open android
echo 2. Build APK in Android Studio
echo 3. Distribute APK - no server needed!
echo.
echo The app will work completely offline with embedded backend.

pause