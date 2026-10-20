@echo off
chcp 65001 > nul
cd /d "%~dp0"

:: Eger dogrudan cift tiklandiysa ve gizli modda degilse, launcher.vbs ile tamamen sessiz baslatip bu pencereyi aninda kapat
if "%~1" neq "hidden" (
    start "" wscript.exe "%~dp0launcher.vbs"
    exit /b 0
)

:: 1. Node calistiricisini belirle
set "NODE_BIN=node"
if exist "%~dp0runtime\node.exe" set "NODE_BIN=%~dp0runtime\node.exe"
if exist "%~dp0server\runtime\node.exe" set "NODE_BIN=%~dp0server\runtime\node.exe"

:: 2. Port 5000 kontrolu (Sunucu zaten calisiyor mu?)
netstat -ano | findstr :5000 | findstr LISTENING > nul
if %errorlevel% equ 0 goto :RUNNING

:: 3. Sunucuyu baslat (server/index.js icinde sunucu hazir oldugunda tarayici otomatik acilacaktir)
"%NODE_BIN%" --experimental-sqlite server/index.js
exit /b 0

:RUNNING
:: Sunucu zaten aciksa sadece tarayiciyi on plana getir
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" "http://localhost:5000"
) else (
    start "" "http://localhost:5000"
)
exit /b 0