import {
  getTemplateConfig,
  buildSignatureBlockHTML,
  pdfTemplateConfigs,
  type PDFTemplateConfig,
} from '../lib/pdfTemplates';

describe('getTemplateConfig', () => {
  it('returns config for known form ID (ust_arama)', () => {
    const config = getTemplateConfig('ust_arama');
    expect(config.signatureCount).toBe(3);
    expect(config.hasWitness).toBe(true);
    expect(config.hasInventory).toBe(true);
  });

  it('returns config for known form ID (ifade_supheli)', () => {
    const config = getTemplateConfig('ifade_supheli');
    expect(config.signatureCount).toBe(3);
    expect(config.signatureLabels).toContain('Şüpheli');
    expect(config.paragraphFields).toContain('ifade_icerik');
  });

  it('returns config for known form ID (trafik_kaza)', () => {
    const config = getTemplateConfig('trafik_kaza');
    expect(config.signatureCount).toBe(4);
    expect(config.headerSubtitle).toBe('Trafik Kaza Tespit Tutanağı');
    expect(config.hasWitness).toBe(true);
  });

  it('returns default config for unknown form ID', () => {
    const config = getTemplateConfig('nonexistent_form');
    expect(config.signatureCount).toBe(2);
    expect(config.signatureLabels).toEqual(['Düzenleyen', 'İmza']);
    expect(config.hasWitness).toBe(false);
    expect(config.hasInventory).toBe(false);
  });

  it('returns default config for empty string', () => {
    const config = getTemplateConfig('');
    expect(config.signatureCount).toBe(2);
    expect(config.hasWitness).toBe(false);
  });

  it('returns a copy for unknown IDs (not same reference)', () => {
    const config1 = getTemplateConfig('unknown1');
    const config2 = getTemplateConfig('unknown2');
    expect(config1).not.toBe(config2);
    expect(config1).toEqual(config2);
  });
});

describe('pdfTemplateConfigs completeness', () => {
  const allFormIds = [
    'ust_arama', 'arac_arama', 'olay_yeri_inceleme', 'yakalama',
    'el_koyma', 'teslim_tesellum', 'ifade_supheli', 'ifade_tanik',
    'teshis', 'olum_muayene', 'trafik_kaza', 'koruma_muhafaza', 'gorgu_tespit',
  ];

  it('has configs for all 13 forms', () => {
    expect(Object.keys(pdfTemplateConfigs)).toHaveLength(13);
    for (const id of allFormIds) {
      expect(pdfTemplateConfigs[id]).toBeDefined();
    }
  });

  it.each(allFormIds)('config for %s has required properties', (formId) => {
    const config = pdfTemplateConfigs[formId];
    expect(typeof config.signatureCount).toBe('number');
    expect(config.signatureCount).toBeGreaterThanOrEqual(2);
    expect(Array.isArray(config.signatureLabels)).toBe(true);
    expect(config.signatureLabels.length).toBe(config.signatureCount);
    expect(typeof config.hasWitness).toBe('boolean');
    expect(typeof config.hasInventory).toBe('boolean');
  });

  it.each(allFormIds)('config for %s has closing text', (formId) => {
    const config = pdfTemplateConfigs[formId];
    expect(config.closingText).toBeDefined();
    expect(config.closingText!.length).toBeGreaterThan(0);
  });
});

describe('buildSignatureBlockHTML', () => {
  it('generates correct number of signature blocks', () => {
    const config = getTemplateConfig('ust_arama'); // 3 blocks
    const html = buildSignatureBlockHTML(config, 'Ahmet Yılmaz', 'Üsteğmen', '12345');
    // Count signature-block divs
    const blockCount = (html.match(/class="signature-block"/g) || []).length;
    expect(blockCount).toBe(3);
  });

  it('includes officer info in first block', () => {
    const config = getTemplateConfig('gorgu_tespit');
    const html = buildSignatureBlockHTML(config, 'Mehmet Kaya', 'Yüzbaşı', '99999');
    expect(html).toContain('Yüzbaşı');
    expect(html).toContain('Mehmet Kaya');
    expect(html).toContain('Sicil: 99999');
  });

  it('omits sicil line when sicil is empty', () => {
    const config = getTemplateConfig('gorgu_tespit');
    const html = buildSignatureBlockHTML(config, 'Mehmet Kaya', 'Yüzbaşı', '');
    expect(html).toContain('Mehmet Kaya');
    expect(html).not.toContain('Sicil:');
  });

  it('uses placeholder for non-first blocks', () => {
    const config = getTemplateConfig('trafik_kaza'); // 4 blocks
    const html = buildSignatureBlockHTML(config, 'Ali', 'Çavuş', '111');
    // Non-first blocks should have blank lines
    const placeholders = (html.match(/___________________/g) || []).length;
    expect(placeholders).toBe(3); // blocks 2, 3, 4
  });

  it('uses fallback label when signatureLabels is shorter', () => {
    const config: PDFTemplateConfig = {
      signatureCount: 3,
      signatureLabels: ['Label1'], // only 1 label for 3 blocks
      hasWitness: false,
      hasInventory: false,
    };
    const html = buildSignatureBlockHTML(config, 'Test', 'Rank', '');
    expect(html).toContain('Label1');
    expect(html).toContain('İmza 2');
    expect(html).toContain('İmza 3');
  });

  it('wraps blocks in footer div', () => {
    const config = getTemplateConfig('el_koyma');
    const html = buildSignatureBlockHTML(config, 'X', 'Y', 'Z');
    expect(html).toMatch(/^<div class="footer">/);
    expect(html).toMatch(/<\/div>$/);
  });

  it('escapes HTML in officer info', () => {
    const config = getTemplateConfig('gorgu_tespit');
    const html = buildSignatureBlockHTML(config, '<script>alert("xss")</script>', 'Rank', '');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('calculates proper width for blocks', () => {
    const config = getTemplateConfig('trafik_kaza'); // 4 blocks
    const html = buildSignatureBlockHTML(config, 'A', 'B', 'C');
    // 90 / 4 = 22
    expect(html).toContain('width: 22%');
  });
});
