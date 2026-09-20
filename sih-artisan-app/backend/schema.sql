-- schema.sql
-- Production data layer for ShilpSaathi (PostgreSQL), matching the
-- "Data Layer" block in the Methodology & System Data-Flow diagram.
-- Product images themselves live in Object Storage (e.g. S3-compatible
-- bucket); this table stores the resulting URL, not the binary.

CREATE TABLE IF NOT EXISTS artisans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  phone         VARCHAR(15) UNIQUE NOT NULL,
  craft         TEXT,
  location      TEXT,
  pehchan_id    TEXT,                 -- optional field per minimal-field onboarding
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
  image_url       TEXT,               -- Object Storage URL
  views           INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'published',  -- draft | published | archived
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enquiries (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artisan_id     UUID REFERENCES artisans(id) ON DELETE CASCADE,
  product_id     UUID REFERENCES products(id) ON DELETE SET NULL,
  buyer_name     TEXT NOT NULL,
  buyer_type     TEXT,               -- Wholesaler | Retailer | Exporter | Hotel Chain ...
  quantity       INTEGER,
  asking_price   NUMERIC(10,2),
  status         TEXT DEFAULT 'open', -- open | negotiating | accepted | declined
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Price Negotiation feature: every message/offer in a thread
CREATE TABLE IF NOT EXISTS negotiation_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enquiry_id    UUID REFERENCES enquiries(id) ON DELETE CASCADE,
  sender        TEXT NOT NULL,        -- 'buyer' | 'artisan'
  message       TEXT,
  offer_price   NUMERIC(10,2),
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_artisan ON products(artisan_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_artisan ON enquiries(artisan_id);
CREATE INDEX IF NOT EXISTS idx_negotiation_enquiry ON negotiation_messages(enquiry_id);
