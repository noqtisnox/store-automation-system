# Store Automation System - API v1 Spec

## Authentication

| Method | Endpoint | Description | Body / Notes |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/signup` | Create a new account | `{ email, password, name }` |
| `POST` | `/auth/login` | Authenticate user | Returns `{ token, user }` |
| `POST` | `/auth/logout` | Invalidate session | Requires Auth |

---

## Catalogue (Products)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/products` | List all available products |
| `GET` | `/products/:id` | Get detailed info for one product |
| `POST` | `/products` | Add new product (Admin Only) |
| `PATCH` | `/products/:id` | Update product details |
| `DELETE` | `/products/:id` | Remove product from store |

---

## Shopping Cart

| Method | Endpoint | Description | Body / Notes |
| :--- | :--- | :--- | :--- |
| `GET` | `/cart` | View items in current cart | |
| `POST` | `/cart/items` | Add a product to cart | `{ product_id, quantity }` |
| `PATCH` | `/cart/items/:id` | Update item quantity | `{ quantity }` |
| `DELETE` | `/cart/items/:id` | Remove item from cart | |
| `DELETE` | `/cart` | Clear entire cart | |

---

## Orders & Checkout

| Method | Endpoint | Description | Notes |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/orders/checkout` | Process the current cart | Converts cart items to a permanent order. |
| `GET` | `/api/v1/orders` | List user's order history | Returns a list of past purchases and statuses. |
| `GET` | `/api/v1/orders/:id` | Get specific order details | Includes tracking info and itemized receipt. |

---

## Automation Control

| Method | Endpoint | Description | Notes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/automation/alerts` | List all active triggers | e.g., "Notify if Milk < 10 units." |
| `POST` | `/api/v1/automation/alerts` | Create a new stock trigger | Body: `{ product_id, threshold, action }`. |
| `DELETE` | `/api/v1/automation/alerts/:id`| Remove an automation rule | Stops the trigger from firing. |
| `GET` | `/api/v1/automation/history` | View automation logs | See when a backend automatically sent an email. |

---

## Admin Management

| Method | Endpoint | Description | Notes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/inventory` | Full inventory overview | Includes "hidden" metadata like cost-price. |
| `GET` | `/api/v1/admin/analytics` | Sales & performance data | Good for your Python/Data-science experiments. |
| `GET` | `/api/v1/admin/audit-logs` | System-wide activity feed | Shows which backend (Ruby, Rust, etc.) did what. |
| `PATCH` | `/api/v1/admin/users/:id` | Change user roles/permissions | e.g., Promoting a user to "Manager". |

---

## Point of Sale (PoS)

| Method | Endpoint | Description | Notes |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/pos/sessions` | Open a Register Session | Assigns a clerk to a specific physical register. |
| `GET` | `/api/v1/pos/products/:barcode` | Fast barcode lookup | Specialized route to find a product by SKU/UPC. |
| `POST` | `/api/v1/pos/transactions` | Immediate Checkout | Skips the "cart" logic; processes items + payment at once. |
| `POST` | `/api/v1/pos/refunds` | Process In-store Return | Links to a previous transaction ID. |
| `GET` | `/api/v1/pos/receipt/:id` | Generate print-ready data | Often returns a simplified text/thermal printer format. |
