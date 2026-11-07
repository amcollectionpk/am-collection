/* AM Collection — Luxury Watches storefront.
   Screens (mobile-app style): Home / Categories / Product Details / My Cart /
   Checkout / Order Placed / Account / Special Offers (+ Shop, Wishlist, Track,
   Policies, FAQs, Contact, Complaint, Payment Methods).
   Data: live backend API (server.js) is used first when the deployed database
   has products; otherwise the built-in watch catalog (js/catalog.js — the
   owner's 27 watches with photos + prices) drives the shop. Cart / wishlist
   live in localStorage; orders are always verified server-side. */
(function () {
  'use strict';
  var api = AMC.api, rs = AMC.rs, esc = AMC.esc;
  var app = document.getElementById('app');
  var CATALOG = window.AMC_CATALOG || { categories: [], products: [] };

  var PROVINCES = {
    'Punjab': ['Lahore','Faisalabad','Rawalpindi','Multan','Gujranwala','Sialkot','Bahawalpur','Bahawalnagar','Sargodha','Sheikhupura','Gujrat','Jhang','Dera Ghazi Khan','Sahiwal','Okara','Kasur','Rahim Yar Khan','Other'],
    'Sindh': ['Karachi','Hyderabad','Sukkur','Larkana','Nawabshah','Mirpur Khas','Jacobabad','Other'],
    'Khyber Pakhtunkhwa': ['Peshawar','Mardan','Mingora','Abbottabad','Mansehra','Kohat','Dera Ismail Khan','Other'],
    'Balochistan': ['Quetta','Gwadar','Turbat','Khuzdar','Hub','Other'],
    'Islamabad Capital Territory': ['Islamabad'],
    'Gilgit-Baltistan': ['Gilgit','Skardu','Other'],
    'Azad Jammu & Kashmir': ['Muzaffarabad','Mirpur','Rawalakot','Other']
  };
  var PAYMENTS = [
    { id: 'COD', name: 'Cash on Delivery', desc: 'Pay when your parcel arrives.' },
    { id: 'JAZZCASH', name: 'JazzCash', desc: 'Pay on ' + AMC.PAYMENT_NUMBER + ' — marked paid after verified confirmation.' },
    { id: 'EASYPAISA', name: 'Easypaisa', desc: 'Pay on ' + AMC.PAYMENT_NUMBER + ' — marked paid after verified confirmation.' },
    { id: 'NAYAPAY', name: 'NayaPay', desc: 'Pay on ' + AMC.PAYMENT_NUMBER + ' — marked paid after verified confirmation.' }
  ];
  var DELIVERY_FLAT = 200, FREE_ABOVE = 5000;
  var POLICIES = {
    shipping: 'Orders are dispatched after confirmation and delivered through courier services across Pakistan. The delivery charge is shown clearly at checkout before you place your order — the standard charge is Rs. 200, and orders of Rs. 5,000 or more get FREE delivery. Some remote areas may have a different rate, always shown in the Order Summary. Delivery usually takes 2–5 working days depending on your city. You will receive your order number at confirmation and can track your parcel any time from the Track Order page.',
    returns: 'If you receive a damaged, defective or wrong item, contact us within 7 days of delivery with your order number. Items must be unused and in the packaging they arrived in for exchange or refund. Refunds for prepaid orders are sent back through the same payment method; COD refunds are arranged after the returned parcel is received and checked.',
    privacy: 'We collect only the information needed to process and deliver your order: your name, mobile number, email (optional) and delivery address. We never ask for your CNIC or date of birth at checkout. Your information is used for order processing, delivery and order updates, and is not sold to third parties. Payment confirmations for JazzCash, Easypaisa and NayaPay are accepted only after verified confirmation from the payment provider.',
    terms: 'By placing an order on AM Collection you agree that the prices, product details and stock shown at the time of ordering apply to your order; your order stores a snapshot of the product name and price so later changes never alter a placed order. Cash on Delivery orders are payable to the courier at delivery. We may call or message you to confirm a COD order before dispatch. Orders can be cancelled by the store if an item goes out of stock, with a full refund of any prepaid amount.'
  };
  var POLICY_TITLES = { shipping: 'Shipping Policy', returns: 'Return & Refund Policy', privacy: 'Privacy Policy', terms: 'Terms & Conditions' };
  var FAQS = [
    { q: 'How do I place an order?', a: 'Add a watch to your cart, open the cart and tap Checkout. Enter your name, mobile number and delivery address, choose a payment method (Cash on Delivery, JazzCash, Easypaisa or NayaPay) and tap Place Order. You will get an order number like ORD-20261107-001 on the Order Placed page.' },
    { q: 'What are the delivery charges?', a: 'The standard delivery charge is Rs. 200. Orders of Rs. 5,000 or more get FREE delivery. The exact charge is always shown in the Order Summary before you place the order — no hidden charges.' },
    { q: 'How can I pay?', a: 'You can pay Cash on Delivery when your parcel arrives, or pay through JazzCash, Easypaisa or NayaPay on the number 03147656328. Prepaid payments are marked paid only after verified confirmation from the payment provider.' },
    { q: 'How do I track my order?', a: 'Open the Track Order page and enter your order number and the mobile number used at checkout. You will see the current status — Pending Confirmation, Confirmed, Processing, Shipped or Delivered.' },
    { q: 'Can I return or exchange an item?', a: 'Yes — damaged, defective or wrong items can be returned or exchanged within 7 days of delivery. See the Return & Refund Policy page for full details and contact us on WhatsApp for help.' },
    { q: 'Do I need an account to order?', a: 'No. You can order as a guest with just your name, mobile number and address. Creating an account lets you save your details and see your order history in My Account.' }
  ];

  /* ---------- local state ---------- */
  function readJson(k, fb) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } }
  function writeJson(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  var cart = readJson('amc-cart', []);
  var wishlist = readJson('amc-wishlist', []);
  var session = readJson('amc-session', null);
  function saveCart() { writeJson('amc-cart', cart); syncBadges(); }
  function saveWish() { writeJson('amc-wishlist', wishlist); syncBadges(); }
  function saveSession() { writeJson('amc-session', session); syncBadges(); }
  function cartCount() { return cart.reduce(function (s, c) { return s + c.qty; }, 0); }
  function cartSubtotal() { return cart.reduce(function (s, c) { return s + c.price * c.qty; }, 0); }
  function syncBadges() {
    var cc = document.getElementById('cartCount'); if (cc) cc.textContent = cartCount();
    var wc = document.getElementById('wishCount'); if (wc) wc.textContent = wishlist.length;
    var al = document.getElementById('accountLink'); if (al) al.textContent = session ? session.name.split(' ')[0] : 'Account';
  }

  /* ---------- catalog layer: live API first, built-in catalog as the shop data ---------- */
  function normProduct(p) {
    var img = p.image_url || p.image || (Array.isArray(p.images) && p.images[0] ? (p.images[0].image_url || p.images[0]) : null);
    return {
      id: p.id, slug: p.slug, name: p.name, sku: p.sku || '',
      price: Number(p.discount_price != null ? p.discount_price : p.price) || 0,
      wasPrice: (p.discount_price != null && Number(p.price) > Number(p.discount_price)) ? Number(p.price) : null,
      image_url: img, category_slug: p.category_slug || p.categorySlug || '',
      category_name: p.category_name || p.categoryName || '',
      stock_qty: p.stock_qty != null ? Number(p.stock_qty) : 20,
      is_featured: !!p.is_featured, description: p.description || ''
    };
  }
  var apiMode = null; // null=unknown, true=live DB products, false=built-in catalog
  function detectMode() {
    if (apiMode !== null) return Promise.resolve(apiMode);
    return api.get('/api/products?limit=60').then(function (d) {
      apiMode = !!(d.products && d.products.length);
      return apiMode;
    }).catch(function () { apiMode = false; return false; });
  }
  function localFilter(opts) {
    var list = CATALOG.products.slice();
    if (opts.category) list = list.filter(function (p) { return p.category_slug === opts.category; });
    if (opts.search) { var s = opts.search.toLowerCase(); list = list.filter(function (p) { return p.name.toLowerCase().indexOf(s) >= 0 || p.category_name.toLowerCase().indexOf(s) >= 0; }); }
    if (opts.sort === 'price_asc') list.sort(function (a, b) { return a.price - b.price; });
    if (opts.sort === 'price_desc') list.sort(function (a, b) { return b.price - a.price; });
    if (opts.sort === 'popular') list.sort(function (a, b) { return (b.is_featured - a.is_featured) || (a.n - b.n); });
    return list;
  }
  function loadProducts(opts) {
    opts = opts || {};
    return detectMode().then(function (live) {
      if (!live) return localFilter(opts).map(normProduct);
      var qs = '?limit=60' + (opts.category ? '&category=' + encodeURIComponent(opts.category) : '') +
        (opts.search ? '&search=' + encodeURIComponent(opts.search) : '') + (opts.sort ? '&sort=' + encodeURIComponent(opts.sort) : '');
      return api.get('/api/products' + qs).then(function (d) { return (d.products || []).map(normProduct); })
        .catch(function () { return localFilter(opts).map(normProduct); });
    });
  }
  function loadProduct(slug) {
    return detectMode().then(function (live) {
      if (!live) {
        var p = null;
        CATALOG.products.forEach(function (x) { if (x.slug === slug) p = x; });
        return p ? { product: normProduct(p), variants: [], reviews: [], reviewSummary: { count: 0, averageRating: 0 } } : null;
      }
      return api.get('/api/products/' + encodeURIComponent(slug)).then(function (d) {
        return { product: normProduct(d.product), variants: d.variants || [], reviews: d.reviews || [], reviewSummary: d.reviewSummary || { count: 0, averageRating: 0 } };
      }).catch(function () {
        var p = null; CATALOG.products.forEach(function (x) { if (x.slug === slug) p = x; });
        return p ? { product: normProduct(p), variants: [], reviews: [], reviewSummary: { count: 0, averageRating: 0 } } : null;
      });
    });
  }
  function loadCategories() {
    return detectMode().then(function (live) {
      if (!live) return CATALOG.categories;
      return api.get('/api/categories').then(function (d) {
        var cats = (d.categories || []).filter(function (c) { return !c.parent_id; });
        return cats.length ? cats : CATALOG.categories;
      }).catch(function () { return CATALOG.categories; });
    });
  }
  function renderCatBar() {
    loadCategories().then(function (cats) {
      var bar = document.getElementById('catBar'); if (!bar) return;
      bar.innerHTML = '<a href="#/shop">All Watches</a>' + cats.map(function (c) {
        return '<a href="#/shop?category=' + encodeURIComponent(c.slug) + '">' + esc(c.name) + '</a>';
      }).join('') + '<a href="#/offers">Special Offers</a>';
    });
  }

  /* ---------- cards / cart actions ---------- */
  function productCard(p) {
    var wished = wishlist.indexOf(p.slug) >= 0;
    var pct = p.wasPrice ? Math.round((p.wasPrice - p.price) / p.wasPrice * 100) : 0;
    return '<article class="pcard">' +
      '<a class="pimg" href="#/product/' + encodeURIComponent(p.slug) + '">' + (p.image_url ? '<img src="' + esc(p.image_url) + '" alt="' + esc(p.name) + '" loading="lazy">' : '<span class="noimg">⌚</span>') + '</a>' +
      '<div class="pbody">' +
        '<a class="pname" href="#/product/' + encodeURIComponent(p.slug) + '">' + esc(p.name) + '</a>' +
        (p.category_name ? '<span class="muted small">' + esc(p.category_name) + '</span>' : '') +
        '<div class="price">' + (pct ? '<span class="was">' + rs(p.wasPrice) + '</span>' : '') + rs(p.price) + (pct ? ' <span class="off">' + pct + '% OFF</span>' : '') + '</div>' +
        '<div class="pactions">' +
          '<button class="btn btn-primary btn-sm" data-add="' + esc(p.slug) + '">Add to Cart</button>' +
          '<button class="btn btn-sm" data-buy="' + esc(p.slug) + '">Buy Now</button>' +
          '<button class="btn btn-sm" data-wish="' + esc(p.slug) + '" title="Wishlist">' + (wished ? '♥' : '♡') + '</button>' +
        '</div></div></article>';
  }
  function addToCart(p, qty) {
    qty = Math.max(1, qty || 1);
    var found = null;
    cart.forEach(function (c) { if (c.slug === p.slug) found = c; });
    if (found) found.qty = Math.min(found.qty + qty, Math.max(1, p.stock_qty || 20));
    else cart.push({ productId: p.id, slug: p.slug, name: p.name, sku: p.sku, price: p.price, image: p.image_url, qty: qty, stock: p.stock_qty || 20 });
    saveCart();
  }
  function bindCardButtons(root) {
    root.querySelectorAll('[data-add],[data-buy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var slug = btn.getAttribute('data-add') || btn.getAttribute('data-buy');
        var buy = btn.hasAttribute('data-buy');
        loadProduct(slug).then(function (d) {
          if (!d) { AMC.toast('Product not available'); return; }
          addToCart(d.product, 1);
          AMC.toast('Added to cart — ' + d.product.name);
          if (buy) location.hash = '#/cart';
        });
      });
    });
    root.querySelectorAll('[data-wish]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var slug = btn.getAttribute('data-wish'), i = wishlist.indexOf(slug);
        if (i >= 0) { wishlist.splice(i, 1); btn.textContent = '♡'; AMC.toast('Removed from wishlist'); }
        else { wishlist.push(slug); btn.textContent = '♥'; AMC.toast('Added to wishlist'); }
        saveWish();
      });
    });
  }
  function gridHtml(list) { return list.length ? '<div class="grid">' + list.map(productCard).join('') + '</div>' : '<div class="empty">No watches found.</div>'; }
  function deliveryEstimate(subtotal) { return subtotal >= FREE_ABOVE ? 0 : DELIVERY_FLAT; }
  function summaryHtml(subtotal, delivery) {
    return '<div class="summary-line"><span>Subtotal</span><span>' + rs(subtotal) + '</span></div>' +
      '<div class="summary-line"><span>Delivery</span><span>' + (delivery === 0 ? 'FREE' : rs(delivery)) + '</span></div>' +
      '<div class="summary-line total"><span>Grand Total</span><span>' + rs(subtotal + delivery) + '</span></div>';
  }

  /* ---------- HOME ---------- */
  function viewHome() {
    app.innerHTML = '<p class="muted">Loading…</p>';
    Promise.all([loadCategories(), loadProducts({ sort: 'popular' })]).then(function (r) {
      var cats = r[0], all = r[1];
      var best = all.filter(function (p) { return p.is_featured; });
      if (best.length < 4) best = all.slice(0, 8);
      var heroImg = (all.filter(function (p) { return p.slug === 'jacob-and-co-the-godfather'; })[0] || all[0] || {}).image_url || '/assets/watches/watch-27.jpg';
      app.innerHTML =
        '<section class="hero"><div>' +
          '<span class="kick">AM COLLECTION — LUXURY WATCHES</span>' +
          '<h1>Timeless Luxury,<br><em>On Your Wrist</em></h1>' +
          '<p>Premium Quality, Best Prices — Cash on Delivery across Pakistan</p>' +
          '<div class="hero-cta"><a class="btn btn-primary" href="#/shop">Shop Now</a><a class="btn" href="#/offers">Special Offers</a></div>' +
        '</div><img src="' + esc(heroImg) + '" alt="Luxury watch at AM Collection"></section>' +
        '<div class="trust-row">' +
          '<div class="trust-box"><b>Cash on Delivery</b><span class="muted small">Pay at your doorstep</span></div>' +
          '<div class="trust-box"><b>Delivery Rs. 200</b><span class="muted small">FREE on orders Rs. 5,000+</span></div>' +
          '<div class="trust-box"><b>Easy Payments</b><span class="muted small">JazzCash · Easypaisa · NayaPay</span></div>' +
          '<div class="trust-box"><b>7-Day Easy Return</b><span class="muted small">Damaged or wrong item</span></div>' +
        '</div>' +
        '<h2 class="section-title">Shop by Category <a href="#/categories">View All →</a></h2>' +
        '<div class="tiles">' + cats.map(function (c) {
          var count = all.filter(function (p) { return p.category_slug === c.slug; }).length;
          return '<a class="tile" href="#/shop?category=' + encodeURIComponent(c.slug) + '"><img src="' + esc(c.image_url || c.image || '/assets/watches/watch-01.jpg') + '" alt="' + esc(c.name) + '"><small>' + (count ? count + ' watches' : 'Watches') + '</small><span>' + esc(c.name) + '</span></a>';
        }).join('') + '</div>' +
        '<h2 class="section-title">Best Selling <a href="#/shop">Shop All →</a></h2>' + gridHtml(best.slice(0, 8)) +
        '<div class="offer-banner"><div><b>Free Delivery</b><br><span class="muted">On all orders of Rs. 5,000 or more — anywhere in Pakistan.</span></div><a class="btn btn-primary" href="#/offers">See Offers</a></div>' +
        '<h2 class="section-title">All Watches</h2>' + gridHtml(all.slice(0, 12)) +
        (all.length > 12 ? '<p style="text-align:center;margin-top:16px"><a class="btn" href="#/shop">View All ' + all.length + ' Watches</a></p>' : '');
      bindCardButtons(app);
      window.scrollTo(0, 0);
    });
  }

  /* ---------- CATEGORIES ---------- */
  function viewCategories() {
    Promise.all([loadCategories(), loadProducts({})]).then(function (r) {
      var cats = r[0], all = r[1];
      app.innerHTML = '<h1 class="section-title">Categories</h1><div class="tiles">' + cats.map(function (c) {
        var count = all.filter(function (p) { return p.category_slug === c.slug; }).length;
        return '<a class="tile" href="#/shop?category=' + encodeURIComponent(c.slug) + '"><img src="' + esc(c.image_url || c.image || '/assets/watches/watch-01.jpg') + '" alt="' + esc(c.name) + '"><small>' + count + ' watches</small><span>' + esc(c.name) + '</span></a>';
      }).join('') + '</div>' +
      '<p class="muted" style="margin-top:14px">Looking for a deal? See <a href="#/offers">Special Offers</a> — free delivery on orders of Rs. 5,000 or more.</p>';
      window.scrollTo(0, 0);
    });
  }

  /* ---------- SHOP ---------- */
  function viewShop(params) {
    var cat = params.get('category') || '', search = params.get('search') || '', sort = params.get('sort') || 'newest';
    loadCategories().then(function (cats) {
      app.innerHTML = '<h1 class="section-title">' + (cat ? esc((cats.filter(function (c) { return c.slug === cat; })[0] || {}).name || 'Shop') : (search ? 'Search: ' + esc(search) : 'All Watches')) + '</h1>' +
        '<div class="filters"><select id="fCat"><option value="">All Categories</option>' + cats.map(function (c) { return '<option value="' + esc(c.slug) + '"' + (c.slug === cat ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') + '</select>' +
        '<select id="fSort"><option value="newest"' + (sort === 'newest' ? ' selected' : '') + '>Newest</option><option value="popular"' + (sort === 'popular' ? ' selected' : '') + '>Best Selling</option><option value="price_asc"' + (sort === 'price_asc' ? ' selected' : '') + '>Price: Low to High</option><option value="price_desc"' + (sort === 'price_desc' ? ' selected' : '') + '>Price: High to Low</option></select></div>' +
        '<div id="shopGrid"><p class="muted">Loading…</p></div>';
      function reload() {
        loadProducts({ category: cat, search: search, sort: sort }).then(function (list) {
          var g = document.getElementById('shopGrid'); if (!g) return;
          g.innerHTML = gridHtml(list); bindCardButtons(g);
        });
      }
      document.getElementById('fCat').addEventListener('change', function () { cat = this.value; reload(); });
      document.getElementById('fSort').addEventListener('change', function () { sort = this.value; reload(); });
      reload(); window.scrollTo(0, 0);
    });
  }

  /* ---------- PRODUCT DETAILS ---------- */
  function viewProduct(slug) {
    app.innerHTML = '<p class="muted">Loading…</p>';
    loadProduct(slug).then(function (d) {
      if (!d) { app.innerHTML = '<div class="empty">Product not found. <a href="#/shop">Back to shop</a></div>'; return; }
      var p = d.product, qty = 1;
      var sum = d.reviewSummary || { count: 0, averageRating: 0 };
      app.innerHTML =
        '<p class="small"><a href="#/">Home</a> / <a href="#/shop?category=' + encodeURIComponent(p.category_slug) + '">' + esc(p.category_name || 'Watches') + '</a> / ' + esc(p.name) + '</p>' +
        '<div class="pd"><div class="pd-img"><img src="' + esc(p.image_url || '') + '" alt="' + esc(p.name) + '"></div>' +
        '<div><span class="muted small">' + esc(p.category_name || '') + (p.sku ? ' · SKU ' + esc(p.sku) : '') + '</span>' +
        '<h1>' + esc(p.name) + '</h1>' +
        (sum.count ? '<p class="stars">' + '★★★★★'.slice(0, Math.round(sum.averageRating)) + ' <span class="muted small">' + sum.averageRating + ' (' + sum.count + ' reviews)</span></p>' : '') +
        '<p class="big-price">' + (p.wasPrice ? '<span class="was" style="color:#9a8f76;text-decoration:line-through;font-size:1rem">' + rs(p.wasPrice) + '</span> ' : '') + rs(p.price) + '</p>' +
        '<p class="muted">' + (p.stock_qty > 0 ? 'In stock — ready to dispatch' : 'Out of stock') + ' · Delivery Rs. 200 (FREE on orders Rs. 5,000+)</p>' +
        '<p>' + esc(p.description || '') + '</p>' +
        '<div class="pd-size-qty"><div><span class="small muted">Quantity</span><div class="qty-ctrl"><button id="qMinus" type="button">−</button><input id="qVal" value="1" readonly><button id="qPlus" type="button">+</button></div></div></div>' +
        '<div class="action-row" style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px">' +
          '<button class="btn btn-primary" id="pdAdd">Add to Cart</button>' +
          '<button class="btn" id="pdBuy">Buy Now</button>' +
          '<button class="btn" id="pdWish">' + (wishlist.indexOf(p.slug) >= 0 ? '♥ Wishlisted' : '♡ Wishlist') + '</button></div>' +
        '<div class="trust-box" style="text-align:left;margin-top:16px"><b>Payment options</b><br><span class="muted small">Cash on Delivery, JazzCash, Easypaisa, NayaPay — ' + AMC.PAYMENT_NUMBER + '</span></div>' +
        '</div></div>' +
        '<h2 class="section-title">Customer Reviews</h2><div id="revBox">' +
        (d.reviews.length ? d.reviews.map(function (r) { return '<div class="review-card"><b>' + esc(r.customer_name) + '</b> <span class="stars">' + '★★★★★'.slice(0, Number(r.rating) || 0) + '</span><p>' + esc(r.body) + '</p></div>'; }).join('') : '<p class="muted">No reviews yet.</p>') +
        '<form class="review-form" id="revForm"><h3 style="margin-top:0">Write a review</h3>' +
        '<label>Your name *<input id="revName" required></label>' +
        '<label>Rating *<span class="star-input" id="revStars">' + [1, 2, 3, 4, 5].map(function (n) { return '<button type="button" data-star="' + n + '">★</button>'; }).join('') + '</span></label>' +
        '<label>Your review *<textarea id="revText" rows="3" required></textarea></label>' +
        '<p class="form-error" id="revErr"></p><button class="btn btn-primary" type="submit">Submit Review</button>' +
        '<p class="muted small">Reviews appear publicly after admin approval.</p></form></div>' +
        '<h2 class="section-title">You may also like</h2><div id="relGrid"></div>';
      document.getElementById('qMinus').addEventListener('click', function () { qty = Math.max(1, qty - 1); document.getElementById('qVal').value = qty; });
      document.getElementById('qPlus').addEventListener('click', function () { qty = Math.min(p.stock_qty || 20, qty + 1); document.getElementById('qVal').value = qty; });
      document.getElementById('pdAdd').addEventListener('click', function () { addToCart(p, qty); AMC.toast('Added to cart'); });
      document.getElementById('pdBuy').addEventListener('click', function () { addToCart(p, qty); location.hash = '#/checkout'; });
      document.getElementById('pdWish').addEventListener('click', function () {
        var i = wishlist.indexOf(p.slug);
        if (i >= 0) { wishlist.splice(i, 1); this.textContent = '♡ Wishlist'; } else { wishlist.push(p.slug); this.textContent = '♥ Wishlisted'; }
        saveWish();
      });
      var rating = 5;
      function paintStars() { document.querySelectorAll('#revStars button').forEach(function (b) { b.classList.toggle('on', Number(b.getAttribute('data-star')) <= rating); }); }
      paintStars();
      document.querySelectorAll('#revStars button').forEach(function (b) { b.addEventListener('click', function () { rating = Number(b.getAttribute('data-star')); paintStars(); }); });
      document.getElementById('revForm').addEventListener('submit', function (e) {
        e.preventDefault();
        api.post('/api/products/' + encodeURIComponent(slug) + '/reviews', { customerName: document.getElementById('revName').value.trim(), rating: rating, body: document.getElementById('revText').value.trim() })
          .then(function () { document.getElementById('revBox').insertAdjacentHTML('beforeend', '<div class="review-success">Thank you! Your review is submitted and will appear after admin approval.</div>'); document.getElementById('revForm').reset(); rating = 5; paintStars(); })
          .catch(function (err) { document.getElementById('revErr').textContent = (err.details || [err.message]).join(' '); });
      });
      loadProducts({ category: p.category_slug }).then(function (list) {
        var rel = list.filter(function (x) { return x.slug !== p.slug; }).slice(0, 4);
        var g = document.getElementById('relGrid'); if (g) { g.innerHTML = gridHtml(rel); bindCardButtons(g); }
      });
      window.scrollTo(0, 0);
    });
  }

  /* ---------- MY CART ---------- */
  function viewCart() {
    if (!cart.length) {
      app.innerHTML = '<h1 class="section-title">My Cart</h1><div class="empty">Your cart is empty.<br><br><a class="btn btn-primary" href="#/shop">Shop Watches</a></div>';
      window.scrollTo(0, 0); return;
    }
    var sub = cartSubtotal(), del = deliveryEstimate(sub);
    app.innerHTML = '<h1 class="section-title">My Cart</h1><div class="card">' +
      cart.map(function (c, i) {
        return '<div class="cart-row">' + (c.image ? '<img src="' + esc(c.image) + '" alt="">' : '<span>⌚</span>') +
          '<div><a href="#/product/' + encodeURIComponent(c.slug) + '"><b>' + esc(c.name) + '</b></a><br><span class="muted small">' + rs(c.price) + ' each</span>' +
          '<div class="qty-ctrl" style="margin-top:6px"><button data-dec="' + i + '">−</button><input value="' + c.qty + '" readonly><button data-inc="' + i + '">+</button></div></div>' +
          '<div style="text-align:right"><b>' + rs(c.price * c.qty) + '</b><br><button class="btn btn-sm btn-ghost" data-del="' + i + '">Remove</button></div></div>';
      }).join('') + summaryHtml(sub, del) +
      '<p class="muted small">Delivery is Rs. 200 — FREE on orders of Rs. 5,000 or more. Final delivery is confirmed at checkout.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><a class="btn btn-primary" href="#/checkout">Proceed to Checkout</a><a class="btn" href="#/shop">Continue Shopping</a></div></div>';
    app.querySelectorAll('[data-inc]').forEach(function (b) { b.addEventListener('click', function () { var c = cart[Number(b.getAttribute('data-inc'))]; c.qty = Math.min(c.stock || 20, c.qty + 1); saveCart(); viewCart(); }); });
    app.querySelectorAll('[data-dec]').forEach(function (b) { b.addEventListener('click', function () { var c = cart[Number(b.getAttribute('data-dec'))]; c.qty = Math.max(1, c.qty - 1); saveCart(); viewCart(); }); });
    app.querySelectorAll('[data-del]').forEach(function (b) { b.addEventListener('click', function () { cart.splice(Number(b.getAttribute('data-del')), 1); saveCart(); viewCart(); }); });
    window.scrollTo(0, 0);
  }

  /* ---------- CHECKOUT ---------- */
  var idemKey = null;
  function viewCheckout() {
    if (!cart.length) { location.hash = '#/cart'; return; }
    if (!idemKey) idemKey = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'idem-' + Date.now() + '-' + Math.random().toString(36).slice(2);
    var provOptions = Object.keys(PROVINCES).map(function (p) { return '<option>' + esc(p) + '</option>'; }).join('');
    app.innerHTML = '<h1 class="section-title">Checkout</h1>' +
      '<div class="checkout-steps"><span class="step on"><span class="step-num">1</span> Details</span><span class="step"><span class="step-num">2</span> Payment</span><span class="step"><span class="step-num">3</span> Done</span></div>' +
      '<form id="coForm"><div class="card"><h3 style="margin-top:0">Your Details</h3>' +
      '<label>Full Name *<input id="coName" required autocomplete="name" value="' + esc(session ? session.name : '') + '"></label>' +
      '<label>Mobile Number * (03XX XXXXXXX)<input id="coMobile" required inputmode="tel" autocomplete="tel"></label>' +
      '<label>Email (optional)<input id="coEmail" type="email" autocomplete="email" value="' + esc(session ? session.email : '') + '"></label>' +
      '<label>Province *<select id="coProvince" required><option value="">Select province</option>' + provOptions + '</select></label>' +
      '<label>City *<select id="coCity" required><option value="">Select province first</option></select></label>' +
      '<label>Area / Locality *<input id="coArea" required></label>' +
      '<label>Complete House Address *<input id="coHouse" required placeholder="House, street, block…"></label>' +
      '<label>Postal Code (optional)<input id="coPostal"></label></div>' +
      '<div class="card" style="margin-top:14px"><h3 style="margin-top:0">Payment Method</h3><div class="pay-grid">' +
      PAYMENTS.map(function (p, i) { return '<label class="pay-card' + (i === 0 ? ' sel' : '') + '"><input type="radio" name="pay" value="' + p.id + '"' + (i === 0 ? ' checked' : '') + '><span><b>' + esc(p.name) + '</b><br><span class="muted small">' + esc(p.desc) + '</span></span></label>'; }).join('') +
      '</div></div>' +
      '<div class="card" style="margin-top:14px"><h3 style="margin-top:0">Order Summary</h3><div id="coSummary"></div>' +
      '<p class="form-error" id="coErr"></p>' +
      '<button class="btn btn-primary btn-block place-order" id="coPlace" type="submit">Place Order</button></div></form>';
    var provEl = document.getElementById('coProvince'), cityEl = document.getElementById('coCity');
    function fillCities() {
      var cities = PROVINCES[provEl.value] || [];
      cityEl.innerHTML = cities.map(function (c) { return '<option>' + esc(c) + '</option>'; }).join('');
      quote();
    }
    function quote() {
      var items = cart.map(function (c) { return { productId: c.productId, quantity: c.qty }; });
      api.post('/api/delivery/quote', { items: items, province: provEl.value || undefined, city: cityEl.value || undefined }).then(function (q) {
        document.getElementById('coSummary').innerHTML = summaryHtml(q.subtotal, q.deliveryFee);
      }).catch(function () {
        var sub = cartSubtotal();
        document.getElementById('coSummary').innerHTML = summaryHtml(sub, deliveryEstimate(sub));
      });
    }
    provEl.addEventListener('change', fillCities);
    cityEl.addEventListener('change', quote);
    app.querySelectorAll('.pay-card').forEach(function (card) { card.addEventListener('click', function () { app.querySelectorAll('.pay-card').forEach(function (x) { x.classList.remove('sel'); }); card.classList.add('sel'); }); });
    quote();
    document.getElementById('coForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var pay = (app.querySelector('input[name="pay"]:checked') || {}).value || 'COD';
      var body = {
        customer: { fullName: document.getElementById('coName').value.trim(), mobile: document.getElementById('coMobile').value.trim(), email: document.getElementById('coEmail').value.trim() || undefined },
        address: { province: provEl.value, city: cityEl.value, area: document.getElementById('coArea').value.trim(), houseAddress: document.getElementById('coHouse').value.trim(), postalCode: document.getElementById('coPostal').value.trim() || undefined },
        paymentMethod: pay,
        items: cart.map(function (c) { return { productId: c.productId, quantity: c.qty }; })
      };
      var btn = document.getElementById('coPlace'); btn.disabled = true; btn.textContent = 'Placing order…';
      api.post('/api/orders', body, { 'Idempotency-Key': idemKey }).then(function (res) {
        var o = res.order || res;
        var placed = { orderNumber: o.orderNumber || res.orderNumber, grandTotal: o.grandTotal || res.grandTotal, paymentMethod: o.paymentMethod || res.paymentMethod || pay, paymentNumber: res.paymentNumber || AMC.PAYMENT_NUMBER, nextStep: res.nextStep || '' };
        writeJson('amc-last-order', placed);
        cart = []; idemKey = null; saveCart();
        location.hash = '#/order-placed';
      }).catch(function (err) {
        btn.disabled = false; btn.textContent = 'Place Order';
        document.getElementById('coErr').textContent = (err.details && err.details.length ? err.details.join(' ') : err.message) + ' — if the shop database is not live yet, please order on WhatsApp: ' + AMC.PAYMENT_NUMBER;
      });
    });
    window.scrollTo(0, 0);
  }

  /* ---------- ORDER PLACED ---------- */
  function viewPlaced() {
    var o = readJson('amc-last-order', null);
    if (!o) { app.innerHTML = '<div class="empty">No recent order found. <a href="#/shop">Continue shopping</a></div>'; return; }
    app.innerHTML = '<div class="card success-hero"><div class="tick">✓</div><h1>Order Placed!</h1>' +
      '<p>Thank you for shopping with AM Collection.</p>' +
      '<p>Your order number is <b style="color:var(--gold-soft)">' + esc(o.orderNumber || '') + '</b></p>' +
      '<p><strong>Grand Total: ' + rs(o.grandTotal) + '</strong> · Payment: ' + esc(o.paymentMethod || '') + '</p>' +
      '<p class="muted">' + esc(o.nextStep || 'We will call or message you to confirm your order before dispatch.') + (o.paymentMethod && o.paymentMethod !== 'COD' ? '<br>Payment number: <strong>' + esc(o.paymentNumber || AMC.PAYMENT_NUMBER) + '</strong> — your payment is marked paid after verified confirmation.' : '') + '</p>' +
      '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap"><a class="btn btn-primary" href="#/track">Track Order</a><a class="btn" href="#/shop">Continue Shopping</a></div></div>';
    window.scrollTo(0, 0);
  }

  /* ---------- SPECIAL OFFERS ---------- */
  function viewOffers() {
    loadProducts({ sort: 'price_asc' }).then(function (all) {
      var under3k = all.filter(function (p) { return p.price < 3000; });
      var premium = all.filter(function (p) { return p.price >= 3950; }).sort(function (a, b) { return b.price - a.price; });
      app.innerHTML = '<h1 class="section-title">Special Offers</h1>' +
        '<div class="offer-banner"><div><b>FREE Delivery</b><br><span class="muted">On every order of Rs. 5,000 or more — no code needed, applied automatically at checkout.</span></div><a class="btn btn-primary" href="#/shop">Shop Now</a></div>' +
        '<div class="offer-banner"><div><b>Cash on Delivery</b><br><span class="muted">Order now and pay at your doorstep, anywhere in Pakistan. JazzCash, Easypaisa and NayaPay also accepted.</span></div><a class="btn" href="#/cart">My Cart</a></div>' +
        '<h2 class="section-title">Watches Under Rs. 3,000</h2>' + gridHtml(under3k) +
        '<h2 class="section-title">Premium Picks — Free Delivery</h2><p class="muted small" style="margin-top:-6px">Add any of these with another watch to cross Rs. 5,000 and your delivery is free.</p>' + gridHtml(premium);
      bindCardButtons(app); window.scrollTo(0, 0);
    });
  }

  /* ---------- WISHLIST ---------- */
  function viewWishlist() {
    loadProducts({}).then(function (all) {
      var list = all.filter(function (p) { return wishlist.indexOf(p.slug) >= 0; });
      app.innerHTML = '<h1 class="section-title">Wishlist</h1>' + (list.length ? gridHtml(list) : '<div class="empty">Your wishlist is empty. Tap ♡ on any watch to save it here.</div>');
      bindCardButtons(app); window.scrollTo(0, 0);
    });
  }

  /* ---------- TRACK ORDER ---------- */
  function viewTrack() {
    app.innerHTML = '<h1 class="section-title">Track Your Order</h1><form class="card" id="trForm">' +
      '<label>Order Number *<input id="trNum" required placeholder="ORD-20261107-001"></label>' +
      '<label>Mobile Number *<input id="trPhone" required inputmode="tel" placeholder="03XX XXXXXXX"></label>' +
      '<p class="form-error" id="trErr"></p><button class="btn btn-primary" type="submit">Track</button><div id="trOut"></div></form>';
    document.getElementById('trForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var num = document.getElementById('trNum').value.trim(), ph = document.getElementById('trPhone').value.trim();
      api.get('/api/orders/track?orderNumber=' + encodeURIComponent(num) + '&phone=' + encodeURIComponent(ph)).then(function (d) {
        var o = d.order || {};
        document.getElementById('trErr').textContent = '';
        document.getElementById('trOut').innerHTML = '<div class="summary-line" style="margin-top:12px"><span>Status</span><b>' + esc(o.order_status || '') + '</b></div>' +
          '<div class="summary-line"><span>Payment</span><span>' + esc(o.payment_status || '') + ' · ' + esc(o.payment_method || '') + '</span></div>' +
          '<div class="summary-line total"><span>Grand Total</span><span>' + rs(o.grand_total) + '</span></div>' +
          ((d.history || []).length ? '<ul class="timeline">' + d.history.map(function (h) { return '<li><b>' + esc(h.status) + '</b> — ' + esc(h.note || '') + '<br><span class="small">' + esc(String(h.created_at || '').slice(0, 16).replace('T', ' ')) + '</span></li>'; }).join('') + '</ul>' : '');
      }).catch(function (err) { document.getElementById('trErr').textContent = err.message; });
    });
    window.scrollTo(0, 0);
  }

  /* ---------- ACCOUNT ---------- */
  function viewAccount() {
    if (AMC.getAdminToken()) {
      app.innerHTML = '<h1 class="section-title">My Account</h1><div class="card"><p>You are logged in as <b>Admin</b>.</p>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn btn-primary" href="/admin">Open Admin Dashboard</a>' +
        '<button class="btn" id="accAdminOut">Logout Admin</button></div></div>';
      document.getElementById('accAdminOut').addEventListener('click', function () { AMC.setAdminToken(null); AMC.toast('Admin logged out'); viewAccount(); });
      window.scrollTo(0, 0); return;
    }
    if (session && AMC.getToken()) {
      app.innerHTML = '<h1 class="section-title">My Account</h1><div class="card"><p>Welcome, <b>' + esc(session.name) + '</b><br><span class="muted">' + esc(session.email) + '</span></p>' +
        '<h3>My Orders</h3><div id="accOrders"><p class="muted">Loading…</p></div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><a class="btn" href="#/track">Track Order</a><button class="btn btn-ghost" id="accOut">Logout</button></div></div>';
      document.getElementById('accOut').addEventListener('click', function () { AMC.setToken(null); session = null; saveSession(); AMC.toast('Logged out'); viewAccount(); });
      api.get('/api/auth/me/orders').then(function (d) {
        var box = document.getElementById('accOrders'); if (!box) return;
        var orders = d.orders || [];
        box.innerHTML = orders.length ? orders.map(function (o) { return '<div class="summary-line"><span>' + esc(o.order_number) + '<br><span class="muted small">' + esc(String(o.created_at || '').slice(0, 10)) + '</span></span><span><span class="status-badge">' + esc(o.order_status) + '</span> ' + rs(o.grand_total) + '</span></div>'; }).join('') : '<p class="muted">No orders yet.</p>';
      }).catch(function () { var box = document.getElementById('accOrders'); if (box) box.innerHTML = '<p class="muted">Orders could not be loaded right now. Use Track Order with your order number and mobile number.</p>'; });
      window.scrollTo(0, 0); return;
    }
    app.innerHTML = '<h1 class="section-title">My Account</h1><div class="card" style="max-width:480px;margin:0 auto">' +
      '<div style="display:flex;gap:8px;margin-bottom:14px"><button class="btn btn-primary btn-sm" id="tabLogin">Login</button><button class="btn btn-sm" id="tabReg">Create Account</button></div>' +
      '<form id="authForm"><div id="regFields" hidden><label>Full Name *<input id="authName"></label><label>Phone (optional)<input id="authPhone" inputmode="tel"></label></div>' +
      '<label>Email *<input id="authEmail" type="email" required autocomplete="email"></label>' +
      '<label>Password *<input id="authPass" type="password" required autocomplete="current-password"></label>' +
      '<p class="form-error" id="authErr"></p><button class="btn btn-primary btn-block" id="authBtn" type="submit">Login</button></form>' +
      '<p class="muted small">Store owner? Login with the admin username and password from the server .env file — the Admin Dashboard opens automatically.</p>' +
      '<p class="muted small">No account needed to order — you can always check out as a guest.</p></div>';
    var mode = 'login';
    function setMode(m) {
      mode = m;
      document.getElementById('regFields').hidden = m === 'login';
      document.getElementById('authBtn').textContent = m === 'login' ? 'Login' : 'Create Account';
      document.getElementById('tabLogin').classList.toggle('btn-primary', m === 'login');
      document.getElementById('tabReg').classList.toggle('btn-primary', m !== 'login');
    }
    document.getElementById('tabLogin').addEventListener('click', function () { setMode('login'); });
    document.getElementById('tabReg').addEventListener('click', function () { setMode('register'); });
    document.getElementById('authForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('authEmail').value.trim(), pass = document.getElementById('authPass').value;
      var errEl = document.getElementById('authErr');
      if (mode === 'register') {
        api.post('/api/auth/register', { fullName: document.getElementById('authName').value.trim(), email: email, phone: document.getElementById('authPhone').value.trim() || undefined, password: pass }).then(function (d) {
          if (d.token) AMC.setToken(d.token);
          session = { name: (d.user && (d.user.full_name || d.user.name)) || document.getElementById('authName').value.trim(), email: email };
          saveSession(); AMC.toast('Account created — welcome!'); viewAccount();
        }).catch(function (err) { errEl.textContent = (err.details || [err.message]).join(' '); });
      } else {
        // Pehle customer login; fail ho to admin login try (owner ke liye).
        api.post('/api/auth/login', { email: email, password: pass }).then(function (d) {
          if (d.token) AMC.setToken(d.token);
          session = { name: (d.user && (d.user.full_name || d.user.name)) || email, email: (d.user && d.user.email) || email };
          saveSession(); AMC.toast('Welcome back!'); viewAccount();
        }).catch(function () {
          api.post('/api/admin/login', { username: email, password: pass }).then(function (d) {
            if (d.token) AMC.setAdminToken(d.token);
            AMC.toast('Admin login successful'); viewAccount();
          }).catch(function (err2) { errEl.textContent = err2.message || 'Login failed — check email and password.'; });
        });
      }
    });
    window.scrollTo(0, 0);
  }

  /* ---------- STATIC PAGES ---------- */
  function viewPolicy(key) {
    app.innerHTML = '<h1 class="section-title">' + esc(POLICY_TITLES[key] || 'Policy') + '</h1><div class="card policy-body"><p>' + esc(POLICIES[key] || '') + '</p></div>';
    window.scrollTo(0, 0);
  }
  function viewFaqs() {
    app.innerHTML = '<h1 class="section-title">FAQs</h1>' + FAQS.map(function (f) { return '<details class="faq"><summary>' + esc(f.q) + '</summary><p class="muted">' + esc(f.a) + '</p></details>'; }).join('');
    window.scrollTo(0, 0);
  }
  function viewPayments() {
    app.innerHTML = '<h1 class="section-title">Payment Methods</h1><div class="card">' +
      PAYMENTS.map(function (p) { return '<div class="summary-line"><span><b>' + esc(p.name) + '</b><br><span class="muted small">' + esc(p.desc) + '</span></span></div>'; }).join('') +
      '<p class="muted">Payment number for JazzCash, Easypaisa and NayaPay: <b style="color:var(--gold-soft)">' + AMC.PAYMENT_NUMBER + '</b>. Prepaid payments are marked paid only after verified confirmation from the payment provider.</p></div>';
    window.scrollTo(0, 0);
  }
  function viewAbout() {
    app.innerHTML = '<h1 class="section-title">About AM Collection</h1><div id="aboutPic"></div><div class="card policy-body">' +
      '<p>AM Collection is an online watch store in Pakistan, bringing stylish men\'s, luxury and sports watches to your doorstep at honest prices.</p>' +
      '<p>Premium Quality, Best Prices — Cash on Delivery across Pakistan. Pay cash at your doorstep, or through JazzCash, Easypaisa and NayaPay.</p>' +
      '<p>Delivery is Rs. 200, and FREE on orders of Rs. 5,000 or more. Questions? Message us on WhatsApp any time.</p>' +
      '<p><a class="btn btn-primary" href="#/shop">Shop Watches</a> <a class="btn" href="' + AMC.WHATSAPP_LINK + '" target="_blank" rel="noopener">WhatsApp Us</a></p></div>';
    api.get('/api/pages/about').then(function (d) {
      if (d && d.pictureUrl) { var b = document.getElementById('aboutPic'); if (b) b.innerHTML = '<img class="about-picture" src="' + esc(d.pictureUrl) + '" alt="AM Collection">'; }
    }).catch(function () {});
    window.scrollTo(0, 0);
  }
  function viewContact() {
    app.innerHTML = '<h1 class="section-title">Contact Us</h1><div class="card">' +
      '<p>WhatsApp: <a href="' + AMC.WHATSAPP_LINK + '" target="_blank" rel="noopener"><b>' + AMC.PAYMENT_NUMBER + '</b></a></p>' +
      '<p class="muted">Message us on WhatsApp for order help, product questions and returns. For a formal complaint, use the <a href="#/complaint">Complaint page</a>.</p>' +
      '<p><a class="btn btn-primary" href="' + AMC.WHATSAPP_LINK + '" target="_blank" rel="noopener">Chat on WhatsApp</a></p></div>';
    window.scrollTo(0, 0);
  }
  function viewComplaint() {
    app.innerHTML = '<h1 class="section-title">File a Complaint</h1><form class="card" id="cpForm" style="max-width:560px">' +
      '<label>Your Name *<input id="cpName" required></label>' +
      '<label>Mobile Number *<input id="cpPhone" required inputmode="tel"></label>' +
      '<label>Order Number (if any)<input id="cpOrder"></label>' +
      '<label>Your Complaint *<textarea id="cpMsg" rows="4" required></textarea></label>' +
      '<p class="form-error" id="cpErr"></p><button class="btn btn-primary" type="submit">Submit Complaint</button><div id="cpDone"></div></form>';
    document.getElementById('cpForm').addEventListener('submit', function (e) {
      e.preventDefault();
      api.post('/api/complaints', { name: document.getElementById('cpName').value.trim(), phone: document.getElementById('cpPhone').value.trim(), orderNumber: document.getElementById('cpOrder').value.trim() || undefined, message: document.getElementById('cpMsg').value.trim() })
        .then(function () { document.getElementById('cpDone').innerHTML = '<div class="review-success" style="margin-top:12px">Your complaint has been received. We will contact you soon.</div>'; document.getElementById('cpForm').reset(); })
        .catch(function (err) { document.getElementById('cpErr').textContent = (err.details || [err.message]).join(' '); });
    });
    window.scrollTo(0, 0);
  }

  /* ---------- ROUTER ---------- */
  function setNav(key) {
    document.querySelectorAll('.bottom-nav a').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-nav') === key); });
  }
  function route() {
    var hash = location.hash.replace(/^#\/?/, '');
    var parts = hash.split('?');
    var path = parts[0], params = new URLSearchParams(parts[1] || '');
    var seg = path.split('/').filter(Boolean);
    syncBadges();
    if (path === '' ) { setNav('home'); viewHome(); }
    else if (seg[0] === 'shop') { setNav(''); viewShop(params); }
    else if (seg[0] === 'categories') { setNav('categories'); viewCategories(); }
    else if (seg[0] === 'offers') { setNav('offers'); viewOffers(); }
    else if (seg[0] === 'product' && seg[1]) { setNav(''); viewProduct(decodeURIComponent(seg[1])); }
    else if (seg[0] === 'cart') { setNav('cart'); viewCart(); }
    else if (seg[0] === 'checkout') { setNav('cart'); viewCheckout(); }
    else if (seg[0] === 'order-placed') { setNav(''); viewPlaced(); }
    else if (seg[0] === 'wishlist') { setNav(''); viewWishlist(); }
    else if (seg[0] === 'track') { setNav(''); viewTrack(); }
    else if (seg[0] === 'account') { setNav('account'); viewAccount(); }
    else if (seg[0] === 'admin') { location.href = '/admin'; }
    else if (seg[0] === 'policy' && seg[1]) { setNav(''); viewPolicy(seg[1]); }
    else if (seg[0] === 'faqs') { setNav(''); viewFaqs(); }
    else if (seg[0] === 'payment-methods') { setNav(''); viewPayments(); }
    else if (seg[0] === 'about') { setNav(''); viewAbout(); }
    else if (seg[0] === 'contact') { setNav(''); viewContact(); }
    else if (seg[0] === 'complaint') { setNav(''); viewComplaint(); }
    else { setNav('home'); viewHome(); }
  }
  var searchForm = document.getElementById('headerSearch');
  if (searchForm) searchForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = document.getElementById('headerSearchInput').value.trim();
    location.hash = '#/shop' + (q ? '?search=' + encodeURIComponent(q) : '');
    if ((location.hash.replace(/^#\/?/, '').split('?')[0]) === 'shop') route();
  });
  window.addEventListener('hashchange', route);
  renderCatBar();
  syncBadges();
  route();
})();
