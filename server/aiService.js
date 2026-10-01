// OMNIFlow - OMNI AI Diagnostic Engine
// Powered by Google Gemini 2.0 Flash & Built-in Senior IT Knowledge Base

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// System prompt designed specifically for Senior Enterprise IT Engineering
const SYSTEM_PROMPT = `Sen kurumsal bilişim sistemleri, sunucu altyapıları, ağ güvenliği ve sanallaştırma konularında uzmanlaşmış "OMNI AI Kıdemli IT Çözüm Mühendisi"sin.
Görevin: IT yöneticilerinin, sistem ve ağ teknisyenlerinin karşılaştığı arızaları, hata kodlarını (0x..., Event ID, HTTP, SSL), mavi ekranları (BSOD), firewall/VPN sorunlarını ve sistem loglarını hızlıca teşhis etmek ve kesin çözüm üretmektir.

Eğer kullanıcı bir ekran görüntüsü (screenshot) veya hata penceresi görseli yüklediyse:
- Görseldeki hata metnini, pencere başlığını ve hata kodunu titizlikle oku.
- Hatanın tam olarak nereden kaynaklandığını saptayın.

Her yanıtında şu profesyonel ve düzenli formatı kullan:
### 📌 1. Sorun Teşhisi & Kök Neden (Root Cause)
Hatanın neden kaynaklandığını net, teknik ve anlaşılır bir dille açıkla.

### 🛠️ 2. Adım Adım Çözüm Yolu (Step-by-Step Solution)
Numaralandırılmış maddeler halinde doğrudan uygulanabilir çözüm adımlarını yaz.

### 💻 3. Hazır Komut Satırı (PowerShell / CMD / Terminal)
Kullanıcının doğrudan kopyalayıp çalıştırabileceği PowerShell, CMD veya Linux komutlarını kod bloğu (\`\`\`powershell veya \`\`\`cmd) içinde ver.

### 💡 4. Önleyici Tavsiye (Best Practice)
Benzer bir sorunun tekrarlanmaması için alınması gereken kalıcı önlemi kısaca belirt.

Türkçe, net, saygılı ve sonuç odaklı konuş. Gereksiz dolambaçlı cümlelerden kaçın.`;

/**
 * Built-in Expert Knowledge Base for Instant Zero-Config Offline Diagnosis
 */
function getBuiltinDiagnosis(message = '') {
  const norm = message.toLowerCase();

  if (norm.includes('0x80070005') || norm.includes('access is denied') || norm.includes('erisim engellendi')) {
    return {
      text: `### 📌 1. Sorun Teşhisi & Kök Neden (Root Cause)
**0x80070005 (ERROR_ACCESS_DENIED)**, Windows işletim sisteminde, Windows Update veya COM/DCOM servislerinde dosya sistemi ya da kayıt defteri (Registry) izinlerinin bozulması sonucu oluşur. Genellikle antivirüs engeli veya kullanıcı yetkisi yetersizliğinden kaynaklanır.

### 🛠️ 2. Adım Adım Çözüm Yolu
1. **Yönetici Olarak Çalıştırın:** İşlemi yapan komut istemini veya uygulamayı mutlaka *Yönetici Olarak Çalıştırın (Run as Administrator)*.
2. **Windows Update Servislerini Sıfırlayın:** Update veritabanı önbelleğini temizleyin.
3. **Kayıt Defteri İzinlerini Düzeltin:** SubInACL veya yerleşik reset komutlarıyla SYSTEM ve Administrator izinlerini geri yükleyin.
4. **Antivirüs / EDR Korumasını Geçici Devre Dışı Bırakın:** Yazılım yükleme anında erişim kısıtlaması yapan EDR ajanını test için duraklatın.

### 💻 3. Hazır Komut Satırı (PowerShell)
\`\`\`powershell
# Windows Update servislerini durdur ve önbelleği sıfırla
Stop-Service wuauserv, cryptSvc, bits, msiserver -Force
Rename-Item -Path "C:\\Windows\\SoftwareDistribution" -NewName "SoftwareDistribution.old" -ErrorAction SilentlyContinue
Rename-Item -Path "C:\\Windows\\System32\\catroot2" -NewName "catroot2.old" -ErrorAction SilentlyContinue
Start-Service wuauserv, cryptSvc, bits, msiserver

# Sistem dosya bütünlüğünü onar
sfc /scannow
DISM /Online /Cleanup-Image /RestoreHealth
\`\`\`

### 💡 4. Önleyici Tavsiye
Kullanıcı makinelerinde standart kullanıcı hesaplarına local admin yetkisi vermek yerine, LAPS (Local Administrator Password Solution) kullanarak yetki yönetimini merkezileştirin.`,
      source: 'builtin'
    };
  }

  if (norm.includes('98') || norm.includes('forticlient') || norm.includes('logon to the server') || norm.includes('ssl-vpn')) {
    return {
      text: `### 📌 1. Sorun Teşhisi & Kök Neden (Root Cause)
FortiClient SSL-VPN bağlantısının **%98 oranına gelip kilitlenmesi**, istemci bilgisayardaki sanal ağ bağdaştırıcısının (Fortinet Virtual Ethernet Adapter / WAN Miniport) IP alamaması, TLS 1.2 protokol uyumsuzluğu veya Windows güncellemesi sonrası bozuk Miniport sürücülerinden kaynaklanır.

### 🛠️ 2. Adım Adım Çözüm Yolu
1. **WAN Miniport Bağdaştırıcılarını Sıfırlayın:** Aygıt Yöneticisi -> Ağ Bağdaştırıcıları altındaki bozuk sanal WAN portlarını kaldırıp yeniden taratın.
2. **TLS Protokollerini Doğrulayın:** İnternet Seçenekleri -> Gelişmiş sekmesinde *TLS 1.2* ve *TLS 1.3* kutucuklarının işaretli olduğunu teyit edin.
3. **TCP/IP ve Winsock Yığınını Sıfırlayın:** Bozulmuş LSP (Layered Service Provider) ağ kancalarını temizleyin.
4. **FortiGate Tarafını Kontrol Edin:** FortiGate SSL VPN IP havuzunda boşta atanabilir IP adresi kalıp kalmadığını kontrol edin.

### 💻 3. Hazır Komut Satırı (CMD / PowerShell)
\`\`\`powershell
# Ağ yığınını ve DNS önbelleğini temizle
netsh int ip reset
netsh winsock reset
ipconfig /flushdns

# Fortinet servislerini yeniden başlat
Restart-Service -Name "FortiClient Service Scheduler" -Force -ErrorAction SilentlyContinue
\`\`\`

### 💡 4. Önleyici Tavsiye
FortiGate üzerinde SSL-VPN tünel ayarlarında "DTLS Tunneling" seçeneğini aktif ederek paket kayıplarında bağlantının donmasını engelleyin.`,
      source: 'builtin'
    };
  }

  if (norm.includes('vss') || norm.includes('8193') || norm.includes('writer') || norm.includes('veeam')) {
    return {
      text: `### 📌 1. Sorun Teşhisi & Kök Neden (Root Cause)
**VSS Event ID 8193 (Volume Shadow Copy Service Error)**, Windows Server ve Veeam / Acronis yedekleme sırasında sistem sağlayıcısının (VSS System Provider) COM güvenlik izinleri veya 'Network Service' yetki kısıtlaması nedeniyle gölge kopya oluşturamaması durumudur.

### 🛠️ 2. Adım Adım Çözüm Yolu
1. **VSS Yazıcı Durumlarını Kontrol Edin:** \`vssadmin list writers\` komutu ile hangi yazıcının 'Failed' veya 'Waiting for completion' durumunda kaldığını görün.
2. **Network Service İzinlerini Kayıt Defterinde Doğrulayın:** \`HKLM\\SYSTEM\\CurrentControlSet\\Services\\VSS\\Diag\` anahtarına NETWORK SERVICE için Tam Denetim verin.
3. **VSS Servislerini Yeniden Başlatın.**

### 💻 3. Hazır Komut Satırı (PowerShell)
\`\`\`powershell
# VSS Yazıcılarını kontrol et
vssadmin list writers

# Hatalı VSS servislerini yeniden başlat
Restart-Service -Name VSS, swprv -Force

# COM+ Event System servisini sıfırla
Restart-Service -Name EventSystem -Force
\`\`\`

### 💡 4. Önleyici Tavsiye
Yedekleme yazılımınızda (Veeam vb.) VSS snapshot işleminin işletim sistemi diski (C:) üzerinde en az %15 boş alan bulunduğunda çalışmasını sağlayın.`,
      source: 'builtin'
    };
  }

  // Generic fallback if no specific keywords match
  return {
    text: `### 📌 1. Sorun Teşhisi & Analiz
İlettiğiniz sorun incelendi: **"${message}"**
Bu arıza, işletim sistemi servisleri, ağ yapılandırması veya yetkilendirme katmanında meydana gelen bir kesintiye işaret etmektedir.

### 🛠️ 2. Genel Adım Adım Çözüm Yolu
1. **Olay Görüntüleyicisi (Event Viewer) Kayıtlarını İnceleyin:** \`eventvwr.msc\` açarak *Windows Günlükleri -> Sistem* ve *Uygulama* altındaki kırmızı Hata (Error) kayıtlarını kontrol edin.
2. **Ağ ve İsim Çözümleme (DNS) Durumunu Test Edin:** Hedef sunucu veya servise IP ve Hostname üzerinden erişilebilirliği doğrulayın.
3. **Servis Durumunu Kontrol Edin:** İlgili arka plan servisinin çalışır durumda ve 'Otomatik' başlangıç türünde olduğunu teyit edin.
4. **Güvenlik Duvarı ve Port İzinlerini Doğrulayın:** Portun dinlemede olup olmadığını test edin.

### 💻 3. Hazır Teşhis Komutları (PowerShell)
\`\`\`powershell
# Temel ağ ve DNS kontrolü
Test-NetConnection -ComputerName "8.8.8.8" -Port 53
ipconfig /flushdns

# Son 2 saatte oluşan kritik sistem hatalarını listele
Get-WinEvent -FilterHashtable @{LogName='System'; Level=1,2; StartTime=(Get-Date).AddHours(-2)} -MaxEvents 5 | Format-Table TimeCreated, Id, Message -Wrap
\`\`\`

### 💡 4. Google Gemini 2.0 Flash Entegrasyonu
> **İpucu:** Tam yapay zeka gücünden faydalanmak, görsel ekran görüntülerini doğrudan analiz ettirmek ve sınırsız özel IT çözümü almak için **Ayarlar** menüsünden ücretsiz **Google Gemini API Anahtarınızı** tanımlayabilirsiniz.`,
    source: 'builtin'
  };
}

/**
 * Call Google Gemini API (Gemini 2.0 Flash) with multimodal support
 */
async function callGeminiAPI(apiKey, { message, imageBase64, mimeType = 'image/png', history = [] }) {
  const parts = [];

  // Add system prompt and user message
  let userText = message || 'Lütfen ekteki ekran görüntüsündeki hata mesajını analiz et ve teknik çözüm adımlarını sun.';
  parts.push({ text: `${SYSTEM_PROMPT}\n\n---\nKULLANICI SORUSU / BİLGİSAYAR HATASI:\n${userText}` });

  // Add inline base64 image if attached
  if (imageBase64) {
    // Strip header prefix if present (data:image/png;base64,...)
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    parts.push({
      inline_data: {
        mime_type: mimeType,
        data: cleanBase64
      }
    });
  }

  const payload = {
    contents: [
      {
        role: 'user',
        parts: parts
      }
    ],
    generationConfig: {
      temperature: 0.2, // Low temperature for high technical precision
      topP: 0.95,
      maxOutputTokens: 2048
    }
  };

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Gemini API Error:', response.status, errText);
    throw new Error(`Gemini API Yanıtı Hatası (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const responseText = candidate?.content?.parts?.[0]?.text;

  if (!responseText) {
    throw new Error('Gemini API geçerli bir çözüm metni üretemedi.');
  }

  return {
    text: responseText,
    source: 'gemini_2_flash',
    model: 'Gemini 2.0 Flash'
  };
}

/**
 * Main Diagnostic Entry Point
 */
async function diagnoseIssue({ message, imageBase64, mimeType, customerId, history, getSetting }) {
  // Check for persistent or environment Gemini API Key
  const apiKey = getSetting('gemini_api_key', '') || process.env.GEMINI_API_KEY || '';

  if (apiKey && apiKey.trim().length > 10) {
    try {
      const result = await callGeminiAPI(apiKey.trim(), {
        message,
        imageBase64,
        mimeType,
        history
      });
      return {
        success: true,
        ...result
      };
    } catch (apiError) {
      console.warn('Gemini API call failed, falling back to senior IT knowledge base:', apiError.message);
      const fallback = getBuiltinDiagnosis(message);
      return {
        success: true,
        ...fallback,
        warning: `Gemini API bağlantısında hata oluştu (${apiError.message}), yerleşik IT motoruyla yanıtlandı.`
      };
    }
  }

  // If no API key configured, use built-in senior IT knowledge base
  const diagnosis = getBuiltinDiagnosis(message);
  return {
    success: true,
    ...diagnosis,
    notice: 'Yanıt yerleşik kurumsal IT teşhis motoru tarafından üretildi. Sınırsız görsel ve derin analiz için Ayarlar\'dan ücretsiz Gemini API Key ekleyebilirsiniz.'
  };
}

module.exports = {
  diagnoseIssue,
  getBuiltinDiagnosis
};
