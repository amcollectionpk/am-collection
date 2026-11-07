-- ============================================================================
-- AM COLLECTION — PostgreSQL Database Schema (server-matched version)
-- ----------------------------------------------------------------------------
-- Ye schema server.js ki asal queries ke bilkul mutabiq hai:
--   * Saari IDs INTEGER (SERIAL) hain — server `category_id=$1::int` aur
--     integer product/order IDs expect karta hai.
--   * Stock seedha `products.stock_qty` / `product_variants.stock_qty`
--     mein rehta hai (alag inventory table server istemal NAHI karta).
--   * Orders par `order_status` + `payment_status` TEXT columns hain aur
--     values wohi hain jo server likhta/parhta hai:
--     PENDING_CONFIRMATION, CONFIRMED, PROCESSING, SHIPPED, DELIVERED,
--     CANCELLED, RETURNED / PENDING, COD_PENDING, PAID, FAILED ...
--   * Payment methods TEXT hain: COD, JAZZCASH, EASYPAISA, NAYAPAY.
-- Run:  psql "$DATABASE_URL" -f database/schema.sql
-- Phir: psql "$DATABASE_URL" -f database/seed-watches.sql  (27 watches)
-- Dono files idempotent hain — dobara chalane se nuqsan nahi hota.
-- Requires: PostgreSQL 13+
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- USERS (customers; admin dashboard login is .env-based, is table se nahi)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    full_name     TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    phone         TEXT,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'customer',
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Delivery addresses (checkout par logged-in customer ka address auto-save)
CREATE TABLE IF NOT EXISTS addresses (
    id            SERIAL PRIMARY KEY,
    user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name     TEXT NOT NULL,
    phone         TEXT NOT NULL,
    province      TEXT NOT NULL,
    city          TEXT NOT NULL,
    area_locality TEXT NOT NULL,
    house_address TEXT NOT NULL,
    postal_code   TEXT,
    is_default    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses (user_id);

-- ----------------------------------------------------------------------------
-- CATEGORIES & PRODUCTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id          SERIAL PRIMARY KEY,
    parent_id   INT REFERENCES categories(id) ON DELETE SET NULL,
    name        TEXT NOT NULL,
    slug        TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url   TEXT,
    sort_order  INT NOT NULL DEFAULT 0,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories (parent_id);

CREATE TABLE IF NOT EXISTS products (
    id             SERIAL PRIMARY KEY,
    category_id    INT REFERENCES categories(id) ON DELETE SET NULL,
    name           TEXT NOT NULL,
    slug           TEXT NOT NULL UNIQUE,
    sku            TEXT NOT NULL UNIQUE,
    description    TEXT,
    image_url      TEXT,
    price          NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    discount_price NUMERIC(12,2) CHECK (discount_price IS NULL OR discount_price >= 0),
    cost_price     NUMERIC(12,2) CHECK (cost_price IS NULL OR cost_price >= 0),
    stock_qty      INT NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
    bra_type       TEXT,
    size_prices    JSONB NOT NULL DEFAULT '{}'::jsonb,
    weight_kg      NUMERIC(8,3),
    is_featured    BOOLEAN NOT NULL DEFAULT FALSE,
    is_active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products (is_active);

-- Product photos (admin / future use; storefront products.image_url use karta hai)
CREATE TABLE IF NOT EXISTS product_images (
    id         SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url  TEXT NOT NULL,
    alt_text   TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images (product_id);

-- Variants: server variant_name / size / price_delta / stock_qty expect karta hai
CREATE TABLE IF NOT EXISTS product_variants (
    id           SERIAL PRIMARY KEY,
    product_id   INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_name TEXT,
    size         TEXT,
    sku          TEXT,
    price_delta  NUMERIC(12,2) NOT NULL DEFAULT 0,
    stock_qty    INT,
    is_active    BOOLEAN NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants (product_id);

-- Stock movement history (server: product_id, variant_id, movement_type,
-- quantity, reference likhta hai — misaal movement_type='ORDER')
CREATE TABLE IF NOT EXISTS inventory_movements (
    id            SERIAL PRIMARY KEY,
    product_id    INT REFERENCES products(id) ON DELETE SET NULL,
    variant_id    INT REFERENCES product_variants(id) ON DELETE SET NULL,
    movement_type TEXT NOT NULL,
    quantity      INT NOT NULL,
    reference     TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_movements_product ON inventory_movements (product_id);

-- ----------------------------------------------------------------------------
-- ORDERS (customer + address SNAPSHOTS — server `area` column likhta hai)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id               SERIAL PRIMARY KEY,
    order_number     TEXT NOT NULL UNIQUE,
    idempotency_key  TEXT UNIQUE,
    user_id          INT REFERENCES users(id) ON DELETE SET NULL,
    customer_name    TEXT NOT NULL,
    customer_phone   TEXT NOT NULL,
    customer_email   TEXT,
    province         TEXT NOT NULL,
    city             TEXT NOT NULL,
    area             TEXT NOT NULL,
    house_address    TEXT NOT NULL,
    postal_code      TEXT,
    payment_method   TEXT NOT NULL,
    subtotal         NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
    discount_amount  NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (discount_amount >= 0),
    delivery_fee     NUMERIC(12,2) NOT NULL CHECK (delivery_fee >= 0),
    grand_total      NUMERIC(12,2) NOT NULL CHECK (grand_total >= 0),
    payment_status   TEXT NOT NULL DEFAULT 'PENDING',
    order_status     TEXT NOT NULL DEFAULT 'PENDING_CONFIRMATION',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (order_status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders (customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at DESC);

-- Order line items — product data order ke waqt SNAPSHOT hota hai.
-- line_total aam column hai (server khud unit_price * quantity likhta hai).
CREATE TABLE IF NOT EXISTS order_items (
    id           SERIAL PRIMARY KEY,
    order_id     INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id   INT REFERENCES products(id) ON DELETE SET NULL,
    variant_id   INT REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    sku          TEXT NOT NULL,
    variant_name TEXT,
    unit_price   NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
    quantity     INT NOT NULL CHECK (quantity > 0),
    line_total   NUMERIC(12,2) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);

-- Har status change ki history (Track Order + admin istemal karte hain)
CREATE TABLE IF NOT EXISTS order_status_history (
    id         SERIAL PRIMARY KEY,
    order_id   INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status     TEXT NOT NULL,
    note       TEXT,
    changed_by INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_order_history_order ON order_status_history (order_id, created_at);

-- Payments (ek order ki payment row; callback par provider_txn_id /
-- verified_at / raw_callback update hote hain)
CREATE TABLE IF NOT EXISTS payments (
    id              SERIAL PRIMARY KEY,
    order_id        INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    method          TEXT NOT NULL,
    amount          NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    status          TEXT NOT NULL DEFAULT 'PENDING',
    provider_txn_id TEXT,
    verified_at     TIMESTAMPTZ,
    raw_callback    JSONB,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments (order_id);

CREATE TABLE IF NOT EXISTS shipments (
    id              SERIAL PRIMARY KEY,
    order_id        INT NOT NULL UNIQUE REFERENCES orders(id) ON DELETE CASCADE,
    courier         TEXT,
    tracking_number TEXT,
    status          TEXT NOT NULL DEFAULT 'SHIPPED',
    shipped_at      TIMESTAMPTZ,
    delivered_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- COUPONS (server: code, discount_type 'percent'|'fixed', discount_value,
-- min_order_amount, max_uses, used_count, valid_until, is_active parhta hai)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
    id               SERIAL PRIMARY KEY,
    code             TEXT NOT NULL UNIQUE,
    discount_type    TEXT NOT NULL DEFAULT 'fixed'
                     CHECK (discount_type IN ('percent', 'fixed')),
    discount_value   NUMERIC(12,2) NOT NULL CHECK (discount_value >= 0),
    min_order_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    max_uses         INT,
    used_count       INT NOT NULL DEFAULT 0 CHECK (used_count >= 0),
    valid_from       TIMESTAMPTZ,
    valid_until      TIMESTAMPTZ,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- REVIEWS (admin approval: PENDING -> APPROVED / REJECTED; is_approved
-- status ke saath sync rehta hai — server dono likhta hai)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id            SERIAL PRIMARY KEY,
    product_id    INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id       INT REFERENCES users(id) ON DELETE SET NULL,
    order_id      INT REFERENCES orders(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL DEFAULT '',
    rating        INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title         TEXT,
    body          TEXT NOT NULL DEFAULT '',
    status        TEXT NOT NULL DEFAULT 'PENDING'
                  CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    is_approved   BOOLEAN NOT NULL DEFAULT FALSE,
    reviewed_by   INT,
    reviewed_at   TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews (status, created_at DESC);

-- ----------------------------------------------------------------------------
-- SETTINGS, COMPLAINTS, AUDIT
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS store_settings (
    key        TEXT PRIMARY KEY,
    value      JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS complaints (
    id           SERIAL PRIMARY KEY,
    name         TEXT NOT NULL,
    mobile       TEXT NOT NULL,
    order_number TEXT,
    message      TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'NEW'
                 CHECK (status IN ('NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints (status, created_at DESC);

-- admin_user_id / entity_id par koi FK nahi: dashboard ka env-admin koi
-- DB user nahi hota (us ki id NULL rehti hai) — audit best-effort hai.
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id            SERIAL PRIMARY KEY,
    admin_user_id INT,
    action        TEXT NOT NULL,
    entity        TEXT NOT NULL,
    entity_id     BIGINT,
    details       JSONB,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_admin ON admin_audit_logs (admin_user_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- BASE SEED (structure only — products seed-watches.sql se ate hain)
-- ----------------------------------------------------------------------------
INSERT INTO store_settings (key, value) VALUES
    ('store_name', '"AM Collection"'::jsonb),
    ('default_delivery_fee', '200'::jsonb),
    ('currency', '"PKR"'::jsonb)
ON CONFLICT (key) DO NOTHING;

COMMIT;

-- ============================================================================
-- NOTES
-- * Delivery fee database se NAHI banti — server.js ka calculateDelivery()
--   env values (DELIVERY_BASE=200, DELIVERY_FREE_ABOVE=5000, STORE_CITY)
--   se khud calculate karta hai.
-- * Admin login is schema ka hissa NAHI hai: dashboard .env ke
--   ADMIN_USER / ADMIN_PASSWORD se khulta hai (POST /api/admin/login).
-- * WhatsApp order notification bhi DB se nahi chalti — server.js order
--   commit ke baad .env ki WHATSAPP_* settings se bhejta hai (optional).
-- ============================================================================
