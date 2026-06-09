@echo off
echo ===================================================
echo      Starting ChloroGuard Application
echo ===================================================
echo.
echo Starting the Backend API (FastAPI)...
start "ChloroGuard Backend" cmd /c "cd api && py -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak >nul

echo Starting the Mobile App (Expo Go)...
start "ChloroGuard Frontend" cmd /c "cd mobile_app && npx expo start --clear"

echo.
echo ===================================================
echo Both services have been started in new windows!
echo - Keep the backend window open to process images.
echo - Scan the QR code in the frontend window with Expo Go.
echo ===================================================
pause
