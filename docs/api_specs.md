# Store Automation System — API Reference v1

All protected endpoints require `Authorization: Bearer <token>` in the request header.

---

## Table of Contents

- [Authentication](#-authentication)
- [Catalogue (Products)](#-catalogue-products)
- [Shopping Cart](#-shopping-cart)
- [Orders & Checkout](#-orders--checkout)
- [Automation Control](#️-automation-control)
- [Inventory Management](#-inventory-management)
- [Admin Management](#️-admin-management)
- [Point of Sale (PoS)](#️-point-of-sale-pos)

---

## Authentication

> New tokens are issued on login. Use `/auth/refresh` to renew before expiry.

| Method | Endpoint | Description | Body / Notes |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/signup` | Create a new account | `{ email, password, name }` |
| `POST` | `/api/v1/auth/login` | Authenticate user | Returns `{ token, user }` |
| `POST` | `/api/v1/auth/logout` | Invalidate session | Requires Auth |
| `POST` | `/api/v1/auth/refresh` | Refresh access token | Returns new `{ token }` |
| `POST` | `/api/v1/auth/password-reset` | Request password reset | `{ email }` |
| `POST` | `/api/v1/auth/password-reset/confirm` | Confirm password reset | `{ token, new_password }` |

---

## Catalogue (Products)

> Supports `?search=`, `?category=`, and `?page=` query params on the list endpoint.

| Method | Endpoint | Description | Body / Notes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/products` | List all available products | Supports `search`, `category`, `page` params |
| `GET` | `/api/v1/products/:id` | Get detailed info for one product | — |
| `POST` | `/api/v1/products` | Add new product | Admin only. `{ name, price, sku, stock, ... }` |
| `PATCH` | `/api/v1/products/:id` | Update product details | Admin only |
| `DELETE` | `/api/v1/products/:id` | Remove product from store | Admin only |

---

## Shopping Cart

> Cart is scoped to the authenticated user via their session token.

| Method | Endpoint | Description | Body / Notes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/cart` | View items in current cart | — |
| `POST` | `/api/v1/cart/items` | Add a product to cart | `{ product_id, quantity }` |
| `PATCH` | `/api/v1/cart/items/:id` | Update item quantity | `{ quantity }` |
| `DELETE` | `/api/v1/cart/items/:id` | Remove item from cart | — |
| `DELETE` | `/api/v1/cart` | Clear entire cart | — |

---

## Orders & Checkout

> Checkout converts the active cart into a permanent, immutable order record.

| Method | Endpoint | Description | Body / Notes |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/orders/checkout` | Process the current cart | Converts cart items to a permanent order |
| `GET` | `/api/v1/orders` | List user's order history | Returns past purchases and statuses |
| `GET` | `/api/v1/orders/:id` | Get specific order details | Includes tracking info and itemized receipt |
| `GET` | `/api/v1/orders/:id/status` | Lightweight order status poll | For non-WebSocket order tracking |

---

## Automation Control

> Triggers fire backend actions (e.g. email alerts, auto-reorder) when stock thresholds are crossed.

| Method | Endpoint | Description | Body / Notes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/automation/alerts` | List all active triggers | e.g. "Notify if Milk < 10 units" |
| `POST` | `/api/v1/automation/alerts` | Create a new stock trigger | `{ product_id, threshold, action }` |
| `PATCH` | `/api/v1/automation/alerts/:id` | Edit an existing trigger | `{ threshold, action }` |
| `DELETE` | `/api/v1/automation/alerts/:id` | Remove an automation rule | Stops the trigger from firing |
| `GET` | `/api/v1/automation/history` | View automation logs | See when a backend auto-sent an email, etc. |

---

## Inventory Management

> Separate from the admin analytics overview — these routes write directly to stock levels.

| Method | Endpoint | Description | Body / Notes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/inventory` | Full inventory overview | Admin only. Includes cost-price metadata |
| `PATCH` | `/api/v1/inventory/:id` | Adjust stock level | Admin only. `{ quantity, reason }` — for shipments, corrections, write-offs |

---

## Admin Management

> Requires elevated role (Admin or Manager). Standard users will receive `403 Forbidden`.

| Method | Endpoint | Description | Body / Notes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/users` | List all users | Paginated. Supports `?role=` filter |
| `PATCH` | `/api/v1/admin/users/:id` | Change user roles/permissions | e.g. Promoting a user to "Manager" |
| `GET` | `/api/v1/admin/analytics` | Sales & performance data | Good for Python/data-science experiments |
| `GET` | `/api/v1/admin/audit-logs` | System-wide activity feed | Shows which backend (Ruby, Rust, etc.) did what |

---

## Point of Sale (PoS)

> Designed for in-store terminals. Bypasses cart logic for direct, immediate transactions.

| Method | Endpoint | Description | Body / Notes |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/pos/sessions` | Open a register session | Assigns a clerk to a specific physical register |
| `PATCH` | `/api/v1/pos/sessions/:id` | Close / reconcile register | `{ status: "closed", cash_total }` |
| `GET` | `/api/v1/pos/products/:barcode` | Fast barcode lookup | Find product by SKU/UPC |
| `POST` | `/api/v1/pos/transactions` | Immediate checkout | Skips cart; processes items + payment at once |
| `POST` | `/api/v1/pos/refunds` | Process in-store return | Links to a previous `transaction_id` |
| `GET` | `/api/v1/pos/receipt/:id` | Generate print-ready receipt | Returns simplified text/thermal printer format |
