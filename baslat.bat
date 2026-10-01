@echo off
chcp 65001 > nul
title OMNIFlow
echo ======================================================================
echo                 OMNIFLOW - BILISIM YONETIM SISTEMI
echo ======================================================================
echo.

:: Port 5000 kontrolu (Sunucu zaten calisiyor mu?)
netstat -ano | findstr :5000 | findstr LISTENING > nul
if %ERRORLEVEL% equ 0 (
    echo [BILGI] OMNIFlow sunucusu arka planda zaten aktif.
    echo Tarayici aciliyor: http://localhost:5000
    start http://localhost:5000
    exit /b
)

echo Uygulama baslatiliyor, lutfen bekleyin...
echo Erisim Adresi: http://localhost:5000
echo.

:: Node calistiricisini belirle (G?m?l? portable Node veya Sistem Node)
set "NODE_BIN=node"
if exist "%~dp0runtime\node.exe" (
    set "NODE_BIN=%~dp0runtime\node.exe"
) else if exist "%~dp0server\runtime\node.exe" (
    set "NODE_BIN=%~dp0server\runtime\node.exe"
)

cd /d "%~dp0server"

:: Tarayiciyi otomatik ac
start "" cmd /c "ping 127.0.0.1 -n 3 > nul & start http://localhost:5000"

:: Node sunucusunu calistir
"%NODE_BIN%" --experimental-sqlite index.js

pause