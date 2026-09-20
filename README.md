# ShilpSaathi (शिल्प साथी)

**AI-Powered Digital Business Manager for Artisans & Micro-Entrepreneurs**  
*Smart India Hackathon 2026 — Problem Statement SIH26090 — Team CODESPHERE*

> **"Just Click. Just Speak. AI Handles the Rest."**  
> Bridging the digital divide for rural Indian master artisans through voice-first, vernacular-enabled, automated AI cataloging, transparent pricing, and direct B2B buyer market linkage (zero intermediaries).

---

## 🌟 Key Features

1. **Voice-First & Vernacular UI**: Simplified experience designed for rural artisans speaking Hindi, English, and regional languages.
2. **7-Step AI Pipeline**:
   - **Capture**: Snap photos of handcrafted products.
   - **Enhance**: Automatic background cleanup & lighting optimization.
   - **Voice**: Speak naturally about materials, effort, and story.
   - **Catalogue**: Instant bilingual digital catalog generated via Gemini AI.
   - **Price**: Transparent fair-pricing formula accounting for labor, materials & market trends.
   - **Publish**: One-tap multi-channel publishing (ONDC, Government e-Marketplace, social).
   - **Connect**: Direct buyer-artisan inquiries with real-time price negotiation.
3. **Government Scheme Integration**: Pehchan Card verification, PM Vishwakarma linkage, and ONDC discovery.

---

## 📁 Repository Structure

```
SIH_2026/
├── CLAUDE.md                # Complete technical architecture & AI guide
├── SPEC.md                  # Comprehensive product specification
├── sih-artisan-app/
│   ├── backend/             # Node.js + Express API service (Port 4000)
│   │   ├── src/             # Routes, Gemini AI services, database models
│   │   ├── schema.sql       # PostgreSQL production schema
│   │   ├── data.json        # Demo artisan & product data
│   │   └── .env.example     # Environment variables template
│   └── mobile/              # React Native (Expo) mobile application
│       ├── src/             # Screens (Artisan, Buyer, Catalog, Negotiation)
│       └── App.js           # Navigation & app entry point
└── README.md
```

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Node.js (v18+ recommended)
- npm
- Expo Go app on your phone (or an Android/iOS emulator)

---

### Step 1: Start Backend API

```bash
cd sih-artisan-app/backend
npm install
npm run seed      # Seeds demo artisan, sample products & buyer enquiries
npm run dev       # Starts server at http://localhost:4000
```

> **Configuration**: Copy `.env.example` to `.env` and set your `GEMINI_API_KEY` for live AI cataloging:
> ```bash
> PORT=4000
> GEMINI_API_KEY=your_gemini_api_key_here
> ```

---

### Step 2: Start Mobile App (Expo)

```bash
cd sih-artisan-app/mobile
npm install
npx expo start
```

- Scan the QR code using the **Expo Go** app on Android or iOS.
- **Login**: Enter any 10-digit mobile number and OTP `1234`.
- **Network Configuration**: In `mobile/src/api.js`, update `API_BASE_URL` to your computer's local network IP if testing on a physical phone:
  - Android Emulator: `http://10.0.2.2:4000/api`
  - Physical Device: `http://<YOUR_LOCAL_IP>:4000/api`
  - Web / iOS Simulator: `http://localhost:4000/api`

---

## 🔬 Tech Stack

- **Frontend / Mobile**: React Native, Expo, React Navigation, Lucide Icons
- **Backend**: Node.js, Express.js, CORS, Multer
- **AI & ML**: Google Gemini API (Multimodal Image & Text understanding), Speech-to-Text stubs (Bhashini-ready)
- **Data Persistence**: In-memory / JSON store for prototype demos + PostgreSQL Schema (`schema.sql`) for production
- **Standards & Protocol**: ONDC-compliant schemas, PM Vishwakarma / Pehchan ID alignment

---

## 👥 Team CODESPHERE
- **Event**: Smart India Hackathon 2026 (SIH 2026)
- **Problem Statement**: SIH26090
