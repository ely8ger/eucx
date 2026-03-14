-- ─── EUCX — PostgreSQL Schema ─────────────────────────────────────────────────
-- TimescaleDB Extension (für Preishistorie)
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ─── ENUMs ────────────────────────────────────────────────────────────────────
CREATE TYPE user_role      AS ENUM ('admin', 'seller', 'buyer', 'observer');
CREATE TYPE user_status    AS ENUM ('active', 'suspended', 'pending');
CREATE TYPE order_direction AS ENUM ('buy', 'sell');
CREATE TYPE order_status   AS ENUM ('active', 'partially_filled', 'filled', 'cancelled', 'expired');
CREATE TYPE session_status AS ENUM ('scheduled', 'pre_trading', 'trading_1', 'correction_1', 'trading_2', 'correction_2', 'final', 'closed');
CREATE TYPE deal_status    AS ENUM ('matched', 'confirmed', 'cancelled', 'disputed');
CREATE TYPE steel_form     AS ENUM ('rebar', 'wire_rod', 'beam', 'pipe', 'sheet', 'coil');
CREATE TYPE steel_standard AS ENUM ('EN_10080', 'ASTM_A615', 'GOST_5781', 'DIN_488', 'BS_4449');
CREATE TYPE currency_code  AS ENUM ('EUR', 'PLN', 'USD');

-- ─── Organisations ────────────────────────────────────────────────────────────
CREATE TABLE organizations (
    id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name         TEXT NOT NULL,
    tax_id       TEXT NOT NULL UNIQUE,
    country      CHAR(2) NOT NULL,
    city         TEXT NOT NULL,
    is_verified  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Nutzer ───────────────────────────────────────────────────────────────────
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE RESTRICT,
    email           TEXT NOT NULL UNIQUE,
    password_hash   TEXT NOT NULL,
    role            user_role NOT NULL DEFAULT 'buyer',
    status          user_status NOT NULL DEFAULT 'pending',
    totp_secret     TEXT,
    totp_enabled    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);

-- ─── Stahl-Produkte ───────────────────────────────────────────────────────────
CREATE TABLE steel_products (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id     UUID NOT NULL REFERENCES organizations(id),
    form                steel_form NOT NULL,
    grade               TEXT NOT NULL,
    diameter_mm         NUMERIC(5,1),
    standard            steel_standard NOT NULL,
    quantity_tons       NUMERIC(10,3) NOT NULL CHECK (quantity_tons > 0),
    min_lot_tons        NUMERIC(10,3) NOT NULL DEFAULT 1.0,
    origin_country      CHAR(2) NOT NULL,
    production_year     SMALLINT NOT NULL,
    warehouse_location  TEXT NOT NULL,
    has_certificate     BOOLEAN NOT NULL DEFAULT FALSE,
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_org ON steel_products(organization_id);
CREATE INDEX idx_products_form ON steel_products(form);

-- ─── Handelssitzungen ─────────────────────────────────────────────────────────
CREATE TABLE trading_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES steel_products(id),
    current_status  session_status NOT NULL DEFAULT 'scheduled',
    scheduled_start TIMESTAMPTZ NOT NULL,
    ended_at        TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_product ON trading_sessions(product_id);
CREATE INDEX idx_sessions_status ON trading_sessions(current_status);

-- ─── Orders ───────────────────────────────────────────────────────────────────
CREATE TABLE orders (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id       UUID NOT NULL REFERENCES trading_sessions(id),
    user_id          UUID NOT NULL REFERENCES users(id),
    organization_id  UUID NOT NULL REFERENCES organizations(id),
    product_id       UUID NOT NULL REFERENCES steel_products(id),
    direction        order_direction NOT NULL,
    price_per_unit   NUMERIC(12,2) NOT NULL CHECK (price_per_unit > 0),
    currency         currency_code NOT NULL DEFAULT 'EUR',
    quantity_tons    NUMERIC(10,3) NOT NULL CHECK (quantity_tons > 0),
    filled_quantity  NUMERIC(10,3) NOT NULL DEFAULT 0 CHECK (filled_quantity >= 0),
    status           order_status NOT NULL DEFAULT 'active',
    idempotency_key  UUID NOT NULL UNIQUE,  -- Replay-Attack Schutz
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT filled_lte_quantity CHECK (filled_quantity <= quantity_tons)
);

CREATE INDEX idx_orders_session ON orders(session_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_direction_price ON orders(direction, price_per_unit);

-- Row Level Security: Händler sehen nur eigene Orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY orders_org_isolation ON orders
    USING (organization_id = current_setting('app.current_org_id', TRUE)::UUID
        OR current_setting('app.is_admin', TRUE) = 'true');

-- ─── Abschlüsse (Deals) ───────────────────────────────────────────────────────
CREATE TABLE deals (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id      UUID NOT NULL REFERENCES trading_sessions(id),
    sell_order_id   UUID NOT NULL REFERENCES orders(id),
    buy_order_id    UUID NOT NULL REFERENCES orders(id),
    seller_org_id   UUID NOT NULL REFERENCES organizations(id),
    buyer_org_id    UUID NOT NULL REFERENCES organizations(id),
    product_id      UUID NOT NULL REFERENCES steel_products(id),
    quantity_tons   NUMERIC(10,3) NOT NULL CHECK (quantity_tons > 0),
    price_per_unit  NUMERIC(12,2) NOT NULL CHECK (price_per_unit > 0),
    currency        currency_code NOT NULL DEFAULT 'EUR',
    total_value     NUMERIC(16,2) GENERATED ALWAYS AS (quantity_tons * price_per_unit) STORED,
    status          deal_status NOT NULL DEFAULT 'matched',
    buyer_signature TEXT,        -- ECDSA-384 Signatur (PKI/EDS)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_deals_session ON deals(session_id);
CREATE INDEX idx_deals_seller ON deals(seller_org_id);
CREATE INDEX idx_deals_buyer ON deals(buyer_org_id);

ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY deals_org_isolation ON deals
    USING (seller_org_id = current_setting('app.current_org_id', TRUE)::UUID
        OR buyer_org_id  = current_setting('app.current_org_id', TRUE)::UUID
        OR current_setting('app.is_admin', TRUE) = 'true');

-- ─── Event Store (Append-Only) ────────────────────────────────────────────────
CREATE TABLE event_store (
    id           BIGSERIAL PRIMARY KEY,
    aggregate_id UUID NOT NULL,
    event_type   TEXT NOT NULL,
    payload      JSONB NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_aggregate ON event_store(aggregate_id);
CREATE INDEX idx_events_type ON event_store(event_type);

-- Append-Only erzwingen
CREATE RULE event_store_no_update AS ON UPDATE TO event_store DO INSTEAD NOTHING;
CREATE RULE event_store_no_delete AS ON DELETE TO event_store DO INSTEAD NOTHING;

-- ─── Preishistorie (TimescaleDB) ──────────────────────────────────────────────
CREATE TABLE price_history (
    recorded_at    TIMESTAMPTZ NOT NULL,
    product_id     UUID NOT NULL,
    session_id     UUID NOT NULL,
    price          NUMERIC(12,2) NOT NULL,
    quantity       NUMERIC(10,3) NOT NULL,
    currency       currency_code NOT NULL DEFAULT 'EUR'
);

SELECT create_hypertable('price_history', 'recorded_at');
CREATE INDEX idx_price_history_product ON price_history(product_id, recorded_at DESC);

-- ─── Refresh-Tokens ───────────────────────────────────────────────────────────
CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  TEXT NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tokens_user ON refresh_tokens(user_id);

ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY tokens_own_only ON refresh_tokens
    USING (user_id = current_setting('app.current_user_id', TRUE)::UUID
        OR current_setting('app.is_admin', TRUE) = 'true');

-- ─── Audit-Log ────────────────────────────────────────────────────────────────
CREATE TABLE audit_log (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID REFERENCES users(id),
    action      TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id   UUID,
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
