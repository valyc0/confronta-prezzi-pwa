-- Create products table
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    store TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous access (since it's a public app)
CREATE POLICY "Allow anonymous access" ON products
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- Create index for faster searches
CREATE INDEX idx_products_name ON products USING gin (name gin_trgm_ops);
CREATE INDEX idx_products_store ON products USING gin (store gin_trgm_ops);
CREATE INDEX idx_products_date ON products (date DESC);

-- Enable full text search extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
