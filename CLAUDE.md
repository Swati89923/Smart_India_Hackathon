# CLAUDE.md — ShilpSaathi (शिल्प साथी) Reference & Guide

> **AI Assistant Quick Reference**: This document contains complete project architecture, technical specifications, API contracts, screen maps, and workflows for **ShilpSaathi**. Read this file to understand any part of the project immediately without re-scanning the entire codebase.

---

## 1. Project Overview & Context

- **Project Name**: ShilpSaathi (शिल्प साथी)
- **Tagline**: *"Just Click. Just Speak. AI Handles the Rest."*
- **Event / Hackathon**: Smart India Hackathon 2026 (SIH 2026)
- **Problem Statement**: SIH26090 — AI-Driven Market Linkage and Smart Cataloging for Artisans & Micro-Entrepreneurs
- **Team**: CODESPHERE
- **Core Mission**: Bridge the digital divide for rural Indian master artisans through voice-first, vernacular-enabled, automated AI cataloging, transparent pricing, and direct B2B buyer market linkage (zero intermediaries).
- **Key Government Integrations**: PM Vishwakarma Yojana, Pehchan ID verification, ONDC network discovery.

---

## 2. Repository Structure & Map

```
ShilpSaathi-Prototype/
├── CLAUDE.md                         <-- This file (AI instructions & technical reference)
├── SPEC.md                           <-- Comprehensive product & technical specifications
└── sih-artisan-app/
    ├── README.md                     <-- General overview & quickstart
    ├── backend/                      <-- Express.js + Node.js API Service
    │   ├── package.json              <-- Dependencies (express, cors, uuid, dotenv, nodemon)
    │   ├── server.js                 <-- Express server entrypoint (Port 4000)
    │   ├── schema.sql                <-- Production PostgreSQL relational schema
    │   ├── data.json                 <-- Lightweight file-based local DB for prototype
    │   ├── README.md                 <-- Backend API documentation
    │   └── src/
    │       ├── db.js                 <-- File-backed JSON load/save database helper
    │       ├── seed.js               <-- Demo data seeder (Artisans, Buyers, Products, Enquiries)
    │       ├── routes/
    │       │   ├── auth.js           <-- Phone OTP auth for both Artisan & Buyer roles
    │       │   ├── artisans.js       <-- Artisan profile update & fetch
    │       │   ├── products.js       <-- Storefront & Marketplace product CRUD + search
    │       │   ├── ai.js             <-- 4 AI endpoints (enhance, transcribe, translate, catalogue, price)
    │       │   └── enquiries.js      <-- Buyer enquiries, 2-way negotiation thread, deal closing
    │       └── services/
    │           ├── nlpCatalogue.js   <-- Vision & NLP stubs (Image enhance, ASR transcribe, catalogue gen)
    │           └── pricingModel.js   <-- Transparent cost-plus pricing formula & AI negotiation advisor
    └── mobile/                       <-- React Native / Expo Mobile App
        ├── package.json              <-- Dependencies (expo 51, react-native 0.74, expo-av, expo-image-picker)
        ├── app.json                  <-- Expo configuration
        ├── App.js                    <-- Main container, Artisan 7-step wizard, Artisan screens, Role Switcher
        └── src/
            ├── theme.js              <-- Earthy Indian color palette, crafts list, 7-step wizard config
            ├── api.js                <-- Axios client + offline-safe mock fallbacks for all endpoints
            └── BuyerScreens.js       <-- Buyer Marketplace, Product Modal, Enquiries, Chat, Profile
```

---

## 3. Tech Stack & Dependencies

### Backend
- **Runtime**: Node.js (`v18+` or `v20+`)
- **Framework**: Express.js (`^4.19.2`)
- **Key Packages**:
  - `cors` (`^2.8.5`): Cross-Origin Resource Sharing
  - `uuid` (`^9.0.1`): Unique identifier generation
  - `dotenv` (`^16.4.5`): Environment configuration
  - `nodemon` (`^3.1.0`): Hot-reloading development server
- **Data Persistence**:
  - Prototype: `data.json` managed via `backend/src/db.js`
  - Production: PostgreSQL defined in `backend/schema.sql`

### Mobile App
- **Framework**: React Native with Expo SDK 51 (`react-native: 0.74.1`, `react: 18.2.0`)
- **Key Packages**:
  - `expo-image-picker` (`~15.0.0`): Camera capture & gallery picker
  - `expo-av` (`~14.0.0`): Audio recording for regional voice descriptions
  - `@expo/vector-icons` (`^14.0.3`): Feather and MaterialCommunityIcons
  - `axios` (`^1.7.2`): HTTP client for backend REST API
  - `react-native-web` (`~0.19.10`): Web preview capability

---

## 4. Quick Run & Dev Commands

### Backend Commands
```bash
# Navigate to backend
cd sih-artisan-app/backend

# Install dependencies
npm install

# Seed demo data (creates data.json with sample artisans, buyers, products, negotiations)
npm run seed

# Run server with hot-reload (Port 4000)
npm run dev

# Or run in standard mode
npm start

# Test API health
curl http://localhost:4000/api/health
```

### Mobile App Commands
```bash
# Navigate to mobile
cd sih-artisan-app/mobile

# Install dependencies
npm install

# Start Expo dev server
npx expo start

# Shortcuts:
# Press 'w' for Web browser
# Press 'a' for Android emulator
# Press 'i' for iOS simulator
```

### Mobile Network Configuration (`mobile/src/api.js`)
When running on physical devices or emulators, update `API_BASE_URL` in [api.js](file:///c:/Users/DELL/Downloads/ShilpSaathi-Prototype/sih-artisan-app/mobile/src/api.js):
- **iOS Simulator / Web Preview**: `http://localhost:4000/api` (Default)
- **Android Emulator**: `http://10.0.2.2:4000/api`
- **Physical Phone (Expo Go on same Wi-Fi)**: `http://<YOUR_LAN_IP>:4000/api` (e.g. `http://192.168.1.15:4000/api`)
- *Note*: If the backend is unreachable, the app automatically activates offline mock fallbacks in `mobile/src/api.js`.

---

## 5. Demo Accounts & 1-Click Logins

The application includes 1-click demo login buttons directly on the Login screen:

| Role | Name | Phone Number | OTP | Sample Data / Capabilities |
|---|---|---|---|---|
| **Artisan** | Radha Devi | `9876543210` | `1234` | Pottery artisan from Khurja, UP; Pehchan ID `PEHCHAN-UP-88213`; 3 products; 7-step AI wizard; incoming buyer enquiry |
| **Artisan 2** | Shanti Ram | `9812345678` | `1234` | Weaving artisan from Varanasi, UP; Pehchan ID `PEHCHAN-UP-55104`; Banarasi Silk Dupatta |
| **Buyer** | Rajiv Sharma | `9123456780` | `1234` | Exporter at Rathi Exports Pvt Ltd, New Delhi; wholesale buyer browsing marketplace; active negotiation thread |
| **Buyer 2** | Ananya Gupta | `9876500112` | `1234` | Retailer at Craft Bazaar Retail, Bengaluru |

*Note: Any 10-digit phone number works with demo OTP `1234`.*

---

## 6. Complete API Endpoints Reference

Base URL: `http://localhost:4000/api`

### Auth (`/api/auth`)
- `POST /api/auth/send-otp`
  - Body: `{ phone: "9876543210" }`
  - Response: `{ sent: true, demoOtp: "1234" }`
- `POST /api/auth/verify-otp`
  - Body: `{ phone: "9876543210", otp: "1234", role: "artisan" | "buyer", ...details }`
  - Response: `{ token, role, artisan | buyer }`
- `PATCH /api/auth/buyer/:id`
  - Body: `{ name, buyerType, companyName, city }`
  - Response: `{ ok: true, buyer }`

### Artisans (`/api/artisans`)
- `GET /api/artisans/:id`
  - Response: Full artisan object with KYC status
- `PUT /api/artisans/:id`
  - Body: `{ name, craft, location, pehchanId, language }`
  - Response: Updated artisan object (`kycVerified: true` if name, craft & location exist)

### Products & Marketplace (`/api/products`)
- `GET /api/products?artisanId=&craft=&search=`
  - Query parameters:
    - `artisanId`: Filter products belonging to a specific artisan (Storefront view)
    - `craft`: Filter by craft type (`all`, `pottery`, `weaving`, etc.)
    - `search`: Case-insensitive text search matching title, Hindi title, category, craft, or artisan
  - Response: Array of enriched products (attaches artisan name, location, pehchanId, kyc status)
- `GET /api/products/:id`
  - Response: Single enriched product
- `POST /api/products` (Step 6 Publish)
  - Body: `{ artisanId, title, titleHi, description, descriptionHi, craft, category, price, imageUrl }`
  - Response: Newly created product (`views: 0`, `status: 'published'`)
- `PATCH /api/products/:id`
  - Body: Partial product updates

### AI Services (`/api/ai`)
- `POST /api/ai/enhance` (Step 2 - Image AI)
  - Body: `{ craft: "pottery" }`
  - Response: `{ enhancedImageUrl, tags: ["background_removed", "lighting_fixed", "cropped_to_market_format"] }`
- `POST /api/ai/transcribe` (Step 3 - Speech-to-Text)
  - Body: `{ craft: "pottery" }`
  - Response: `{ transcriptHi: "यह नीले रंग का हाथ से बना मिट्टी का फूलदान है...", confidence: 0.93 }`
- `POST /api/ai/translate` (Bilingual Helper)
  - Body: `{ text, craft }`
  - Response: `{ translatedText: "Handmade blue pottery vase, crafted in the traditional Jaipur style." }`
- `POST /api/ai/catalogue` (Step 4 - NLP Cataloging)
  - Body: `{ craft: "pottery" }`
  - Response: `{ title, titleHi, description, descriptionHi, category }`
- `POST /api/ai/price` (Step 5 - Pricing Engine)
  - Body: `{ cost: 300, craft: "pottery" }`
  - Response: `{ min: 450, recommended: 650, max: 815, basis: "Cost ₹300 × craft margin (1.4) × market-trend index (1.04)..." }`

### Enquiries & Price Negotiation (`/api/enquiries`)
- `GET /api/enquiries?artisanId=&buyerId=&buyerPhone=`
  - Response: Array of negotiation threads filtered by role
- `POST /api/enquiries`
  - Body: `{ productId, artisanId, buyerId, buyerName, buyerType, buyerPhone, productTitle, quantity, askingPrice, initialOfferPrice, initialMessage }`
  - Response: Newly created enquiry with initial negotiation message
- `GET /api/enquiries/:id`
  - Response: Enquiry object with full conversation `thread: [...]`
- `POST /api/enquiries/:id/message`
  - Body: `{ sender: "buyer" | "artisan", message: "...", offerPrice: 520 }`
  - Response: Updated enquiry thread
- `GET /api/enquiries/:id/suggest-response` (AI Negotiation Copilot)
  - Response: `{ action: "counter" | "accept", suggestedPrice: 585, note: "..." }`
- `POST /api/enquiries/:id/respond` (Artisan Finalizes Action)
  - Body: `{ action: "accept" | "counter" | "reject", price: 585, message: "..." }`
  - Response: Updated enquiry with updated status (`accepted`, `negotiating`, `declined`)
- `POST /api/enquiries/:id/deal` (Buyer Confirms Order / Escrow)
  - Body: `{ finalPrice: 585, address: "...", paymentMode: "Escrow / Cash on Delivery" }`
  - Response: Updated enquiry marked with `status: "deal_closed"`, `finalPrice`, `totalAmount`

---

## 7. The 7-Step AI Pipeline & Algorithms

The core artisan product creation pipeline consists of 7 seamless steps:

```
[Step 1: Capture]   --> Take photo via camera or select from gallery
        ↓
[Step 2: Enhance]   --> AI removes messy background & fixes studio lighting
        ↓
[Step 3: Voice]     --> Artisan speaks in vernacular (Hindi); STT transcribes & translates
        ↓
[Step 4: Catalogue] --> NLP extracts keywords & generates bilingual product listing
        ↓
[Step 5: Price]     --> Formula-driven fair pricing engine with explainable basis
        ↓
[Step 6: Publish]   --> 1-tap live publish to Artisan Shop & Buyer Marketplace
        ↓
[Step 7: Connect]   --> Direct visibility to verified B2B buyers & ONDC networks
```

### Pricing Engine Formula (`pricingModel.js`)
$$\text{Base Price} = \text{Artisan Production Cost} \times \text{Craft Margin} \times \text{Market Trend Index}$$
- $\text{Recommended Price} = \text{Round to nearest ₹5}(\text{Base Price})$
- $\text{Min Price} = \text{Round to nearest ₹5}(\text{Recommended} \times 0.85)$
- $\text{Max Price} = \text{Round to nearest ₹5}(\text{Recommended} \times 1.25)$

#### Craft Margins:
- Pottery: `1.40`
- Weaving: `1.55`
- Painting: `1.80`
- Jewelry: `2.20`
- Woodwork: `1.60`
- Embroidery: `1.50`

#### Market Trend Indices:
- Pottery: `1.04` | Weaving: `0.98` | Painting: `1.10` | Jewelry: `1.02` | Woodwork: `0.96` | Embroidery: `1.05`

### AI Negotiation Heuristic (`suggestNegotiationResponse`)
- If $\frac{\text{Offer Price}}{\text{Asking Price}} \ge 0.90$ (within 10% discount):
  - **Action**: `"accept"`
  - **Advice**: *"This offer is within 10% of your asking price and order size is healthy — accepting keeps the relationship strong."*
- If $\frac{\text{Offer Price}}{\text{Asking Price}} < 0.90$:
  - **Action**: `"counter"`
  - **Counter Price**: $\text{Round to nearest ₹5}\left(\frac{\text{Asking Price} + \text{Offer Price}}{2}\right)$
  - **Advice**: *"The offer is X% below your asking price. A counter splits the difference while protecting your margin."*
- **Artisan retains 100% control**: Suggestions are strictly editable drafts and are never sent automatically.

---

## 8. Mobile App Screens & Navigation Structure

The mobile app has two primary personas with seamless in-app switching:

```
                  ┌──────────────────────┐
                  │ SplashScreen (Lang)  │
                  └──────────┬───────────┘
                             │
                  ┌──────────▼───────────┐
                  │ LoginScreen (OTP)    │
                  └──────────┬───────────┘
                             │
     ┌───────────────────────┴────────────────────────┐
     ▼ (Artisan Role)                                 ▼ (Buyer Role)
┌─────────────────────────────┐              ┌─────────────────────────────┐
│ OnboardingScreen (if new)   │              │ BuyerMarketScreen (Search)  │
└────────────┬────────────────┘              └──────────────┬──────────────┘
             │                                              │
┌────────────▼────────────────┐              ┌──────────────▼──────────────┐
│ RoleSwitcher (Header Toggle)│<------------>│ RoleSwitcher (Header Toggle)│
├─────────────────────────────┤              ├─────────────────────────────┤
│ Tab 1: HomeScreen (Stats)   │              │ Tab 1: Explore Crafts       │
│ Tab 2: ShopScreen (Products)│              │ Tab 2: My Enquiries (Deals) │
│ Tab 3: [+] 7-Step AI Wizard │              │ Tab 3: Business Profile     │
│ Tab 4: EnquiriesScreen      │              └──────────────┬──────────────┘
│ Tab 5: ProfileScreen        │                             │
└────────────┬────────────────┘              ┌──────────────▼──────────────┐
             │                               │ BuyerProductModal           │
┌────────────▼────────────────┐              │ - Make Wholesale Offer      │
│ NegotiationScreen (Artisan) │              │ - Instant Buy (Escrow)      │
│ - View Offer History        │              └──────────────┬──────────────┘
│ - AI Suggested Response     │                             │
│ - Accept / Counter / Reject │              ┌──────────────▼──────────────┐
└─────────────────────────────┘              │ BuyerNegotiationScreen      │
                                             │ - Live Chat & Counter-Offer │
                                             │ - Accept Artisan Counter    │
                                             │ - Deal Closed Confirmation  │
                                             └─────────────────────────────┘
```

---

## 9. Design System & Theming (`theme.js`)

The visual design is specifically crafted to evoke Indian artisan heritage, natural terracotta, raw paper, and handloom textures:

| Token Name | Hex Code | Purpose |
|---|---|---|
| `paper` | `#F6F0E1` | Warm handmade parchment background |
| `paperDeep` | `#EFE6D2` | Darker parchment for headers and cards |
| `card` | `#FFFDF7` | Crisp card background |
| `terracotta` | `#BD5B3A` | Primary accent for artisans (earth / clay) |
| `terracottaDeep`| `#9C4429` | Deep terracotta for buttons & emphasized borders |
| `indigo` | `#2E4A63` | Primary accent for buyers (trade / trust) |
| `indigoDeep` | `#1F3345` | Dark slate indigo for enterprise elements |
| `turmeric` | `#DDA02E` | Highlight gold / pending / in-progress badges |
| `leaf` | `#4C7A57` | Success green / verified / deal closed |
| `ink` | `#2B2A28` | Primary high-contrast text |
| `inkSoft` | `#5B5648` | Secondary muted text |
| `border` | `#E3D6B8` | Subtle warm borders |

---

## 10. Rules for Making Changes & Future Reference

1. **Dual Role Consistency**: Any change to products or enquiries must reflect on both the Artisan side (`App.js`) and the Buyer side (`src/BuyerScreens.js`).
2. **Offline Fallback Preservation**: Never break the fallback handlers in `mobile/src/api.js`. If the backend is down during a presentation or demo, the app must continue working seamlessly using local data.
3. **AI Stubs vs Production Model Boundary**: Every mock in `backend/src/services/` (`nlpCatalogue.js`, `pricingModel.js`) is designed to match the exact input/output signature of future production models (Whisper/Bhashini, Gemini/GPT-4o, regression models). Do not alter service signatures without updating both the router and the mobile caller.
4. **Artisan Agency Principle**: AI never automatically sends counter-offers or publishes products without explicit human confirmation by the artisan.
5. **Bilingual Requirement**: All generated catalogue items, buttons, and navigation must include both Hindi and English context to remain accessible to rural artisans.

---

## 11. Web App (`sih-artisan-app/web/`) & Admin API

- **Web client**: React 19 + Vite + react-router + lucide-react. `npm run dev` → http://localhost:5173. See `web/README.md`.
  - `src/api.js` mirrors every backend endpoint with an offline in-memory fallback (`src/sampleData.js` = copy of `seed.js`). Keep both in sync with `backend/src/seed.js` and `mobile/src/api.js`.
  - Areas: `/artisan/*` (sidebar dashboard + AI wizard), `/market/*` + `/buyer/*` (buyer marketplace), `/admin/*` (admin console). One session per role in localStorage; header role switcher.
- **Admin API** (`backend/src/routes/admin.js`, demo creds `admin@shilpsaathi.gov.in` / `admin123`, override with `ADMIN_EMAIL` / `ADMIN_PASSWORD`):
  - `POST /api/admin/login`, `GET /api/admin/overview`, `GET /api/admin/artisans`, `PATCH /api/admin/artisans/:id {status}`,
    `GET /api/admin/products`, `PATCH /api/admin/products/:id {status}`, `GET|PUT /api/admin/settings {announcement, categories}`.
- **Data additions**: artisans have `state`, `bio`, `status` (active | pending | suspended); products have `material`, `priceMin`, `priceMax`, `status` (published | pending | hidden — marketplace `GET /api/products` without `artisanId` returns only published); enquiries accept `budgetMin`, `budgetMax`, `requiredBy`.

---

## 12. Real AI pipeline (keys in `backend/.env` only — see `backend/.env.example`)

| Step | Endpoint | Service | Fallback without key |
|---|---|---|---|
| Photo enhance | `POST /api/ai/enhance {craft, imageBase64, identify?, description?}` | Gemini `locateProduct` finds the described product → `sharp` crops to it → remove.bg (`type=product`) → Cloudinary (store, square pad, auto-improve) — `src/services/imageService.js` | browser canvas levels/crop |
| Identify product | `POST /api/ai/identify {craft, imageBase64, description?}` | Gemini vision (`analyzeProductImage`) | none (UI hides it) |
| Voice → text | `POST /api/ai/transcribe {craft, audioBase64, mimeType, languageHint}` | Gemini audio (`transcribeAudio`) — returns `transcript`, `english`, `hindi`, `language` | demo transcript per craft |
| Listing | `POST /api/ai/catalogue {craft, imageBase64, voiceTranscript}` | Gemini multimodal | craft templates |
| Price | `POST /api/ai/price {cost?, craft, title?, description?, material?, category?}` | `marketService.researchMarket`: SerpAPI Google Shopping → Gemini + Google Search (billed key) → Gemini estimate; `recommendMarketPrice` anchors to the market median, never below cost + 15% | cost × craft margin × trend (old formula) |

- Web records audio with MediaRecorder and uploads 16 kHz mono WAV (`web/src/audioTools.js`); the old `{craft}`-only calls still work for mobile.
- `geminiService.js` tries `GEMINI_MODEL` then `GEMINI_FALLBACK_MODELS`, skipping a busy model for 2 min; per-task `thinkingLevel` (identify = minimal, transcribe/catalogue = low) keeps replies ~3-5 s.
- Wizard order (web + mobile): **Photo → Voice → Enhance → Details → Price → Publish** — the artisan's description is sent to enhance/identify so cluttered photos (laptop, bedsheet, hands) are cropped to the actual product before background removal.
- Never put keys in `web/` (anything there ships to the browser).

---

## 13. Mobile App v2 (`sih-artisan-app/mobile/`, Expo SDK 57)

- Rewritten to match the web design and features (artisan + buyer; admin stays web-only). See `mobile/README.md`.
- Entry `index.js` → `App.js` (single stack whose screens switch on the active role; one saved session per role in AsyncStorage).
- `src/api.js` mirrors `web/src/api.js` (same endpoints + offline fallbacks). Backend URL auto-derives from the Expo dev host (`http://<laptop-ip>:4000/api`), override with `EXPO_PUBLIC_API_BASE_URL`.
- Voice: `expo-audio` records AAC (Android) / 16 kHz WAV (iOS) → `POST /api/ai/transcribe`. Photos: `expo-image-picker` + `expo-image-manipulator` (≤1600px JPEG) → `/api/ai/enhance` + `/api/ai/identify`.
- When changing an endpoint or constant, update `web/src/*` and `mobile/src/*` together (constants.js and sampleData.js are copies).
