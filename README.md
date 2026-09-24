# ShilpSaathi (à¤¶à¤¿à¤²à¥à¤ª à¤¸à¤¾à¤¥à¥€)

**AI-Powered Digital Business Manager for Artisans & Micro-Entrepreneurs**  
*Smart India Hackathon 2026 â€” Problem Statement SIH26090 â€” Team CODESPHERE*

> **"Just Click. Just Speak. AI Handles the Rest."**  
> Bridging the digital divide for rural Indian master artisans through voice-first, vernacular-enabled, automated AI cataloging, transparent pricing, and direct B2B buyer market linkage (zero intermediaries).

---

## ðŸŒŸ Key Features

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

## ðŸ“ Modular Repository Architecture

```
SIH_2026/
â”œâ”€â”€ image-enhancement/            # Module 01: Image Pre-processing, Studio Lighting & Cleanup
â”‚   â””â”€â”€ src/ (algorithms, pipelines, presets) & tests/
â”œâ”€â”€ artisan-ui/                   # Module 02: Artisan Voice-First UI & 7-Step Onboarding Logic
â”‚   â””â”€â”€ src/ (components, screens, hooks, navigation, assets)
â”œâ”€â”€ ai-catalogue-generator/       # Module 03: Multilingual Story & ONDC Catalogue Generator (Gemini + Bhashini)
â”‚   â””â”€â”€ src/ (prompts, voice-transcription, translation, ondc-schema)
â”œâ”€â”€ ai-pricing-engine/            # Module 04: Fair Pricing Engine, Benchmarks & Floor Protection
â”‚   â””â”€â”€ src/ (models, benchmarks, guardrails)
â”œâ”€â”€ buyer-marketplace-ui/         # Module 05: Buyer Discovery, Audio Storytelling & Negotiation Chat
â”‚   â””â”€â”€ src/ (components, screens, negotiation, navigation)
â”œâ”€â”€ backend-api/                  # Module 06: Central Express API, Auth, Database & AI Orchestration
â”‚   â””â”€â”€ src/ (controllers, routes, models, services, config)
â”‚
â”œâ”€â”€ sih-artisan-app/              # Integrated Working Prototype (Expo Mobile + Express Backend)
â”‚   â”œâ”€â”€ backend/                  # Working Node.js + Express API service (Port 4000)
â”‚   â””â”€â”€ mobile/                   # Working React Native (Expo) mobile application
â”œâ”€â”€ CLAUDE.md                     # Complete technical architecture & AI guide
â”œâ”€â”€ SPEC.md                       # Comprehensive product specification
â””â”€â”€ README.md                     # Master project overview & quickstart
```

---

### ðŸ§© Module Deep-Dives

| Module | Purpose & Pipeline Stage | Key Technologies |
| :--- | :--- | :--- |
| [**`image-enhancement/`**](./image-enhancement/README.md) | Studio lighting, background removal & high-res craft enhancement | Sharp, Rembg, Computer Vision |
| [**`artisan-ui/`**](./artisan-ui/README.md) | Voice-first, vernacular UI & onboarding for rural artisans | React Native / Expo, Lucide Icons |
| [**`ai-catalogue-generator/`**](./ai-catalogue-generator/README.md) | Vernacular speech-to-text, storytelling & ONDC taxonomy | Google Gemini 1.5, Bhashini ASR |
| [**`ai-pricing-engine/`**](./ai-pricing-engine/README.md) | Cost-plus pricing formula, craft indices & floor price protection | Mathematical models, Benchmark Data |
| [**`buyer-marketplace-ui/`**](./buyer-marketplace-ui/README.md) | Conscious buyer discovery, cost breakdown view & live negotiation | React Native / Web, WebSockets |
| [**`backend-api/`**](./backend-api/README.md) | Centralized REST APIs, DB persistence, Auth & AI coordination | Node.js, Express, PostgreSQL |

---

## ðŸš€ Quick Start (Local Setup)

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

## ðŸ‘¥ Team Setup (clone â†’ apni keys â†’ run)

> Har teammate **apni khud ki keys** use karta hai. `.env` files kabhi GitHub pe nahi jaati (`.gitignore` mein hain) â€” sirf `.env.example` templates repo mein hain.

```bash
git clone https://github.com/Swati89923/Smart_India_Hackathon.git
cd Smart_India_Hackathon/sih-artisan-app

# 1) Backend
cd backend
npm install
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env
# .env kholo aur apni keys daalo (neeche table dekho), save karo
npm run dev                 # http://localhost:4000  (.env save karte hi auto-restart)

# 2) Web app â€” naya terminal
cd sih-artisan-app/web
npm install
npm run dev                 # http://localhost:5173
```

| Key (`backend/.env`) | Kahan se milegi | Zaroori? |
|---|---|---|
| `GEMINI_API_KEY` | https://aistudio.google.com â†’ Get API key | AI voice / listing / photo pehchaan ke liye |
| `REMOVE_BG_API_KEY` | https://www.remove.bg/api | Asli background removal (50 free/mahina) |
| `CLOUDINARY_CLOUD_NAME`, `_API_KEY`, `_API_SECRET` | https://console.cloudinary.com â†’ Dashboard | Photo storage/CDN |
| `JWT_SECRET` | koi bhi lamba random text | haan |

- **Bina kisi key ke bhi app chalta hai** (demo data + templates) â€” UI par kaam karne walon ko keys ki zaroorat nahi.
- `backend/data.json` (local database) har member ki apni hoti hai, pehli baar server chalne par `src/seed.js` se khud banti hai. Reset karna ho to file delete karke `npm run seed`.
- `web/.env` optional hai â€” sirf tab banao jab backend kisi aur URL par ho (`web/.env.example` dekho). **Web mein kabhi API keys mat daalo.**
- Demo logins: Artisan `9876543210`, Buyer `9123456780` (OTP `1234`), Admin `admin@shilpsaathi.gov.in` / `admin123`.

---

## ðŸ”¬ Tech Stack

- **Frontend / Mobile**: React Native, Expo, React Navigation, Lucide Icons
- **Backend**: Node.js, Express.js, CORS, Multer
- **AI & ML**: Google Gemini API (Multimodal Image & Text understanding), Speech-to-Text stubs (Bhashini-ready)
- **Data Persistence**: In-memory / JSON store for prototype demos + PostgreSQL Schema (`schema.sql`) for production
- **Standards & Protocol**: ONDC-compliant schemas, PM Vishwakarma / Pehchan ID alignment

---

## ðŸ‘¥ Team CODESPHERE
- **Event**: Smart India Hackathon 2026 (SIH 2026)
- **Problem Statement**: SIH26090

