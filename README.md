# 🛡️ Jandarma Saha Rehberi — v1.0.0-rc1

**Jandarma Kolluk Saha Rehberi** — Gendarmerie Law Enforcement Field Guide

Jandarma personelinin sahada karşılaştığı çeşitli olay türlerinde adım adım ne yapması gerektiğini gösteren ve gerekli tutanak/rapor şablonlarını dijital olarak doldurup PDF çıktı almayı sağlayan mobil rehber uygulaması.

A mobile guide application for gendarmerie personnel that shows step-by-step procedures for various incident types encountered in the field, and allows digital form-filling with PDF generation.

> ⚠ **Bu uygulama gayri resmi bir saha rehberidir.** Resmi belge veya hukuki danışmanlık yerine geçmez.

---

## ✨ Features

### 📋 Olay Rehberi (Incident Guide)
- **13 olay türü** across 4 categories (Asayiş, Terör, TEM, Kaçakçılık)
- Detailed definitions, step-by-step checklists, prosecutor communication procedures
- **Decision-tree navigation** for complex events (darp, uyuşturucu)
- Suspect/victim/witness rights documentation
- Structured Turkish Penal Code (TCK) and Criminal Procedure Code (CMK) references

### 📝 Tutanak & Formlar (Reports & Forms)
- **13 official report templates** with dynamic form fields
- Body Search, Vehicle Search, Crime Scene Investigation, Apprehension, Seizure, Statement, and more
- **Per-form PDF templates** with specialized signature blocks (2-4 signers) and closing texts
- **Officer profile auto-fill** — enter once, fills every form
- Date/time auto-populated on creation
- Save as draft and resume later
- Share via WhatsApp, email, or print
- All PDFs watermarked as `TASLAK — RESMİ BELGE DEĞİLDİR`

### 🔍 Arama (Search)
- Full-text search across all content
- Turkish character normalization (İ/ı↔i, ö↔o, ç↔c, ş↔s, ğ↔g, ü↔u)
- Search history and autocomplete
- Search by legal article number (e.g., "TCK 86")

### ⭐ Favoriler (Favorites)
- Bookmark any incident guide or form template
- Quick access from the Favorites tab

### 📴 Offline First
- All content stored locally — works without internet
- PDF generation fully offline
- Form drafts saved to device, **encrypted at rest**

### 🔒 Security & Privacy
- First-run disclaimer / consent screen
- Draft PII encrypted (symmetric key in SecureStore, payload in AsyncStorage)
- HTML escaping in all PDF generation — XSS-safe
- No official letterhead — no impersonation risk
- No analytics, no telemetry by default
- Optional Sentry crash reporting (OFF by default, opt-in)

### 🌓 Field Mode (Saha Modu)
- Toggle on home screen for outdoor/stress conditions
- Larger fonts, bigger tap targets (48dp minimum)
- Emergency quick-dial: 112, 155, 156

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK 54) |
| Language | TypeScript (strict mode) |
| Routing | Expo Router 6 (file-based) |
| State Management | Zustand 5 + AsyncStorage |
| Validation | Zod 4 (runtime + build-time) |
| PDF Generation | expo-print |
| Encryption | expo-secure-store + XOR obfuscation |
| Sharing | expo-sharing |
| Icons | lucide-react-native |
| Fonts | Noto Sans (Google Fonts) |
| Testing | Jest + jest-expo (201 tests, >97% coverage) |
| Crash Reporting | Sentry (optional, OFF by default) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- [Expo Go](https://expo.dev/client) app on your phone (for mobile testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/menesdeniz1/jebs-mobile.git
cd jebs-mobile

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running

```bash
# Web browser
npm run web

# iOS (requires macOS)
npm run ios

# Android
npm run android

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Type check
npm run typecheck
```

---

## 📂 Project Structure

```
jebs-mobile/
├── app/                           # Expo Router screens
│   ├── (tabs)/                    # Bottom tab navigator
│   │   ├── index.tsx              # Home Screen
│   │   ├── guide.tsx              # Guide categories
│   │   ├── forms.tsx              # Report templates
│   │   ├── favorites.tsx          # Favorites
│   │   └── search.tsx             # Search
│   ├── guide/
│   │   ├── [categoryId].tsx       # Category detail
│   │   └── event/[eventId].tsx    # Incident detail
│   ├── form/
│   │   ├── [templateId].tsx       # Form filling + PDF
│   │   └── preview.tsx            # PDF preview + save
│   ├── _layout.tsx                # Root layout + init
│   └── disclaimer.tsx             # First-run consent
├── data/
│   ├── categories.json            # 4 incident categories
│   ├── events.json                # 13 incident types (structured)
│   ├── forms.json                 # 13 report templates
│   ├── types.ts                   # TypeScript interfaces
│   ├── schemas.ts                 # Zod validation schemas
│   ├── loader.ts                  # Typed data loader
│   └── version.json               # Content version tracker
├── lib/
│   ├── html.ts                    # HTML escaping
│   ├── validation.ts              # Field validators (TC Kimlik, etc.)
│   ├── search.ts                  # Full-text search + Turkish normalization
│   ├── pdf.ts                     # PDF generation
│   ├── pdfTemplates.ts            # Per-form PDF template configs
│   ├── crypto.ts                  # PII encryption
│   ├── cleanup.ts                 # PDF temp file cleanup
│   └── crashReporting.ts          # Sentry (opt-in)
├── store/
│   ├── persistence.ts             # Shared load/persist with retry
│   ├── draftsStore.ts             # Encrypted draft storage
│   ├── favoritesStore.ts          # Favorites
│   ├── searchStore.ts             # Search history
│   └── officerProfileStore.ts     # Officer profile auto-fill
├── components/
│   ├── form/FormField.tsx         # Form field renderer
│   ├── guide/                     # StepChecklist, DecisionTreeWalker
│   ├── profile/                   # OfficerProfileCard
│   └── ui/                        # ListCard, SectionHeader, Dialog, Toast, EmergencyContacts
├── constants/
│   ├── theme.ts                   # Design tokens + Field Mode
│   └── strings.ts                 # Centralized Turkish strings (i18n scaffold)
├── types/
│   └── optional-deps.d.ts         # Type declarations for optional deps
├── __tests__/                     # Jest test suites (7 files, 88 tests)
└── jest.config.js                 # Jest configuration
```

---

## 📋 Report Templates

| # | Template | Fields | Signatures |
|---|---|---|---|
| 1 | Üst Arama Tutanağı | 18 | 3 (Arama Yapan, Aranan Kişi, Tanık) |
| 2 | Araç Arama Tutanağı | 17 | 3 (Arama Yapan, Sürücü, Tanık) |
| 3 | Olay Yeri İnceleme Tutanağı | 15 | 2 (İnceleme Görevlisi, Düzenleyen) |
| 4 | Yakalama Tutanağı | 18 | 3 (Yakalayan, Yakalanan, Tanık) |
| 5 | El Koyma Tutanağı | 15 | 2 (El Koyan, Eşya Sahibi) |
| 6 | Teslim-Tesellüm Tutanağı | 11 | 2 (Teslim Eden, Teslim Alan) |
| 7 | İfade Tutanağı (Şüpheli) | 19 | 3 (İfade Alan, Şüpheli, Müdafi) |
| 8 | İfade Tutanağı (Tanık/Mağdur) | 16 | 2 (İfade Alan, Tanık/Mağdur) |
| 9 | Teşhis Tutanağı | 14 | 3 (Teşhis Ettiren, Teşhis Eden, Tanık) |
| 10 | Ölü Muayene ve Otopsi Tutanağı | 16 | 2 (Görevli, Tabip) |
| 11 | Trafik Kaza Tespit Tutanağı | 23 | 4 (Görevli, 1. Sürücü, 2. Sürücü, Tanık) |
| 12 | Koruma Altına Alma Tutanağı | 14 | 2 (Koruma Alan, Düzenleyen) |
| 13 | Görgü Tespit Tutanağı | — | 2 (Tespit Eden, Düzenleyen) |

---

## 🧪 Testing

```bash
# Run all tests
npm test

# With coverage report
npm run test:coverage
```

**Coverage targets**: ≥85% global coverage.
Current: 97.72% statements, 89.93% branches, 100% functions, 97.46% lines.
---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary | `#1B5E20` (Gendarmerie Green) |
| Accent | `#D32F2F` (Emergency Red) |
| Background | `#F5F5F5` / `#121212` (dark) |
| Surface | `#FFFFFF` / `#1E1E1E` (dark) |
| Text | `#212121` / `#E0E0E0` (dark) |
| Font | Noto Sans (400/600/700) |
| Min Tap Target | 44dp (48dp in Field Mode) |

---

## 📄 License

This project is open source and available for informational and educational purposes.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

<p align="center">
  Made with ❤️ for Turkish Gendarmerie personnel
</p>
