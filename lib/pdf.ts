import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

interface PDFData {
    title: string;
    il: string;
    ilce: string;
    tarih: string;
    saat: string;
    duzenleyen_adsoyad: string;
    duzenleyen_rutbe: string;
    duzenleyen_sicil: string;
    content: string;
}

function generatePDFHTML(data: PDFData): string {
    return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @page {
      size: A4;
      margin: 2.5cm;
    }
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.6;
      color: #000;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #1B5E20;
      padding-bottom: 15px;
    }
    .header .emblem {
      width: 60px;
      height: 60px;
      margin: 0 auto 10px;
      background: #1B5E20;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24pt;
      font-weight: bold;
    }
    .header h1 {
      font-size: 11pt;
      font-weight: bold;
      margin: 3px 0;
      text-transform: uppercase;
    }
    .header h2 {
      font-size: 14pt;
      font-weight: bold;
      margin: 15px 0 5px;
      text-decoration: underline;
    }
    .meta-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      font-size: 11pt;
    }
    .meta-info div {
      flex: 1;
    }
    .content {
      margin-bottom: 30px;
    }
    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
    }
    .content table td {
      border: 1px solid #333;
      padding: 6px 10px;
      vertical-align: top;
      font-size: 11pt;
    }
    .content table td:first-child {
      width: 35%;
      font-weight: bold;
      background: #f5f5f5;
    }
    .section-title {
      font-weight: bold;
      font-size: 12pt;
      margin: 15px 0 8px;
      border-bottom: 1px solid #999;
      padding-bottom: 3px;
    }
    .footer {
      margin-top: 50px;
      display: flex;
      justify-content: space-between;
    }
    .footer .signature-block {
      text-align: center;
      width: 45%;
    }
    .footer .signature-line {
      border-top: 1px solid #000;
      margin-top: 40px;
      padding-top: 5px;
      font-size: 11pt;
    }
    .notice {
      margin-top: 30px;
      font-size: 9pt;
      color: #666;
      text-align: center;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="emblem">J</div>
    <h1>T.C.</h1>
    <h1>İÇİŞLERİ BAKANLIĞI</h1>
    <h1>JANDARMA GENEL KOMUTANLIĞI</h1>
    <h1>${data.il ? data.il.toUpperCase() + ' İL JANDARMA KOMUTANLIĞI' : '........ İL JANDARMA KOMUTANLIĞI'}</h1>
    <h1>${data.ilce ? data.ilce.toUpperCase() + ' İLÇE JANDARMA KOMUTANLIĞI' : '........ İLÇE JANDARMA KOMUTANLIĞI'}</h1>
    <h2>${data.title}</h2>
  </div>

  <div class="meta-info">
    <div>
      <strong>Tarih:</strong> ${data.tarih || '../../....'}<br>
      <strong>Saat:</strong> ${data.saat || '..:..'}<br>
    </div>
    <div style="text-align: right;">
      <strong>İl:</strong> ${data.il || '........'}<br>
      <strong>İlçe:</strong> ${data.ilce || '........'}<br>
    </div>
  </div>

  <div class="content">
    ${data.content}
  </div>

  <p class="notice">
    İşbu tutanak tarafımızca yukarıda belirtilen tarihte düzenlenmiş olup,
    imza altına alınmıştır.
  </p>

  <div class="footer">
    <div class="signature-block">
      <div class="signature-line">
        <strong>Düzenleyen</strong><br>
        ${data.duzenleyen_rutbe || ''} ${data.duzenleyen_adsoyad || ''}<br>
        Sicil No: ${data.duzenleyen_sicil || ''}
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
    };

    // Skip common fields that are already in the header
    const skipFields = ['il', 'ilce', 'tarih', 'saat', 'duzenleyen_adsoyad', 'duzenleyen_rutbe', 'duzenleyen_sicil'];

    for (const field of fields) {
        if (skipFields.includes(field.id)) continue;
        const group = field.group || 'details';
        if (!groups[group]) groups[group] = [];
        groups[group].push({
            label: field.label,
            value: values[field.id] || '—',
        });
    }

    let html = '';
    for (const [groupKey, items] of Object.entries(groups)) {
        const groupTitle = groupLabels[groupKey] || groupKey;
        html += `<div class="section-title">${groupTitle}</div>`;
        html += '<table>';
        for (const item of items) {
            const displayValue = item.value.replace(/\n/g, '<br>');
            html += `<tr><td>${item.label}</td><td>${displayValue}</td></tr>`;
        }
        html += '</table>';
    }

    return html;
}

export async function generatePDF(data: PDFData): Promise<string | null> {
    try {
        const html = generatePDFHTML(data);
        const { uri } = await Print.printToFileAsync({
            html,
            base64: false,
        });
        return uri;
    } catch (error) {
        console.error('PDF generation failed:', error);
        return null;
    }
}

export async function sharePDF(uri: string): Promise<void> {
    try {
        if (Platform.OS === 'web') {
            // On web, open the file in a new tab
            window.open(uri, '_blank');
        } else {
            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(uri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Tutanağı Paylaş',
                });
            }
        }
    } catch (error) {
        console.error('Sharing failed:', error);
    }
}

export async function printPDF(html: string): Promise<void> {
    try {
        await Print.printAsync({ html });
    } catch (error) {
        console.error('Printing failed:', error);
    }
}
