# AM Collection — API Routes (server.js)

Frontend (`public/js/store.js`, `public/js/admin.js`) inhi routes ko
inhi shapes mein call karta hai.

## Public
- `GET /health` → `{ ok, service, time }`
- `GET /api/categories` → `{ categories: [...] }`
- `GET /api/products?category&search&sort&page&limit` → `{ products: [...], page }`
  (sort: `newest` | `price_asc` | `price_desc` | `popular`)
- `GET /api/products/:slug` → `{ product, variants: [...] }`
- `POST /api/delivery/quote` — body `{ items: [{productId, quantity, variantId, size}], province, city }` (size ho to us size ki price `products.size_prices` se server khud leta hai)
  → `{ subtotal, deliveryFee, grandTotal, freeAbove }` (preview only; final fee order par dobara calculate hoti hai)

## Orders
- `POST /api/orders` — **Header lazmi:** `Idempotency-Key: <uuid>`
  Body:
  ```json
  {
    "customer": { "fullName": "...", "mobile": "03XX...", "email": "optional" },
    "address": { "province": "...", "city": "...", "area": "...", "houseAddress": "...", "postalCode": "optional" },
    "paymentMethod": "COD | JAZZCASH | EASYPAISA | NAYAPAY",
    "couponCode": "optional",
    "items": [{ "productId": 1, "variantId": null, "quantity": 1, "variantName": "optional", "size": "34 (optional — size_prices wale product par lazmi)" }]
  }
  ```
  → `201 { orderNumber: "ORD-YYYYMMDD-001", grandTotal, subtotal, discount, deliveryFee, paymentMethod, paymentNumber, nextStep }`
  Duplicate key par → `200 { duplicate: true, order }` (naya order nahi banta)
  Checkout par **Nearby Landmark aur Order Notes fields NAHI hain** — na UI mein,
  na is payload mein. **Auto-save:** order place hote hi order + checkout par
  likha gaya poora delivery address (snapshot) backend mein usi transaction
  mein save ho jata hai aur Admin Orders mein foran nazar ata hai — koi alag
  "save address" step ya approval nahi. Customer logged in ho (Bearer token)
  to wahi address us ki address book (`addresses` table) mein bhi khud save
  ho jata hai (duplicate nahi banta). "Confirm Order" sirf order-status
  action hai, saving se us ka koi taalluq nahi.
- `GET /api/orders/track?orderNumber&phone` → `{ order, history: [...] }`

## Customer Auth
- `POST /api/auth/register` `{ fullName, email, phone, password }` → `{ token, user }`
- `POST /api/auth/login` `{ email, password }` → `{ token, user }`
- `GET /api/auth/me/orders` (Bearer token) → `{ orders: [...] }`

## Pages
- `GET /api/pages/about` (public) → `{ pictureUrl: "/uploads/about-page.jpg" | null }`
  — About page ki picture ka path (`store_settings` key `about_picture`); set na ho
  ya file maujood na ho to `null` (storefront sirf text dikhata hai, broken image NAHI).
- `POST /api/admin/about-picture` (sirf admin token) — raw image body,
  `Content-Type: image/jpeg | image/png | image/webp | image/gif`, max 5MB
  → `{ ok: true, pictureUrl }` — file `public/uploads/` mein save, path `store_settings` mein.
- `DELETE /api/admin/about-picture` (sirf admin token) → `{ ok: true, pictureUrl: null }`

## Complaints
- `POST /api/complaints` (public, login zaroori nahi) — body `{ name, mobile, orderNumber (optional), message }`
  → `201 { message: "Your complaint has been received", complaint: {..., status: "NEW"} }`
  Ghalat naam/mobile/message par `422`. Complaint `complaints` table mein save hoti hai.
- `GET /api/admin/complaints?status&page&limit` (sirf admin token) → `{ complaints: [...], page, summary }`
  ⚠️ Complaints **strictly admin-only** hain — koi public read/list endpoint NAHI hai;
  customer ko submit par sirf "Your complaint has been received" ki confirmation dikhti hai.

## Payments (server-to-server)
- `POST /api/payments/callback/:provider` — JazzCash / Easypaisa / NayaPay.
  HMAC signature verify + amount + order number match ke baghair PAID nahi hota.

## Admin Login
- `POST /api/admin/login` `{ username, password }` -> `{ token, user: { username, role: "admin" } }`
  Credentials server ki `.env` ke `ADMIN_USER` / `ADMIN_PASSWORD` se check hote hain
  (initial temporary: `admin` / `AM-Admin-786` — **live se pehle lazmi change karein**).
  Ghalat credentials -> `401`. Ye token customer token se alag hai; admin page
  usay browser mein save karke apni tamam admin API calls ke saath bhejta hai.
  **Storefront entry point:** yehi endpoint website ke aam Login screen
  (`#/login`, `public/js/store.js` → `pageAuth`) se bhi call hota hai —
  owner wahan admin username/password dale to token `amc-admin-token`
  mein save karke browser `/admin` dashboard par chala jata hai
  (owner ko `#/admin` / `/admin` type NAHI karna padta). Email wale
  customer login par pehle `POST /api/auth/login` try hota hai aur
  admin sirf fallback hai; bina `@` wala identifier seedha admin se
  verify hota hai. Customer token se admin route kabhi NAHI khulta.

## Admin (Bearer ADMIN token lazmi — baghair token ke 401, customer token par 403)
- `GET /api/admin/dashboard` → `{ today: {orders, revenue}, pendingConfirmation, lowStock, recentOrders }`
- `GET /api/admin/orders?status&page` → `{ orders: [...] }`
- `GET /api/admin/orders/:orderNumber` → `{ order, items, payment, shipment }`
- `PATCH /api/admin/orders/:orderNumber/status` `{ status, courier, trackingNumber, note }`
  (status: PENDING_CONFIRMATION, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED)
- `PATCH /api/admin/orders/:orderNumber/payment` `{ paymentStatus }` — COD reconciliation
- `POST /api/admin/products` `{ name, slug, sku, categoryId, price, discountPrice, costPrice, stockQty, description, braType, sizePrices }`
  (`sizePrices` = per-size prices, JSON object ya JSON string, misaal Floral Print Full-Coverage Bra & Underwear Set: `{"32":2000,"34":2175,"36":2350,"38":2525}` — har bara size +Rs. 175; base `price` hamesha sab se chhote size ki price save hoti hai. Order par server price selected size se `products.size_prices` se dobara calculate karta hai — client price kabhi use nahi hoti.)
  (`braType` sirf Women Underwear and Bras subcategory ke products ke liye — 14 allowed types schema ke `products.bra_type` CHECK mein hain; product response mein `bra_type` ke naam se wapas aata hai aur storefront specifications mein dikhta hai)
- `PATCH /api/admin/products/:id` — name, price, discount_price, cost_price, stock_qty, description, is_active, category_id, bra_type, size_prices

## Reviews — Customer Reviews with Admin Approval
Flow: customer review submit karta hai → review `PENDING` save hota hai aur
publicly NAHI dikhta → sirf admin ko Admin Dashboard → Reviews mein dikhta
hai → admin **Approve** kare tab hi wo product page / public API par sab ko
dikhta hai. **Reject** = kabhi public nahi; admin **Delete** bhi kar sakta hai.

### Public
- `GET /api/products/:slug/reviews` → `{ reviews: [...], count, averageRating }`
  — **sirf `status='APPROVED'` reviews.** Pending/Rejected is response mein kabhi nahi aate.
  Har review: `{ id, product_id, customer_name, rating, title, body, status, created_at }`
- `GET /api/reviews?productId=<id>` ya `?productSlug=<slug>` → upar wala hi shape (sirf approved)
- `GET /api/products/:slug` ke response mein bhi `reviews` (sirf approved) aur
  `reviewSummary: { count, averageRating }` shamil hain — average bhi sirf approved se banta hai.
- `POST /api/products/:slug/reviews` — naya review submit (login zaroori nahi)
  Body: `{ "customerName": "...", "rating": 1-5, "title": "optional", "body": "review text" }`
  (`name` / `reviewText` naam bhi accept hote hain)
  → `201 { message, review: {..., status: "PENDING"}, status: "PENDING", publiclyVisible: false }`
  Naya review hamesha `PENDING` banta hai — `status`/`is_approved` client se set nahi ho sakta.
- `POST /api/reviews` — waisa hi submit, body mein `productId` ya `productSlug` ke saath.

### Admin (Bearer token + role admin/staff lazmi) — Reviews moderation
- `GET /api/admin/reviews?status=PENDING|APPROVED|REJECTED&productId&page&limit`
  → `{ reviews: [...], page, summary: { PENDING, APPROVED, REJECTED, total } }`
  — admin ko **saaray** reviews har status ke saath dikhte hain (product name/slug ke saath).
- `PATCH /api/admin/reviews/:id/approve` `{}` → review `APPROVED` (+ `is_approved=true`) — ab publicly dikhega
- `PATCH /api/admin/reviews/:id/reject` `{}` → review `REJECTED` (+ `is_approved=false`) — public ko kabhi nahi dikhega
- `PATCH /api/admin/reviews/:id/status` `{ "status": "PENDING | APPROVED | REJECTED" }` — generic status change
- `DELETE /api/admin/reviews/:id` → review delete → `{ ok: true, deleted: true, id }`

