# ShilpSaathi (शिल्प साथी) — Complete Product & Technical Specification

**Smart India Hackathon 2026** | **Problem Statement: SIH26090** | **Team: CODESPHERE**  
**Document Version:** 1.0.0  
**Status:** Approved Prototype / Production Roadmap  
**Target Audience:** Engineering, Product, SIH Evaluators, and AI Agents

---

## 1. Executive Summary & Vision

### 1.1 Problem Statement (SIH26090)
India is home to over 7 million traditional rural artisans and micro-entrepreneurs. Despite creating world-class handicrafts, handlooms, and folk art, they face systemic market failure due to:
- **Digital Literacy Barrier**: Traditional e-commerce platforms (Amazon, Flipkart, Etsy) require complex text cataloging, SKU management, SEO descriptions, and English-only inputs.
- **Intermediary Exploitation**: Artisans receive only 15–20% of the final retail price; the rest is absorbed by multi-tier middlemen.
- **Arbitrary Pricing & Under-pricing**: Lack of transparent market data leads artisans to sell distress stock at or below production cost.
- **Lack of Direct B2B Market Linkage**: Exporters, wholesale chains, and boutique retailers cannot discover verified local craft clusters directly.

### 1.2 The ShilpSaathi Solution
**ShilpSaathi (शिल्प साथी)** is an **AI-powered digital business manager and direct-to-buyer marketplace** designed specifically for Indian artisans. Built on the core philosophy **"Just Click. Just Speak. AI Handles the Rest."**, the platform automates the entire supply-chain entry in 7 simple steps:

$$\text{Capture} \longrightarrow \text{Enhance} \longrightarrow \text{Voice} \longrightarrow \text{Catalogue} \longrightarrow \text{Price} \longrightarrow \text{Publish} \longrightarrow \text{Connect}$$

Additionally, ShilpSaathi integrates an **AI-Assisted Two-Way Price Negotiation Engine** that empowers artisans to negotiate bulk wholesale offers without being pressured into unfair margins.

---

## 2. User Personas & Core Journeys

### 2.1 Persona 1: Rural Master Artisan (e.g., Radha Devi, Khurja Pottery)
- **Background**: 42 years old, generational clay artisan, uses basic Android phone, communicates predominantly in Hindi.
- **Pain Points**: Cannot type English descriptions; unaware of fair market value in urban/export markets; lacks studio photography setup.
- **Needs**: Voice-first cataloging in Hindi, automatic background cleanup, transparent price recommendation, instant store listing.
- **Journey**:
  1. Login with mobile OTP (`1234`).
  2. Complete minimal onboarding (Name, Craft, District, Pehchan ID).
  3. Snap a photo of a terracotta vase on a rough workshop floor.
  4. AI instantly strips messy background and applies studio lighting.
  5. Hold mic button and speak in Hindi: *"यह नीले रंग का हाथ से बना मिट्टी का फूलदान है..."*
  6. AI generates bilingual listing (English + Hindi) with auto-assigned tags and category.
  7. Enter raw material/labour cost (₹300) $\to$ AI computes recommended price (₹650) with transparent formula.
  8. Click Publish $\to$ live on storefront and discoverable to national buyers.
  9. Receive wholesale offer for 150 pieces at ₹520 $\to$ AI suggests counter-offer at ₹585 $\to$ Artisan counters or accepts.

### 2.2 Persona 2: Enterprise / Wholesale Buyer (e.g., Rajiv Sharma, Rathi Exports)
- **Background**: B2B bulk buyer sourcing authentic Indian handicrafts for European and domestic retail stores.
- **Pain Points**: Verifying authentic artisans vs counterfeit middlemen; lengthy procurement cycles; lack of standardized pricing.
- **Needs**: Verified artisan profiles (Pehchan ID & PM Vishwakarma linked), craft-based search, ability to submit bulk wholesale bids or instant purchases.
- **Journey**:
  1. Login as Buyer.
  2. Browse curated artisan marketplace filtered by craft (Pottery, Weaving, Painting, Jewelry, etc.).
  3. View craft details, artisan provenance, and verification badges.
  4. Choose between:
     - **Instant Purchase**: Place immediate order at listed retail price with escrow security.
     - **Make Bulk Offer**: Propose custom quantity (e.g. 100 units) and target price per piece with delivery note.
  5. Engage in transparent 2-way chat negotiation with artisan until deal is agreed.
  6. Finalize deal with escrow payment protection.

---

## 3. High-Level System Architecture

The ShilpSaathi prototype is designed using clean architectural layers and modular micro-service boundaries:

```
+-----------------------------------------------------------------------------------+
|                                PRESENTATION LAYER                                 |
|                                                                                   |
|   React Native (Expo SDK 51) Mobile Application                                  |
|   +---------------------------------------+-----------------------------------+   |
|   |         Artisan Experience            |         Buyer Marketplace         |   |
|   | - 7-Step AI Creation Wizard           | - Craft Exploration & Search      |   |
|   | - Studio Camera & Vernacular Audio    | - Instant Buy & Wholesale Offers  |   |
|   | - Storefront & Enquiry Dashboard      | - Direct Negotiation Timeline     |   |
|   | - AI Advisory Negotiation Console     | - Verified Enterprise Profile     |   |
|   +---------------------------------------+-----------------------------------+   |
|                       |                                   |                       |
|                       +-----------------+-----------------+                       |
|                                         |                                         |
|                          Axios Client + Offline Fallbacks                         |
|                             (mobile/src/api.js)                                   |
+-----------------------------------------|-----------------------------------------+
                                          | REST API (HTTP / JSON)
+-----------------------------------------v-----------------------------------------+
|                               API ORCHESTRATION LAYER                             |
|                                                                                   |
|   Node.js + Express.js API Server (backend/server.js)                             |
|   - Port: 4000                                                                    |
|   - CORS Enabled, JSON Body Parser (10MB payload limit)                           |
|   - Route Handlers:                                                               |
|     • /api/auth       (OTP Verification & Role Provisioning)                      |
|     • /api/artisans   (Profile, KYC & Pehchan Records)                            |
|     • /api/products   (Cataloging, Filtering, Storefront Sync)                   |
|     • /api/ai         (Image Enhancement, ASR, NLP & Pricing Services)            |
|     • /api/enquiries  (B2B Negotiation Threads, Counter-Offers, Deal Closure)     |
+-----------------------------------------|-----------------------------------------+
                                          |
            +-----------------------------+-----------------------------+
            |                                                           |
+-----------v-----------------------+       +---------------------------v-----------+
|        AI SERVICES LAYER          |       |              DATA LAYER               |
|                                   |       |                                       |
| - Vision AI Stub (enhanceImage)   |       | Prototype:                            |
|   • Background removal & crop     |       | - Local file-backed database          |
| - ASR & Speech-to-Text (Bhashini) |       |   (backend/data.json)                 |
|   • Multilingual audio processing |       | - Atomic sync via backend/src/db.js   |
| - NLP Generator (generateCatalogue|       |                                       |
|   • Bilingual structured listing  |       | Production:                           |
| - Pricing Model Engine            |       | - PostgreSQL (backend/schema.sql)     |
|   • Margin × Trend formula        |       | - Object Storage (S3 / R2 for media)  |
| - AI Negotiation Advisor          |       | - ONDC Network Adapters (Beckn)       |
+-----------------------------------+       +---------------------------------------+
```

---

## 4. Detailed Feature Specifications

### Feature 1: Authentication & Role Switcher
- **Functionality**:
  - Phone-based authentication supporting both `artisan` and `buyer` roles.
  - OTP verification system (demo hardcoded to `1234` for instant hackathon evaluation).
  - One-click instant login buttons:
    - *Artisan*: Radha Devi (`9876543210`)
    - *Buyer*: Rajiv Sharma (`9123456780`)
  - **In-App Role Switcher**: A prominent header component ([RoleSwitcher](file:///c:/Users/DELL/Downloads/ShilpSaathi-Prototype/sih-artisan-app/mobile/src/BuyerScreens.js#L30)) allowing judges and users to toggle between Artisan and Buyer viewpoints seamlessly without re-logging.

### Feature 2: Minimal-Field Artisan Onboarding
- **Functionality**:
  - Designed for low-literacy users in 3 progressive steps:
    1. **Name**: Artisan's real name.
    2. **Craft Selection**: Visual grid of 6 primary craft categories with icons (Pottery, Weaving, Painting, Jewelry, Woodwork, Embroidery).
    3. **Location & Pehchan ID**: State/district cluster details + optional Pehchan ID from Ministry of Textiles.
  - **KYC Logic**: Automatic verification badge awarded when name, craft, and location are complete.

### Feature 3: The 7-Step AI Product Creation Wizard
Executed via [AddProductFlow](file:///c:/Users/DELL/Downloads/ShilpSaathi-Prototype/sih-artisan-app/mobile/App.js#L875):

1. **Step 1 — Capture ([CaptureScreen](file:///c:/Users/DELL/Downloads/ShilpSaathi-Prototype/sih-artisan-app/mobile/App.js#L491))**:
   - Opens device camera with high-contrast frame viewfinder via `expo-image-picker`.
   - Allows retaking or confirming the captured photograph.
2. **Step 2 — Enhance ([EnhanceScreen](file:///c:/Users/DELL/Downloads/ShilpSaathi-Prototype/sih-artisan-app/mobile/App.js#L536))**:
   - Sends image to `/api/ai/enhance`.
   - Simulates background removal, color-temperature correction, and square/4:3 market formatting.
   - Displays real-time visual AI badges: `"Background removed"`, `"Lighting fixed"`, `"Cropped to market format"`.
3. **Step 3 — Voice ([VoiceScreen](file:///c:/Users/DELL/Downloads/ShilpSaathi-Prototype/sih-artisan-app/mobile/App.js#L581))**:
   - Voice-first audio capture using `expo-av`.
   - Calls `/api/ai/transcribe` to convert vernacular speech (Hindi) to text.
   - Calls `/api/ai/translate` to produce English translation.
   - Artisan can toggle between original Hindi transcript and English translation.
4. **Step 4 — Catalogue ([CatalogueScreen](file:///c:/Users/DELL/Downloads/ShilpSaathi-Prototype/sih-artisan-app/mobile/App.js#L665))**:
   - Calls `/api/ai/catalogue` to synthesize a full bilingual product card:
     - English Title & Hindi Title
     - Bilingual narrative description capturing cultural heritage and materials
     - Category classification
   - All fields are 100% editable by the artisan.
5. **Step 5 — Price ([PriceScreen](file:///c:/Users/DELL/Downloads/ShilpSaathi-Prototype/sih-artisan-app/mobile/App.js#L717))**:
   - Artisan enters production cost (e.g. ₹300).
   - Calls `/api/ai/price` which computes recommended price, minimum price, and maximum ceiling.
   - Displays transparent mathematical explanation:
     *"Cost ₹300 × craft margin (1.4) × market-trend index (1.04) for pottery. Similar items sold in ₹450–₹850 range."*
   - Artisan selects recommended price or customizes it.
6. **Step 6 — Publish ([PublishScreen](file:///c:/Users/DELL/Downloads/ShilpSaathi-Prototype/sih-artisan-app/mobile/App.js#L786))**:
   - Previews the final listing card exactly as external buyers will see it.
   - Commits product to database via `POST /api/products`.
   - Displays celebratory success state.
7. **Step 7 — Connect ([ConnectScreen](file:///c:/Users/DELL/Downloads/ShilpSaathi-Prototype/sih-artisan-app/mobile/App.js#L845))**:
   - Explains ONDC discovery and buyer market linkage.
   - Previews live buyer enquiries and transitions artisan to their active shop.

### Feature 4: Buyer Marketplace & Product Discovery
Executed via [BuyerMarketScreen](file:///c:/Users/DELL/Downloads/ShilpSaathi-Prototype/sih-artisan-app/mobile/src/BuyerScreens.js#L77):
- Real-time search across English titles, Hindi titles, craft categories, and artisan names/locations.
- Horizontal craft category filter chips (All, Pottery, Weaving, Painting, Jewelry, Woodwork, Embroidery).
- Product cards displaying price, artisan verification badge, Pehchan ID, and action shortcuts.
- Detailed modal popup ([BuyerProductModal](file:///c:/Users/DELL/Downloads/ShilpSaathi-Prototype/sih-artisan-app/mobile/src/BuyerScreens.js#L229)) with craft story, full provenance, and order modes.

### Feature 5: Two-Way Price Negotiation & Deal Closure Engine
Executed via [NegotiationScreen](file:///c:/Users/DELL/Downloads/ShilpSaathi-Prototype/sih-artisan-app/mobile/App.js#L969) (Artisan) and [BuyerNegotiationScreen](file:///c:/Users/DELL/Downloads/ShilpSaathi-Prototype/sih-artisan-app/mobile/src/BuyerScreens.js#L616) (Buyer):
- **Buyer Bulk Offer**: Buyer specifies quantity (e.g., 150 units) and proposes a discounted unit price (e.g., ₹520 vs ₹650 listed).
- **Artisan AI Negotiation Advisor**:
  - The backend evaluates the ratio of offer price to asking price.
  - If discount $\le 10\%$, AI recommends: `"Accept"`.
  - If discount $> 10\%$, AI calculates a fair counter-offer splitting the difference: $\text{Counter} = \frac{\text{Ask} + \text{Offer}}{2}$.
  - AI provides advisory explanation protecting artisan margin.
  - Artisan can Accept, Counter, or Decline with custom prices and messages.
- **Buyer Action**:
  - Receives artisan counter-offer.
  - Can accept deal directly or propose another counter.
- **Deal Confirmation**:
  - Once either party accepts, the thread status locks to `"deal_closed"`.
  - Generates final invoice summary (Quantity, Unit Price, Total Amount, Escrow Payment Mode, Delivery Address).

---

## 5. Algorithmic Specifications

### 5.1 Pricing Model Algorithm (`pricingModel.js`)

The recommendation model calculates a balanced price protecting artisan wages while remaining competitive:

```javascript
function recommendPrice({ cost, craft = "pottery" }) {
  const CRAFT_MARGIN = {
    pottery: 1.40,     // 40% margin
    weaving: 1.55,     // 55% margin
    painting: 1.80,    // 80% margin
    jewelry: 2.20,     // 120% margin
    woodwork: 1.60,    // 60% margin
    embroidery: 1.50   // 50% margin
  };

  const MARKET_TREND_INDEX = {
    pottery: 1.04,     // +4% market demand
    weaving: 0.98,     // -2% seasonal lull
    painting: 1.10,    // +10% art collector interest
    jewelry: 1.02,     // +2% wedding season demand
    woodwork: 0.96,    // -4% raw material surplus
    embroidery: 1.05   // +5% festival demand
  };

  const margin = CRAFT_MARGIN[craft] || 1.5;
  const trend = MARKET_TREND_INDEX[craft] || 1.0;

  const base = cost * margin * trend;
  const recommended = Math.round(base / 5) * 5;
  const min = Math.round((recommended * 0.85) / 5) * 5;
  const max = Math.round((recommended * 1.25) / 5) * 5;

  return { min, recommended, max, basis: "..." };
}
```

### 5.2 AI Negotiation Response Heuristic (`pricingModel.js`)

```javascript
function suggestNegotiationResponse({ askingPrice, offerPrice, quantity }) {
  const ratio = offerPrice / askingPrice;
  if (ratio >= 0.9) {
    return {
      action: "accept",
      suggestedPrice: offerPrice,
      note: `This offer is within 10% of your asking price and the order size (${quantity}) is healthy — accepting keeps the relationship strong.`
    };
  }
  const counter = Math.round((askingPrice + offerPrice) / 2 / 5) * 5;
  return {
    action: "counter",
    suggestedPrice: counter,
    note: `The offer is ${Math.round((1 - ratio) * 100)}% below your asking price. A counter at ₹${counter}/piece splits the difference while protecting your margin.`
  };
}
```

---

## 6. Database Schema & Data Models

### 6.1 PostgreSQL Production Schema (`backend/schema.sql`)

```sql
CREATE TABLE IF NOT EXISTS artisans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  phone         VARCHAR(15) UNIQUE NOT NULL,
  craft         TEXT,
  location      TEXT,
  pehchan_id    TEXT,
  kyc_verified  BOOLEAN DEFAULT FALSE,
  language      VARCHAR(5) DEFAULT 'hi',
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id      UUID REFERENCES artisans(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  title_hi        TEXT,
  description     TEXT,
  description_hi  TEXT,
  craft           TEXT,
  category        TEXT,
  price           NUMERIC(10,2) NOT NULL,
  image_url       TEXT,
  views           INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'published',
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enquiries (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id     UUID REFERENCES artisans(id) ON DELETE CASCADE,
  product_id     UUID REFERENCES products(id) ON DELETE SET NULL,
  buyer_name     TEXT NOT NULL,
  buyer_type     TEXT,
  quantity       INTEGER,
  asking_price   NUMERIC(10,2),
  status         TEXT DEFAULT 'open',
  created_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS negotiation_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id    UUID REFERENCES enquiries(id) ON DELETE CASCADE,
  sender        TEXT NOT NULL, -- 'buyer' | 'artisan'
  message       TEXT,
  offer_price   NUMERIC(10,2),
  created_at    TIMESTAMPTZ DEFAULT now()
);
```

### 6.2 File-Backed JSON Structure (`backend/data.json`)
The prototype maintains the exact relational structure inside `data.json`:
- `artisans`: Array of artisan profile records.
- `buyers`: Array of registered wholesale/retail buyers.
- `products`: Array of published craft items.
- `enquiries`: Array of enquiries, each containing embedded `thread: [ { id, sender, message, offerPrice, time } ]`.

---

## 7. Production Roadmap & AI Swap-In Matrix

To transition from the current hackathon prototype to a national-scale deployment, the mock service stubs can be replaced without changing API contracts:

| Component | Prototype Implementation | Production Swap-In | Integration Approach |
|---|---|---|---|
| **Image Enhancement** | Mock URL + visual badges | **SAM / BiRefNet + Stable Diffusion Inpainting** | Run containerized FastAPI model on AWS SageMaker / RunPod |
| **Speech-to-Text** | Deterministic craft transcripts | **AI4Bharat Bhashini ASR / Whisper Fine-tuned** | REST call to Bhashini API with audio blob input |
| **Bilingual NLP** | Static craft templates | **Gemini 1.5 Flash / GPT-4o-mini** | Prompted with transcript: *"Generate bilingual handicraft listing in JSON"* |
| **Pricing Engine** | Fixed margin formula | **XGBoost Regressor + ONDC Transaction Stream** | Trained on historical sales across GeM, ONDC, and Amazon Karigar |
| **Data Layer** | Local `data.json` | **PostgreSQL (Supabase / RDS) + S3 / Cloudflare R2** | Switch database connection pool in `db.js` |
| **Buyer Linkage** | In-app marketplace | **ONDC Protocol Beckn Gateway** | Expose ONDC `bpp_client` endpoints (`search`, `init`, `confirm`) |

---

## 8. Conclusion
ShilpSaathi provides a complete, working, voice-first digital management platform for India's craft ecosystem. By removing technical barriers, guaranteeing transparent fair pricing, and providing an AI-assisted negotiation copilot, the platform ensures that artisans retain dignity, agency, and economic prosperity in the digital economy.
