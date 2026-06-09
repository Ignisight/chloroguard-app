@echo off
setlocal enabledelayedexpansion
echo ==================================================
echo       STARTING PHOTOGUARD SYSTEM (OFFLINE)
echo ==================================================
echo.

echo 1. Freeing up Port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo [OK] Terminating old API server process PID %%a holding port 8000...
    taskkill /f /pid %%a >nul 2>&1
)
echo.

echo 2. Detecting PC Local IP Address...
:: Run PowerShell to find the primary IPv4 address (excluding localhost and loopbacks)
for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -ExpandProperty IPAddress -First 1"`) do (
    set DETECTED_IP=%%i
)

if "%DETECTED_IP%"=="" (
    set DETECTED_IP=192.168.1.100
    echo [WARNING] Could not auto-detect local IP. Defaulting to 192.168.1.100.
) else (
    echo [OK] Detected PC Local IP: !DETECTED_IP!
)
echo.
echo ==================================================
echo  👉 IN THE MOBILE APP (⚙️ Settings Gear Icon):
echo     Set Server IP to: !DETECTED_IP!
echo     Set Port to:      8000
echo ==================================================
echo.

echo 3. Starting FastAPI Backend Server on 0.0.0.0 (LAN)...
cd /d "%~dp0api"
:: Host 0.0.0.0 allows devices on the same Wi-Fi network to connect
start "photoguard API Backend" py -m uvicorn main:app --host 0.0.0.0 --port 8000
echo [OK] Backend server listening on all network interfaces.
echo.

echo 4. Starting Mobile App dev server (Expo Go)...
cd /d "%~dp0mobile_app"
call npx.cmd expo start --clear
pause
