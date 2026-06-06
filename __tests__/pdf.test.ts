// Mock expo-print
const mockPrintToFile = jest.fn();
const mockPrintAsync = jest.fn();
jest.mock('expo-print', () => ({
  printToFileAsync: (...args: unknown[]) => mockPrintToFile(...args),
  printAsync: (...args: unknown[]) => mockPrintAsync(...args),
}));

// Mock expo-sharing
const mockIsAvailable = jest.fn();
const mockShareAsync = jest.fn();
jest.mock('expo-sharing', () => ({
  isAvailableAsync: (...args: unknown[]) => mockIsAvailable(...args),
  shareAsync: (...args: unknown[]) => mockShareAsync(...args),
}));

import { buildFormContentHTML, generatePDF, sharePDF, printPDF, type PDFData } from '../lib/pdf';

beforeEach(() => {
  jest.clearAllMocks();
});

const basePDFData: PDFData = {
  title: 'Test Tutanak',
  il: 'Ankara',
  ilce: 'Çankaya',
  mahalleKoy: 'Kızılay',
  tarih: '01.01.2026',
  saat: '14:30',
  duzenleyenAdsoyad: 'Ahmet Yılmaz',
  duzenleyenRutbe: 'Üsteğmen',
  duzenleyenSicil: '12345',
  content: '<p>Test content</p>',
};

describe('buildFormContentHTML', () => {
  const fields = [
    { id: 'il', label: 'İl', group: 'location' },
    { id: 'supheli_ad', label: 'Şüpheli Adı', group: 'subject' },
    { id: 'supheli_tc', label: 'Şüpheli TC', group: 'subject' },
    { id: 'olay_ozet', label: 'Olay Özeti', group: 'details' },
    { id: 'duzenleyen_adsoyad', label: 'Düzenleyen', group: 'officer' },
  ];

  it('skips location and officer fields (il, duzenleyen_adsoyad)', () => {
    const html = buildFormContentHTML(fields, {
      il: 'Ankara',
      supheli_ad: 'Mehmet',
      duzenleyen_adsoyad: 'Ali',
    });
    // il and duzenleyen_adsoyad should be skipped
    // Check that there's no table cell with just 'İl' as label
    expect(html).not.toContain('<td>İl</td>');
    expect(html).not.toContain('<td>Düzenleyen</td>');
    expect(html).toContain('Şüpheli Adı');
  });

  it('groups fields by group name with section titles', () => {
    const html = buildFormContentHTML(fields, {
      supheli_ad: 'Mehmet',
      olay_ozet: 'Olay açıklaması',
    });
    expect(html).toContain('İlgili Kişi Bilgileri');
    expect(html).toContain('Olay/İşlem Detayları');
  });

  it('shows — for missing values', () => {
    const html = buildFormContentHTML(fields, {});
    expect(html).toContain('—');
  });

  it('uses group key as fallback for unknown group names', () => {
    const customFields = [
      { id: 'custom_field', label: 'Custom', group: 'unknown_group' },
    ];
    const html = buildFormContentHTML(customFields, { custom_field: 'value' });
    expect(html).toContain('unknown_group');
  });

  it('escapes HTML in field values', () => {
    const html = buildFormContentHTML(
      [{ id: 'notes', label: 'Notlar', group: 'details' }],
      { notes: '<script>alert("xss")</script>' }
    );
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('converts newlines to <br> in values', () => {
    const html = buildFormContentHTML(
      [{ id: 'notes', label: 'Notlar', group: 'details' }],
      { notes: 'Line1\nLine2' }
    );
    expect(html).toContain('<br>');
  });

  it('handles fields without explicit group (defaults to details)', () => {
    const noGroupFields = [
      { id: 'extra', label: 'Extra', group: '' },
    ];
    const html = buildFormContentHTML(noGroupFields, { extra: 'value' });
    // Empty string group should fallback to 'details' via || 'details'
    expect(html).toContain('Olay/İşlem Detayları');
  });
});

describe('generatePDF', () => {
  it('returns URI on success', async () => {
    mockPrintToFile.mockResolvedValue({ uri: 'file:///tmp/test.pdf' });
    const uri = await generatePDF(basePDFData);
    expect(uri).toBe('file:///tmp/test.pdf');
    expect(mockPrintToFile).toHaveBeenCalledTimes(1);
    // Verify html was passed
    const htmlArg = mockPrintToFile.mock.calls[0][0].html;
    expect(htmlArg).toContain('Ankara');
    expect(htmlArg).toContain('Test Tutanak');
  });

  it('returns null on error', async () => {
    mockPrintToFile.mockRejectedValue(new Error('print failed'));
    const uri = await generatePDF(basePDFData);
    expect(uri).toBeNull();
  });

  it('uses template config when formId is provided', async () => {
    mockPrintToFile.mockResolvedValue({ uri: 'file:///tmp/test.pdf' });
    const data: PDFData = { ...basePDFData, formId: 'trafik_kaza' };
    await generatePDF(data);
    const htmlArg = mockPrintToFile.mock.calls[0][0].html;
    expect(htmlArg).toContain('Trafik Kaza Tespit Tutanağı');
  });

  it('uses default config when no formId is provided', async () => {
    mockPrintToFile.mockResolvedValue({ uri: 'file:///tmp/test.pdf' });
    await generatePDF(basePDFData);
    const htmlArg = mockPrintToFile.mock.calls[0][0].html;
    // Default closing text
    expect(htmlArg).toContain('tanzim ve imza edilmiştir');
  });

  it('handles empty optional fields gracefully', async () => {
    mockPrintToFile.mockResolvedValue({ uri: 'file:///tmp/test.pdf' });
    const data: PDFData = {
      ...basePDFData,
      mahalleKoy: undefined,
      duzenleyenRutbe: '',
      duzenleyenSicil: '',
    };
    const uri = await generatePDF(data);
    expect(uri).toBe('file:///tmp/test.pdf');
  });
});

describe('sharePDF', () => {
  it('shares when sharing is available', async () => {
    mockIsAvailable.mockResolvedValue(true);
    mockShareAsync.mockResolvedValue(undefined);
    await sharePDF('file:///tmp/test.pdf');
    expect(mockShareAsync).toHaveBeenCalledWith('file:///tmp/test.pdf', {
      mimeType: 'application/pdf',
      dialogTitle: 'Tutanağı Paylaş',
    });
  });

  it('does not share when sharing is not available', async () => {
    mockIsAvailable.mockResolvedValue(false);
    await sharePDF('file:///tmp/test.pdf');
    expect(mockShareAsync).not.toHaveBeenCalled();
  });

  it('handles sharing error gracefully', async () => {
    mockIsAvailable.mockResolvedValue(true);
    mockShareAsync.mockRejectedValue(new Error('share failed'));
    await expect(sharePDF('file:///tmp/test.pdf')).resolves.toBeUndefined();
  });
});

describe('printPDF', () => {
  it('prints HTML successfully', async () => {
    mockPrintAsync.mockResolvedValue(undefined);
    await printPDF(basePDFData);
    expect(mockPrintAsync).toHaveBeenCalledTimes(1);
    const htmlArg = mockPrintAsync.mock.calls[0][0].html;
    expect(htmlArg).toContain('Ankara');
  });

  it('handles print error gracefully', async () => {
    mockPrintAsync.mockRejectedValue(new Error('printer offline'));
    await expect(printPDF(basePDFData)).resolves.toBeUndefined();
  });
});
