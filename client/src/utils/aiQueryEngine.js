// OMNIFlow - Omni AI Voice Query & Customer Intelligence Engine
// Powered by Natural Language Understanding & Real-time Database Exploration

import { api } from '../api';

function normalizeText(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

/**
 * Process a voice or text query and return an articulate answer with structured data
 */
export async function queryOmniAI({
  prompt,
  customers = [],
  stats = null,
  licenseAlerts = []
}) {
  if (!prompt || typeof prompt !== 'string') {
    return {
      text: 'Sizi duyamadım, lütfen sorunuzu tekrar iletin.',
      speech: 'Sizi duyamadım, lütfen sorunuzu tekrar iletin.',
      type: 'error'
    };
  }

  const normPrompt = normalizeText(prompt);

  // 1. Check for Greetings & Identity
  if (normPrompt.includes('kimsin') || normPrompt.includes('adin ne') || normPrompt.includes('optimus')) {
    return {
      text: 'Ben Optimus Prime. OmniFlow altyapısını ve tüm siber sistemlerinizi korumak için buradayım. Müşterileriniz, sunucularınız ve lisanslarınız hakkında tüm bilgileri bana sorabilirsiniz.',
      speech: 'Ben Optimus Prime. OmniFlow altyapısını ve tüm siber sistemlerinizi korumak için buradayım. Müşterileriniz ve sunucularınız hakkında emrinizdeyim.',
      type: 'identity'
    };
  }

  if (normPrompt.includes('merhaba') || normPrompt.includes('selam') || normPrompt.includes('gunaydin')) {
    return {
      text: 'Selamlar! Ben Optimus Prime. Tüm sistemler devrede ve güvende. Hangi müşteri veya donanım hakkında bilgi almak istersiniz?',
      speech: 'Selamlar. Tüm sistemler devrede ve güvende. Hangi müşteri hakkında bilgi istersiniz?',
      type: 'greeting'
    };
  }

  // 2. Check for Global System Stats / License Questions
  if (normPrompt.includes('lisans') && (normPrompt.includes('durum') || normPrompt.includes('biten') || normPrompt.includes('kritik') || normPrompt.includes('alarm'))) {
    const urgentCount = (licenseAlerts || []).filter(item => item.daysRemaining !== null && item.daysRemaining <= 15).length;
    if (urgentCount > 0) {
      return {
        text: `Sistemde ${urgentCount} adet kritik veya süresi yaklaşan lisans tespit edildi. FortiGate ve Antivirüs lisanslarını incelemenizi öneririm.`,
        speech: `Dikkat! Sistemde ${urgentCount} adet süresi yaklaşan kritik lisans tespit edildi. Güvenlik duvarı ve antivirüs lisanslarını incelemenizi öneririm.`,
        type: 'alert',
        count: urgentCount
      };
    } else {
      return {
        text: 'Tüm kurumsal lisanslar güncel durumda. Süresi yaklaşan kritik bir lisans bulunmuyor.',
        speech: 'Tüm kurumsal lisanslar güncel durumda. Süresi yaklaşan kritik bir lisans bulunmuyor, sistem stabil.',
        type: 'success'
      };
    }
  }

  if (normPrompt.includes('kac musteri') || normPrompt.includes('toplam musteri') || normPrompt.includes('genel durum')) {
    const custCount = stats?.customers || customers.length || 0;
    const srvCount = (stats?.servers || 0) + (stats?.vms || 0);
    const pcCount = stats?.pcs || 0;
    return {
      text: `Sistemde kayıtlı ${custCount} müşteri, ${srvCount} sunucu/sanal makine ve ${pcCount} kullanıcı bilgisayarı aktif olarak takip ediliyor.`,
      speech: `Sistemimizde toplam ${custCount} müşteri, ${srvCount} sunucu ve ${pcCount} bilgisayar aktif olarak takip ediliyor.`,
      type: 'stats'
    };
  }

  // 3. Customer Matching: Search customer in prompt
  let matchedCustomer = null;
  let bestScore = 0;

  for (const c of customers) {
    const cNorm = normalizeText(c.name);
    const words = cNorm.split(/\s+/).filter(w => w.length > 2);
    
    // Check exact name match or words
    if (normPrompt.includes(cNorm)) {
      matchedCustomer = c;
      bestScore = 100;
      break;
    }

    for (const w of words) {
      if (normPrompt.includes(w)) {
        if (w.length > bestScore) {
          bestScore = w.length;
          matchedCustomer = c;
        }
      }
    }
  }

  // If a customer was matched, fetch their detailed inventory!
  if (matchedCustomer) {
    try {
      const details = await api.getCustomer(matchedCustomer.id);
      const cust = details.customer || matchedCustomer;
      const servers = details.physical_servers || [];
      const vms = details.virtual_machines || [];
      const pcs = details.user_computers || [];
      const firewalls = details.firewalls || [];
      const lines = details.lines || [];
      const backups = details.backup_units || [];

      // Query Intent 1: Sunucular & Sanal Makineler
      if (normPrompt.includes('sunucu') || normPrompt.includes('server') || normPrompt.includes('vm') || normPrompt.includes('sanal')) {
        if (servers.length === 0 && vms.length === 0) {
          return {
            text: `${cust.name} firmasında henüz kayıtlı bir sunucu veya sanal makine bulunmuyor.`,
            speech: `${cust.name} firmasında henüz kayıtlı bir sunucu bulunmuyor.`,
            type: 'customer_servers',
            customer: cust
          };
        }

        const serverNames = servers.map(s => `${s.server_name} (${s.ip_address || 'IP tanımsız'})`).join(', ');
        const vmCount = vms.length;
        const mainSrv = servers[0];

        const speech = `${cust.name} firmasında ${servers.length} adet fiziksel sunucu ve ${vmCount} adet sanal makine bulunuyor. ${mainSrv ? `Ana sunucu ${mainSrv.server_name}, IP adresi ${mainSrv.ip_address || 'yerel ağda'}.` : ''}`;
        const text = `${cust.name} Sunucu Envanteri:\n` +
          `- Fiziksel Sunucular (${servers.length}): ${serverNames || 'Yok'}\n` +
          `- Sanal Makineler (${vmCount}): ${vms.map(v => v.vm_name).slice(0, 4).join(', ') || 'Yok'}`;

        return {
          text,
          speech,
          type: 'customer_servers',
          customer: cust,
          data: { servers, vms }
        };
      }

      // Query Intent 2: Dış IP / İnternet Hattı
      if (normPrompt.includes('internet') || normPrompt.includes('hat') || normPrompt.includes('ip') || normPrompt.includes('statik')) {
        const extIp = cust.external_ip || (lines[0] && lines[0].static_ip);
        const lineInfo = lines.map(l => `${l.branch_name || 'Ana Hat'}: ${l.static_ip} (${l.line_type || 'Fiber'})`).join(', ');

        if (!extIp && lines.length === 0) {
          return {
            text: `${cust.name} için henüz tanımlanmış bir dış statik IP veya internet hattı bulunamadı.`,
            speech: `${cust.name} firması için henüz bir dış statik IP tanımlanmamış.`,
            type: 'customer_lines',
            customer: cust
          };
        }

        const speech = `${cust.name} şirketinin dış statik IP adresi ${extIp || lines[0]?.static_ip}. ${lines.length > 0 ? `Toplam ${lines.length} adet internet hattı devrededir.` : ''}`;
        const text = `${cust.name} İnternet & Dış IP Bilgileri:\n` +
          `- Ana Statik IP: ${extIp || 'Belirtilmemiş'}\n` +
          (lines.length > 0 ? `- Kayıtlı Hatlar:\n  ${lineInfo}` : '');

        return {
          text,
          speech,
          type: 'customer_lines',
          customer: cust,
          data: { lines, external_ip: extIp }
        };
      }

      // Query Intent 3: Yetkili Kişi & İletişim
      if (normPrompt.includes('yetkili') || normPrompt.includes('kim') || normPrompt.includes('telefon') || normPrompt.includes('iletisim') || normPrompt.includes('mail') || normPrompt.includes('eposta')) {
        const contact = cust.contact_person || 'Yetkili kişi belirtilmemiş';
        const phone = cust.phone || 'Telefon kaydı yok';
        const email = cust.email || 'E-posta kaydı yok';

        const speech = `${cust.name} firmasının yetkili kişisi ${contact}. Telefon numarası ${phone}, e-posta adresi ${email}.`;
        const text = `${cust.name} İletişim Bilgileri:\n` +
          `- Yetkili Kişi: ${contact}\n` +
          `- Telefon: ${phone}\n` +
          `- E-posta: ${email}\n` +
          (cust.address ? `- Adres: ${cust.address}` : '');

        return {
          text,
          speech,
          type: 'customer_contact',
          customer: cust
        };
      }

      // Query Intent 4: Bilgisayarlar & PC
      if (normPrompt.includes('bilgisayar') || normPrompt.includes('pc') || normPrompt.includes('istemci') || normPrompt.includes('kullanici')) {
        const pcCount = pcs.length;
        const speech = `${cust.name} firmasında kayıtlı toplam ${pcCount} adet kullanıcı bilgisayarı bulunmaktadır.`;
        const text = `${cust.name} Kullanıcı Bilgisayarları (${pcCount} Adet):\n` +
          pcs.slice(0, 5).map(p => `- ${p.user_name || p.computer_name} (AnyDesk: ${p.anydesk_id || 'Yok'})`).join('\n') +
          (pcs.length > 5 ? `\n... ve ${pcs.length - 5} bilgisayar daha.` : '');

        return {
          text,
          speech,
          type: 'customer_pcs',
          customer: cust,
          data: { pcs }
        };
      }

      // Query Intent 5: Güvenlik Duvarı & Firewall
      if (normPrompt.includes('guvenlik') || normPrompt.includes('firewall') || normPrompt.includes('antivirus')) {
        if (firewalls.length === 0) {
          return {
            text: `${cust.name} için henüz tanımlanmış bir Güvenlik Duvarı (Firewall) cihazı bulunmuyor.`,
            speech: `${cust.name} firmasında kayıtlı bir güvenlik duvarı cihazı bulunamadı.`,
            type: 'customer_firewalls',
            customer: cust
          };
        }

        const fw = firewalls[0];
        const speech = `${cust.name} güvenlik duvarı ${fw.brand || 'Firewall'} ${fw.model || ''}. Lisans bitiş tarihi ${fw.license_expiry || 'tanımlanmamış'}.`;
        const text = `${cust.name} Güvenlik Duvarı:\n` +
          `- Cihaz: ${fw.brand || ''} ${fw.model || ''} (${fw.firewall_name || ''})\n` +
          `- Lisans Bitişi: ${fw.license_expiry || 'Bilinmiyor'}\n` +
          `- WAN IP: ${fw.wan_ip || 'Yok'} | LAN IP: ${fw.lan_ip || 'Yok'}`;

        return {
          text,
          speech,
          type: 'customer_firewalls',
          customer: cust,
          data: { firewalls }
        };
      }

      // Query Intent 6: Genel Müşteri Özeti
      const speech = `${cust.name} sistem özeti: ${servers.length} sunucu, ${vms.length} sanal makine, ${pcs.length} bilgisayar ve ${firewalls.length} güvenlik duvarı kayıtlıdır. Dış IP adresi ${cust.external_ip || 'mevcut'}. Yetkili kişi ${cust.contact_person || 'kayıtlı'}.`;
      const text = `📊 ${cust.name} Genel Altyapı Özeti:\n` +
        `- Yetkili: ${cust.contact_person || 'Tanımsız'} (Tel: ${cust.phone || '-'}, Mail: ${cust.email || '-'})\n` +
        `- Dış Statik IP: ${cust.external_ip || 'Tanımsız'}\n` +
        `- Sunucular: ${servers.length} Fiziksel, ${vms.length} Sanal Makine\n` +
        `- Bilgisayarlar: ${pcs.length} İstemci PC\n` +
        `- Güvenlik Duvarı: ${firewalls.length > 0 ? `${firewalls[0].brand} ${firewalls[0].model || ''}` : 'Kayıt yok'}\n` +
        `- Yedekleme NAS: ${backups.length} Ünite`;

      return {
        text,
        speech,
        type: 'customer_summary',
        customer: cust,
        data: details
      };
    } catch (err) {
      console.error('Customer fetch error:', err);
    }
  }

  // Fallback / Unknown Query
  return {
    text: `"${prompt}" sorunuzu anladım ancak sistemde tam bir eşleşme bulamadım. Bir müşteri adı söyleyerek (Örn: "Atlas Lojistik sunucuları neler?" veya "Nova Mimarlık yetkilisi kim?") sorabilirsiniz.`,
    speech: `Sorunuzu dinledim ancak müşteri eşleşmesi bulamadım. Örneğin: Atlas Lojistik sunucuları neler, veya Nova Mimarlık internet hattı nedir şeklinde sorabilirsiniz.`,
    type: 'help'
  };
}
