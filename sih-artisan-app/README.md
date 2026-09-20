# ShilpSaathi (शिल्प साथी)

**AI-Powered Digital Business Manager for Artisans & Micro-Entrepreneurs**
Smart India Hackathon 2026 — Problem Statement SIH26090 — Team CODESPHERE

A working prototype of the full 7-step pipeline from the proposal —
**Capture → Enhance → Voice → Catalogue → Price → Publish → Connect** —
plus the newly added **price negotiation** feature, built on the tech
stack from the "Technical Approach" slide:

- **Mobile app**: React Native (Expo) — camera + voice-first UI
- **Backend/API**: Node.js + Express.js
- **Image AI / Speech-to-Text / NLP / Pricing Model**: service stubs behind
  clean function boundaries, ready to be swapped for real models
- **Data layer**: PostgreSQL schema provided (`backend/schema.sql`); the
  running prototype persists to a local JSON file for zero-setup demos

```
sih-artisan-app/
├── backend/     Node.js + Express API (see backend/README.md)
└── mobile/      React Native / Expo app (see below)
```

## Quick start (2 terminals)

**1. Backend**

```bash
cd backend
npm install
npm run seed      # one demo artisan, 2 products, 2 buyer enquiries
npm run dev        # http://localhost:4000
```

**2. Mobile app**

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with **Expo Go** (Android/iOS) or press `a` / `i` for an
emulator. Login with any 10-digit number and OTP `1234`.

> **Important:** update `API_BASE_URL` in `mobile/src/api.js` to match how
> your phone/emulator reaches your computer:
> - Android emulator → `http://10.0.2.2:4000/api`
> - Physical phone (same WiFi) → `http://<your-computer's-LAN-IP>:4000/api`
> - iOS simulator → `http://localhost:4000/api` (default)
>
> If the backend isn't reachable, the app still works using built-in
> offline fallbacks (see `mobile/src/api.js`) — useful for a quick demo
> without a laptop nearby, though live negotiation/product-sync needs
> the real backend running.

## What's implemented vs. what's a stub (for judges)

| Layer | This prototype | Production swap-in |
|---|---|---|
| Camera & voice capture | Real (expo-image-picker, expo-av) | — |
| Background removal / enhancement | Mock response + AI badges | Segmentation/enhancement model |
| Speech-to-text | Mock transcript per craft | Bhashini / fine-tuned Whisper |
| Bilingual catalogue generation | Deterministic templates | LLM prompted per transcript |
| Price recommendation | Transparent formula (cost × craft margin × market-trend index) | Trained regression/ranking model |
| Price negotiation | Rule-based suggestion + manual accept/counter/decline | Same UX, richer suggestion model |
| Data storage | JSON file (`backend/data.json`) | PostgreSQL (`backend/schema.sql`) + Object Storage for images |

Every mock lives behind the same function signature it would have in
production (see `backend/src/services/`), so swapping in real models
doesn't require touching the API contract or the mobile app.
