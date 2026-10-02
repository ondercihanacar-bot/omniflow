@echo off
chcp 65001 > nul
title OMNIFlow - Otomatik Yedekleme ve GitHub Senkronizasyonu
echo ======================================================================
echo          OMNIFLOW - OTOMATIK YEDEKLEME VE GITHUB PUSH MOTORU
echo         Designed and Developed by Önder Cihan ACAR (C) 2026.
echo ======================================================================
echo.
cd /d "%~dp0"

:: 1. Veritabani Checkpoint ve Otomatik Yedek Alma
echo [1/4] Geri dönüs icin veritabani yedegi aliniyor...
powershell -Command "$d = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'; if (!(Test-Path 'Otomatik_Yedekler')) { New-Item -ItemType Directory -Path 'Otomatik_Yedekler' | Out-Null }; if (Test-Path 'server\data\itmanager.db') { Copy-Item 'server\data\itmanager.db' -Destination \"Otomatik_Yedekler\OmniFlow_Backup_$d.db\" -Force; Write-Host \"[+] Yedek olusturuldu: Otomatik_Yedekler\OmniFlow_Backup_$d.db\" -ForegroundColor Green }"

:: 2. SQLite WAL Checkpoint
node --experimental-sqlite -e "try { const { DatabaseSync } = require('node:sqlite'); const db = new DatabaseSync('server/data/itmanager.db'); db.exec('PRAGMA wal_checkpoint(FULL);'); } catch(e){}" > nul 2>&1

:: 3. Frontend Derlemesi
echo [2/4] Arayüz derlemesi kontrol ediliyor (npm run build)...
cd client
call npm run build
cd ..

:: 4. Git Commit ve Push
echo.
echo [3/4] Degisiklikler Git'e ekleniyor...
git add .
set "DATETIME=%date% %time%"
git commit -m "auto: sistem guncellemesi ve veritabani senkronizasyonu (%DATETIME%)"

echo.
echo [4/4] GitHub ve Render bulut sunucusuna gonderiliyor (Push)...
git push origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ======================================================================
    echo [BASARILI] Yedek alindi ve tum degisiklikler GitHub'a gonderildi!
    echo Render bulut sunucusu (https://omniflow-mptm.onrender.com) 
    echo otomatik olarak yeni surumu yayina aliyor.
    echo ======================================================================
) else (
    echo.
    echo [BILGI] Push yapilacak yeni bir degisiklik bulunamadi veya baglanti hatasi.
)
echo.
pause
