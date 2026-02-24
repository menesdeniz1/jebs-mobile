# 🛡️ Jandarma Saha Rehberi

**Jandarma Kolluk Saha Rehberi** — Gendarmerie Law Enforcement Field Guide

Jandarma personelinin sahada karşılaştığı çeşitli olay türlerinde adım adım ne yapması gerektiğini gösteren ve gerekli tutanak/rapor şablonlarını dijital olarak doldurup PDF çıktı almayı sağlayan mobil rehber uygulaması.

A mobile guide application for gendarmerie personnel that shows step-by-step procedures for various incident types encountered in the field, and allows digital form-filling with PDF generation.

---

## 📱 Screenshots

<p align="center">
  <img src="docs/screenshots/home.png" width="250" alt="Ana Sayfa" />
  <img src="docs/screenshots/detail.png" width="250" alt="Olay Detayı" />
  <img src="docs/screenshots/checklist.png" width="250" alt="İşlem Listesi" />
</p>

---

## ✨ Features

### 📋 Olay Rehberi (Incident Guide)
- **13 olay türü** across 4 categories (Asayiş, Terör, TEM, Kaçakçılık)
- Detailed definitions, step-by-step checklists, prosecutor communication procedures
- Suspect/victim/witness rights documentation
- Relevant Turkish Penal Code (TCK) and Criminal Procedure Code (CMK) references
- Interactive checklist with progress tracking

### 📝 Tutanak & Formlar (Reports & Forms)
- **12 official report templates** with dynamic form fields
- Body Search, Vehicle Search, Crime Scene Investigation, Apprehension, Seizure, Statement, and more
- PDF generation with official Gendarmerie letterhead
- Save as draft and resume later
- Share via WhatsApp, email, or print

### 🔍 Arama (Search)
- Full-text search across all content
- Turkish character normalization (ı↔i, ö↔o, ç↔c, ş↔s, ğ↔g, ü↔u)
- Search history and autocomplete
- Search by legal article number (e.g., "TCK 86")

### ⭐ Favoriler (Favorites)
- Bookmark any incident guide or form template
- Quick access from the Favorites tab

### 📴 Offline First
- All content stored locally — works without internet
- PDF generation fully offline
- Form drafts saved to device

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK 54) |
| Language | TypeScript |
| Routing | Expo Router (file-based) |
| State Management | Zustand + AsyncStorage |
| PDF Generation | expo-print |
| Sharing | expo-sharing |
| Icons | @expo/vector-icons (Ionicons) |
| Styling | React Native StyleSheet |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- [Expo Go](https://expo.dev/client) app on your phone (for mobile testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/ernykt/jebs-mobile.git
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

# Expo Go (scan QR code)
npx expo start
```

---

## 📂 Project Structure

```
jebs-mobile/
├── app/                        # Expo Router screens
│   ├── (tabs)/                 # Bottom tab navigator
│   │   ├── index.tsx           # Home Screen
│   │   ├── guide.tsx           # Guide categories
│   │   ├── forms.tsx           # Report templates
│   │   └── favorites.tsx       # Favorites
│   ├── guide/
│   │   ├── [categoryId].tsx    # Category detail
│   │   └── event/[eventId].tsx # Incident detail (3 tabs)
│   ├── form/
│   │   └── [templateId].tsx    # Form filling + PDF
│   └── search.tsx              # Search page
├── data/
│   ├── categories.json         # 4 incident categories
│   ├── events.json             # 13 incident types (full content)
│   └── forms.json              # 12 report templates
├── lib/
│   ├── store.ts                # Zustand state management
│   ├── search.ts               # Full-text search engine
│   └── pdf.ts                  # PDF generation
├── constants/
│   └── theme.ts                # Design tokens
└── assets/                     # Images and fonts
```

---

## 📋 Report Templates

| # | Template | Fields |
|---|---|---|
| 1 | Üst Arama Tutanağı | 18 |
| 2 | Araç Arama Tutanağı | 17 |
| 3 | Olay Yeri İnceleme Tutanağı | 15 |
| 4 | Yakalama Tutanağı | 18 |
| 5 | El Koyma Tutanağı | 15 |
| 6 | Teslim-Tesellüm Tutanağı | 11 |
| 7 | İfade Tutanağı (Şüpheli) | 19 |
| 8 | İfade Tutanağı (Tanık/Mağdur) | 16 |
| 9 | Teşhis Tutanağı | 14 |
| 10 | Ölü Muayene ve Otopsi Tutanağı | 16 |
| 11 | Trafik Kaza Tespit Tutanağı | 23 |
| 12 | Koruma Altına Alma Tutanağı | 14 |

---

## 🎨 Design System

| Token | Value |
|---|---|
| Primary | `#1B5E20` (Gendarmerie Green) |
| Accent | `#D32F2F` (Emergency Red) |
| Background | `#F5F5F5` |
| Surface | `#FFFFFF` |
| Text | `#212121` |

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
