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
sih-artisan-app/
├── CLAUDE.md                         <-- This file (AI instructions & technical reference)
├── SPEC.md                           <-- Comprehensive product & technical specifications
├── README.md                         <-- General overview & quickstart
├── backend/                          <-- Express.js + Node.js API Service
│   ├── package.json                  <-- Dependencies (express, cors, uuid, dotenv, nodemon)
│   ├── server.js                     <-- Express server entrypoint (Port 4000)
│   ├── schema.sql                    <-- Production PostgreSQL relational schema
│   ├── data.json                     <-- Lightweight file-based local DB for prototype
│   ├── README.md                     <-- Backend API documentation
│   └── src/
│       ├── db.js                     <-- File-backed JSON load/save database helper
│       ├── seed.js                   <-- Demo data seeder (Artisans, Buyers, Products, Enquiries)
│       ├── routes/
│       │   ├── auth.js               <-- Phone OTP auth for both Artisan & Buyer roles
│       │   ├── artisans.js           <-- Artisan profile update & fetch
│       │   ├── products.js           <-- Storefront & Marketplace product CRUD + search
│       │   ├── ai.js                 <-- 4 AI endpoints (enhance, transcribe, translate, catalogue, price)
│       │   └── enquiries.js          <-- Buyer enquiries, 2-way negotiation thread, deal closing
│       └── services/
│           ├── nlpCatalogue.js       <-- Vision & NLP stubs (Image enhance, ASR transcribe, catalogue gen)
│           └── pricingModel.js       <-- Transparent cost-plus pricing formula & AI negotiation advisor
└── mobile/                           <-- React Native / Expo Mobile App
    ├── package.json                  <-- Dependencies (expo 51, react-native 0.74, expo-av, expo-image-picker)
    ├── app.json                      <-- Expo configuration
    ├── App.js                        <-- Main container, Artisan 7-step wizard, Artisan screens, Role Switcher
    └── src/
        ├── theme.js                  <-- Earthy Indian color palette, crafts list, 7-step wizard config
        ├── api.js                    <-- Axios client + offline-safe mock fallbacks for all endpoints
        └── BuyerScreens.js           <-- Buyer Marketplace, Product Modal, Enquiries, Chat, Profile
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
cd backend

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
cd mobile

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
- `POST /api/auth/send-otp`: `{ phone }` $\to$ `{ sent: true, demoOtp: "1234" }`
- `POST /api/auth/verify-otp`: `{ phone, otp, role, ...details }` $\to$ `{ token, role, artisan | buyer }`
- `PATCH /api/auth/buyer/:id`: `{ name, buyerType, companyName, city }` $\to$ `{ ok: true, buyer }`

### Artisans (`/api/artisans`)
- `GET /api/artisans/:id`: Fetch artisan profile
- `PUT /api/artisans/:id`: `{ name, craft, location, pehchanId, language }` $\to$ Update profile

### Products & Marketplace (`/api/products`)
- `GET /api/products?artisanId=&craft=&search=`: Search and filter catalog items
- `GET /api/products/:id`: Get product by ID
- `POST /api/products`: Step 6 product publication
- `PATCH /api/products/:id`: Update product attributes

### AI Services (`/api/ai`)
- `POST /api/ai/enhance`: Step 2 Image enhancement
- `POST /api/ai/transcribe`: Step 3 Speech-to-text
- `POST /api/ai/translate`: Hindi $\leftrightarrow$ English translation helper
- `POST /api/ai/catalogue`: Step 4 Bilingual listing generation
- `POST /api/ai/price`: Step 5 Price recommendation engine

### Enquiries & Price Negotiation (`/api/enquiries`)
- `GET /api/enquiries?artisanId=&buyerId=&buyerPhone=`: Retrieve negotiation threads
- `POST /api/enquiries`: Create new enquiry / wholesale offer
- `GET /api/enquiries/:id`: Retrieve single thread
- `POST /api/enquiries/:id/message`: Post new message or offer
- `GET /api/enquiries/:id/suggest-response`: AI suggested response calculation
- `POST /api/enquiries/:id/respond`: Artisan accept/counter/decline
- `POST /api/enquiries/:id/deal`: Buyer confirms order with escrow

---

## 7. Rules for Making Changes & Future Reference

1. **Dual Role Consistency**: Any change to products or enquiries must reflect on both the Artisan side (`App.js`) and the Buyer side (`src/BuyerScreens.js`).
2. **Offline Fallback Preservation**: Never break the fallback handlers in `mobile/src/api.js`. If the backend is down during a presentation or demo, the app must continue working seamlessly using local data.
3. **AI Stubs vs Production Model Boundary**: Every mock in `backend/src/services/` (`nlpCatalogue.js`, `pricingModel.js`) matches the exact input/output signature of future production models.
4. **Artisan Agency Principle**: AI never automatically sends counter-offers or publishes products without explicit human confirmation by the artisan.
5. **Bilingual Requirement**: All generated catalogue items, buttons, and navigation must include both Hindi and English context to remain accessible to rural artisans.
