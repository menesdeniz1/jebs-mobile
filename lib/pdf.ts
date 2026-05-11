import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { escapeHtml } from './html';

export interface PDFData {
  title: string;
  il: string;
  ilce: string;
  mahalleKoy?: string;
  tarih: string;
  saat: string;
  duzenleyenAdsoyad: string;
  duzenleyenRutbe: string;
  duzenleyenSicil: string;
  content: string;
}

function generatePDFHTML(data: PDFData): string {
  const il = escapeHtml(data.il) || '........';
  const ilce = escapeHtml(data.ilce) || '........';
  const mahalle = escapeHtml(data.mahalleKoy || '') || '........';
  const tarih = escapeHtml(data.tarih) || '../../....';
  const saat = escapeHtml(data.saat) || '..:..';
  const title = escapeHtml(data.title);
  const rutbe = escapeHtml(data.duzenleyenRutbe || '');
  const adsoyad = escapeHtml(data.duzenleyenAdsoyad || '');
  const sicil = escapeHtml(data.duzenleyenSicil || '');

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 2.5cm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; color: #000; position: relative; }
    .watermark {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 9999;
    }
    .watermark-text {
      font-size: 48pt;
      font-weight: bold;
      color: rgba(200, 0, 0, 0.12);
      transform: rotate(-35deg);
      white-space: nowrap;
      letter-spacing: 8px;
      text-align: center;
      line-height: 2.5;
    }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #555; padding-bottom: 15px; }
    .header h1 { font-size: 14pt; font-weight: bold; margin: 3px 0; }
    .header h2 { font-size: 12pt; color: #666; margin: 5px 0 0; font-style: italic; }
    .draft-notice {
      text-align: center;
      padding: 8px 16px;
      margin-bottom: 20px;
      border: 2px solid #C62828;
      border-radius: 4px;
      background: #FFF3F3;
      color: #C62828;
      font-weight: bold;
      font-size: 10pt;
    }
    .location-sentence { margin-bottom: 20px; text-indent: 2em; text-align: justify; }
    .content { margin-bottom: 30px; }
    .content table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    .content table td { border: 1px solid #333; padding: 6px 10px; vertical-align: top; font-size: 11pt; }
    .content table td:first-child { width: 35%; font-weight: bold; background: #f5f5f5; }
    .section-title { font-weight: bold; font-size: 12pt; margin: 15px 0 8px; border-bottom: 1px solid #999; padding-bottom: 3px; }
    .closing { margin-top: 30px; text-indent: 2em; text-align: justify; }
    .footer { margin-top: 50px; display: flex; justify-content: space-between; }
    .footer .signature-block { text-align: center; width: 45%; }
    .footer .signature-line { border-top: 1px solid #000; margin-top: 40px; padding-top: 5px; font-size: 11pt; }
  </style>
</head>
<body>
  <!-- Watermark: TASLAK — RESMİ BELGE DEĞİLDİR -->
  <div class="watermark">
    <div class="watermark-text">
      TASLAK — RESMİ BELGE DEĞİLDİR<br>
      TASLAK — RESMİ BELGE DEĞİLDİR<br>
      TASLAK — RESMİ BELGE DEĞİLDİR
    </div>
  </div>

  <div class="header">
    <h1>Jandarma Saha Rehberi</h1>
    <h2>${title}</h2>
  </div>
  <div class="draft-notice">
    ⚠ TASLAK BELGE — RESMİ BELGE NİTELİĞİ TAŞIMAZ
  </div>
  <p class="location-sentence">
    ${il} İli ${ilce} İlçesi ${mahalle} Köyü/Mahallesi'nde,
    ${tarih} tarihinde, saat ${saat}'da
  </p>
  <div class="content">
    ${data.content}
  </div>
  <p class="closing">
    İş bu tutanak ${tarih} tarihinde tarafımızca tanzim ve imza edilmiştir.
  </p>
  <div class="footer">
    <div class="signature-block">
      <div class="signature-line">
        <strong>Düzenleyen</strong><br>
        ${rutbe} ${adsoyad}<br>
        Sicil: ${sicil}
      </div>
    </div>
    <div class="signature-block">
      <div class="signature-line">
        <strong>İmza</strong><br>
        ___________________
      </div>
    </div>
  </div>
</body>
</html>`;
}

export function buildFormContentHTML(
  fields: Array<{ id: string; label: string; group: string }>,
  values: Record<string, string>
): string {
  const groups: Record<string, Array<{ label: string; value: string }>> = {};
  const groupLabels: Record<string, string> = {
    location: 'Yer ve Zaman Bilgileri',
    officer: 'Düzenleyen Bilgileri',
    subject: 'İlgili Kişi Bilgileri',
    vehicle: 'Araç Bilgileri',
    vehicle1: '1. Araç Bilgileri',
    vehicle2: '2. Araç Bilgileri',
    details: 'Olay/İşlem Detayları',
    witnesses: 'Tanık Bilgileri',
    statement: 'İfade İçeriği',
    damage: 'Hasar ve Yaralanma Bilgileri',
  };

  const skipFields = [
    'il', 'ilce', 'mahalle_koy', 'tarih', 'saat',
    'duzenleyen_adsoyad', 'duzenleyen_rutbe', 'duzenleyen_sicil',
  ];

  for (const field of fields) {
    if (skipFields.includes(field.id)) continue;
    const group = field.group || 'details';
    if (!groups[group]) groups[group] = [];
    groups[group].push({ label: field.label, value: values[field.id] || '—' });
  }

  let html = '';
  for (const [groupKey, items] of Object.entries(groups)) {
    const groupTitle = escapeHtml(groupLabels[groupKey] || groupKey);
    html += `<div class="section-title">${groupTitle}</div><table>`;
    for (const item of items) {
      const label = escapeHtml(item.label);
      const value = escapeHtml(item.value).replace(/\n/g, '<br>');
      html += `<tr><td>${label}</td><td>${value}</td></tr>`;
    }
    html += '</table>';
  }
  return html;
}

export async function generatePDF(data: PDFData): Promise<string | null> {
  try {
    const html = generatePDFHTML(data);
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    return uri;
  } catch (error) {
    console.error('PDF generation failed:', error);
    return null;
  }
}

export async function sharePDF(uri: string): Promise<void> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Tutanağı Paylaş',
      });
    }
  } catch (error) {
    console.error('Sharing failed:', error);
  }
}

export async function printPDF(data: PDFData): Promise<void> {
  try {
    const html = generatePDFHTML(data);
    await Print.printAsync({ html });
  } catch (error) {
    console.error('Print failed:', error);
  }
}
