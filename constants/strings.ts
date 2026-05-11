/**
 * Centralized Turkish strings (P3-20 — i18n scaffold).
 *
 * All user-facing strings should be imported from this module.
 * When i18n support is added later, this file will be replaced
 * with a proper i18n library (e.g., react-i18next) that loads
 * from locale-specific JSON files.
 *
 * Currently: Turkish-only, single-locale.
 *
 * Usage:
 *   import { t } from '../constants/strings';
 *   <Text>{t.common.save}</Text>
 */

export const t = {
  // ── Common UI ─────────────────────────────────────
  common: {
    save: 'Kaydet',
    cancel: 'İptal',
    delete: 'Sil',
    edit: 'Düzenle',
    close: 'Kapat',
    back: 'Geri',
    next: 'İleri',
    yes: 'Evet',
    no: 'Hayır',
    ok: 'Tamam',
    search: 'Ara',
    loading: 'Yükleniyor...',
    error: 'Hata',
    success: 'Başarılı',
    retry: 'Tekrar Dene',
    clear: 'Temizle',
    selectAll: 'Tümünü Seç',
    viewAll: 'Tümünü Gör',
    noResults: 'Sonuç bulunamadı',
    required: 'Bu alan zorunludur',
  },

  // ── Navigation & Tabs ─────────────────────────────
  nav: {
    home: 'Ana Sayfa',
    guide: 'Olaylar',
    forms: 'Tutanaklar',
    favorites: 'Favoriler',
    search: 'Arama',
  },

  // ── Home Screen ───────────────────────────────────
  home: {
    guideSection: 'Olay Rehberi',
    quickForms: 'Sık Kullanılan Tutanaklar',
    recentDrafts: 'Son Taslaklar',
    emergencyNumbers: 'Acil Numaralar',
    fieldMode: 'Saha Modu',
    fieldModeActive: '🔶 Saha Modu AKTİF',
    fieldModeHint: 'Daha büyük yazı tipi için dokunun',
    fieldModeActiveHint: 'Büyük yazı tipi aktif — dokunarak kapatın',
    officerProfile: 'Personel Profili',
    officerProfileHint: 'Bilgilerinizi girin — tutanaklarda otomatik doldurulacaktır',
  },

  // ── Forms ─────────────────────────────────────────
  forms: {
    fillForm: 'Form Doldur',
    preview: 'PDF Önizleme',
    saveDraft: 'Taslak Kaydet',
    saveDevice: 'Cihaza Kaydet',
    share: 'Paylaş',
    draftSaved: 'Taslak kaydedildi',
    draftDeleted: 'Taslak silindi',
    formNotFound: 'Form bulunamadı',
    unsavedChanges: 'Kaydedilmemiş değişiklikler var. Çıkmak istiyor musunuz?',
    unsavedTitle: 'Kaydedilmemiş Değişiklikler',
    saveBefore: 'Kaydet ve Çık',
    discardExit: 'Kaydetmeden Çık',
    validationErrors: 'Lütfen hatalı alanları düzeltin',
    pdfGenerating: 'PDF oluşturuluyor...',
    pdfSaved: 'PDF cihaza kaydedildi',
    pdfSaveFailed: 'PDF kaydedilemedi',
    pdfShared: 'PDF paylaşıldı',
  },

  // ── Guide / Events ────────────────────────────────
  guide: {
    category: 'Kategori',
    eventDetail: 'Olay Detayı',
    steps: 'Adımlar',
    definition: 'Tanım',
    howItOccurs: 'Oluşumu',
    legalRefs: 'Yasal Dayanaklar',
    prosecutorInfo: 'Savcılık Bilgisi',
    partyRoles: 'Taraf Rolleri',
    witnessProcedure: 'Tanık İşlemleri',
    relatedForms: 'İlgili Tutanaklar',
    draftBanner: '⚠ TASLAK — Hukuki inceleme gerektirir',
    resetTree: 'Başa Dön',
  },

  // ── Favorites ─────────────────────────────────────
  favorites: {
    added: 'Favorilere eklendi',
    removed: 'Favorilerden çıkarıldı',
    empty: 'Henüz favori eklenmedi',
    emptyHint: 'Olay veya tutanak sayfalarından favori ekleyebilirsiniz',
  },

  // ── Search ────────────────────────────────────────
  search: {
    placeholder: 'Olay, tutanak veya madde ara...',
    recentSearches: 'Son Aramalar',
    clearHistory: 'Geçmişi Temizle',
    events: 'Olaylar',
    forms: 'Tutanaklar',
    lawArticles: 'Kanun Maddeleri',
    minChars: 'En az 2 karakter girin',
  },

  // ── Disclaimer ────────────────────────────────────
  disclaimer: {
    title: 'Kullanım Koşulları',
    body: 'Bu uygulama gayri resmi bir saha rehberidir. Kesinlikle resmi bir belge veya hukuki danışmanlık yerine geçmez. Kullanıcı, uygulamadaki bilgilerin doğruluğunu resmi kaynaklardan teyit etmekle yükümlüdür.',
    accept: 'Kabul Ediyorum',
  },

  // ── Officer Profile ───────────────────────────────
  officer: {
    namePlaceholder: 'Ad Soyad',
    rankPlaceholder: 'Rütbe Seçiniz',
    sicilPlaceholder: 'Sicil No',
    unitPlaceholder: 'Birim (örn: Çankaya İlçe J.K.)',
    profileCleared: 'Profil temizlendi',
  },

  // ── Errors ────────────────────────────────────────
  errors: {
    saveFailed: 'Veri kaydedilemedi. Lütfen tekrar deneyin.',
    encryptFailed: 'Veri şifrelenemedi. Lütfen tekrar deneyin.',
    loadFailed: 'Veri yüklenemedi',
    networkError: 'Bağlantı hatası',
    unknownError: 'Beklenmeyen bir hata oluştu',
  },

  // ── PDF ───────────────────────────────────────────
  pdf: {
    header: 'Jandarma Saha Rehberi',
    draftWatermark: 'TASLAK — RESMİ BELGE DEĞİLDİR',
    draftNotice: 'Bu belge gayri resmi taslaktır. Resmi işlem için yetkili makama başvurunuz.',
    generatedAt: 'Oluşturulma Tarihi',
    page: 'Sayfa',
  },
} as const;

/** Type for the string keys (useful for future i18n library integration) */
export type StringKeys = typeof t;
