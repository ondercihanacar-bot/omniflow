@echo off
chcp 65001 > nul
title OMNIFlow - Bilisim ve Altyapi Yonetim Sistemi
cd /d "%~dp0"

echo ======================================================================
echo                 OMNIFLOW - BILISIM YONETIM SISTEMI
echo ======================================================================
echo.

:: 1. Node calistiricisini belirle
set "NODE_BIN=node"
if exist "%~dp0runtime\node.exe" set "NODE_BIN=%~dp0runtime\node.exe"
if exist "%~dp0server\runtime\node.exe" set "NODE_BIN=%~dp0server\runtime\node.exe"

:: 2. Node.js erisim kontrolu
where "%NODE_BIN%" >nul 2>&1
if %errorlevel% equ 0 goto :CHECK_PORT

echo [HATA] Node.js calistiricisi sistemde bulunamadi!
echo Lutfen sisteminizde Node.js kurulu oldugundan emin olun.
pause
exit /b 1

:CHECK_PORT
:: 3. Port 5000 kontrolu
netstat -ano | findstr :5000 | findstr LISTENING > nul
if %errorlevel% equ 0 goto :RUNNING

echo OMNIFlow sunucusu baslatiliyor, lutfen bekleyin...
echo Erisim Adresi: http://localhost:5000
echo.

:: Tarayiciyi otomatik ac
start "" cmd /c "ping 127.0.0.1 -n 4 > nul & if exist \"%ProgramFiles%\Google\Chrome\Application\chrome.exe\" (start \"\" \"%ProgramFiles%\Google\Chrome\Application\chrome.exe\" \"http://localhost:5000\") else (start \"\" \"http://localhost:5000\")"

:: Node sunucusunu calistir
"%NODE_BIN%" --experimental-sqlite server/index.js

echo.
echo [BILGI] OMNIFlow sunucusu sonlandi.
pause
exit /b 0

:RUNNING
echo ======================================================================
echo [OK] OMNIFlow sunucusu arka planda zaten aktif ve calisiyor.
echo Tarayici aciliyor: http://localhost:5000
echo ======================================================================
echo.
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" "http://localhost:5000"
) else (
    start "" "http://localhost:5000"
)
ping 127.0.0.1 -n 4 > nul
exit /b 0