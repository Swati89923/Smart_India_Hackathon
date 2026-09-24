# ShilpSaathi Web (Artisan · Buyer · Admin)

React 19 + Vite web client for the ShilpSaathi backend (`../backend`, port 4000).
The UI follows the SIH26090 mockup: green artisan dashboard, blue buyer marketplace, navy admin console.

```bash
cd ../backend && npm install && npm run seed && npm run dev   # API on :4000
cd ../web && npm install && npm run dev                         # UI on http://localhost:5173
```

Set `VITE_API_BASE_URL` (see `.env.example`) if the API runs elsewhere. If the API is unreachable the app
switches to an in-memory copy of the seed data (`src/sampleData.js`) and shows an "Offline demo" pill.

| Role | Login |
|---|---|
| Artisan | Radha Devi `9876543210` / Sita Devi `9801122334`, OTP `1234` (1-click buttons on the login page) |
| Buyer | Rajiv Sharma `9123456780` / Ananya Gupta `9876500112`, OTP `1234` |
| Admin | `admin@shilpsaathi.gov.in` / `admin123` |

## Screens
- **Artisan** (`/artisan`): dashboard, 6-step AI wizard (photo → enhance → voice → AI details → pricing → publish),
  My Products, Enquiries & negotiation with AI copilot, profile/storefront, onboarding.
- **Buyer** (`/market`, `/buyer`): marketplace home, product listing with filters, product details, bulk enquiry form,
  chat/negotiation with deal confirmation, buyer dashboard, artisan storefronts.
- **Admin** (`/admin`): overview & growth chart, manage artisans (approve/suspend), manage products (approve/hide),
  analytics, settings (categories, announcement shown on artisan dashboards, CSV reports).

## Notes
- Photo enhancement runs in the browser (`src/imageTools.js`: 1:1 crop, auto-levels, colour lift); `/api/ai/enhance`
  adds the Gemini quality check when `GEMINI_API_KEY` is set.
- Voice input uses the browser Web Speech API (Chrome/Edge) in 12 Indian languages; other browsers fall back to
  `/api/ai/transcribe` or typing.
- Without `GEMINI_API_KEY` the catalogue step uses the backend's template fallback, so titles are craft templates —
  set the key for real image+voice-based listings.
