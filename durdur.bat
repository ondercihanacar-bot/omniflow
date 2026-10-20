@echo off
chcp 65001 > nul
title OMNIFlow - Sunucuyu Durdur
cd /d "%~dp0"

echo ======================================================================
echo                 OMNIFLOW - SUNUCUYU DURDUR
echo ======================================================================
echo.

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do (
    echo [*] Port 5000 uzerinde calisan OMNIFlow (PID: %%a) durduruluyor...
    taskkill /f /pid %%a >nul 2>&1
)

echo.
echo [OK] OMNIFlow sunucusu basariyla durduruldu.
ping 127.0.0.1 -n 3 > nul
exit /b 0