/**
 * AM Collection — Node.js + Express Backend
 * Brand: AM Collection | Payments: COD, JazzCash, Easypaisa, NayaPay (03147656328)
 * Features: Secure order creation, server-side delivery calculation,
 *           customer reviews with admin approval (PENDING -> APPROVED/REJECTED),
 *           transactional stock handling, idempotency (no duplicate orders),
 *           signed payment-callback verification, admin order management.
 *
 * Run:  npm install && cp .env.example .env && node server.js
 * Deps: express pg bcryptjs jsonwebtoken helmet cors express-rate-limit dotenv
 * DB:   PostgreSQL — database/schema.sql (server.js ki queries se matched:
 *       integer IDs, products.stock_qty, orders.order_status/payment_status)
 *       + database/seed-watches.sql (79 watches). Render par dono files
 *       scripts/init-db.js se build ke waqt khud chal jati hain.
 * Render: PORT hosting deti hai (process.env.PORT) — neeche wahi bind hota
 *       hai; database SSL ke liye PGSSL=true rakhein (Render Postgres par
 *       SSL lazmi hai; render.com wali DATABASE_URL par khud bhi on ho jata
 *       hai). Poori deploy guide README.md -> "RENDER PAR FREE DEPLOY".
 */

require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) console.warn('[WARN] JWT_SECRET not set — set it in .env before production.');

// ---------- Admin Dashboard login credentials (.env se) ----------
// Dashboard SIRF in credentials se khulta hai — POST /api/admin/login
// inhi se verify karta hai. Owner website ke aam Login screen par
// yehi username/password dalta hai to dashboard khud khul jata hai
// (#/admin ya /admin type NAHI karna padta); /admin page fallback
// hai. Storefront (customer side) par admin ka koi visible link
// NAHI hai. Ye INITIAL / TEMPORARY values hain — website live
// karne se PEHLE .env mein ADMIN_USER aur khaas tor par
// ADMIN_PASSWORD lazmi change karein.
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AM-Admin-786';
if (!process.env.ADMIN_PASSWORD) console.warn('[WARN] ADMIN_PASSWORD .env mein set nahi — temporary default use ho raha hai. Live se pehle .env mein ADMIN_PASSWORD change karein.');

// ---------- Database ----------
const RENDER_DB = /render\.com|sslmode=require/.test(process.env.DATABASE_URL || '');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: (process.env.PGSSL === 'true' || RENDER_DB) ? { rejectUnauthorized: false } : false,
  max: 20, idleTimeoutMillis: 30000,
});
pool.on('error', (e) => console.error('[PG] pool error', e.message));

// ---------- Middleware ----------
app.use(helmet());
app.use(cors({ origin: (process.env.CORS_ORIGINS || 'http://localhost:3000').split(','), credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true })); // payment callbacks post form data
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));
app.use('/api/orders', rateLimit({ windowMs: 60 * 1000, max: 20 })); // tighter on checkout

const asyncH = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const money = (n) => Math.round(Number(n) || 0);
const todayStr = () => new Date().toISOString().slice(0, 10).replace(/-/g, '');

// ---------- Size-based pricing (products.size_prices) ----------
// size_prices = { "32": 2000, "34": 2175, "36": 2350, "38": 2525 } — har size ki apni price;
// products.price hamesha sab se chhote size ki price hoti hai (base price). Order/quote mein
// price SERVER database se size ke hisaab se dobara calculate karta hai — client ki bheji
// price par kabhi bharosa nahi hota.
function parseSizePrices(raw) {
  let sp = raw;
  if (typeof sp === 'string') { try { sp = JSON.parse(sp); } catch { return null; } }
  if (!sp || typeof sp !== 'object' || Array.isArray(sp)) return null;
  const out = {};
  for (const [k, v] of Object.entries(sp)) { const n = money(v); if (String(k).trim() && n > 0) out[String(k)] = n; }
  return Object.keys(out).length ? out : null;
}
function sortedSizes(sp) { return Object.keys(sp).sort((a, b) => (parseFloat(a) - parseFloat(b)) || (a < b ? -1 : 1)); }
function sizePriceFor(row, size) {
  const sp = parseSizePrices(row && row.size_prices);
  if (!sp) return null;
  if (size != null && sp[String(size)] != null) return sp[String(size)];
  return sp[sortedSizes(sp)[0]]; // size na mile to sab se chhota size (base price)
}

// ---------- Delivery calculation (SERVER-SIDE ONLY — never trust client totals) ----------
/**
 * Rules (editable via store_settings / env):
 *  - Standard delivery: Rs. 200 (matches user's checkout design: 2000 + 200 = 2200)
 *  - FREE delivery on subtotal >= Rs. 5,000
 *  - Remote provinces (Balochistan, Gilgit-Baltistan): + Rs. 100
 *  - Same-city (store city, default Bahawalnagar) orders >= Rs. 3,000: Rs. 150
 *  - + Rs. 50 per extra kg over 2kg if weight data is present on products
 */
const DELIVERY = {
  base: money(process.env.DELIVERY_BASE || 200),
  freeAbove: money(process.env.DELIVERY_FREE_ABOVE || 5000),
  remoteSurcharge: 100,
  remoteProvinces: ['Balochistan', 'Gilgit-Baltistan', 'Gilgit Baltistan'],
  storeCity: (process.env.STORE_CITY || 'Bahawalnagar').toLowerCase(),
};
function calculateDelivery({ subtotal, province, city, totalWeightKg = 0 }) {
  if (subtotal >= DELIVERY.freeAbove) return 0;
  let fee = DELIVERY.base;
  if (city && city.toLowerCase() === DELIVERY.storeCity && subtotal >= 3000) fee = 150;
  if (DELIVERY.remoteProvinces.map(p => p.toLowerCase()).includes(String(province || '').toLowerCase())) fee += DELIVERY.remoteSurcharge;
  if (totalWeightKg > 2) fee += Math.ceil(totalWeightKg - 2) * 50;
  return fee;
}

// ---------- WhatsApp order notification (OPTIONAL — sirf .env se) ----------
// Naya order commit hote hi owner ko WhatsApp Cloud API se foran message
// jata hai. Ye TAB hi active hota hai jab .env / hosting env mein ye teen
// values hon: WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN (Meta
// WhatsApp Cloud API se milte hain) aur WHATSAPP_NOTIFY_TO (owner ka apna
// WhatsApp number, country code ke saath, misaal 923147656328).
// WHATSAPP_TEMPLATE_NAME diya ho to approved template message jata hai
// (template ke {{1}}..{{5}} = order number, customer, phone, total,
// payment method); warna plain text jata hai (wo sirf tab deliver hota
// hai jab owner ne pichle 24 ghante mein is number par message kiya ho —
// is liye asal istemal ke liye template lazmi rakhein).
// Settings na hon to notification khamoshi se skip ho jati hai — order
// kabhi is ki wajah se fail NAHI hota, aur bhej kar bhi order response
// is ka wait NAHI karta (fire-and-forget).
async function notifyWhatsAppOrder(info) {
  try {
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const to = String(process.env.WHATSAPP_NOTIFY_TO || '').replace(/[^0-9]/g, '');
    if (!phoneId || !token || !to || typeof fetch !== 'function') return;
    const template = String(process.env.WHATSAPP_TEMPLATE_NAME || '').trim();
    const payload = template
      ? { messaging_product: 'whatsapp', to, type: 'template',
          template: { name: template, language: { code: process.env.WHATSAPP_TEMPLATE_LANG || 'en' },
            components: [{ type: 'body', parameters: [
              { type: 'text', text: String(info.orderNumber) },
              { type: 'text', text: String(info.customerName || '') },
              { type: 'text', text: String(info.customerPhone || '') },
              { type: 'text', text: 'Rs. ' + Number(info.grandTotal || 0).toLocaleString('en-PK') },
              { type: 'text', text: String(info.paymentMethod || '') } ] }] } }
      : { messaging_product: 'whatsapp', to, type: 'text',
          text: { body: `New order ${info.orderNumber} — ${info.customerName} (${info.customerPhone}) — Rs. ${Number(info.grandTotal || 0).toLocaleString('en-PK')} — ${info.paymentMethod}` } };
    const r = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!r.ok) console.warn('[WA] order notification failed:', r.status, String(await r.text()).slice(0, 200));
  } catch (e) { console.warn('[WA] order notification error:', e.message); }
}

// ---------- Auth ----------
function signToken(user) { return jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET, { expiresIn: '7d' }); }
function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) return res.status(401).json({ error: 'Login required' });
  try { req.user = jwt.verify(h.slice(7), JWT_SECRET); next(); } catch { return res.status(401).json({ error: 'Invalid or expired token' }); }
}
function requireAdmin(req, res, next) {
  // Valid ADMIN token lazmi hai: ya to /api/admin/login se mila hua token
  // (role 'admin' + admin:true), ya database ke admin/staff user ka token.
  // Customer token (role 'customer') yahan hamesha 403 dega.
  if (!req.user) return res.status(401).json({ error: 'Admin login required' });
  if (req.user.admin === true && req.user.role === 'admin') return next();
  if (['admin', 'staff'].includes(req.user.role)) return next();
  return res.status(403).json({ error: 'Admin access only' });
}
function safeEqual(a, b) {
  const ba = Buffer.from(String(a || '')), bb = Buffer.from(String(b || ''));
  if (ba.length !== bb.length) return false;
  try { return crypto.timingSafeEqual(ba, bb); } catch { return false; }
}
function signAdminToken() {
  // id null rakha hai: reviewed_by / changed_by / audit columns users(id)
  // ke UUID foreign keys hain — env-admin koi DB user nahi, NULL wahan valid hai.
  return jwt.sign({ id: null, admin: true, username: ADMIN_USER, role: 'admin', email: null }, JWT_SECRET, { expiresIn: '12h' });
}
async function audit(client, adminId, action, entity, entityId, details) {
  try { await client.query('INSERT INTO admin_audit_logs(admin_user_id,action,entity,entity_id,details) VALUES($1,$2,$3,$4,$5)', [adminId || null, action, entity, entityId || null, details ? JSON.stringify(details) : null]); } catch {}
}

// ---------- Validation helpers ----------
const PK_PHONE = /^(\+92|0)?3\d{9}$/;
function validateCheckout(body) {
  const errs = [];
  const c = body.customer || {}, a = body.address || {};
  if (!c.fullName || String(c.fullName).trim().length < 3) errs.push('Full Name is required');
  if (!c.mobile || !PK_PHONE.test(String(c.mobile).replace(/[\s-]/g, ''))) errs.push('Valid Mobile Number required (03XX XXXXXXX)');
  if (c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) errs.push('Email format is invalid');
  if (!a.province) errs.push('Province is required');
  if (!a.city) errs.push('City is required');
  if (!a.area) errs.push('Area / Locality is required');
  if (!a.houseAddress || String(a.houseAddress).trim().length < 8) errs.push('Complete House Address is required');
  if (!['COD', 'JAZZCASH', 'EASYPAISA', 'NAYAPAY'].includes(body.paymentMethod)) errs.push('Select a valid Payment Method (COD / JazzCash / Easypaisa / NayaPay)');
  if (!Array.isArray(body.items) || body.items.length === 0) errs.push('Cart is empty');
  // Per spec § Part D-2: NEVER ask for CNIC / DOB — reject if a client tries to send them as required data
  return errs;
}

// ---------- Health ----------
app.get('/health', asyncH(async (req, res) => { await pool.query('SELECT 1'); res.json({ ok: true, service: 'AM Collection API', time: new Date().toISOString() }); }));

// ---------- Catalog (public) ----------
app.get('/api/categories', asyncH(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM categories WHERE is_active=true ORDER BY sort_order, name');
  res.json({ categories: rows });
}));
app.get('/api/products', asyncH(async (req, res) => {
  const { category, search, sort = 'newest', page = 1, limit = 24 } = req.query;
  const where = ['p.is_active=true'], args = [];
  if (category) { args.push(category); where.push(/^\d+$/.test(String(category)) ? `(c.slug=$${args.length} OR p.category_id=$${args.length}::int)` : `c.slug=$${args.length}`); }
  if (search) { args.push(`%${search}%`); where.push(`(p.name ILIKE $${args.length} OR p.sku ILIKE $${args.length})`); }
  const order = { newest: 'p.created_at DESC', price_asc: 'p.price ASC', price_desc: 'p.price DESC', popular: 'p.created_at DESC' }[sort] || 'p.created_at DESC';
  const off = (Math.max(1, +page) - 1) * Math.min(100, +limit);
  args.push(Math.min(100, +limit), off);
  const { rows } = await pool.query(`SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE ${where.join(' AND ')} ORDER BY ${order} LIMIT $${args.length - 1} OFFSET $${args.length}`, args);
  res.json({ products: rows, page: +page });
}));
app.get('/api/products/:slug', asyncH(async (req, res) => {
  const { rows } = await pool.query('SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id=p.category_id WHERE p.slug=$1 AND p.is_active=true', [req.params.slug]);
  if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
  const variants = await pool.query('SELECT * FROM product_variants WHERE product_id=$1 AND is_active=true ORDER BY id', [rows[0].id]);
  // Public response mein SIRF approved reviews — pending/rejected kabhi leak nahi hote.
  const reviews = await getApprovedReviews(rows[0].id);
  res.json({ product: rows[0], variants: variants.rows, reviews: reviews.rows, reviewSummary: reviews.summary });
}));

// ---------- Customer Reviews (admin approval / moderation) ----------
// Flow: customer product page par review deta hai (name + star rating + text)
//   -> review hamesha status='PENDING' save hota hai aur PUBLIC ko NAHI dikhta
//   -> sirf Admin Dashboard > Reviews mein nazar aata hai
//   -> admin Approve kare to status='APPROVED' aur tab hi product page / public
//      API par publicly dikhta hai; Reject kare to status='REJECTED' (public
//      ko kabhi nahi dikhta) — admin review delete bhi kar sakta hai.
async function getApprovedReviews(productId) {
  const { rows } = await pool.query(
    `SELECT id, product_id, customer_name, rating, title, body, status, created_at
       FROM reviews WHERE product_id=$1 AND status='APPROVED' ORDER BY created_at DESC`, [productId]);
  const count = rows.length;
  const averageRating = count ? Math.round((rows.reduce((s, r) => s + Number(r.rating || 0), 0) / count) * 10) / 10 : 0;
  return { rows, summary: { count, averageRating } };
}
function validateReview(body) {
  const errs = [];
  const customerName = String(body.customerName || body.customer_name || body.name || body.reviewerName || '').trim();
  const rating = parseInt(body.rating, 10);
  const reviewText = String(body.body || body.reviewText || body.review || body.text || '').trim();
  const title = body.title != null ? String(body.title).trim() : null;
  if (customerName.length < 2) errs.push('Your name is required');
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) errs.push('Star rating 1 to 5 is required');
  if (reviewText.length < 3) errs.push('Review text is required');
  if (customerName.length > 120) errs.push('Name is too long');
  if (reviewText.length > 2000) errs.push('Review text is too long (max 2000 characters)');
  return { errs, customerName, rating, reviewText, title: title || null };
}
async function createPendingReview(req, res, product) {
  const v = validateReview(req.body || {});
  if (v.errs.length) return res.status(422).json({ error: 'Validation failed', details: v.errs });
  const userId = req.user && req.user.id ? req.user.id : null;
  const { rows } = await pool.query(
    `INSERT INTO reviews(product_id, user_id, order_id, customer_name, rating, title, body, status, is_approved)
     VALUES($1,$2,$3,$4,$5,$6,$7,'PENDING',false) RETURNING id, product_id, customer_name, rating, title, body, status, created_at`,
    [product.id, userId, req.body.orderId || req.body.order_id || null, v.customerName, v.rating, v.title, v.reviewText]);
  // NOTE: naya review public response mein NAHI bheja jata as published — wo
  // pending hai; customer ko sirf confirmation milta hai.
  return res.status(201).json({ message: 'Thank you! Your review has been submitted and will appear publicly after admin approval.', review: rows[0], status: 'PENDING', publiclyVisible: false });
}
// Public: kisi product ke SIRF approved reviews
app.get('/api/products/:slug/reviews', asyncH(async (req, res) => {
  const { rows: prods } = await pool.query('SELECT id FROM products WHERE slug=$1 AND is_active=true', [req.params.slug]);
  if (!prods[0]) return res.status(404).json({ error: 'Product not found' });
  const reviews = await getApprovedReviews(prods[0].id);
  res.json({ reviews: reviews.rows, ...reviews.summary, count: reviews.summary.count, averageRating: reviews.summary.averageRating });
}));
app.get('/api/reviews', asyncH(async (req, res) => {
  const { productId, productSlug, slug } = req.query;
  let pid = productId || null;
  const s = productSlug || slug;
  if (!pid && s) { const { rows } = await pool.query('SELECT id FROM products WHERE slug=$1 AND is_active=true', [s]); if (!rows[0]) return res.status(404).json({ error: 'Product not found' }); pid = rows[0].id; }
  if (!pid) return res.status(400).json({ error: 'productId or productSlug is required' });
  const reviews = await getApprovedReviews(pid);
  res.json({ reviews: reviews.rows, count: reviews.summary.count, averageRating: reviews.summary.averageRating });
}));
// Public: review submit — hamesha PENDING (login zaroori nahi; token ho to user link ho jata hai)
async function optionalAuth(req, res, next) {
  const h = req.headers.authorization || '';
  if (h.startsWith('Bearer ')) { try { req.user = jwt.verify(h.slice(7), JWT_SECRET); } catch {} }
  next();
}
app.post('/api/products/:slug/reviews', optionalAuth, asyncH(async (req, res) => {
  const { rows } = await pool.query('SELECT id FROM products WHERE slug=$1 AND is_active=true', [req.params.slug]);
  if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
  return createPendingReview(req, res, rows[0]);
}));
app.post('/api/reviews', optionalAuth, asyncH(async (req, res) => {
  const { productId, productSlug, slug } = req.body || {};
  let prod = null;
  if (productId) { const { rows } = await pool.query('SELECT id FROM products WHERE id=$1 AND is_active=true', [productId]); prod = rows[0] || null; }
  if (!prod && (productSlug || slug)) { const { rows } = await pool.query('SELECT id FROM products WHERE slug=$1 AND is_active=true', [productSlug || slug]); prod = rows[0] || null; }
  if (!prod) return res.status(404).json({ error: 'Product not found — productId or productSlug is required' });
  return createPendingReview(req, res, prod);
}));

// ---------- Delivery quote (preview only — final fee is recomputed at order time) ----------
app.post('/api/delivery/quote', asyncH(async (req, res) => {
  const { items = [], province, city } = req.body;
  let subtotal = 0;
  for (const it of items) {
    const { rows } = await pool.query('SELECT price,discount_price,size_prices FROM products WHERE id=$1 AND is_active=true', [it.productId]);
    if (rows[0]) { const spUnit = sizePriceFor(rows[0], it.size); const unit = spUnit != null ? spUnit : money(rows[0].discount_price ?? rows[0].price); subtotal += unit * Math.max(1, +it.quantity || 1); }
  }
  const deliveryFee = calculateDelivery({ subtotal, province, city });
  res.json({ subtotal, deliveryFee, grandTotal: subtotal + deliveryFee, freeAbove: DELIVERY.freeAbove });
}));

// ---------- SECURE ORDER CREATION ----------
// Headers: Idempotency-Key: <uuid from client> — duplicate clicks / retries return the SAME order.
app.post('/api/orders', optionalAuth, asyncH(async (req, res) => {
  const errs = validateCheckout(req.body);
  if (errs.length) return res.status(422).json({ error: 'Validation failed', details: errs });
  const idemKey = req.headers['idempotency-key'];
  if (!idemKey) return res.status(400).json({ error: 'Idempotency-Key header is required to prevent duplicate orders' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Idempotency: if this key already produced an order, return it — no duplicate.
    const dup = await client.query('SELECT order_number, grand_total, payment_method, order_status FROM orders WHERE idempotency_key=$1', [idemKey]);
    if (dup.rows[0]) { await client.query('COMMIT'); return res.status(200).json({ duplicate: true, message: 'Order already placed', order: dup.rows[0] }); }

    // 1) Verify every price + stock FROM THE DATABASE (client prices are ignored)
    let subtotal = 0, totalWeight = 0; const lineItems = [];
    for (const it of req.body.items) {
      const qty = Math.max(1, parseInt(it.quantity) || 1);
      const q = it.variantId
        ? await client.query('SELECT p.id,p.name,p.sku,p.price,p.discount_price,p.size_prices,p.weight_kg,v.id AS variant_id,v.variant_name,v.size AS variant_size,v.sku AS variant_sku,v.price_delta, COALESCE(v.stock_qty, p.stock_qty) AS stock FROM products p JOIN product_variants v ON v.product_id=p.id WHERE p.id=$1 AND v.id=$2 AND p.is_active=true FOR UPDATE', [it.productId, it.variantId])
        : await client.query('SELECT id,name,sku,price,discount_price,size_prices,weight_kg,stock_qty AS stock FROM products WHERE id=$1 AND is_active=true FOR UPDATE', [it.productId]);
      const row = q.rows[0];
      if (!row) throw Object.assign(new Error(`Product ${it.productId} not available`), { status: 400 });
      if (row.stock < qty) throw Object.assign(new Error(`"${row.name}" is out of stock (available: ${row.stock})`), { status: 400 });
      // Size-based price: agar product par size_prices hain to unit price SERVER par selected
      // size se recompute hoti hai (client price hamesha ignore). Size lazmi + valid hona chahiye.
      const spMap = parseSizePrices(row.size_prices);
      let unit, chosenSize = null;
      if (spMap) {
        chosenSize = it.size ?? row.variant_size ?? null;
        if (chosenSize == null || spMap[String(chosenSize)] == null) throw Object.assign(new Error(`"${row.name}" ke liye valid size select karein (${sortedSizes(spMap).join(', ')})`), { status: 400 });
        unit = spMap[String(chosenSize)];
      } else {
        unit = money(row.discount_price ?? row.price) + money(row.price_delta || 0);
      }
      subtotal += unit * qty; totalWeight += Number(row.weight_kg || 0) * qty;
      const sizeLabel = chosenSize != null ? `Size ${chosenSize}` : null;
      const vName = [row.variant_name || it.variantName || null, sizeLabel].filter(Boolean).join(' · ') || null;
      lineItems.push({ productId: row.id, variantId: row.variant_id || null, name: row.name, sku: row.variant_sku || row.sku, variantName: vName, unitPrice: unit, qty });
    }

    // 2) Coupon (server-side re-validation)
    let discount = 0;
    if (req.body.couponCode) {
      const cp = await client.query('SELECT * FROM coupons WHERE UPPER(code)=UPPER($1) AND is_active=true AND (valid_until IS NULL OR valid_until>=now()) AND (max_uses IS NULL OR used_count<max_uses)', [req.body.couponCode]);
      const c = cp.rows[0];
      if (c && subtotal >= money(c.min_order_amount)) discount = c.discount_type === 'percent' ? Math.floor(subtotal * Number(c.discount_value) / 100) : money(c.discount_value);
      if (discount > 0) await client.query('UPDATE coupons SET used_count=used_count+1 WHERE id=$1', [c.id]);
    }

    // 3) Delivery + grand total (server-side)
    const { province, city } = req.body.address;
    const deliveryFee = calculateDelivery({ subtotal: subtotal - discount, province, city, totalWeightKg: totalWeight });
    const grandTotal = subtotal - discount + deliveryFee;

    // 4) Order number: ORD-YYYYMMDD-001 (daily sequence, race-safe inside transaction)
    const seq = await client.query(`SELECT COALESCE(MAX(CAST(SPLIT_PART(order_number,'-',3) AS INT)),0)+1 AS n FROM orders WHERE order_number LIKE $1`, [`ORD-${todayStr()}-%`]);
    const orderNumber = `ORD-${todayStr()}-${String(seq.rows[0].n).padStart(3, '0')}`;

    // 5) Insert order with SNAPSHOTS (customer + address frozen at order time — spec §19).
    // AUTO-SAVE: order + poora delivery address isi transaction mein foran save hota
    // hai aur admin Orders mein usi waqt nazar ata hai — koi alag "save address"
    // step, prompt ya approval NAHI. Order Notes checkout par nahi manga jata.
    const cst = req.body.customer, adr = req.body.address;
    const ord = await client.query(`INSERT INTO orders(order_number,idempotency_key,user_id,customer_name,customer_phone,customer_email,province,city,area,house_address,postal_code,payment_method,subtotal,discount_amount,delivery_fee,grand_total,payment_status,order_status) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,'PENDING','PENDING_CONFIRMATION') RETURNING id,order_number,grand_total,created_at`,
      [orderNumber, idemKey, (req.user && req.user.id) || null, cst.fullName.trim(), cst.mobile.replace(/[\s-]/g, ''), cst.email || null, adr.province, adr.city, adr.area, adr.houseAddress, adr.postalCode || null, req.body.paymentMethod, subtotal, discount, deliveryFee, grandTotal]);
    const orderId = ord.rows[0].id;

    // 6) Items (price snapshot) + stock decrement
    for (const li of lineItems) {
      await client.query('INSERT INTO order_items(order_id,product_id,variant_id,product_name,sku,variant_name,unit_price,quantity,line_total) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)', [orderId, li.productId, li.variantId, li.name, li.sku, li.variantName, li.unitPrice, li.qty, li.unitPrice * li.qty]);
      if (li.variantId) await client.query('UPDATE product_variants SET stock_qty=stock_qty-$1 WHERE id=$2', [li.qty, li.variantId]);
      else await client.query('UPDATE products SET stock_qty=stock_qty-$1 WHERE id=$2', [li.qty, li.productId]);
      await client.query('INSERT INTO inventory_movements(product_id,variant_id,movement_type,quantity,reference) VALUES($1,$2,$3,$4,$5)', [li.productId, li.variantId, 'ORDER', -li.qty, orderNumber]);
    }
    await client.query('INSERT INTO order_status_history(order_id,status,note) VALUES($1,$2,$3)', [orderId, 'PENDING_CONFIRMATION', 'Order placed']);
    await client.query('INSERT INTO payments(order_id,method,amount,status) VALUES($1,$2,$3,$4)', [orderId, req.body.paymentMethod, grandTotal, req.body.paymentMethod === 'COD' ? 'COD_PENDING' : 'PENDING']);

    // 7) AUTO-SAVE address book (sirf logged-in customer): checkout par likha gaya
    // address usi order ke saath khud-ba-khud addresses table mein bhi save ho
    // jata hai — customer se koi "save this address" nahi poochha jata aur kisi
    // approval ki zaroorat nahi. Duplicate address dobara save nahi hota; pehla
    // address default ban jata hai. SAVEPOINT is liye ke address-book ki kisi
    // ghalti se order kabhi fail na ho.
    if (req.user && req.user.id) {
      try {
        await client.query('SAVEPOINT addr_book');
        const dupAddr = await client.query('SELECT id FROM addresses WHERE user_id=$1 AND province=$2 AND city=$3 AND area_locality=$4 AND house_address=$5 LIMIT 1', [req.user.id, adr.province, adr.city, adr.area, adr.houseAddress]);
        if (!dupAddr.rows[0]) {
          const cnt = await client.query('SELECT COUNT(*)::int AS n FROM addresses WHERE user_id=$1', [req.user.id]);
          await client.query('INSERT INTO addresses(user_id,full_name,phone,province,city,area_locality,house_address,postal_code,is_default) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)', [req.user.id, cst.fullName.trim(), cst.mobile.replace(/[\s-]/g, ''), adr.province, adr.city, adr.area, adr.houseAddress, adr.postalCode || null, cnt.rows[0].n === 0]);
        }
        await client.query('RELEASE SAVEPOINT addr_book');
      } catch (addrErr) { try { await client.query('ROLLBACK TO SAVEPOINT addr_book'); } catch {} }
    }
    await client.query('COMMIT');
    // Owner ko WhatsApp par foran khabar (sirf tab jab .env mein WHATSAPP_*
    // settings hon) — response is ka wait nahi karta, fail bhi nahi hota.
    notifyWhatsAppOrder({ orderNumber, customerName: cst.fullName.trim(), customerPhone: cst.mobile.replace(/[\s-]/g, ''), grandTotal, paymentMethod: req.body.paymentMethod });

    // COD: paid ONLY after courier collection/reconciliation — never at placement (spec Part D-5).
    // Online: client must pay via gateway; order stays PENDING until signed callback verifies (see below).
    res.status(201).json({ message: 'Order placed successfully', orderNumber, grandTotal, subtotal, discount, deliveryFee, paymentMethod: req.body.paymentMethod, paymentNumber: process.env.STORE_PAYMENT_NUMBER || '03147656328', nextStep: req.body.paymentMethod === 'COD' ? 'Pay cash when your parcel arrives.' : 'Complete payment in your JazzCash/Easypaisa/NayaPay app, then wait for confirmation.' });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(e.status || 500).json({ error: e.status ? e.message : 'Order failed. Please retry.', retry: true });
  } finally { client.release(); }
}));

// ---------- Track order (public: order number + phone, no login needed) ----------
app.get('/api/orders/track', asyncH(async (req, res) => {
  const { orderNumber, phone } = req.query;
  if (!orderNumber || !phone) return res.status(400).json({ error: 'orderNumber and phone are required' });
  const { rows } = await pool.query('SELECT order_number,order_status,payment_status,payment_method,grand_total,created_at FROM orders WHERE order_number=$1 AND customer_phone=$2', [orderNumber, String(phone).replace(/[\s-]/g, '')]);
  if (!rows[0]) return res.status(404).json({ error: 'Order not found — check order number and phone' });
  const hist = await pool.query('SELECT osh.status,osh.note,osh.created_at FROM order_status_history osh JOIN orders o ON o.id=osh.order_id WHERE o.order_number=$1 ORDER BY osh.created_at', [orderNumber]);
  res.json({ order: rows[0], history: hist.rows });
}));

// ---------- Auth: register / login ----------
app.post('/api/auth/register', asyncH(async (req, res) => {
  const { fullName, email, phone, password } = req.body;
  if (!fullName || !email || !password || password.length < 8) return res.status(422).json({ error: 'Name, email and 8+ character password required' });
  const hash = await bcrypt.hash(password, 12);
  try {
    const { rows } = await pool.query('INSERT INTO users(full_name,email,phone,password_hash,role) VALUES($1,$2,$3,$4,$5) RETURNING id,full_name,email,role', [fullName, email.toLowerCase(), phone || null, hash, 'customer']);
    res.status(201).json({ token: signToken(rows[0]), user: rows[0] });
  } catch (e) { if (e.code === '23505') return res.status(409).json({ error: 'Email already registered' }); throw e; }
}));
app.post('/api/auth/login', asyncH(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email=$1 AND is_active=true', [String(req.body.email || '').toLowerCase()]);
  const u = rows[0];
  if (!u || !(await bcrypt.compare(req.body.password || '', u.password_hash))) return res.status(401).json({ error: 'Invalid email or password' });
  res.json({ token: signToken(u), user: { id: u.id, full_name: u.full_name, email: u.email, role: u.role } });
}));
app.get('/api/auth/me/orders', requireAuth, asyncH(async (req, res) => {
  const { rows } = await pool.query('SELECT order_number,grand_total,payment_method,payment_status,order_status,created_at FROM orders WHERE customer_email=$1 ORDER BY created_at DESC LIMIT 50', [req.user.email]);
  res.json({ orders: rows });
}));

// ---------- Payment callbacks (JazzCash / Easypaisa / NayaPay) ----------
// SECURITY (spec §14): NEVER mark paid from a browser redirect. Only a server-side
// callback whose HMAC signature verifies AND whose amount + order ID match the DB
// order may set payment_status = PAID. Secret keys live ONLY in .env, never frontend.
function verifyCallbackSignature(payload, secret) {
  const received = payload.pp_SecureHash || payload.secureHash || payload.signature || '';
  if (!received || !secret) return false;
  const data = Object.keys(payload).filter(k => !['pp_SecureHash', 'secureHash', 'signature'].includes(k)).sort().map(k => payload[k]).join('&');
  const expected = crypto.createHmac('sha256', secret).update(data).digest('hex');
  try { return crypto.timingSafeEqual(Buffer.from(received.toLowerCase()), Buffer.from(expected.toLowerCase())); } catch { return false; }
}
app.post('/api/payments/callback/:provider', asyncH(async (req, res) => {
  const provider = req.params.provider.toUpperCase(); // JAZZCASH | EASYPAISA | NAYAPAY
  const secret = { JAZZCASH: process.env.JAZZCASH_SECRET, EASYPAISA: process.env.EASYPAISA_SECRET, NAYAPAY: process.env.NAYAPAY_SECRET }[provider];
  const payload = { ...req.query, ...req.body };
  if (!verifyCallbackSignature(payload, secret)) { console.warn(`[PAY] bad signature provider=${provider}`); return res.status(400).send('Invalid signature'); }
  const orderNumber = payload.pp_BillReference || payload.orderId || payload.order_id;
  const paidAmount = money(payload.pp_Amount || payload.amount);
  const success = ['000', 'success', 'SUCCESS', 'PAID'].includes(String(payload.pp_ResponseCode || payload.status || ''));
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT id,grand_total,payment_status FROM orders WHERE order_number=$1 FOR UPDATE', [orderNumber]);
    const order = rows[0];
    if (!order) { await client.query('ROLLBACK'); return res.status(404).send('Order not found'); }
    if (success && paidAmount !== money(order.grand_total)) { await client.query('ROLLBACK'); console.warn(`[PAY] amount mismatch order=${orderNumber}`); return res.status(400).send('Amount mismatch'); }
    const newStatus = success ? 'PAID' : 'FAILED';
    if (order.payment_status !== 'PAID') {
      await client.query('UPDATE orders SET payment_status=$1 WHERE id=$2', [newStatus, order.id]);
      await client.query('UPDATE payments SET status=$1, provider_txn_id=$2, verified_at=now(), raw_callback=$3 WHERE order_id=$4', [newStatus, payload.pp_TxnRefNo || payload.txnId || null, JSON.stringify(payload), order.id]);
    }
    await client.query('COMMIT');
    res.status(200).send('OK');
  } catch (e) { await client.query('ROLLBACK'); res.status(500).send('Error'); } finally { client.release(); }
}));

// ---------- Customer Complaints ----------
// Public: storefront ke Complaint form se complaint ati hai — login zaroori
// NAHI. Complaint complaints table mein status 'NEW' ke saath save hoti hai
// aur sirf admin ko Admin Dashboard -> Complaints mein dikhti hai.
app.post('/api/complaints', asyncH(async (req, res) => {
  const name = String((req.body && req.body.name) || '').trim();
  const mobileRaw = String((req.body && (req.body.mobile || req.body.phone)) || '');
  const mobile = mobileRaw.replace(/[\s-]/g, '');
  const orderNumberRaw = req.body && (req.body.orderNumber ?? req.body.order_number);
  const orderNumber = orderNumberRaw != null && String(orderNumberRaw).trim() ? String(orderNumberRaw).trim() : null;
  const message = String((req.body && req.body.message) || '').trim();
  const errs = [];
  if (name.length < 3) errs.push('Your name is required');
  if (!PK_PHONE.test(mobile)) errs.push('Valid Mobile Number required (03XX XXXXXXX)');
  if (message.length < 3) errs.push('Complaint message is required');
  if (name.length > 120) errs.push('Name is too long');
  if (message.length > 2000) errs.push('Message is too long (max 2000 characters)');
  if (orderNumber && orderNumber.length > 60) errs.push('Order number is too long');
  if (errs.length) return res.status(422).json({ error: 'Validation failed', details: errs });
  const { rows } = await pool.query(
    'INSERT INTO complaints(name, mobile, order_number, message) VALUES($1,$2,$3,$4) RETURNING id, name, mobile, order_number, message, status, created_at',
    [name, mobile, orderNumber, message]);
  return res.status(201).json({ message: 'Your complaint has been received', complaint: rows[0] });
}));

// ---------- About Us page picture ----------
// Owner Admin Dashboard -> Settings se About page ki picture set karta hai.
// File server par public/uploads/ mein save hoti hai aur us ka path
// store_settings table mein key 'about_picture' ke saath rehta hai.
// Picture set NA ho to API pictureUrl: null deta hai aur About page par
// SIRF text dikhta hai — koi broken image NAHI ati.
const ABOUT_IMG_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };
function aboutUploadsDir() { return path.join(__dirname, 'public', 'uploads'); }
function clearAboutFiles() {
  try {
    const dir = aboutUploadsDir();
    if (fs.existsSync(dir)) fs.readdirSync(dir).filter((f) => f.indexOf('about-page.') === 0).forEach((f) => { try { fs.unlinkSync(path.join(dir, f)); } catch {} });
  } catch {}
}
app.get('/api/pages/about', asyncH(async (req, res) => {
  const { rows } = await pool.query("SELECT value FROM store_settings WHERE key='about_picture'");
  let url = rows[0] && rows[0].value && rows[0].value.url ? String(rows[0].value.url) : null;
  // File server par maujood na ho to picture na bhejein (broken image na aye)
  if (url && !fs.existsSync(path.join(__dirname, 'public', url))) url = null;
  res.json({ pictureUrl: url });
}));

// ---------- Admin Login (username + password, .env se check) ----------
// POST /api/admin/login { username, password } -> { token, user }
// Token signed JWT hai (wahi JWT_SECRET approach). Ghalat credentials
// par 401 — koi dashboard data login ke baghair NAHI milta.
const adminLoginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false });
app.post('/api/admin/login', adminLoginLimiter, (req, res) => {
  if (!JWT_SECRET) return res.status(500).json({ error: 'Server par JWT_SECRET set nahi hai — pehle .env configure karein.' });
  const username = String((req.body && req.body.username) || '');
  const password = String((req.body && req.body.password) || '');
  if (!safeEqual(username, ADMIN_USER) || !safeEqual(password, ADMIN_PASSWORD)) {
    return res.status(401).json({ error: 'Invalid admin username or password' });
  }
  return res.json({ token: signAdminToken(), user: { username: ADMIN_USER, role: 'admin' } });
});

// BLANKET GUARD: /api/admin/* ki HAR route (login ke ilawa) ke liye valid
// admin token lazmi hai — koi bhi admin route baghair token ke nahi khulti,
// chahe us route par requireAuth/requireAdmin lagana reh bhi jaye. (Neeche
// wali har admin route par is ke ilawa requireAuth + requireAdmin bhi hai.)
app.use('/api/admin', (req, res, next) => {
  if (req.path === '/login' && req.method === 'POST') return next();
  return requireAuth(req, res, () => requireAdmin(req, res, next));
});

// ---------- Admin: orders, payments, delivery ----------
app.get('/api/admin/orders', requireAuth, requireAdmin, asyncH(async (req, res) => {
  const { status, page = 1 } = req.query; const args = []; let where = 'WHERE 1=1';
  if (status) { args.push(status); where += ` AND order_status=$${args.length}`; }
  args.push(30, (Math.max(1, +page) - 1) * 30);
  const { rows } = await pool.query(`SELECT order_number,customer_name,customer_phone,grand_total,payment_method,payment_status,order_status,created_at FROM orders ${where} ORDER BY created_at DESC LIMIT $${args.length - 1} OFFSET $${args.length}`, args);
  res.json({ orders: rows });
}));
app.get('/api/admin/orders/:orderNumber', requireAuth, requireAdmin, asyncH(async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM orders WHERE order_number=$1', [req.params.orderNumber]);
  if (!rows[0]) return res.status(404).json({ error: 'Order not found' });
  const items = await pool.query('SELECT * FROM order_items WHERE order_id=$1', [rows[0].id]);
  const payment = await pool.query('SELECT * FROM payments WHERE order_id=$1 ORDER BY id DESC LIMIT 1', [rows[0].id]);
  const shipment = await pool.query('SELECT * FROM shipments WHERE order_id=$1 ORDER BY id DESC LIMIT 1', [rows[0].id]);
  res.json({ order: rows[0], items: items.rows, payment: payment.rows[0] || null, shipment: shipment.rows[0] || null }); // matches admin "Order Details" card design
}));
const ORDER_FLOW = ['PENDING_CONFIRMATION', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];
app.patch('/api/admin/orders/:orderNumber/status', requireAuth, requireAdmin, asyncH(async (req, res) => {
  const { status, courier, trackingNumber, note } = req.body;
  if (!ORDER_FLOW.includes(status)) return res.status(422).json({ error: 'Invalid status', allowed: ORDER_FLOW });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query('SELECT id,order_status FROM orders WHERE order_number=$1 FOR UPDATE', [req.params.orderNumber]);
    if (!rows[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Order not found' }); }
    const oid = rows[0].id;
    await client.query('UPDATE orders SET order_status=$1, updated_at=now() WHERE id=$2', [status, oid]);
    await client.query('INSERT INTO order_status_history(order_id,status,note,changed_by) VALUES($1,$2,$3,$4)', [oid, status, note || null, req.user.id]);
    if (status === 'CANCELLED') { // restore stock
      const items = await client.query('SELECT * FROM order_items WHERE order_id=$1', [oid]);
      for (const it of items.rows) { if (it.variant_id) await client.query('UPDATE product_variants SET stock_qty=stock_qty+$1 WHERE id=$2', [it.quantity, it.variant_id]); else await client.query('UPDATE products SET stock_qty=stock_qty+$1 WHERE id=$2', [it.quantity, it.product_id]); }
    }
    if (status === 'SHIPPED') await client.query('INSERT INTO shipments(order_id,courier,tracking_number,status,shipped_at) VALUES($1,$2,$3,$4,now()) ON CONFLICT DO NOTHING', [oid, courier || null, trackingNumber || null, 'SHIPPED']);
    if (status === 'DELIVERED') await client.query("UPDATE shipments SET status='DELIVERED', delivered_at=now() WHERE order_id=$1", [oid]);
    await audit(client, req.user.id, 'ORDER_STATUS', 'orders', oid, { to: status });
    await client.query('COMMIT');
    res.json({ ok: true, orderNumber: req.params.orderNumber, status });
  } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
}));
app.patch('/api/admin/orders/:orderNumber/payment', requireAuth, requireAdmin, asyncH(async (req, res) => {
  // COD reconciliation: mark PAID only when courier cash is collected (spec §21).
  const { paymentStatus } = req.body; // PAID | COD_COLLECTED | REFUNDED | FAILED
  const { rows } = await pool.query('UPDATE orders SET payment_status=$1, updated_at=now() WHERE order_number=$2 RETURNING order_number,payment_status', [paymentStatus, req.params.orderNumber]);
  if (!rows[0]) return res.status(404).json({ error: 'Order not found' });
  res.json({ ok: true, ...rows[0] });
}));
app.get('/api/admin/dashboard', requireAuth, requireAdmin, asyncH(async (req, res) => {
  const [sales, weekSales, monthSales, pending, lowStock, recent] = await Promise.all([
    pool.query("SELECT COUNT(*)::int AS orders, COALESCE(SUM(grand_total),0)::int AS revenue FROM orders WHERE order_status<>'CANCELLED' AND created_at>=date_trunc('day',now())"),
    pool.query("SELECT COUNT(*)::int AS orders, COALESCE(SUM(grand_total),0)::int AS revenue FROM orders WHERE order_status<>'CANCELLED' AND created_at>=date_trunc('day',now()) - interval '6 days'"),
    pool.query("SELECT COUNT(*)::int AS orders, COALESCE(SUM(grand_total),0)::int AS revenue FROM orders WHERE order_status<>'CANCELLED' AND created_at>=date_trunc('month',now())"),
    pool.query("SELECT COUNT(*)::int AS n FROM orders WHERE order_status='PENDING_CONFIRMATION'"),
    pool.query('SELECT id,name,sku,stock_qty FROM products WHERE stock_qty<=5 AND is_active=true ORDER BY stock_qty LIMIT 10'),
    pool.query('SELECT order_number,customer_name,grand_total,order_status,created_at FROM orders ORDER BY created_at DESC LIMIT 10'),
  ]);
  res.json({ today: sales.rows[0], week: weekSales.rows[0], month: monthSales.rows[0], pendingConfirmation: pending.rows[0].n, lowStock: lowStock.rows, recentOrders: recent.rows });
}));
// ---------- Admin: About page picture set / change / remove (sirf admin token) ----------
// Upload: raw image body (Content-Type image/jpeg|png|webp|gif, max 5MB).
app.post('/api/admin/about-picture', requireAuth, requireAdmin, express.raw({ type: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], limit: '5mb' }), asyncH(async (req, res) => {
  const type = String(req.headers['content-type'] || '').split(';')[0].trim().toLowerCase();
  const ext = ABOUT_IMG_TYPES[type];
  if (!ext) return res.status(422).json({ error: 'Sirf JPG, PNG, WebP ya GIF picture upload karein' });
  if (!Buffer.isBuffer(req.body) || !req.body.length) return res.status(400).json({ error: 'Picture file nahi mili' });
  const dir = aboutUploadsDir();
  fs.mkdirSync(dir, { recursive: true });
  clearAboutFiles();
  const fileName = 'about-page.' + ext;
  fs.writeFileSync(path.join(dir, fileName), req.body);
  const url = '/uploads/' + fileName;
  await pool.query("INSERT INTO store_settings(key, value) VALUES('about_picture', $1::jsonb) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value, updated_at=now()", [JSON.stringify({ url })]);
  res.json({ ok: true, pictureUrl: url });
}));
app.delete('/api/admin/about-picture', requireAuth, requireAdmin, asyncH(async (req, res) => {
  clearAboutFiles();
  await pool.query("DELETE FROM store_settings WHERE key='about_picture'");
  res.json({ ok: true, pictureUrl: null });
}));

// ---------- Admin: Complaints (sirf admin token — blanket guard + requireAuth/requireAdmin) ----------
app.get('/api/admin/complaints', requireAuth, requireAdmin, asyncH(async (req, res) => {
  const { status, page = 1, limit = 50 } = req.query;
  const args = []; const where = ['WHERE 1=1'];
  if (status) { args.push(String(status).toUpperCase()); where.push(`status=$${args.length}`); }
  const lim = Math.min(100, Math.max(1, +limit || 50)); const off = (Math.max(1, +page) - 1) * lim;
  args.push(lim, off);
  const { rows } = await pool.query(
    `SELECT id, name, mobile, order_number, message, status, created_at
       FROM complaints ${where.join(' AND ')}
      ORDER BY (status='NEW') DESC, created_at DESC
      LIMIT $${args.length - 1} OFFSET $${args.length}`, args);
  const counts = await pool.query('SELECT status, COUNT(*)::int AS n FROM complaints GROUP BY status');
  const summary = { NEW: 0, total: 0 };
  counts.rows.forEach((c) => { summary[c.status] = c.n; summary.total += c.n; });
  res.json({ complaints: rows, page: +page, summary });
}));

// ---------- Admin: Reviews moderation ----------
// Admin ko SAARE reviews dikhte hain (PENDING / APPROVED / REJECTED) —
// public ko sirf APPROVED. Approve/Reject par status + is_approved sync
// rehte hain aur reviewed_by / reviewed_at set hote hain.
app.get('/api/admin/reviews', requireAuth, requireAdmin, asyncH(async (req, res) => {
  const { status, productId, page = 1, limit = 50 } = req.query;
  const args = []; const where = ['WHERE 1=1'];
  if (status) {
    const s = String(status).toUpperCase();
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(s)) return res.status(422).json({ error: 'Invalid status', allowed: ['PENDING', 'APPROVED', 'REJECTED'] });
    args.push(s); where.push(`r.status=$${args.length}`);
  }
  if (productId) { args.push(productId); where.push(`r.product_id=$${args.length}`); }
  const lim = Math.min(100, Math.max(1, +limit || 50)); const off = (Math.max(1, +page) - 1) * lim;
  args.push(lim, off);
  const { rows } = await pool.query(
    `SELECT r.id, r.product_id, p.name AS product_name, p.slug AS product_slug,
            r.customer_name, r.user_id, r.order_id, r.rating, r.title, r.body,
            r.status, r.is_approved, r.reviewed_by, r.reviewed_at, r.created_at, r.updated_at
       FROM reviews r LEFT JOIN products p ON p.id=r.product_id
      ${where.join(' AND ')} ORDER BY (r.status='PENDING') DESC, r.created_at DESC
      LIMIT $${args.length - 1} OFFSET $${args.length}`, args);
  const counts = await pool.query(`SELECT status, COUNT(*)::int AS n FROM reviews GROUP BY status`);
  const summary = { PENDING: 0, APPROVED: 0, REJECTED: 0, total: 0 };
  counts.rows.forEach((c) => { summary[c.status] = c.n; summary.total += c.n; });
  res.json({ reviews: rows, page: +page, summary });
}));
async function setReviewStatus(req, res, status) {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `UPDATE reviews SET status=$1, is_approved=$2, reviewed_by=$3, reviewed_at=now(), updated_at=now()
        WHERE id=$4 RETURNING *`, [status, status === 'APPROVED', req.user.id || null, req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Review not found' });
    await audit(client, req.user.id, status === 'APPROVED' ? 'REVIEW_APPROVE' : 'REVIEW_REJECT', 'reviews', rows[0].id, { status });
    res.json({ ok: true, review: rows[0] });
  } finally { client.release(); }
}
app.patch('/api/admin/reviews/:id/approve', requireAuth, requireAdmin, asyncH(async (req, res) => setReviewStatus(req, res, 'APPROVED')));
app.patch('/api/admin/reviews/:id/reject', requireAuth, requireAdmin, asyncH(async (req, res) => setReviewStatus(req, res, 'REJECTED')));
app.patch('/api/admin/reviews/:id/status', requireAuth, requireAdmin, asyncH(async (req, res) => {
  const s = String((req.body && req.body.status) || '').toUpperCase();
  if (!['PENDING', 'APPROVED', 'REJECTED'].includes(s)) return res.status(422).json({ error: 'Invalid status', allowed: ['PENDING', 'APPROVED', 'REJECTED'] });
  return setReviewStatus(req, res, s);
}));
app.delete('/api/admin/reviews/:id', requireAuth, requireAdmin, asyncH(async (req, res) => {
  const { rows } = await pool.query('DELETE FROM reviews WHERE id=$1 RETURNING id', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Review not found' });
  res.json({ ok: true, deleted: true, id: rows[0].id });
}));
// Admin products CRUD (prices added by owner later — e.g. products/prices arriving 2026-10-24)
app.post('/api/admin/products', requireAuth, requireAdmin, asyncH(async (req, res) => {
  const { name, slug, sku, categoryId, price, discountPrice, costPrice, stockQty, description, braType } = req.body;
  const imageUrl = req.body.imageUrl ?? req.body.image_url ?? null;
  if (!name || !sku || price == null) return res.status(422).json({ error: 'name, sku and price are required' });
  const sizePricesRaw = req.body.sizePrices ?? req.body.size_prices;
  const sizePrices = sizePricesRaw != null && sizePricesRaw !== '' ? parseSizePrices(sizePricesRaw) : null;
  if (sizePricesRaw != null && sizePricesRaw !== '' && !sizePrices) return res.status(422).json({ error: 'sizePrices must be a JSON object like {"32":2000,"34":2175,"36":2350,"38":2525}' });
  const basePrice = sizePrices ? sizePrices[sortedSizes(sizePrices)[0]] : money(price); // base price = sab se chhote size ki price
  const { rows } = await pool.query('INSERT INTO products(name,slug,sku,category_id,price,discount_price,cost_price,stock_qty,description,bra_type,size_prices,image_url) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *', [name, slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'), sku, categoryId || null, basePrice, discountPrice ? money(discountPrice) : null, costPrice ? money(costPrice) : null, stockQty || 0, description || null, braType || null, sizePrices ? JSON.stringify(sizePrices) : '{}', imageUrl]);
  res.status(201).json({ product: rows[0] });
}));
app.patch('/api/admin/products/:id', requireAuth, requireAdmin, asyncH(async (req, res) => {
  const fields = ['name', 'price', 'discount_price', 'cost_price', 'stock_qty', 'description', 'is_active', 'category_id', 'bra_type', 'size_prices', 'image_url'];
  const sets = [], args = []; for (const f of fields) { const k = f.replace(/_([a-z])/g, (_, c) => c.toUpperCase()); if (req.body[f] !== undefined || req.body[k] !== undefined) { let v = req.body[f] ?? req.body[k]; if (f === 'size_prices') { const sp = v ? parseSizePrices(v) : null; if (v && !sp) return res.status(422).json({ error: 'size_prices must be a JSON object like {"32":2000,"34":2175}' }); v = sp ? JSON.stringify(sp) : '{}'; } args.push(v); sets.push(`${f}=$${args.length}`); } }
  if (!sets.length) return res.status(400).json({ error: 'Nothing to update' });
  args.push(req.params.id);
  const { rows } = await pool.query(`UPDATE products SET ${sets.join(',')}, updated_at=now() WHERE id=$${args.length} RETURNING *`, args);
  res.json({ product: rows[0] });
}));

// ---------- Static frontend (added for deployable package: serves public/) ----------
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

// ---------- Errors + start ----------
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Something went wrong. Please retry.' }); });
if (require.main === module) app.listen(PORT, '0.0.0.0', () => console.log(`AM Collection API running on :${PORT}`));
module.exports = { app, pool, calculateDelivery };
