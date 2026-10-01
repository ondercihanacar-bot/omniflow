# OMNIFlow - Proje Kuralları & Geliştirme Kılavuzu

## 1. Geliştirici İmzası (Telif Hakkı)
- Sol menünün altında (Sidebar footer), ana sayfa altlığında (Page footer) ve **Giriş Ekranı altlığında (AuthScreen footer)** yer alan:
  **"Designed & Developed by Önder Cihan ACAR © 2026. All Rights Reserved."**
  imzası kalıcıdır. Bileşen güncellemeleri veya refactor sırasında kesinlikle kaldırılmamalıdır.
- Giriş ekranında imza bağımsız opak bir şeritte değil, tam ekran arka planın üzerinde doğrudan okunabilir yüksek kontrastlı renk ve gölge efektiyle (`drop-shadow`) yer almalıdır.

## 2. Arayüz ve Ekran Yerleşimi (Layout Invariants)
- **Tam Genişlik (Full-Width):** Ana içerik kapsayıcılarında yapay `max-w-7xl` daraltmaları kullanılmamalıdır. Ekranın sağ ve solundaki boş alanlar tam verimle kullanılmalıdır (`w-full`).
- **Giriş Ekranı Bütünlüğü (Full-Screen Auth):** Giriş ekranında video/dinamik arka fon tam ekran uygulanmalı; alt veya üst paneller zemin akışını kesen koyu şeritler barındırmamalıdır (`bg-transparent border-t-0`).
- **Pah Kırılmış Marka Logosu (Beveled Logo Widget):** Ana sayfa üst menüsü (`Navbar`) ve giriş kartındaki (`AuthScreen`) logolar kenarları pah kırılmış (`rounded-xl` / `rounded-2xl`), koyu arkaplanla bütünleşik (`bg-slate-950/60`, `border-slate-800/80`) beveled çerçevelere sığdırılmalı; aşırı küçültülmeden veya çerçeveden taşmadan sergilenmelidir.
- **Yatay Kaydırmayı Önleme:** Sanal Makineler, Kullanıcı PC ve Sunucu tablolarında sütunlar optimize edilmeli, ilk sütun sabitlenmeli (`sticky left-0`) ve kullanıcının tercih edebileceği çift görünüm (Tablo / Kartlar) korunmalıdır.
- **Sol Menü Kartları:** Müşteri kartları ince ve kompakt kalmalı; ancak alt kısımdaki bilgilendirici cihaz simgeleri (Sunucu, VM, PC, Firewall, NAS, Wi-Fi sayaçları) kart içerisine zarifçe sığdırılmalıdır.
- **Aydınlık Rapor Önizleme:** PDF/Rapor modalında koyu/karanlık arka plan yerine gerçek bir A4 beyaz rapor sayfası önizlemesi sunulmalıdır.

## 3. Mimari ve Derleme Standartları
- Backend (`server/index.js`) port 5000 üzerinde hem API'yi hem de `client/dist` statik dosyalarını sunar.
- `client/src` üzerinde yapılan her değişiklikten sonra `client` klasöründe `npm run build` çalıştırılarak derleme doğrulanmalıdır.
- Veritabanı Node.js yerleşik `node:sqlite` kütüphanesini kullanır.

## 4. Marka ve İsim Standardı (Branding Invariant)
- Programın adı kesin ve istisnasız olarak **"OMNIFlow"** dur. "IT Manager Pro" ismi hiçbir yerde kullanılmamalıdır.
