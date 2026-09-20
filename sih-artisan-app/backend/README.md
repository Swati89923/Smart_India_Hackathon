# ShilpSaathi — Backend (Node.js + Express.js)

Implements the **Backend / AI Services Layer** from the Technical Approach
diagram: an API orchestrator plus four AI service stubs (Image AI,
Speech-to-Text, Language/NLP, Pricing Model), backed by a data layer that
mirrors the PostgreSQL schema in `schema.sql`.

## Run it

```bash
cd backend
npm install
npm run seed     # creates data.json with one demo artisan + products + enquiries
npm run dev       # or: npm start
```

Server starts at `http://localhost:4000`. Health check:

```bash
curl http://localhost:4000/api/health
```

## API reference

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/auth/send-otp` | `{ phone }` → sends OTP (demo OTP is always `1234`) |
| POST | `/api/auth/verify-otp` | `{ phone, otp }` → returns token + artisan profile |
| PUT | `/api/artisans/:id` | Complete onboarding `{ name, craft, location, pehchanId }` |
| GET | `/api/artisans/:id` | Fetch artisan profile |
| POST | `/api/ai/enhance` | `{ craft }` → Step 2, background removal + enhancement |
| POST | `/api/ai/transcribe` | `{ craft }` → Step 3, regional-language voice → text |
| POST | `/api/ai/translate` | `{ text, craft }` → Hindi ⇄ English helper |
| POST | `/api/ai/catalogue` | `{ craft }` → Step 4, bilingual title + description + category |
| POST | `/api/ai/price` | `{ cost, craft }` → Step 5, recommended price range + basis |
| POST | `/api/products` | Step 6, publish product to storefront |
| GET | `/api/products?artisanId=` | List an artisan's storefront |
| GET | `/api/enquiries?artisanId=` | Step 7, buyer/B2B enquiries |
| POST | `/api/enquiries/:id/message` | Buyer sends a message/offer into the negotiation thread |
| GET | `/api/enquiries/:id/suggest-response` | AI-suggested accept/counter response (editable, never auto-sent) |
| POST | `/api/enquiries/:id/respond` | Artisan accepts / counters / declines |

## Notes on the prototype vs. production

- **Data layer**: `src/db.js` persists to a local `data.json` for zero-setup
  demoing. `schema.sql` is the real PostgreSQL schema this maps to —
  swapping the two is a drop-in replacement (same shape of data).
- **Image AI / Speech-to-Text / NLP**: `src/services/nlpCatalogue.js`
  returns deterministic mock results so the whole 7-step pipeline can be
  demoed offline with no API keys. Swap in a real model (e.g. a
  segmentation model for background removal, Bhashini/Whisper for ASR,
  an LLM for catalogue generation) behind the same function signatures.
- **Pricing model**: `src/services/pricingModel.js` is a transparent,
  explainable formula (cost × craft margin × market-trend index) —
  a placeholder for the regression/ranking model described in the
  Technical Approach, with the same inputs/outputs.
