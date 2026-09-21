# Module 06: Backend API & Service Layer (`backend-api/`)

## Overview
The **Backend API** serves as the central orchestration engine powering all ShilpSaathi interfaces, AI pipelines, data persistence, and external protocol integrations.

It coordinates authentication, stores artisan and buyer profiles, routes requests through the multimodal Gemini and Bhashini AI microservices, manages real-time negotiation threads, and prepares products for multi-channel broadcast across the Open Network for Digital Commerce (ONDC).

---

## Directory Structure

```
backend-api/
├── README.md                          <-- Backend architecture and API reference
└── src/
    ├── config/                        <-- Environment and database configuration
    │   └── .gitkeep                   <-- DB pools, API keys, CORS policies
    ├── controllers/                   <-- HTTP request controllers
    │   └── .gitkeep                   <-- ArtisanController, ProductController, EnquiryController
    ├── middlewares/                   <-- Express middlewares
    │   └── .gitkeep                   <-- Auth JWT verification, role guards, error handler
    ├── models/                        <-- Data models and database entities
    │   └── .gitkeep                   <-- Artisan, Buyer, Product, Enquiry, NegotiationMessage
    ├── routes/                        <-- REST API route definitions
    │   └── .gitkeep                   <-- /auth, /artisans, /products, /ai, /enquiries
    └── services/                      <-- Business logic & third-party AI orchestrators
        └── .gitkeep                   <-- GeminiService, BhashiniService, ONDCAdapter
```

---

## REST API Specifications

### 1. Authentication & Users (`/api/auth`)
- `POST /api/auth/send-otp` — Generates and sends SMS OTP to 10-digit mobile number.
- `POST /api/auth/verify-otp` — Verifies OTP, returns session token and user profile role (`artisan` or `buyer`).

### 2. Product Catalog (`/api/products`)
- `GET /api/products` — Retrieves paginated product catalog with craft category, GI tag, and price filtering.
- `GET /api/products/:id` — Fetches complete product details including artisan provenance, audio story, and cost breakdown.
- `POST /api/products` — Creates a newly published artisanal product listing.
- `PUT /api/products/:id` — Updates product inventory or catalog details.

### 3. AI Pipeline Endpoints (`/api/ai`)
- `POST /api/ai/enhance-image` — Dispatches raw craft photo to the image enhancement pipeline.
- `POST /api/ai/transcribe-voice` — Converts regional voice recording to Hindi / Indic text via Bhashini ASR.
- `POST /api/ai/generate-catalogue` — Uses Gemini multimodal AI to generate bilingual title, emotional story, and ONDC taxonomy.
- `POST /api/ai/calculate-fair-price` — Computes mathematical cost-plus pricing and floor-price guardrails.

### 4. Negotiation & Inquiries (`/api/enquiries`)
- `POST /api/enquiries` — Buyer opens enquiry with custom quantity and offer price.
- `GET /api/enquiries/:id` — Fetches full negotiation thread and counter-offer history.
- `POST /api/enquiries/:id/message` — Sends new text or counter-offer price update.
- `POST /api/enquiries/:id/close` — Finalizes negotiated agreement and proceeds to checkout.

---

## Planned Technologies & Database
- **Runtime**: Node.js (`v18+` or `v20+`)
- **Web Framework**: Express.js
- **Database**: PostgreSQL (Production schema with ACID compliance) / JSON store (Fast local demos)
- **AI Integrations**: Google Generative AI SDK (`@google/generative-ai`), Bhashini ASR APIs
