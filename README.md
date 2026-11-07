# AM Collection — Complete Deployable Website Package

Ye package **AM Collection** ki asal, public website hai — isay kisi bhi
Node.js hosting par apne domain ke saath laga kar Pakistan mein sach mein
products sale kiye ja sakte hain.

Package mein kya hai:

| Hissa | File / Folder |
|---|---|
| Storefront (customers ki website) | `public/index.html` + `public/js/store.js` |
| Admin Dashboard | `public/admin.html` + `public/js/admin.js` |
| Design (CSS) | `public/css/styles.css`, `public/css/admin.css` |
| Logo | `public/assets/logo.svg` (approved logo ki SVG recreation) + `public/assets/logo.png` (final logo file) |
| Backend (Node.js + Express) | `server.js` — secure order creation, server-side delivery calculation, optional WhatsApp order notification |
| Database (PostgreSQL) | `database/schema.sql` — server.js ki queries se **matched** schema (integer IDs, `products.stock_qty`, `orders.order_status`/`payment_status`), 16 tables | + `database/seed-watches.sql` — 27 watches ka catalog seed (schema ke baad chalain) |
| Render deploy (FREE) | `render.yaml` — Render Blueprint: free web service + free PostgreSQL, database khud link ho jati hai |
| Database init script | `scripts/init-db.js` — schema + seed ek command se (`npm run db:init`); Render build mein khud chalta hai |
| Settings ki misaal | `.env.example` |

**Catalog: 27 watches (owner ki asal photos + prices).** Storefront in
watches ko built-in catalog (`public/js/catalog.js`, photos
`public/assets/watches/`) se foran dikhata hai — Men's Watches (4),
Luxury Watches (15), Sports Watches (8). Live server checkout ke liye yehi
27 products database mein daalne ke liye Step 2 ke baad
`database/seed-watches.sql` chalain (schema.sql ke baad, idempotent hai).
Admin dashboard se mazeed products bhi add ho sakte hain.

Theme (updated 2026-11-07 — Luxury Watches redesign): black & gold luxury
watch-store design (Playfair Display + Jost), mobile-app style screens —
Home (hero + category tiles + Best Selling), Categories, Product Details,
My Cart, Checkout, Order Placed, Account, Special Offers. Mobile-first,
mobile par bottom navigation (Home / Categories / Offers / Cart / Account).
Prices hamesha `Rs.` format mein. Brand name AM Collection hi hai aur
gold AM logo hi istemal hota hai.

---

## RENDER PAR FREE DEPLOY (sab se asaan tareeqa — step by step)

Is package ko **Render ki free tier** par lagane ke liye tayyar kar diya
gaya hai. Render hi woh option hai jo is store ko chala sakta hai, kyun
ke is website ko **Node.js backend + PostgreSQL database** chahiye —
sirf static files wali free hosting (masalan Cloudflare Pages ya
Netlify) par store khul to jayega lekin **admin dashboard, orders aur
database bilkul kaam nahi karein ge**.

Render free mein website ka apna address bhi deta hai
(`https://am-collection.onrender.com` jaisa) — yehi free "domain" hai.
Apna `.pk` domain baad mein kabhi bhi muft connect ho sakta hai
(Render mein custom domain free hai; sirf domain ki registration
registrar par paid hoti hai).

### Deploy ke steps

1. **Render account banayein** — render.com par **Get Started for Free**
   se sign up karein (GitHub account se sign up sab se asaan hai).
   Free tier ke liye credit card **nahi** chahiye.
2. **Code GitHub par rakhein** — ek **naya private GitHub repository**
   banayein aur is package ki `am-collection` folder ki **saari files**
   us mein upload karein (folder ke andar wali files repository ki root
   mein hon — `server.js`, `package.json`, `render.yaml`, `public/`,
   `database/`, `scripts/` sab nazar anay chahiyein). **`.env` file
   kabhi upload NA karein** (wo `.gitignore` mein pehle se hai).
3. **Blueprint deploy karein** — Render Dashboard mein **New → Blueprint**
   → apna GitHub repository select karein → Render `render.yaml` parh
   kar do cheezein banayega: **am-collection-db** (free PostgreSQL) aur
   **am-collection** (free web service). **Apply** dabane se pehle
   Render ye values poochega (`sync: false` wali):
   - `ADMIN_PASSWORD` — admin dashboard ka **apna naya password**
     rakhein (yehi asal admin password hai — kisi ko na dein, aur
     repository / chat mein kabhi na likhein).
   - `CORS_ORIGINS` — abhi `https://am-collection.onrender.com`
     likh dein (apna asal service name agar mukhtalif ho to wahi
     URL jo Render deploy ke baad de); deploy ke baad Render ke
     **Environment** tab se kabhi bhi badal sakte hain.
   - WhatsApp wali values (`WHATSAPP_*`) — abhi **khaali** chhor
     dein; wo neeche wale optional section ki hain.
   `DATABASE_URL` aur `JWT_SECRET` **khud set ho jate hain** —
   database Blueprint se linked hai aur JWT secret Render generate
   karta hai. `ADMIN_USER` default `admin` hai (Environment tab se
   badal sakte hain).
4. **Deploy ka intezar karein** — pehli build mein `npm install` ke
   saath `node scripts/init-db.js` bhi chalta hai, jo database mein
   **tables + 27 watches khud daal deta hai**. Build log mein
   `[init-db] done — products: 27, categories: 3` nazar ana chahiye.
   Phir service **Live** ho jayegi aur Render website ka URL dega.
5. **Test karein** — URL khol kar: store par 27 watches nazar ayen →
   ek test COD order karein → website ke **Login screen** par admin
   username/password (jo Step 3 mein rakha tha) dalne se **Admin
   Dashboard** khule aur order wahan maujood ho → order ko Confirm →
   Shipped → Delivered karke dekhein.
6. **Server PORT ki fikar na karein** — Render khud `PORT` deta hai
   aur `server.js` `process.env.PORT` par hi bind hota hai. Render ke
   Environment mein `PORT` haath se **na** lagayein.

### Database schema haath se chalana ho to ( Render par zaroorat nahi )

Render Dashboard → **am-collection-db** → **Connect** → **External
Database URL** copy karein, phir apne computer par:

```bash
psql "AAPKI_EXTERNAL_DATABASE_URL" -f database/schema.sql
psql "AAPKI_EXTERNAL_DATABASE_URL" -f database/seed-watches.sql
```

Ya jahan code rakha ho wahan se ek hi command: `npm run db:init`
(`DATABASE_URL` env set hona chahiye). Dono files **idempotent** hain —
dobara chalane se duplicate data nahi banta aur orders mehfooz rehte
hain.

### Render free tier ki asal limits (zaroor parhein)

- **Website so jati hai:** free web service 15 minute khaali rehne par
  spin down ho jati hai. Agli visit par website ~1 minute mein jagti
  hai (pehli loading slow hogi) — ye free tier ka normal behavior hai.
- ⚠️ **Free database sirf 30 din ka hai:** free PostgreSQL creation ke
  **30 din baad expire** ho jata hai; us ke baad 14 din grace milta hai
  aur phir Render **database aur us ka saara data delete** kar deta
  hai. Is liye free database ko sirf **test / shuruaat** ke liye rakhein.
  Asal sale shuru karne se pehle ya to database ko Render par paid plan
  (sab se chhota plan) par upgrade karein, ya waqt par data export
  karke nayi jagah shift karein. Products `seed-watches.sql` se kabhi
  bhi wapas a sakte hain, lekin **orders sirf database mein hote hain**
  — un ka backup hi asal hifazat hai.
- Free service par **persistent disk nahi** milta: Admin Settings se
  upload ki gayi About page ki picture server ki disk par rehti hai —
  free tier par service restart/deploy par wo file ja sakti hai
  (product photos package ke andar hain, wo mehfooz hain).
- **Custom domain:** Render Dashboard → service → **Settings → Custom
  Domains** se apna domain free mein add ho jata hai aur HTTPS (SSL)
  Render khud laga deta hai. Domain ate hi `CORS_ORIGINS` mein usay
  bhi shamil karke service restart karein.

### WhatsApp order notification (OPTIONAL — Render Environment se)

Naya order ate hi owner ko WhatsApp par khabar bhejne ka code
`server.js` mein maujood hai, lekin wo **tab hi active** hota hai jab
Render service ke **Environment** tab mein ye values hon (Meta
WhatsApp Cloud API se milti hain — Meta for Developers → app →
WhatsApp → API Setup):

| Env var | Kya hai |
|---|---|
| `WHATSAPP_PHONE_NUMBER_ID` | Sender number ki **ID** (number khud nahi) |
| `WHATSAPP_ACCESS_TOKEN` | Cloud API token — **secret**, sirf Render Environment mein |
| `WHATSAPP_NOTIFY_TO` | Owner ka apna WhatsApp number (country code ke saath, misaal `923147656328`) — sirf notification receive karta hai; sender kabhi ye number na ho |
| `WHATSAPP_TEMPLATE_NAME` | Meta par approved template ka naam (`{{1}}..{{5}}` = order no., customer, phone, total, payment method) |
| `WHATSAPP_TEMPLATE_LANG` | Template language code (default `en`) |

Values na hon to notification **off** rehti hai aur orders aam tareeqe
se chalte rehte hain. Token ya password **kabhi repository, chat ya
README mein na likhein** — sirf Render ke Environment tab mein.

---

## Requirements (zarooratein)

1. **Node.js hosting** (Node 18 ya zyada) — masalan VPS, Railway, Render,
   Hostinger VPS/Cloud, ya koi bhi jagah jahan `node server.js` chal sake.
   **Recommended: Render (upar wala section) — free tier tayyar hai.**
2. **PostgreSQL database** (version 13 ya zyada) — hosting ke saath
   mil sakta hai ya alag cloud database (Neon, Supabase, Railway).
3. **Apna domain** — masalan `amcollection.pk` (domain registrar se khareedein).
   Render ka free `onrender.com` address bhi istemal ho sakta hai.

---

## Setup — Step by Step

### Step 1: Files hosting par upload karein
Is package ke saaray files hosting ke project folder mein upload karein
(zip khol kar). File structure aisa hona chahiye:

```
am-collection/
  server.js
  package.json
  render.yaml         <- Render Blueprint (free deploy ke liye)
  .env                <- Step 4 mein banegi (Render par Environment tab)
  public/  (index.html, admin.html, css/, js/, assets/)
  database/schema.sql + seed-watches.sql
  scripts/init-db.js
```

### Step 2: Database banayein aur schema chalain
Hosting / cloud par ek khaali PostgreSQL database banayein, phir schema run karein:

```bash
psql "AAPKI_DATABASE_URL" -f database/schema.sql
```

Phir watch catalog (27 products, photos `public/assets/watches/` se serve
hoti hain) database mein daalne ke liye:

```bash
psql "AAPKI_DATABASE_URL" -f database/seed-watches.sql
```

Is se saari tables (16) ban jayengi — schema `server.js` ki queries se
**matched** hai: integer (SERIAL) IDs, stock seedha `products.stock_qty`
mein, orders par `order_status` / `payment_status` columns, aur payment
methods `COD` / `JAZZCASH` / `EASYPAISA` / `NAYAPAY` TEXT values mein.
`schema.sql` sirf structure + chhota sa base seed (store settings) deta
hai — **categories aur 27 products `seed-watches.sql` se ate hain**
(Men's Watches 4, Luxury Watches 15, Sports Watches 8; har product ki
photo `products.image_url` mein aur stock 20). Ek hi command ka
shortcut bhi hai: `npm run db:init` (yehi script Render ki build mein
khud chalti hai). Dono SQL files idempotent hain.

(Note: purani 6 general categories aur Women Underwear and Bras wali
subcategory is watch-store build ke seed mein NAHI hain — store ab
sirf watches ka hai. Bra Type ka attribute aur size-based pricing ka
system code mein maujood hai aur admin se mazeed products add karne
par bilkul pehle ki tarah kaam karta hai, neeche dekhein.)

Bra ki type subcategory NAHI hai — wo product ki **Bra Type** attribute hai.
Admin dashboard ke product form mein (jab subcategory Women Underwear and Bras select ho)
Bra Type ka dropdown milta hai, jis mein ye 14 types hain: T-Shirt Bra,
Sports Bra, Padded Bra, Wireless Bra / Bralette, Full-Coverage Bra,
Strapless Bra, Balconette Bra, Nursing Bra, Lace Bra, Embroidered Bra,
Satin Bra, Strappy Bra, Balconette Lace Bra, Mesh Bra. Ye type product ke
saath save hoti hai (`products.bra_type`) aur storefront par product ki
details / specifications mein "Bra Type: <type>" ke tor par dikhti hai.
Agar baad mein koi aur subcategory add ki jaye to wo alag subcategory
banegi — bra types dobara subcategories nahi banengi.

**Size ke hisaab se price (size-based pricing):** kisi product par har size ki
alag price `products.size_prices` mein save hoti hai (admin product form mein
"Size Prices (JSON)" field). Misaal — Floral Print Full-Coverage Bra &
Underwear Set: size 32 = Rs. 2,000, 34 = Rs. 2,175, 36 = Rs. 2,350,
38 = Rs. 2,525 (har bara size +Rs. 175). Base price (`price`) hamesha sab se
chhote size ki price hoti hai. Storefront product page par size select karne
se price foran us size ki ho jati hai aur specifications mein "Size Prices"
ki poori list dikhti hai; cart/checkout usi selected size ki price charge
karte hain, aur server order banate waqt price database se size ke hisaab
se khud dobara calculate karta hai — browser ki bheji price par bharosa nahi
hota. Product page aur product cards/listings dono par **Add to Cart** aur
**Buy Now** side by side hain.

**Buying flow — size + quantity PEHLE, checkout BAAD mein:** card par
**Buy Now** ya **Add to Cart** dabane par checkout/cart seedha NAHI khulta
aur koi silent default (sab se chhota size, quantity 1) NAHI lagta. Pehle
ek **quick-order panel** (bottom sheet / modal) khulta hai jis mein product
ki photo aur naam, har size ki apni price ke saath selectable size chips
(32 — Rs. 2,000 · 34 — Rs. 2,175 · 36 — Rs. 2,350 · 38 — Rs. 2,525),
quantity stepper (+ / −), live item total (unit price × quantity) aur
delivery samait total dikhta hai. Buy Now par panel ka button
**Continue to Checkout** hota hai — customer size + quantity select karke
wahi dabaye tab hi checkout form khulta hai, aur order summary mein wahi
selected size aur quantity lagi hoti hai. Add to Cart par panel
add-to-cart mode mein khulta hai (confirm button **Add to Cart**), taake
cart item bhi chosen size + quantity ke saath jaye. Product page par
quantity selector size chips ke bilkul saath laga hai, aur wahan ke
**Buy Now / Add to Cart** page par selected size AUR quantity hi istemal
karte hain. Checkout summary aur created order (order item snapshot) mein
chosen size aur quantity record hote hain; server size ki price database
se dobara calculate karke line total ko quantity se multiply karta hai.

### Step 3: Dependencies install karein
```bash
npm install
```

### Step 4: `.env` file banayein
`.env.example` ko copy karke `.env` banayein aur apni values bharein:

```bash
cp .env.example .env
```

- `DATABASE_URL` — Step 2 wale database ki connection string
- `PGSSL` — cloud database par `true`, local par `false`
- `JWT_SECRET` — lambi random value (login security ke liye) — kisi ko na batayein
- `ADMIN_USER` / `ADMIN_PASSWORD` — Admin Dashboard (`/admin`) ka login.
  Initial temporary values `admin` / `AM-Admin-786` hain — **live karne
  se pehle password lazmi change karein** (Step 6 dekhein)
- `CORS_ORIGINS` — apna domain, masalan `https://amcollection.pk`
- `JAZZCASH_SECRET` / `EASYPAISA_SECRET` / `NAYAPAY_SECRET` — ye **sirf
  merchant approval ke baad** provider dega. Tab tak khaali chhor dein;
  **Cash on Delivery is ke baghair bhi poori tarah chalta hai.**
  Secret keys kabhi frontend mein nahi jati — sirf server ki `.env` mein rehti hain.
- `WHATSAPP_*` — optional WhatsApp order notification ki settings
  (upar Render wale section mein tafseel hai). Khaali hon to
  notification off rehti hai.
- **Render par** yehi saari values service ke **Environment** tab mein
  lagti hain — wahan `.env` file nahi banani parti, aur `DATABASE_URL`
  Blueprint se khud ajati hai.

### Step 5: Server start karein
```bash
npm start
```
Website `http://localhost:4000` par (ya hosting ke diye gaye PORT par) khul jayegi:
- Store: `/`
- Admin Dashboard: website ke **Login screen** par admin username/password dalne se khud khul jata hai (Step 6 dekhein); `/admin` fallback URL bhi hai — dono par **login ke baghair dashboard NAHI khulta**

Production mein server ko hamesha chalaye rakhne ke liye hosting ka apna
process manager use karein (aksar hosting `npm start` khud chala deti hai;
VPS par `pm2 start server.js` aam tareeqa hai).

### Step 6: Admin Dashboard login (sirf owner / admin ke liye)

Admin Dashboard **customer side par kisi link se open NAHI hota** —
us ka rasta website ka **aam Login screen** hai:

- **Asal tareeqa (owner ke liye — koi admin URL likhna NAHI padta):**
  website par **Account → Login** kholein (wahi screen jo customers
  use karte hain). Wahan **"Email or Username"** wale khane mein apna
  **admin username** aur **Password** mein apna admin password likh
  kar **Login** dabayein. Credentials backend ke
  `POST /api/admin/login` se server par verify hote hain; sahi hon
  to **Admin Dashboard khud-ba-khud khul jata hai** — link ke aakhir
  mein `#/admin` ya `/admin` **likhne ki zaroorat NAHI** hai.
- **Customer login bilkul pehle jaisa hai:** customer apna email +
  password isi screen par dalta hai to us ka **customer account
  page** hi khulta hai. Customer ka token admin dashboard ya kisi
  `/api/admin/*` route ko **kabhi NAHI khol sakta** (server par
  403 milta hai) — admin token customer token se **alag** save
  hota hai (`amc-admin-token`).
- Storefront (customer website) par admin ka **koi visible
  "Admin Dashboard" link NAHI hai** — na header mein, na footer
  mein, na account page par. Login screen hi entry point hai;
  aam customer ko admin username/password pata hi nahi hota, is
  liye usay kuch nazar nahi ata.
- **Fallback:** `/admin` ka URL khud type karke bhi dashboard
  khola ja sakta hai. Wahan bhi sab se pehle **Admin Login form**
  ata hai (Username + Password) — login se pehle **koi dashboard
  data load NAHI hota**, aur backend ki tamam `/api/admin/*`
  routes baghair valid admin token ke **401/403** deti hain
  (customer account ka token bhi kaam NAHI karta). Website ke
  Login screen se login karne ke baad admin token pehle se save
  hota hai, is liye fallback page par dobara login nahi mangta.
- Login credentials server ki `.env` file mein hain:

  | Setting | Initial (temporary) value |
  |---|---|
  | `ADMIN_USER` | `admin` |
  | `ADMIN_PASSWORD` | `AM-Admin-786` |

- Sahi username/password par server ek **signed admin token** deta hai;
  admin page usay browser mein save karke har admin API call ke saath
  bhejta hai. Header mein **Logout** button hai — wo token clear karke
  wapas login form par le jata hai.
- ⚠️ **Website LIVE karne se PEHLE `.env` mein `ADMIN_PASSWORD` lazmi
  change karein** (aur chaahein to `ADMIN_USER` bhi apna rakhein),
  phir server restart karein. Upar wali values sirf **initial /
  temporary** hain taake pehli dafa login ho sake — inhein live
  password ke tor par kabhi istemal na karein.
- Admin ka **public sign-up nahi hota** — ye login customer accounts
  se bilkul alag hai.

### Step 7: Domain connect karein
1. Domain registrar par DNS mein hosting ki taraf record lagayein
   (hosting jo IP ya CNAME de, wohi lagayein — A record: domain → hosting IP).
2. Hosting panel mein custom domain add karein.
3. **SSL (HTTPS) lazmi on karein** — zyada tar hosting free Let's Encrypt
   certificate de deti hai. Bina HTTPS ke login/payment secure nahi hota.
4. `.env` mein `CORS_ORIGINS` mein apna asal domain likhein aur server restart karein.

---

## Customer Reviews — Admin Approval ke saath

Har product page par **Customer Reviews** ka section hai:

1. Customer product page par review form bharta hai — **apna naam, star
   rating (1–5) aur review text** (title optional hai). Login zaroori nahi.
2. Submit karne par review database mein **`status = PENDING`** ke saath
   save hota hai. Is stage par review **publicly NAHI dikhta** — na product
   page par, na public API (`GET /api/products/:slug/reviews` aur product
   response sirf `APPROVED` reviews wapas karte hain).
3. Review sirf **Admin Dashboard → Reviews** mein nazar aata hai, jahan
   saaray reviews apne status (Pending / Approved / Rejected) ke saath
   list hote hain.
4. Admin **Approve** dabaye to review `APPROVED` ho kar product page par
   sab ko publicly dikhne lagta hai (average rating bhi sirf approved
   reviews se banta hai). **Reject** karne par review `REJECTED` rehta
   hai — public ko kabhi nahi dikhta, record admin mein rehta hai.
   Admin kisi review ko **Delete** bhi kar sakta hai.
5. Schema: `database/schema.sql` ki `reviews` table mein
   `customer_name`, `rating`, `body`, `status` (TEXT: `PENDING` /
   `APPROVED` / `REJECTED`, default `PENDING`) aur us ke saath sync
   rehne wala `is_approved` hai.

## Owner jo 3 defaults badal sakta hai

Ye teeno `server.js` / `.env` mein hain — hosting par `.env` edit karke
server restart karne se badal jate hain:

| Default | Abhi ki value | Kahan se badlega |
|---|---|---|
| Free delivery threshold | **Rs. 5,000** — is se zyada ke order par delivery FREE | `.env` → `DELIVERY_FREE_ABOVE=5000` |
| Remote-province surcharge | **+ Rs. 100** — Balochistan, Gilgit-Baltistan | `server.js` → `DELIVERY.remoteSurcharge` (aur remote provinces ki list bhi wahin hai) |
| Store city | **Bahawalnagar** — same city, Rs. 3,000+ par delivery Rs. 150 | `.env` → `STORE_CITY=Bahawalnagar` |

Baaki delivery rule: standard delivery **Rs. 200** (`.env` → `DELIVERY_BASE=200`),
jo order place hone se pehle checkout par clear dikhta hai. Final delivery
hamesha **server** calculate karta hai — browser ke total par kabhi bharosa nahi hota.

## Checkout kaise kaam karta hai

- Checkout design approved design ke mutabiq hai: **Complete Your Order** →
  1) Customer Information (Full Name*, Mobile Number*, Email optional) →
  2) Delivery Address (Province*, City*, Area/Locality*, Complete House
  Address*, Postal Code optional) → 3) Payment Method (Cash on Delivery /
  JazzCash / Easypaisa / NayaPay — wallet par number **03147656328** dikhta
  hai) → 4) Order Summary (Subtotal, Delivery Charges, Grand Total) →
  green **PLACE ORDER** button.
- **Nearby Landmark aur Order Notes fields checkout se remove hain** —
  customer ko ye dono nazar nahi ate aur order ke liye zaroori bhi nahi.
- **Address auto-save:** customer jaise hi order place karta hai, order ke
  saath checkout par likha gaya poora delivery address backend mein
  **khud-ba-khud usi waqt save** ho jata hai (order par address snapshot) aur
  order **Admin → Orders** mein foran nazar ata hai. Koi alag "save address"
  button, prompt ya approval **nahi** hai. Customer logged in ho to wahi
  address us ki address book mein bhi automatically save ho jata hai.
  Admin ka **Confirm Order** sirf order ka status badalta hai — address
  save honay se is ka koi taalluq nahi, address order lagte hi save ho
  jata hai.
- **Quick-order panel:** product card se **Buy Now / Add to Cart** par
  checkout/cart se pehle size + quantity select karna lazmi hai (upar
  "Buying flow" section dekhein) — koi default size/quantity khud nahi
  lagta, aur checkout hamesha customer ke selected size/quantity ke
  saath khulta hai.
- **CNIC / date of birth kabhi nahi manga jata.**
- Order number format: **ORD-YYYYMMDD-001**.
- Double-click / retry se duplicate order nahi banta (Idempotency-Key).
- Stock order ke saath hi transaction mein kam hota hai — overselling mumkin nahi.
- Online payment **PAID sirf tab** hoti hai jab provider ka signed callback
  verify ho aur amount + order number match kare. COD order paid tab hota
  hai jab courier cash collect karke admin Payments mein reconcile kare.

## Footer — Customer Care, Payment Methods aur Complaint

**Footer ki "Customer Care" list mein SIRF customer ki cheezein hain** —
koi Admin link footer (ya storefront ke kisi hisse) mein NAHI hai:

1. Track Your Order
2. FAQs
3. Shipping Policy
4. Return & Refund Policy
5. Contact Us
6. **Complaint** (naya)

**Payment Methods page** (`#/payment-methods`, footer se link hai):
charon tareeqe simple steps ke saath samjhaye gaye hain —
**Cash on Delivery**, **Easypaisa**, **JazzCash** aur **NayaPay** —
aur store ka payment number **03147656328** wahan saaf likha hai
(online payment sirf isi number par; order number ke saath payment
karke TID/screenshot WhatsApp par bhejna hota hai, verification ke
baad order confirm hota hai).

**Complaint form** (`#/complaint`, footer ki Customer Care list se
link hai): customer apna **naam, mobile number, order number
(optional) aur message** likh kar complaint bhej sakta hai — login
zaroori NAHI. Submit karne par customer ko **"Your complaint has
been received"** ki confirmation dikhti hai.

- Backend: `POST /api/complaints` (public) complaint ko database ki
  **`complaints`** table mein `status = 'NEW'` ke saath save karta hai
  (table: `id, name, mobile, order_number` — nullable, `message,
  status` default `NEW`, `created_at`).
- Admin: `GET /api/admin/complaints` sirf **admin token** se khulta
  hai (baghair token ke 401, customer token par 403) aur complaints
  **Admin Dashboard → Complaints** view mein list hoti hain — nayi
  (NEW) sab se upar.
- ⚠️ **Complaints STRICTLY admin-only hain:** complaints parhna sirf
  admin ka kaam hai. Koi **public complaint list ya read endpoint
  NAHI hai** — koi customer kisi bhi complaint ko NAHI dekh sakta,
  apni bhi nahi. Complaint bhejne wale customer ko submit par sirf
  **"Your complaint has been received"** ki confirmation dikhti hai,
  is ke ilawa kuch NAHI.

## About Us Page ki Picture (Admin Settings se)

Owner **Admin Dashboard → Settings → "About Page Picture"** se About
Us page ki picture khud add/change kar sakta hai:

- **Upload / Change:** JPG / PNG / WebP / GIF file select karke
  **Upload / Change Picture** dabayein (max 5MB). File server par
  `public/uploads/about-page.<ext>` mein save hoti hai aur us ka path
  database ki `store_settings` table mein key `about_picture` ke
  saath rehta hai.
- **Customer ko kya dikhta hai:** About Us page (`#/about`) ke **sab
  se upar** wohi picture dikhti hai. Backend `GET /api/pages/about`
  `{ pictureUrl }` deta hai — storefront sirf tab hi `<img>` lagata
  hai jab picture set ho.
- **Picture set na ho to:** About page par **sirf text** dikhta hai —
  koi khaali/broken image NAHI ati.
- **Remove:** Settings mein hi **Remove Picture** ka button hai —
  file aur setting dono delete ho jate hain aur page wapas text-only
  ho jata hai.
- **Security:** upload aur remove dono **sirf admin token** se hote
  hain (`POST` / `DELETE /api/admin/about-picture`) — baghair admin
  login ke 401, customer token par 403.

## Go-Live Checklist

- [ ] Database bana kar `database/schema.sql` run kar diya
- [ ] `.env` mein asal `DATABASE_URL`, lamba `JWT_SECRET`, aur apna domain `CORS_ORIGINS` mein hai
- [ ] Server `npm start` se chal raha hai aur hosting restart par khud start hota hai
- [ ] Domain connect hai aur **HTTPS (SSL) on** hai
- [ ] Admin login test ho gaya: website ke **Login screen** par admin username/password dalne se dashboard khud khul jaye (koi `#/admin` / `/admin` type kiye baghair), customer email/password dalne se sirf customer account khule, aur bina login ke dashboard NAHI khulna chahiye; `.env` mein `ADMIN_PASSWORD` temporary value se change kar diya
- [ ] Admin se pehle products (name, SKU, price, stock, image) add ho gaye
- [ ] Ek test COD order: store → checkout → admin mein order aaya → Confirm → Shipped → Delivered
- [ ] Ek test review: product page se review submit karein → wo publicly NAHI dikhna chahiye → Admin → Reviews mein Pending approve karein → tab product page par publicly dikhe
- [ ] Track Order page par order number + mobile se status check ho gaya
- [ ] Ek test About picture: Admin → Settings → About Page Picture se ek picture upload karein → customer About Us page ke top par dikhe → phir Remove karke dekhein ke page sirf text ke saath saaf khulta hai (broken image NAHI)
- [ ] Ek test complaint: footer → Complaint se form submit karein → "Your complaint has been received" dikhe → Admin → Complaints mein wo complaint NEW status ke saath nazar aye; Payment Methods page par number **03147656328** aur charon methods check kar lein
- [ ] **COD se sale foran shuru ki ja sakti hai** — koi gateway approval zaroori nahi
- [ ] JazzCash / Easypaisa **merchant approval** ke liye apply kar dein
      (business documents provider mang sakta hai) — approval ke baad
      provider ki di hui secret key `.env` mein daal kar server restart karein,
      phir chhota sa test order karke online payment verify karein
- [ ] Database ka daily backup on karein (hosting panel se)
- [ ] **Render free tier par hon to:** calendar mein reminder lagayein — free PostgreSQL **30 din** mein expire hota hai; us se pehle paid plan par upgrade ya data export lazmi karein (tafseel upar "RENDER PAR FREE DEPLOY" section mein hai)

## API Routes (developer ke liye)

Poori list `docs/API.md` mein hai — frontend bilkul `server.js` ke inhi
routes aur request/response shapes par bana hai.

## Ek zaroori note — schema ab server se matched hai

Purani package mein ek asal khami thi: `database/schema.sql` UUID ids
aur mukhtalif column names (masalan `orders.status`, alag `inventory`
table) par bani thi, jabke `server.js` integer ids, `products.stock_qty`
aur `orders.order_status` expect karta tha — us combination mein deploy
ke baad store ke database wale hisse **kaam hi nahi karte thay**.

**Is build mein wo mismatch fix kar diya gaya hai:** `database/schema.sql`
ko `server.js` ki har query ke mutabiq dobara likha gaya hai (integer
SERIAL ids, `discount_price`, `size_prices`, `weight_kg`, variant par
`variant_name`/`price_delta`/`stock_qty`, payments par `provider_txn_id`/
`verified_at`/`raw_callback`, waghera) aur `seed-watches.sql` bhi usi
schema par seed karti hai. Schema + seed + asal server ke saath poora
flow test kiya gaya hai: products list, COD order (stock kam hona
samait), admin login, order status change, review approval, complaint
aur track order.

`server.js` mein is build ki tabdeelian sirf ye hain: Render ke liye
`0.0.0.0:$PORT` bind, Render Postgres ke liye SSL auto-on, admin product
form ke Image URL ko save karna, optional WhatsApp order notification
(sirf `.env` ki `WHATSAPP_*` settings hon to active), aur do purani
bugs ka fix jo kisi bhi schema par deploy tor dete thay — category
filter mein slug par integer-cast error (shop ki category pages 500
deti theen) aur Track Order ki history query mein ambiguous
`created_at`. Storefront ka design, 27 watches, prices, payment
methods aur admin login ka tareeqa bilkul pehle jaisa hai.
