# Store Automation System — Database Models

Derived from API v1. All tables include `created_at` and `updated_at` timestamps unless noted.

---

## Table of Contents

- [users](#users)
- [refresh_tokens](#refresh_tokens)
- [password_reset_tokens](#password_reset_tokens)
- [categories](#categories)
- [products](#products)
- [inventory_adjustments](#inventory_adjustments)
- [carts](#carts)
- [cart_items](#cart_items)
- [orders](#orders)
- [order_items](#order_items)
- [automation_alerts](#automation_alerts)
- [automation_logs](#automation_logs)
- [pos_sessions](#pos_sessions)
- [pos_transactions](#pos_transactions)
- [pos_transaction_items](#pos_transaction_items)
- [pos_refunds](#pos_refunds)
- [audit_logs](#audit_logs)
- [Relationships](#relationships)

---

## `users`

> Covers `/auth/*` and `/admin/users`. Single table for all roles.

| Column | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | |
| `name` | `VARCHAR(100)` | NOT NULL | |
| `email` | `VARCHAR(255)` | NOT NULL, UNIQUE | |
| `password_hash` | `VARCHAR(255)` | NOT NULL | Never store plaintext |
| `role` | `ENUM` | NOT NULL, DEFAULT `'customer'` | `customer`, `manager`, `admin` |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT `true` | Soft-disable without deleting |
| `created_at` | `TIMESTAMP` | NOT NULL | |
| `updated_at` | `TIMESTAMP` | NOT NULL | |

---

## `refresh_tokens`

> Covers `POST /auth/refresh` and `POST /auth/logout`.

| Column | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | |
| `user_id` | `UUID` | FK → `users.id`, NOT NULL | |
| `token_hash` | `VARCHAR(255)` | NOT NULL, UNIQUE | Store hashed, not raw |
| `expires_at` | `TIMESTAMP` | NOT NULL | |
| `revoked_at` | `TIMESTAMP` | NULLABLE | Set on logout |
| `created_at` | `TIMESTAMP` | NOT NULL | |

---

## `password_reset_tokens`

> Covers `POST /auth/password-reset` and `POST /auth/password-reset/confirm`.

| Column | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | |
| `user_id` | `UUID` | FK → `users.id`, NOT NULL | |
| `token_hash` | `VARCHAR(255)` | NOT NULL, UNIQUE | |
| `expires_at` | `TIMESTAMP` | NOT NULL | Short TTL, e.g. 15 minutes |
| `used_at` | `TIMESTAMP` | NULLABLE | Invalidate after first use |
| `created_at` | `TIMESTAMP` | NOT NULL | |

---

## `categories`

> Supports `?category=` filter on `GET /api/v1/products`.

| Column | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | |
| `name` | `VARCHAR(100)` | NOT NULL, UNIQUE | e.g. `"Dairy"`, `"Beverages"` |
| `slug` | `VARCHAR(100)` | NOT NULL, UNIQUE | URL-safe version of name |
| `created_at` | `TIMESTAMP` | NOT NULL | |
| `updated_at` | `TIMESTAMP` | NOT NULL | |

---

## `products`

> Covers all of `/api/v1/products` and `/api/v1/inventory`. Single source of truth for catalogue + stock.

| Column | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | |
| `category_id` | `UUID` | FK → `categories.id`, NULLABLE | |
| `name` | `VARCHAR(255)` | NOT NULL | |
| `description` | `TEXT` | NULLABLE | |
| `sku` | `VARCHAR(100)` | NOT NULL, UNIQUE | Internal stock-keeping unit |
| `barcode` | `VARCHAR(100)` | UNIQUE, NULLABLE | UPC/EAN for PoS barcode lookup |
| `price` | `DECIMAL(10,2)` | NOT NULL | Public selling price |
| `cost_price` | `DECIMAL(10,2)` | NULLABLE | Admin-only. Used in analytics |
| `stock_quantity` | `INTEGER` | NOT NULL, DEFAULT `0` | Current stock level |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT `true` | Soft-delete instead of hard delete |
| `created_at` | `TIMESTAMP` | NOT NULL | |
| `updated_at` | `TIMESTAMP` | NOT NULL | |

---

## `inventory_adjustments`

> Covers `PATCH /api/v1/inventory/:id`. Append-only log of every stock change.

| Column | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | |
| `product_id` | `UUID` | FK → `products.id`, NOT NULL | |
| `adjusted_by` | `UUID` | FK → `users.id`, NOT NULL | Admin/manager who made the change |
| `quantity_delta` | `INTEGER` | NOT NULL | Positive = stock in, negative = write-off |
| `reason` | `VARCHAR(255)` | NOT NULL | e.g. `"shipment"`, `"correction"`, `"write-off"` |
| `created_at` | `TIMESTAMP` | NOT NULL | No `updated_at` — records are immutable |

---

## `carts`

> Covers `GET /api/v1/cart` and `DELETE /api/v1/cart`. One active cart per user.

| Column | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | |
| `user_id` | `UUID` | FK → `users.id`, NOT NULL, UNIQUE | Enforces one cart per user |
| `created_at` | `TIMESTAMP` | NOT NULL | |
| `updated_at` | `TIMESTAMP` | NOT NULL | |

---

## `cart_items`

> Covers `POST /api/v1/cart/items`, `PATCH /api/v1/cart/items/:id`, `DELETE /api/v1/cart/items/:id`.

| Column | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | |
| `cart_id` | `UUID` | FK → `carts.id`, NOT NULL | |
| `product_id` | `UUID` | FK → `products.id`, NOT NULL | |
| `quantity` | `INTEGER` | NOT NULL, CHECK > 0 | |
| `created_at` | `TIMESTAMP` | NOT NULL | |
| `updated_at` | `TIMESTAMP` | NOT NULL | |

**Unique constraint:** `(cart_id, product_id)` — prevents duplicate rows for the same product.

---

## `orders`

> Covers `POST /api/v1/orders/checkout`, `GET /api/v1/orders`, `GET /api/v1/orders/:id`.

| Column | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | |
| `user_id` | `UUID` | FK → `users.id`, NOT NULL | |
| `status` | `ENUM` | NOT NULL, DEFAULT `'pending'` | `pending`, `confirmed`, `shipped`, `delivered`, `cancelled` |
| `total_amount` | `DECIMAL(10,2)` | NOT NULL | Snapshot at time of checkout |
| `tracking_number` | `VARCHAR(100)` | NULLABLE | Populated when shipped |
| `notes` | `TEXT` | NULLABLE | |
| `created_at` | `TIMESTAMP` | NOT NULL | |
| `updated_at` | `TIMESTAMP` | NOT NULL | |

---

## `order_items`

> The itemized receipt for each order. Prices are snapshotted at checkout — never linked live to `products.price`.

| Column | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | |
| `order_id` | `UUID` | FK → `orders.id`, NOT NULL | |
| `product_id` | `UUID` | FK → `products.id`, NOT NULL | |
| `product_name` | `VARCHAR(255)` | NOT NULL | Snapshot — preserves name if product is renamed |
| `unit_price` | `DECIMAL(10,2)` | NOT NULL | Snapshot — preserves price at time of purchase |
| `quantity` | `INTEGER` | NOT NULL | |
| `created_at` | `TIMESTAMP` | NOT NULL | |

---

## `automation_alerts`

> Covers `GET/POST/PATCH/DELETE /api/v1/automation/alerts`.

| Column | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | |
| `product_id` | `UUID` | FK → `products.id`, NOT NULL | |
| `created_by` | `UUID` | FK → `users.id`, NOT NULL | |
| `threshold` | `INTEGER` | NOT NULL | Fire when `stock_quantity` drops below this |
| `action` | `ENUM` | NOT NULL | `email`, `reorder`, `slack_notify` — extend as needed |
| `is_active` | `BOOLEAN` | NOT NULL, DEFAULT `true` | |
| `created_at` | `TIMESTAMP` | NOT NULL | |
| `updated_at` | `TIMESTAMP` | NOT NULL | |

---

## `automation_logs`

> Covers `GET /api/v1/automation/history`. Append-only record of every trigger that fired.

| Column | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | |
| `alert_id` | `UUID` | FK → `automation_alerts.id`, NOT NULL | |
| `product_id` | `UUID` | FK → `products.id`, NOT NULL | Denormalized for easy querying |
| `stock_at_trigger` | `INTEGER` | NOT NULL | Snapshot of stock when the rule fired |
| `action_taken` | `VARCHAR(255)` | NOT NULL | Description of what the backend did |
| `triggered_by` | `VARCHAR(100)` | NOT NULL | Service name, e.g. `"ruby-worker"`, `"rust-scheduler"` |
| `created_at` | `TIMESTAMP` | NOT NULL | No `updated_at` — records are immutable |

---

## `pos_sessions`

> Covers `POST /api/v1/pos/sessions` and `PATCH /api/v1/pos/sessions/:id`.

| Column | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | |
| `clerk_id` | `UUID` | FK → `users.id`, NOT NULL | |
| `register_id` | `VARCHAR(50)` | NOT NULL | Physical register identifier |
| `status` | `ENUM` | NOT NULL, DEFAULT `'open'` | `open`, `closed` |
| `opening_cash` | `DECIMAL(10,2)` | NULLABLE | Starting float |
| `closing_cash` | `DECIMAL(10,2)` | NULLABLE | Populated on close |
| `opened_at` | `TIMESTAMP` | NOT NULL | |
| `closed_at` | `TIMESTAMP` | NULLABLE | |
| `created_at` | `TIMESTAMP` | NOT NULL | |
| `updated_at` | `TIMESTAMP` | NOT NULL | |

---

## `pos_transactions`

> Covers `POST /api/v1/pos/transactions` and `GET /api/v1/pos/receipt/:id`.

| Column | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | |
| `session_id` | `UUID` | FK → `pos_sessions.id`, NOT NULL | |
| `clerk_id` | `UUID` | FK → `users.id`, NOT NULL | |
| `customer_id` | `UUID` | FK → `users.id`, NULLABLE | Null for anonymous walk-in customers |
| `total_amount` | `DECIMAL(10,2)` | NOT NULL | |
| `payment_method` | `ENUM` | NOT NULL | `cash`, `card`, `mixed` |
| `amount_tendered` | `DECIMAL(10,2)` | NULLABLE | For cash payments |
| `change_given` | `DECIMAL(10,2)` | NULLABLE | For cash payments |
| `created_at` | `TIMESTAMP` | NOT NULL | |

---

## `pos_transaction_items`

> Line items for each PoS transaction. Mirrors `order_items` — prices are always snapshotted.

| Column | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | |
| `transaction_id` | `UUID` | FK → `pos_transactions.id`, NOT NULL | |
| `product_id` | `UUID` | FK → `products.id`, NOT NULL | |
| `product_name` | `VARCHAR(255)` | NOT NULL | Snapshot |
| `unit_price` | `DECIMAL(10,2)` | NOT NULL | Snapshot |
| `quantity` | `INTEGER` | NOT NULL | |
| `created_at` | `TIMESTAMP` | NOT NULL | |

---

## `pos_refunds`

> Covers `POST /api/v1/pos/refunds`.

| Column | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | |
| `transaction_id` | `UUID` | FK → `pos_transactions.id`, NOT NULL | Original transaction being refunded |
| `processed_by` | `UUID` | FK → `users.id`, NOT NULL | Clerk who processed the return |
| `refund_amount` | `DECIMAL(10,2)` | NOT NULL | May be partial |
| `reason` | `VARCHAR(255)` | NULLABLE | |
| `created_at` | `TIMESTAMP` | NOT NULL | |

---

## `audit_logs`

> Covers `GET /api/v1/admin/audit-logs`. Append-only. Written to by all backend services.

| Column | Type | Constraints | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PK | |
| `actor_id` | `UUID` | FK → `users.id`, NULLABLE | Null for system/automated actions |
| `service` | `VARCHAR(100)` | NOT NULL | e.g. `"ruby-api"`, `"rust-scheduler"`, `"python-analytics"` |
| `action` | `VARCHAR(255)` | NOT NULL | e.g. `"user.role_changed"`, `"product.deleted"` |
| `target_type` | `VARCHAR(100)` | NULLABLE | e.g. `"User"`, `"Product"` |
| `target_id` | `UUID` | NULLABLE | ID of the affected record |
| `metadata` | `JSONB` | NULLABLE | Arbitrary context — before/after values, IP, etc. |
| `created_at` | `TIMESTAMP` | NOT NULL | No `updated_at` — records are immutable |

---

## Relationships

```
users ──────────────┬── refresh_tokens
                    ├── password_reset_tokens
                    ├── carts ──── cart_items ──── products
                    ├── orders ─── order_items ─── products
                    ├── automation_alerts ────────── products
                    ├── pos_sessions ─── pos_transactions ─── pos_transaction_items ── products
                    │                            └── pos_refunds
                    ├── inventory_adjustments ──── products
                    └── audit_logs

products ── categories
products ── automation_logs ── automation_alerts
```
