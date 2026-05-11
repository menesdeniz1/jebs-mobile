/**
 * Per-form PDF template configurations (P3-18).
 *
 * Each form template can have custom layout options that affect
 * how the PDF is generated. This allows different tutanak types
 * to have specialized sections, signature blocks, and content ordering.
 *
 * Forms without a config here fall back to the generic layout.
 */

import { escapeHtml } from './html';

export interface PDFTemplateConfig {
  /** Custom title override (otherwise uses form title) */
  pdfTitle?: string;
  /** Number of signature blocks (default: 2) */
  signatureCount: number;
  /** Labels for signature blocks */
  signatureLabels: string[];
  /** Whether to include a "Tanık" signature area */
  hasWitness: boolean;
  /** Whether to include inventory/list section */
  hasInventory: boolean;
  /** Custom closing text (otherwise uses generic closing) */
  closingText?: string;
  /** Custom header subtitle */
  headerSubtitle?: string;
  /** Fields to render as paragraph (instead of table row) */
  paragraphFields?: string[];
}

const DEFAULT_CONFIG: PDFTemplateConfig = {
  signatureCount: 2,
  signatureLabels: ['Düzenleyen', 'İmza'],
  hasWitness: false,
  hasInventory: false,
};

/**
 * Per-form template configurations for all 13 forms.
 */
export const pdfTemplateConfigs: Record<string, PDFTemplateConfig> = {
  ust_arama: {
    signatureCount: 3,
    signatureLabels: ['Arama Yapan', 'Aranan Kişi', 'Tanık'],
    hasWitness: true,
    hasInventory: true,
    closingText: 'Yapılan üst araması sonucunda yukarıda yazılı eşyalar bulunmuş/bulunamamış olup, iş bu tutanak tarafımızca tanzim ve imza edilmiştir.',
  },

  arac_arama: {
    signatureCount: 3,
    signatureLabels: ['Arama Yapan', 'Araç Sahibi/Sürücü', 'Tanık'],
    hasWitness: true,
    hasInventory: true,
    closingText: 'Yapılan araç araması sonucunda yukarıda yazılı materyaller bulunmuş/bulunamamış olup, iş bu tutanak tarafımızca tanzim ve imza edilmiştir.',
  },

  olay_yeri_inceleme: {
    signatureCount: 2,
    signatureLabels: ['Olay Yeri İnceleme Görevlisi', 'Düzenleyen'],
    hasWitness: false,
    hasInventory: true,
    headerSubtitle: 'Olay Yeri İnceleme ve Tespit Tutanağı',
    closingText: 'Olay yeri incelemesi tamamlanmış, deliller usulüne uygun olarak toplanmış olup iş bu tutanak tanzim ve imza edilmiştir.',
  },

  yakalama: {
    signatureCount: 3,
    signatureLabels: ['Yakalayan Görevli', 'Yakalanan Şahıs', 'Tanık'],
    hasWitness: true,
    hasInventory: false,
    closingText: 'Yukarıda kimliği yazılı şahıs yakalanmış olup, yasal hakları hatırlatılarak iş bu tutanak tanzim ve imza edilmiştir.',
  },

  el_koyma: {
    signatureCount: 2,
    signatureLabels: ['El Koyan Görevli', 'Eşya Sahibi'],
    hasWitness: false,
    hasInventory: true,
    closingText: 'Yukarıda yazılı eşyalara elkoyma işlemi yapılmış olup, iş bu tutanak tarafımızca tanzim ve imza edilmiştir.',
  },

  teslim_tesellum: {
    signatureCount: 2,
    signatureLabels: ['Teslim Eden', 'Teslim Alan'],
    hasWitness: false,
    hasInventory: true,
    closingText: 'Yukarıda belirtilen eşya/evrak, eksiksiz olarak teslim edilmiş/alınmış olup, iş bu tutanak tarafımızca tanzim ve imza edilmiştir.',
  },

  ifade_supheli: {
    signatureCount: 3,
    signatureLabels: ['İfade Alan', 'Şüpheli', 'Müdafi'],
    hasWitness: false,
    hasInventory: false,
    paragraphFields: ['ifade_icerik'],
    closingText: 'Şüphelinin ifadesi okundu, yazılanların doğruluğu tasdik edilerek iş bu tutanak tanzim ve imza edilmiştir.',
  },

  ifade_tanik: {
    signatureCount: 2,
    signatureLabels: ['İfade Alan', 'Tanık/Mağdur'],
    hasWitness: false,
    hasInventory: false,
    paragraphFields: ['ifade_icerik'],
    closingText: 'Tanığın/mağdurun ifadesi okundu, yazılanların doğruluğu tasdik edilerek iş bu tutanak tanzim ve imza edilmiştir.',
  },

  teshis: {
    signatureCount: 3,
    signatureLabels: ['Teşhis Ettiren', 'Teşhis Eden', 'Tanık'],
    hasWitness: true,
    hasInventory: false,
    closingText: 'Teşhis işlemi tamamlanmış olup, iş bu tutanak tarafımızca tanzim ve imza edilmiştir.',
  },

  olum_muayene: {
    signatureCount: 2,
    signatureLabels: ['Düzenleyen Görevli', 'Bilirkişi/Tabip'],
    hasWitness: false,
    hasInventory: false,
    headerSubtitle: 'Ölü Muayene ve Otopsi Tutanağı',
    closingText: 'Cenaze muayenesi/otopsi tamamlanmış olup, iş bu tutanak tarafımızca tanzim ve imza edilmiştir.',
  },

  trafik_kaza: {
    signatureCount: 4,
    signatureLabels: ['Düzenleyen Görevli', '1. Sürücü', '2. Sürücü', 'Tanık'],
    hasWitness: true,
    hasInventory: false,
    headerSubtitle: 'Trafik Kaza Tespit Tutanağı',
    closingText: 'Kaza mahallinde yapılan inceleme sonucunda iş bu tutanak tarafımızca tanzim ve imza edilmiştir.',
  },

  koruma_muhafaza: {
    signatureCount: 2,
    signatureLabels: ['Koruma Altına Alan', 'Düzenleyen'],
    hasWitness: false,
    hasInventory: false,
    closingText: 'İlgili şahıs koruma altına alınmış olup, iş bu tutanak tarafımızca tanzim ve imza edilmiştir.',
  },

  gorgu_tespit: {
    signatureCount: 2,
    signatureLabels: ['Tespit Eden Görevli', 'Düzenleyen'],
    hasWitness: false,
    hasInventory: false,
    closingText: 'Mahallinde yapılan inceleme ve gözlem sonucunda iş bu tutanak tarafımızca tanzim ve imza edilmiştir.',
  },
};

/**
 * Get the PDF template config for a form, with defaults filled in.
 */
export function getTemplateConfig(formId: string): PDFTemplateConfig {
  return pdfTemplateConfigs[formId] || { ...DEFAULT_CONFIG };
}

/**
 * Generate the signature block HTML for a given template config.
 */
export function buildSignatureBlockHTML(
  config: PDFTemplateConfig,
  officerName: string,
  officerRank: string,
  officerSicil: string
): string {
  const blocks: string[] = [];

  for (let i = 0; i < config.signatureCount; i++) {
    const label = escapeHtml(config.signatureLabels[i] || `İmza ${i + 1}`);
    let content = '';

    if (i === 0) {
      // First block: officer info
      const rank = escapeHtml(officerRank);
      const name = escapeHtml(officerName);
      const sicil = escapeHtml(officerSicil);
      content = `${rank} ${name}${sicil ? '<br>Sicil: ' + sicil : ''}`;
    } else {
      content = '___________________';
    }

    blocks.push(`
      <div class="signature-block" style="width: ${Math.floor(90 / config.signatureCount)}%;">
        <div class="signature-line">
          <strong>${label}</strong><br>
          ${content}
        </div>
      </div>
    `);
  }

  return `<div class="footer">${blocks.join('')}</div>`;
}
