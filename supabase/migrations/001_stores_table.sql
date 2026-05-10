-- Create stores table for ReturnRate brand data
-- Scraper will populate this with thousands of stores

CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    domain TEXT NOT NULL,
    logo_url TEXT,
    score INTEGER DEFAULT 0,
    return_days INTEGER DEFAULT 30,
    free_shipping_threshold INTEGER DEFAULT 0,
    lifetime_warranty BOOLEAN DEFAULT false,
    price_match BOOLEAN DEFAULT false,
    category TEXT DEFAULT 'general',
    scraped_at TIMESTAMP DEFAULT now(),
    created_at TIMESTAMP DEFAULT now()
);

-- Enable RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read stores" ON stores FOR SELECT USING (true);

-- Allow service role write access
CREATE POLICY "Service write stores" ON stores FOR INSERT WITH CHECK (true);
CREATE POLICY "Service update stores" ON stores FOR UPDATE USING (true);

-- Create indexes
CREATE INDEX idx_stores_domain ON stores(domain);
CREATE INDEX idx_stores_score ON stores(score DESC);
CREATE INDEX idx_stores_name ON stores(name);