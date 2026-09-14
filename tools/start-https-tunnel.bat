@echo off
REM Starts a temporary public HTTPS URL for phone testing.
REM Keep this window open while testing on your phone.
cd /d "%~dp0"
echo Starting HTTPS tunnel...
echo Keep Apache (XAMPP) running.
echo.
cloudflared.exe tunnel --url http://127.0.0.1:80 --no-autoupdate
pause
