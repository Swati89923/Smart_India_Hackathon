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

## 📁 Modular Repository Architecture

```
SIH_2026/
├── image-enhancement/            # Module 01: Image Pre-processing, Studio Lighting & Cleanup
│   └── src/ (algorithms, pipelines, presets) & tests/
├── artisan-ui/                   # Module 02: Artisan Voice-First UI & 7-Step Onboarding Logic
│   └── src/ (components, screens, hooks, navigation, assets)
├── ai-catalogue-generator/       # Module 03: Multilingual Story & ONDC Catalogue Generator (Gemini + Bhashini)
│   └── src/ (prompts, voice-transcription, translation, ondc-schema)
├── ai-pricing-engine/            # Module 04: Fair Pricing Engine, Benchmarks & Floor Protection
│   └── src/ (models, benchmarks, guardrails)
├── buyer-marketplace-ui/         # Module 05: Buyer Discovery, Audio Storytelling & Negotiation Chat
│   └── src/ (components, screens, negotiation, navigation)
├── backend-api/                  # Module 06: Central Express API, Auth, Database & AI Orchestration
│   └── src/ (controllers, routes, models, services, config)
│
├── sih-artisan-app/              # Integrated Working Prototype (Expo Mobile + Express Backend)
│   ├── backend/                  # Working Node.js + Express API service (Port 4000)
│   └── mobile/                   # Working React Native (Expo) mobile application
├── CLAUDE.md                     # Complete technical architecture & AI guide
├── SPEC.md                       # Comprehensive product specification
└── README.md                     # Master project overview & quickstart
```

---

### 🧩 Module Deep-Dives

| Module | Purpose & Pipeline Stage | Key Technologies |
| :--- | :--- | :--- |
| [**`image-enhancement/`**](./image-enhancement/README.md) | Studio lighting, background removal & high-res craft enhancement | Sharp, Rembg, Computer Vision |
| [**`artisan-ui/`**](./artisan-ui/README.md) | Voice-first, vernacular UI & onboarding for rural artisans | React Native / Expo, Lucide Icons |
| [**`ai-catalogue-generator/`**](./ai-catalogue-generator/README.md) | Vernacular speech-to-text, storytelling & ONDC taxonomy | Google Gemini 1.5, Bhashini ASR |
| [**`ai-pricing-engine/`**](./ai-pricing-engine/README.md) | Cost-plus pricing formula, craft indices & floor price protection | Mathematical models, Benchmark Data |
| [**`buyer-marketplace-ui/`**](./buyer-marketplace-ui/README.md) | Conscious buyer discovery, cost breakdown view & live negotiation | React Native / Web, WebSockets |
| [**`backend-api/`**](./backend-api/README.md) | Centralized REST APIs, DB persistence, Auth & AI coordination | Node.js, Express, PostgreSQL |

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

## 👥 Team Setup (clone → apni keys → run)

> Har teammate **apni khud ki keys** use karta hai. `.env` files kabhi GitHub pe nahi jaati (`.gitignore` mein hain) — sirf `.env.example` templates repo mein hain.

```bash
git clone https://github.com/Swati89923/Smart_India_Hackathon.git
cd Smart_India_Hackathon/sih-artisan-app

# 1) Backend
cd backend
npm install
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
# .env kholo aur apni keys daalo (neeche table dekho), save karo
npm run dev                 # http://localhost:4000  (.env save karte hi auto-restart)

# 2) Web app — naya terminal
cd sih-artisan-app/web
npm install
npm run dev                 # http://localhost:5173
```

| Key (`backend/.env`) | Kahan se milegi | Zaroori? |
|---|---|---|
| `GEMINI_API_KEY` | https://aistudio.google.com → Get API key | AI voice / listing / photo pehchaan ke liye |
| `REMOVE_BG_API_KEY` | https://www.remove.bg/api | Asli background removal (50 free/mahina) |
| `CLOUDINARY_CLOUD_NAME`, `_API_KEY`, `_API_SECRET` | https://console.cloudinary.com → Dashboard | Photo storage/CDN |
| `JWT_SECRET` | koi bhi lamba random text | haan |

- **Bina kisi key ke bhi app chalta hai** (demo data + templates) — UI par kaam karne walon ko keys ki zaroorat nahi.
- `backend/data.json` (local database) har member ki apni hoti hai, pehli baar server chalne par `src/seed.js` se khud banti hai. Reset karna ho to file delete karke `npm run seed`.
- `web/.env` optional hai — sirf tab banao jab backend kisi aur URL par ho (`web/.env.example` dekho). **Web mein kabhi API keys mat daalo.**
- Demo logins: Artisan `9876543210`, Buyer `9123456780` (OTP `1234`), Admin `admin@shilpsaathi.gov.in` / `admin123`.

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
