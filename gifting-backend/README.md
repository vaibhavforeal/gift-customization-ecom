# Gifting Backend

Backend API for a customizable gift hamper business — terracotta, sweets, dry fruits — with optional Razorpay payment and an admin dashboard API.

**Stack:** Node.js + TypeScript + Express + Prisma + PostgreSQL.
**Frontend:** built separately (e.g. in your UI design tool) — it just calls this API.

---

## Quick start

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally (or a hosted DB like Neon / Supabase / Railway)
- A Razorpay account with test API keys

### 2. Install

```bash
npm install
```

### 3. Configure

```bash
cp .env.example .env
```

Edit `.env`:

- Set `DATABASE_URL` to your Postgres connection string.
- Generate a `JWT_SECRET`:
  ```bash
  openssl rand -hex 64
  ```
- Paste your Razorpay test keys (`rzp_test_...` and the secret) from
  Razorpay Dashboard → Account & Settings → API Keys.

### 4. Database

```bash
npm run prisma:migrate -- --name init
npm run prisma:generate
npm run seed
```

You now have 7 sample products in the DB.

### 5. Create an admin

```bash
npm run create:admin
```

Enter email, optional name, password.

### 6. Run

```bash
npm run dev
```

Server is live at <http://localhost:4000>.

Health check: `GET http://localhost:4000/api/health`.

Inspect DB visually any time:
```bash
npm run prisma:studio
```

---

## Project layout

```
src/
  config/        env loader, prisma singleton
  middleware/    auth (JWT), error handler
  utils/         razorpay helpers, pricing, jwt, orderNumber
  validators/    zod schemas for every body
  routes/        all express routers
  scripts/       createAdmin.ts
  app.ts         express app factory
  server.ts      entry point
prisma/
  schema.prisma  data model
  seed.ts        sample products
uploads/         local image storage (swap for Cloudinary in production)
```

---

## API reference

Base URL: `http://localhost:4000/api`

All request/response bodies are JSON.

### Public endpoints

#### `GET /products?category=TERRACOTTA`
List active products. `category` optional (`TERRACOTTA | SWEET | DRYFRUIT | OTHER`).

Response:
```json
{
  "products": [
    {
      "id": "ckxxx",
      "name": "Handcrafted Terracotta Diya Set (4 pcs)",
      "description": "...",
      "category": "TERRACOTTA",
      "imageUrl": "https://...",
      "pricingTiers": [
        { "minQty": 1, "maxQty": 4, "unitPrice": 250 },
        { "minQty": 5, "maxQty": 9, "unitPrice": 220 },
        { "minQty": 10, "maxQty": null, "unitPrice": 190 }
      ]
    }
  ]
}
```

#### `GET /products/:id`
Single product details.

#### `POST /quote`
Returns running line-items + subtotal. Use for the live price total as the customer builds the hamper.

Request:
```json
{
  "items": [
    { "productId": "ckxxx", "quantity": 3 },
    { "productId": "ckyyy", "quantity": 2 }
  ]
}
```

Response:
```json
{
  "items": [
    {
      "productId": "ckxxx",
      "productName": "Terracotta Diya Set",
      "imageUrl": "https://...",
      "quantity": 3,
      "unitPrice": 250,
      "subtotal": 750
    }
  ],
  "subtotal": 750
}
```

#### `POST /orders`
Submit a new order. **Payment is not required** — order is saved as `PENDING/UNPAID`.

Request:
```json
{
  "customerName": "Vaibhav",
  "customerPhone": "9876543210",
  "customerEmail": "v@example.com",
  "shippingAddress": "123 Main St, Shivamogga, KA 577201",
  "occasion": "house-warming",
  "notes": "Please pack with red ribbon",
  "items": [
    { "productId": "ckxxx", "quantity": 3 },
    { "productId": "ckyyy", "quantity": 2 }
  ]
}
```

Response:
```json
{
  "orderId": "ckzzz",
  "orderNumber": "ORD-2026-0001",
  "subtotal": 1190,
  "itemCount": 2,
  "status": "PENDING",
  "paymentStatus": "UNPAID"
}
```

#### `GET /orders/:id`
Public order status lookup (uses order id, not number).

#### `POST /orders/:id/pay`
If the customer wants to pay online, call this. Returns data for Razorpay Checkout.

Response:
```json
{
  "razorpayKeyId": "rzp_test_xxx",
  "razorpayOrderId": "order_xxx",
  "amount": 119000,
  "currency": "INR",
  "orderNumber": "ORD-2026-0001",
  "prefill": { "name": "Vaibhav", "email": "v@example.com", "contact": "9876543210" }
}
```

Frontend usage (vanilla):
```js
const rzp = new Razorpay({
  key: data.razorpayKeyId,
  amount: data.amount,
  currency: data.currency,
  order_id: data.razorpayOrderId,
  name: "Your Gifting Brand",
  description: data.orderNumber,
  prefill: data.prefill,
  handler: async (response) => {
    // response has razorpay_order_id, razorpay_payment_id, razorpay_signature
    await fetch("/api/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
      }),
    });
  },
});
rzp.open();
```

Add the Razorpay Checkout script to your frontend HTML:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

#### `POST /payments/verify`
Verifies the signature server-side and marks the order PAID.

Request:
```json
{
  "razorpayOrderId": "order_xxx",
  "razorpayPaymentId": "pay_xxx",
  "razorpaySignature": "abc123..."
}
```

### Admin endpoints

All admin endpoints (except login) require `Authorization: Bearer <token>`.

#### `POST /admin/auth/login`
```json
{ "email": "admin@x.com", "password": "..." }
```
Returns `{ token, admin }`.

#### `GET /admin/products`
List all products (including inactive).

#### `POST /admin/products`
Create a product.
```json
{
  "name": "Saffron 1g",
  "description": "...",
  "category": "DRYFRUIT",
  "imageUrl": "http://localhost:4000/uploads/1234-saffron.jpg",
  "isActive": true,
  "pricingTiers": [
    { "minQty": 1, "maxQty": 9, "unitPrice": 350 },
    { "minQty": 10, "maxQty": null, "unitPrice": 320 }
  ]
}
```

#### `PUT /admin/products/:id`
Update a product. Pricing tiers are replaced entirely.

#### `DELETE /admin/products/:id`
Soft delete (sets `isActive=false`). Preserves old orders.

#### `POST /admin/products/upload-image`
Multipart form upload. Field name: `image`. Max 5 MB.
Returns `{ url, filename, size }`. Paste the `url` into the product form.

```bash
curl -X POST http://localhost:4000/api/admin/products/upload-image \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@./diya.jpg"
```

#### `GET /admin/orders?status=PENDING&paymentStatus=UNPAID&q=vaibhav&page=1&pageSize=20`
List orders with filters and pagination.

#### `GET /admin/orders/:id`
Full order detail with items + product info.

#### `PATCH /admin/orders/:id`
Update status / payment status.
```json
{ "status": "CONFIRMED", "paymentStatus": "PAID" }
```

#### `GET /admin/stats`
Dashboard summary.
```json
{
  "ordersToday": 5,
  "ordersThisWeek": 32,
  "pendingOrders": 8,
  "unpaidOrders": 12,
  "revenuePaidLast7Days": 28450,
  "ordersByStatus": {
    "PENDING": 8,
    "CONFIRMED": 4,
    "PACKED": 2,
    "DELIVERED": 18
  }
}
```

---

## Order lifecycle

Two independent state machines:

**Order status** (you drive it from admin):
`PENDING → CONFIRMED → PACKED → DELIVERED`
(or `CANCELLED` at any point)

**Payment status:**
`UNPAID → PAID` (via Razorpay verify) or admin can manually PATCH to `PAID` if customer pays cash.

This separation handles all your real-world cases:
- submitted but not paid (you call/WhatsApp them)
- paid but not packed (warehouse queue)
- delivered with cash (mark paid manually after)

---

## Pricing logic

`Product` has multiple `PricingTier` rows. Each tier specifies `[minQty, maxQty]` and a `unitPrice`. `maxQty: null` means "no upper bound".

When the customer adds quantity Q of a product, the backend finds the tier where `minQty ≤ Q ≤ maxQty` and uses that `unitPrice`. The customer never sees or sends a price — `POST /quote` and `POST /orders` recompute everything server-side.

`OrderItem.unitPrice` is snapshotted at order time, so editing product pricing later does not retroactively change old orders.

---

## Production checklist

Before going live with `rzp_live_...` keys:

- [ ] Move uploads from local disk to Cloudinary / Supabase Storage / S3. Replace the multer config in `src/routes/admin.products.ts`.
- [ ] Set strong `JWT_SECRET` (regenerate, don't reuse the dev one).
- [ ] Use a managed Postgres (Neon / Supabase / RDS). Set `DATABASE_URL` accordingly.
- [ ] Set `NODE_ENV=production` and `FRONTEND_ORIGIN` to your real frontend domain.
- [ ] Add rate limiting (e.g. `express-rate-limit`) on `/api/admin/auth/login` and `/api/orders`.
- [ ] Add a webhook endpoint for Razorpay payment events (covers cases where the customer closes the browser after paying — your webhook fires anyway). Razorpay → Settings → Webhooks.
- [ ] Daily DB backup.
- [ ] HTTPS only (your hosting platform usually handles this).
- [ ] FSSAI license uploaded in your Razorpay merchant profile (required for food category).

---

## Next pieces you might want

- Razorpay webhook handler so payment confirmation works even when the customer closes the browser before the redirect.
- WhatsApp order confirmation via Twilio (you already have an N8N + Twilio setup — easy to plug in).
- An "Inventory" model with stock count + reorder alerts.
- Coupon codes / discount logic.
- A separate `Hamper` model for pre-curated hampers ("Classic Wedding Hamper") in addition to fully custom builds.
