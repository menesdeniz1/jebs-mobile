import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

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
  const il = data.il || '........';
  const ilce = data.ilce || '........';
  const mahalle = data.mahalleKoy || '........';
  const tarih = data.tarih || '../../....';
  const saat = data.saat || '..:..';

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4; margin: 2.5cm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.6; color: #000; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1B5E20; padding-bottom: 15px; }
    .emblem { width: 60px; height: 60px; margin: 0 auto 10px; background: #1B5E20; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 24pt; font-weight: bold; line-height: 60px; }
    .header h1 { font-size: 11pt; font-weight: bold; margin: 3px 0; text-transform: uppercase; }
    .header h2 { font-size: 14pt; font-weight: bold; margin: 15px 0 5px; text-decoration: underline; }
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
  <div class="header">
    <div class="emblem">J</div>
    <h1>T.C. İÇİŞLERİ BAKANLIĞI</h1>
    <h1>JANDARMA GENEL KOMUTANLIĞI</h1>
    <h1>${il.toUpperCase()} İL JANDARMA KOMUTANLIĞI</h1>
    <h1>${ilce.toUpperCase()} İLÇE JANDARMA KOMUTANLIĞI</h1>
    <h2>${data.title}</h2>
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
        ${data.duzenleyenRutbe || ''} ${data.duzenleyenAdsoyad || ''}<br>
        Sicil: ${data.duzenleyenSicil || ''}
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
    const groupTitle = groupLabels[groupKey] || groupKey;
    html += `<div class="section-title">${groupTitle}</div><table>`;
    for (const item of items) {
      html += `<tr><td>${item.label}</td><td>${item.value.replace(/\n/g, '<br>')}</td></tr>`;
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
