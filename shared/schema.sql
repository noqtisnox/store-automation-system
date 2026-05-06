CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role        TEXT NOT NULL DEFAULT 'customer'
                CHECK(role IN ('customer', 'manager', 'admin')),
    is_active   INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id),
    token_hash  TEXT NOT NULL UNIQUE,
    expires_at  TEXT NOT NULL,
    revoked_at  TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS categories (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL UNIQUE,
    slug       TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
    id             TEXT PRIMARY KEY,
    category_id    TEXT REFERENCES categories(id),
    name           TEXT NOT NULL,
    description    TEXT,
    sku            TEXT NOT NULL UNIQUE,
    barcode        TEXT UNIQUE,
    price          REAL NOT NULL,
    cost_price     REAL,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    is_active      INTEGER NOT NULL DEFAULT 1,
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS carts (
    id         TEXT PRIMARY KEY,
    user_id    TEXT NOT NULL UNIQUE REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS cart_items (
    id         TEXT PRIMARY KEY,
    cart_id    TEXT NOT NULL REFERENCES carts(id),
    product_id TEXT NOT NULL REFERENCES products(id),
    quantity   INTEGER NOT NULL CHECK(quantity > 0),
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id             TEXT PRIMARY KEY,
    user_id        TEXT NOT NULL REFERENCES users(id),
    status         TEXT NOT NULL DEFAULT 'pending'
                    CHECK(status IN ('pending','confirmed','shipped','delivered','cancelled')),
    total_amount   REAL NOT NULL,
    tracking_number TEXT,
    notes          TEXT,
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
    id           TEXT PRIMARY KEY,
    order_id     TEXT NOT NULL REFERENCES orders(id),
    product_id   TEXT NOT NULL REFERENCES products(id),
    product_name TEXT NOT NULL,
    unit_price   REAL NOT NULL,
    quantity     INTEGER NOT NULL,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS automation_alerts (
    id         TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id),
    created_by TEXT NOT NULL REFERENCES users(id),
    threshold  INTEGER NOT NULL,
    action     TEXT NOT NULL CHECK(action IN ('email','reorder','slack_notify')),
    is_active  INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS automation_logs (
    id               TEXT PRIMARY KEY,
    alert_id         TEXT NOT NULL REFERENCES automation_alerts(id),
    product_id       TEXT NOT NULL REFERENCES products(id),
    stock_at_trigger INTEGER NOT NULL,
    action_taken     TEXT NOT NULL,
    triggered_by     TEXT NOT NULL,
    created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS inventory_adjustments (
    id             TEXT PRIMARY KEY,
    product_id     TEXT NOT NULL REFERENCES products(id),
    adjusted_by    TEXT NOT NULL REFERENCES users(id),
    quantity_delta INTEGER NOT NULL,
    reason         TEXT NOT NULL,
    created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pos_sessions (
    id           TEXT PRIMARY KEY,
    clerk_id     TEXT NOT NULL REFERENCES users(id),
    register_id  TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','closed')),
    opening_cash REAL,
    closing_cash REAL,
    opened_at    TEXT NOT NULL DEFAULT (datetime('now')),
    closed_at    TEXT,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pos_transactions (
    id             TEXT PRIMARY KEY,
    session_id     TEXT NOT NULL REFERENCES pos_sessions(id),
    clerk_id       TEXT NOT NULL REFERENCES users(id),
    customer_id    TEXT REFERENCES users(id),
    total_amount   REAL NOT NULL,
    payment_method TEXT NOT NULL CHECK(payment_method IN ('cash','card','mixed')),
    amount_tendered REAL,
    change_given   REAL,
    created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pos_transaction_items (
    id             TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL REFERENCES pos_transactions(id),
    product_id     TEXT NOT NULL REFERENCES products(id),
    product_name   TEXT NOT NULL,
    unit_price     REAL NOT NULL,
    quantity       INTEGER NOT NULL,
    created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pos_refunds (
    id             TEXT PRIMARY KEY,
    transaction_id TEXT NOT NULL REFERENCES pos_transactions(id),
    processed_by   TEXT NOT NULL REFERENCES users(id),
    refund_amount  REAL NOT NULL,
    reason         TEXT,
    created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id          TEXT PRIMARY KEY,
    actor_id    TEXT REFERENCES users(id),
    service     TEXT NOT NULL,
    action      TEXT NOT NULL,
    target_type TEXT,
    target_id   TEXT,
    metadata    TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
