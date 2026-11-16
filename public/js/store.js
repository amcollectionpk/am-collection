/* AM Collection — Luxury Watches storefront.
   Screens (mobile-app style): Home / Categories / Product Details / My Cart /
   Checkout / Order Placed / Account / Special Offers (+ Shop, Wishlist, Track,
   Policies, FAQs, Contact, Complaint, Payment Methods).
   Data: live backend API (server.js) is used first when the deployed database
   has products; otherwise the built-in watch catalog (js/catalog.js — the
   owner's 79 watches with photos + prices) drives the shop. Cart / wishlist
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
    { id: 'JAZZCASH', name: 'JazzCash', desc: 'Pay on ' + AMC.PAYMENT_NUMBER + ' — Transaction ID required.' },
    { id: 'EASYPAISA', name: 'Easypaisa', desc: 'Pay on ' + AMC.PAYMENT_NUMBER + ' — Transaction ID required.' }
  ];
  var DELIVERY_FLAT = 200, FREE_ABOVE = 5000;
  var POLICIES = {
    shipping: 'Orders are dispatched after confirmation and delivered through courier services across Pakistan. The delivery charge is shown clearly at checkout before you place your order — the standard charge is Rs. 200, and orders of Rs. 5,000 or more get FREE delivery. Some remote areas may have a different rate, always shown in the Order Summary. Delivery usually takes 2–5 working days depending on your city. You will receive your order number at confirmation and can track your parcel any time from the Track Order page.',
    returns: 'If you receive a damaged, defective or wrong item, contact us within 7 days of delivery with your order number. Items must be unused and in the packaging they arrived in for exchange or refund. Refunds for prepaid orders are sent back through the same payment method; COD refunds are arranged after the returned parcel is received and checked.',
    privacy: 'We collect only the information needed to process and deliver your order: your name, mobile number, email (optional) and delivery address. We never ask for your CNIC or date of birth at checkout. Your information is used for order processing, delivery and order updates, and is not sold to third parties. Payment confirmations for JazzCash and Easypaisa are accepted only after verified confirmation from the payment provider.',
    terms: 'By placing an order on AM Collection you agree that the prices, product details and stock shown at the time of ordering apply to your order; your order stores a snapshot of the product name and price so later changes never alter a placed order. Cash on Delivery orders are payable to the courier at delivery. We may call or message you to confirm a COD order before dispatch. Orders can be cancelled by the store if an item goes out of stock, with a full refund of any prepaid amount.'
  };
  var POLICY_TITLES = { shipping: 'Shipping Policy', returns: 'Return & Refund Policy', privacy: 'Privacy Policy', terms: 'Terms & Conditions' };
  var FAQS = [
    { q: 'How do I place an order?', a: 'Add a watch to your cart, open the cart and tap Checkout. Enter your name, mobile number and delivery address, choose a payment method (Cash on Delivery, JazzCash or Easypaisa) and tap Place Order. You will get an order number like ORD-20261107-001 on the Order Placed page.' },
    { q: 'What are the delivery charges?', a: 'The standard delivery charge is Rs. 200. Orders of Rs. 5,000 or more get FREE delivery. The exact charge is always shown in the Order Summary before you place the order — no hidden charges.' },
    { q: 'How can I pay?', a: 'You can pay Cash on Delivery when your parcel arrives, or pay through JazzCash or Easypaisa on the number 03147656328 (Account Title: Muqaddas Bibi). After paying, enter your Transaction ID at checkout — your order is completed only after the Transaction ID is entered. Prepaid payments are marked paid only after verified confirmation from the payment provider.' },
    { q: 'How do I track my order?', a: 'Open the Track Order page and enter your order number and the mobile number used at checkout. You will see the current status — Pending Confirmation, Confirmed, Processing, Shipped or Delivered.' },
    { q: 'Can I return or exchange an item?', a: 'Yes — damaged, defective or wrong items can be returned or exchanged within 7 days of delivery. See the Return & Refund Policy page for full details and contact us on WhatsApp for help.' },
    { q: 'Do I need an account to order?', a: 'No. You can order as a guest with just your name, mobile number and address, and track your order any time from the Track Order page with your order number and mobile number.' }
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
  /* Original (struck-through) price from the store discount tiers:
     >=5000 -> 35% off, 3500-4999 -> 30%, 3000-3499 -> 25%, below 3000 -> 20%.
     original = round(sale / (1 - pct)) to the nearest Rs. 50. */
  function origPriceFor(sale) {
    sale = Number(sale) || 0;
    var pct = sale >= 5000 ? 0.35 : sale >= 3500 ? 0.30 : sale >= 3000 ? 0.25 : 0.20;
    return Math.round((sale / (1 - pct)) / 50) * 50;
  }
  function normProduct(p) {
    var img = p.image_url || p.image || (Array.isArray(p.images) && p.images[0] ? (p.images[0].image_url || p.images[0]) : null);
    var sale = Number(p.discount_price != null ? p.discount_price : p.price) || 0;
    var was = (p.discount_price != null && Number(p.price) > Number(p.discount_price)) ? Number(p.price) : null;
    if (!was && sale > 0) { var o = origPriceFor(sale); if (o > sale) was = o; }
    return {
      id: p.id, slug: p.slug, name: p.name, sku: p.sku || '',
      price: sale,
      wasPrice: was,
      image_url: img, category_slug: p.category_slug || p.categorySlug || '',
      category_name: p.category_name || p.categoryName || '',
      stock_qty: p.stock_qty != null ? Number(p.stock_qty) : 20,
      is_featured: !!p.is_featured, description: p.description || ''
    };
  }
  var apiMode = null; // null=unknown, true=live DB products, false=built-in catalog
  function detectMode() {
    if (apiMode !== null) return Promise.resolve(apiMode);
    return api.get('/api/products?limit=100').then(function (d) {
      apiMode = !!(d.products && d.products.length);
      return apiMode;
    }).catch(function () { apiMode = false; return false; });
  }
  function localFilter(opts) {
    var list = CATALOG.products.slice();
    if (opts.category) list = list.filter(function (p) { return p.category_slug === opts.category; });
    if (opts.search) { var s = opts.search.toLowerCase(); list = list.filter(function (p) { return p.name.toLowerCase().indexOf(s) >= 0 || p.category_name.toLowerCase().indexOf(s) >= 0; }); }
    if (opts.sort === 'price_asc') list.sort(function (a, b) { return (a.discount_price != null ? a.discount_price : a.price) - (b.discount_price != null ? b.discount_price : b.price); });
    if (opts.sort === 'price_desc') list.sort(function (a, b) { return (b.discount_price != null ? b.discount_price : b.price) - (a.discount_price != null ? a.discount_price : a.price); });
    if (opts.sort === 'popular') list.sort(function (a, b) { return (b.is_featured - a.is_featured) || (a.n - b.n); });
    return list;
  }
  function loadProducts(opts) {
    opts = opts || {};
    return detectMode().then(function (live) {
      if (!live) return localFilter(opts).map(normProduct);
      var qs = '?limit=100' + (opts.category ? '&category=' + encodeURIComponent(opts.category) : '') +
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
      '<a class="pimg" href="#/product/' + encodeURIComponent(p.slug) + '">' +
        (pct ? '<span class="disc-pill">-' + pct + '%</span>' : '') +
        (p.image_url ? '<img src="' + esc(p.image_url) + '" alt="' + esc(p.name) + '" loading="lazy">' : '<span class="noimg">⌚</span>') + '</a>' +
      '<div class="pbody">' +
        '<a class="pname" href="#/product/' + encodeURIComponent(p.slug) + '">' + esc(p.name) + '</a>' +
        '<div class="price">' + rs(p.price) + (p.wasPrice ? ' <span class="was">' + rs(p.wasPrice) + '</span>' : '') + '</div>' +
        '<div class="pactions">' +
          '<button class="btn btn-primary btn-sm" data-add="' + esc(p.slug) + '">Add to Cart</button>' +
          '<button class="btn btn-sm" data-buy="' + esc(p.slug) + '">Buy Now</button>' +
          '<button class="btn btn-sm" data-wish="' + esc(p.slug) + '" title="Wishlist">' + (wished ? '♥' : '♡') + '</button>' +
        '</div></div></article>';
  }
  function addToCart(p, qty, size) {
    qty = Math.max(1, qty || 1);
    var found = null;
    cart.forEach(function (c) { if (c.slug === p.slug && (c.size || null) === (size || null)) found = c; });
    if (found) found.qty = Math.min(found.qty + qty, Math.max(1, p.stock_qty || 20));
    else cart.push({ productId: p.id, slug: p.slug, name: p.name, sku: p.sku, price: p.price, image: p.image_url, qty: qty, stock: p.stock_qty || 20, size: size || null });
    saveCart();
  }
  function bindCardButtons(root) {
    root.querySelectorAll('[data-add],[data-buy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var slug = btn.getAttribute('data-add') || btn.getAttribute('data-buy');
        var buy = btn.hasAttribute('data-buy');
        loadProduct(slug).then(function (d) {
          if (!d) { AMC.toast('Product not available'); return; }
          if (/hoodie/i.test(d.product.slug)) { location.hash = '#/product/' + encodeURIComponent(d.product.slug); AMC.toast('Please select a size first'); return; }
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
  /* Category tiles use the NEW watch photos (old watch-*.jpg removed) */
  var CAT_TILE_IMG = { "Men's Watches": '/assets/watches/rolex-datejust-black-1.jpg', "Women's Watches": '/assets/watches/luxury-rose-gold-womens-1.jpg', "Smartwatches": '/assets/watches/smartwatch-1.jpg' };
  function catTileImg(c) { return CAT_TILE_IMG[c.name] || c.image_url || c.image || '/assets/watches/rolex-datejust-black-1.jpg'; }
  /* ---------- HERO SLIDER (Home): 13 slides, auto-play 2s, arrows + dots + swipe ---------- */
  var heroTimer = null;
  function heroSlides(all) {
    function bySlug(slug) { var f = all.filter(function (p) { return p.slug === slug; }); return f[0] || null; }
    var defs = [
      { slug: 'rolex-datejust', kick: "MEN'S WATCHES", title: 'Classic Style,<br><em>For Every Day</em>', text: "Men's Comfortable Daily Wear Watch — Cash on Delivery across Pakistan", cta: 'Shop Now', href: '#/product/rolex-datejust', img: '/assets/watches/rolex-datejust-black-1.jpg', alt: "Men's Comfortable Daily Wear Watch" },
      { slug: 'diamond-stone-mens-luxury-fashion-watch', kick: 'LUXURY COLLECTION', title: 'Diamond Stone<br><em>Luxury Fashion</em>', text: 'Working Date & Premium Textured Strap — Cash on Delivery across Pakistan', cta: 'Shop Now', href: '#/product/diamond-stone-mens-luxury-fashion-watch', img: '/assets/watches/diamond-stone-green-1.jpg', alt: "Diamond Stone Men's Luxury Fashion Watch" },
      { slug: 'black-skeleton-chronograph-watch-for-men', kick: "MEN'S WATCHES", title: 'Bold Style,<br><em>Skeleton Design</em>', text: 'Black Skeleton Chronograph Watch — Cash on Delivery across Pakistan', cta: 'Shop Now', href: '#/product/black-skeleton-chronograph-watch-for-men', img: '/assets/watches/black-skeleton-1.jpg', alt: 'Black Skeleton Chronograph Watch for Men' },
      { slug: 'diamond-stone-mens-luxury-fashion-watch-black', kick: 'LUXURY COLLECTION', title: 'Diamond Stone<br><em>Black Edition</em>', text: 'Working Date & Premium Textured Strap — Cash on Delivery across Pakistan', cta: 'Shop Now', href: '#/product/diamond-stone-mens-luxury-fashion-watch-black', img: '/assets/watches/diamond-stone-black-1.jpg', alt: "Diamond Stone Men's Luxury Fashion Watch (Black)" },
      { slug: 'cartier-tank-watch', kick: "MEN'S WATCHES", title: 'Timeless Elegance,<br><em>On Your Wrist</em>', text: 'Cartier Tank Watch — Cash on Delivery across Pakistan', cta: 'Shop Now', href: '#/product/cartier-tank-watch', img: '/assets/watches/cartier-tank-1.jpg', alt: 'Cartier Tank Watch' },
      { slug: 'black-rubber-strap-watch-for-men', kick: "MEN'S WATCHES", title: 'Rubber Strap,<br><em>Date & Luminous</em>', text: 'Black Rubber Strap Watch with Date & Luminous Markers — Cash on Delivery across Pakistan', cta: 'Shop Now', href: '#/product/black-rubber-strap-watch-for-men', img: '/assets/watches/black-rubber-strap-1.jpg', alt: 'Black Rubber Strap Watch for Men' },
      { slug: 'mens-comfort-fit-strap-watch', kick: "MEN'S WATCHES", title: 'Comfort Fit,<br><em>All Day Wear</em>', text: "Men's Comfort Fit Strap Watch — Cash on Delivery across Pakistan", cta: 'Shop Now', href: '#/product/mens-comfort-fit-strap-watch', img: '/assets/watches/comfort-fit-1.jpg', alt: "Men's Comfort Fit Strap Watch" },
      { slug: 'mens-hoursly-luxury-skeleton-watch', kick: "MEN'S WATCHES", title: 'Luxury Skeleton,<br><em>Watch for Boys</em>', text: "Men's Hoursly Luxury Skeleton Watch — Cash on Delivery across Pakistan", cta: 'Shop Now', href: '#/product/mens-hoursly-luxury-skeleton-watch', img: '/assets/watches/hoursly-skeleton-1.jpg', alt: "Men's Hoursly Luxury Skeleton Watch" },
      { slug: 'womens-lightweight-and-comfortable-for-all-day-wear-watch', kick: "WOMEN'S WATCHES", title: 'Lightweight Comfort,<br><em>All Day Wear</em>', text: "Women's Lightweight And Comfortable For All Day Wear Watch — Cash on Delivery across Pakistan", cta: 'Shop Now', href: '#/product/womens-lightweight-and-comfortable-for-all-day-wear-watch', img: '/assets/watches/womens-lightweight-watch-1.jpg', alt: "Women's Lightweight And Comfortable For All Day Wear Watch" },
      { slug: 'womens-red-silicone-diamond-watch-with-gold-case', kick: "WOMEN'S WATCHES", title: 'Red Silicone,<br><em>Gold Case</em>', text: "Women's Red Silicone Diamond Watch with Gold Case — Cash on Delivery across Pakistan", cta: 'Shop Now', href: '#/product/womens-red-silicone-diamond-watch-with-gold-case', img: '/assets/watches/womens-red-silicone-diamond-1.jpg', alt: "Women's Red Silicone Diamond Watch with Gold Case" },
      { slug: 'luxury-rose-gold-womens-watch-with-crystal-diamond', kick: "WOMEN'S WATCHES", title: 'Rose Gold Luxury,<br><em>Crystal Diamond</em>', text: "Luxury Rose Gold Women's Watch with Crystal Diamond — Cash on Delivery across Pakistan", cta: 'Shop Now', href: '#/product/luxury-rose-gold-womens-watch-with-crystal-diamond', img: '/assets/watches/luxury-rose-gold-womens-1.jpg', alt: "Luxury Rose Gold Women's Watch with Crystal Diamond" },
      { slug: 'smart-watch-with-round-digital-display-bluetooth', kick: 'SMARTWATCHES', title: 'Smart Watch,<br><em>Round Digital Display</em>', text: 'Smart Watch with Round Digital Display & Bluetooth — Cash on Delivery across Pakistan', cta: 'Shop Now', href: '#/product/smart-watch-with-round-digital-display-bluetooth', img: '/assets/watches/smartwatch-1.jpg', alt: 'Smart Watch with Round Digital Display & Bluetooth' },
      { slug: 'new-series-11-bluetooth-smart-watch-with-7-straps-waterproof', kick: 'SMARTWATCHES', title: 'Series 11,<br><em>7 Straps Waterproof</em>', text: 'New Series 11 Bluetooth Smart Watch With 7 Straps — Cash on Delivery across Pakistan', cta: 'Shop Now', href: '#/product/new-series-11-bluetooth-smart-watch-with-7-straps-waterproof', img: '/assets/watches/series11-smartwatch-1.jpg', alt: 'New Series 11 Bluetooth Smart Watch With 7 Straps Waterproof' },
      { slug: 'mens-hublot-style-skeleton-watch', kick: "MEN'S WATCHES", title: 'Hublot-Style<br><em>Skeleton Automatic</em>', text: "Men's Hublot-Style Skeleton Watch — Cash on Delivery across Pakistan", cta: 'Shop Now', href: '#/product/mens-hublot-style-skeleton-watch', img: '/assets/watches/hublot-skeleton-1.jpg', alt: "Men's Hublot-Style Skeleton Watch" },
      { slug: 'mens-time-worth-slim-square-watch', kick: "MEN'S WATCHES", title: 'Time Worth<br><em>Slim Square</em>', text: "Men's Time Worth Slim Square Watch — Cash on Delivery across Pakistan", cta: 'Shop Now', href: '#/product/mens-time-worth-slim-square-watch', img: '/assets/watches/timeworth-square-1.jpg', alt: "Men's Time Worth Slim Square Watch" },
      { slug: 'mens-magnet-strap-watch', kick: "MEN'S WATCHES", title: 'Magnet Strap,<br><em>Secure Fit</em>', text: "Men's Magnet Strap Watch — Cash on Delivery across Pakistan", cta: 'Shop Now', href: '#/product/mens-magnet-strap-watch', img: '/assets/watches/magnet-strap-1.jpg', alt: "Men's Magnet Strap Watch" },
      { slug: 'series-11-apple-logo-smartwatch-amoled-display', kick: 'SMARTWATCHES', title: 'Series 11<br><em>AMOLED Display</em>', text: 'Series 11 Apple LOGO Smartwatch | AMOLED Display — Cash on Delivery across Pakistan', cta: 'Shop Now', href: '#/product/series-11-apple-logo-smartwatch-amoled-display', img: '/assets/watches/series11-amoled-1.jpg', alt: 'Series 11 Apple LOGO Smartwatch | AMOLED Display' },
      { slug: 'multicolor-gold-watch-for-men-with-black-dial', kick: "MEN'S WATCHES", title: 'Multicolor Gold<br><em>Black Dial</em>', text: 'Multicolor Gold Watch for Men with Black Dial — Cash on Delivery across Pakistan', cta: 'Shop Now', href: '#/product/multicolor-gold-watch-for-men-with-black-dial', img: '/assets/watches/multicolor-gold-1.jpg', alt: 'Multicolor Gold Watch for Men with Black Dial' }
    ];
    return defs.map(function (d) {
      var p = d.slug ? bySlug(d.slug) : null;
      var priceHtml = '';
      if (p) priceHtml = rs(p.price) + (p.wasPrice ? ' <s>' + rs(p.wasPrice) + '</s>' : '');
      else if (d.priceText) priceHtml = esc(d.priceText);
      return { kick: d.kick, title: d.title, text: d.text, cta: d.cta, href: d.href, img: (p && p.image_url) || d.img, alt: (p && p.name) || d.alt, priceHtml: priceHtml };
    });
  }
  function initHeroSlider() {
    var box = document.getElementById('heroSlider');
    if (!box) return;
    if (heroTimer) { clearInterval(heroTimer); heroTimer = null; }
    var track = document.getElementById('heroSlides');
    var dots = Array.prototype.slice.call(document.querySelectorAll('#heroDots button'));
    var total = dots.length, idx = 0;
    function show(i) {
      idx = (i + total) % total;
      track.style.transform = 'translateX(-' + (idx * 100) + '%)';
      dots.forEach(function (d, j) { d.classList.toggle('active', j === idx); });
    }
    function restart() {
      if (heroTimer) clearInterval(heroTimer);
      heroTimer = setInterval(function () {
        if (!document.getElementById('heroSlider')) { clearInterval(heroTimer); heroTimer = null; return; }
        show(idx + 1);
      }, 2000);
    }
    document.getElementById('heroPrev').addEventListener('click', function () { show(idx - 1); restart(); });
    document.getElementById('heroNext').addEventListener('click', function () { show(idx + 1); restart(); });
    dots.forEach(function (d, j) { d.addEventListener('click', function () { show(j); restart(); }); });
    box.addEventListener('mouseenter', function () { if (heroTimer) { clearInterval(heroTimer); heroTimer = null; } });
    box.addEventListener('mouseleave', restart);
    var startX = null;
    box.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; if (heroTimer) { clearInterval(heroTimer); heroTimer = null; } }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX; startX = null;
      if (Math.abs(dx) > 40) show(idx + (dx < 0 ? 1 : -1));
      restart();
    }, { passive: true });
    restart();
  }

  /* ---------- HOODIE RAIL (Home): hanger-style auto slider ---------- */
  var hoodieTimer = null;
  var hoodieSlides = [
    { slug: 'men-color-block-fleece-hoodie-navy', name: 'Men Color Block Fleece Hoodie \u2014 Navy', img: '/assets/hoodies/hoodie-1-navy.jpg' },
    { slug: 'men-color-block-fleece-hoodie-black', name: 'Men Color Block Fleece Hoodie \u2014 Black', img: '/assets/hoodies/hoodie-2-black.jpg' },
    { slug: 'men-color-block-fleece-hoodie-olive', name: 'Men Color Block Fleece Hoodie \u2014 Olive', img: '/assets/hoodies/hoodie-3-olive.jpg' },
    { slug: 'jakuta-zipper-hoodie-sleeveless', name: 'JAKUTA Zipper Hoodie (Sleeveless Edition)', img: '/assets/hoodies/hoodie-4-sleeveless.jpg' }
  ];
  function initHoodieRail() {
    var rail = document.getElementById('hoodieRail');
    if (!rail) return;
    var cards = Array.prototype.slice.call(rail.querySelectorAll('.hoodie-card'));
    if (!cards.length) return;
    var active = 0;
    function center(card) { var track = document.getElementById('hoodieTrack'); if (!track) return; try { var tr = track.getBoundingClientRect(); var cr = card.getBoundingClientRect(); var x = track.scrollLeft + (cr.left - tr.left) - (track.clientWidth - card.offsetWidth) / 2; track.scrollTo({ left: x, behavior: 'smooth' }); } catch (e) {} }
    function show(i) {
      active = (i + cards.length) % cards.length;
      cards.forEach(function (c, j) { c.classList.toggle('active', j === active); });
      center(cards[active]);
    }
    function restart() {
      if (hoodieTimer) clearInterval(hoodieTimer);
      hoodieTimer = setInterval(function () {
        if (!document.getElementById('hoodieRail')) { clearInterval(hoodieTimer); hoodieTimer = null; return; }
        show(active + 1);
      }, 3000);
    }
    cards.forEach(function (c, i) {
      c.addEventListener('click', function () {
        if (i === active) { location.hash = '#/product/' + encodeURIComponent(c.getAttribute('data-slug')); return; }
        show(i); restart();
      });
    });
    rail.addEventListener('mouseenter', function () { if (hoodieTimer) { clearInterval(hoodieTimer); hoodieTimer = null; } });
    rail.addEventListener('mouseleave', function () { restart(); });
    rail.addEventListener('touchstart', function () { if (hoodieTimer) { clearInterval(hoodieTimer); hoodieTimer = null; } }, { passive: true });
    rail.addEventListener('touchend', function () { restart(); }, { passive: true });
    show(0);
    restart();
  }

  /* ---------- FEATURED (Home): Rolex single-product carousel ---------- */
  function initFeatured() {
    var box = document.getElementById('featuredBox');
    if (!box) return;
    var cards = box.querySelectorAll('.feat-card');
    if (!cards.length) return;
    var n = cards.length, cur = 0, timer = null;
    function paint() {
      for (var i = 0; i < n; i++) {
        var c = cards[i];
        c.classList.remove('cur', 'side-l', 'side-r', 'hidden');
        if (i === cur) c.classList.add('cur');
        else if (i === (cur - 1 + n) % n) c.classList.add('side-l');
        else if (i === (cur + 1) % n) c.classList.add('side-r');
        else c.classList.add('hidden');
      }
    }
    function go(k) { cur = (k + n) % n; paint(); }
    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () {
        if (!document.getElementById('featuredBox')) { clearInterval(timer); timer = null; return; }
        go(cur + 1);
      }, 3000);
    }
    var pv = document.getElementById('featPrev'), nx = document.getElementById('featNext');
    if (pv) pv.addEventListener('click', function () { go(cur - 1); restart(); });
    if (nx) nx.addEventListener('click', function () { go(cur + 1); restart(); });
    box.addEventListener('mouseenter', function () { if (timer) { clearInterval(timer); timer = null; } });
    box.addEventListener('mouseleave', function () { restart(); });
    var sx = null;
    box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 40) { go(cur + (dx < 0 ? 1 : -1)); restart(); }
    }, { passive: true });
    paint(); restart();
  }

  function loadReviews(all) {
    var track = document.getElementById('reviewsTrack');
    if (!track || !all || !all.length) return;
    var jobs = all.map(function (p) {
      return api.get('/api/products/' + encodeURIComponent(p.slug) + '/reviews')
        .then(function (d) {
          var list = (d && d.reviews) || [];
          return list.map(function (r) {
            return { name: r.customer_name || 'Customer', rating: Number(r.rating) || 5, body: r.body || '', product: p.name };
          });
        })
        .catch(function () { return []; });
    });
    Promise.all(jobs).then(function (groups) {
      var reviews = [];
      groups.forEach(function (g) { reviews = reviews.concat(g); });
      if (!reviews.length) {
        track.innerHTML = '<div class="tst-card tst-empty"><div class="tst-stars">★★★★★</div><p>No reviews yet — be the first to share your experience!</p><a class="btn btn-primary" href="#/shop">Shop Now</a></div>';
        return;
      }
      var set = reviews.slice();
      while (set.length < 4) set = set.concat(reviews);
      var cards = set.map(function (r) {
        var filled = Math.max(1, Math.min(5, r.rating));
        var stars = '★★★★★'.slice(0, filled) + '☆☆☆☆☆'.slice(0, 5 - filled);
        var initial = (r.name || 'C').trim().charAt(0).toUpperCase();
        return '<article class="tst-card"><div class="tst-stars">' + stars + '</div><p>' + esc(r.body) + '</p>' +
          '<div class="tst-who"><span class="tst-avatar">' + esc(initial) + '</span><span><b>' + esc(r.name) + '</b><span class="muted small"> bought ' + esc(r.product) + '</span></span></div></article>';
      }).join('');
      track.innerHTML = cards + cards;
    });
  }
  function initWhyCarousel() {
    var box = document.getElementById('whyCarousel');
    if (!box) return;
    var track = document.getElementById('whyTrack');
    var dots = box.querySelectorAll('#whyDots button');
    if (!track || !dots.length) return;
    var n = dots.length, cur = 0, timer = null;
    function paint() {
      track.style.transform = 'translateX(-' + (cur * 100) + '%)';
      for (var i = 0; i < n; i++) dots[i].classList.toggle('active', i === cur);
    }
    function go(k) { cur = (k + n) % n; paint(); }
    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () {
        if (!document.getElementById('whyCarousel')) { clearInterval(timer); timer = null; return; }
        go(cur + 1);
      }, 3000);
    }
    for (var i = 0; i < n; i++) {
      (function (idx) {
        dots[idx].addEventListener('click', function () { go(idx); restart(); });
      })(i);
    }
    box.addEventListener('mouseenter', function () { if (timer) { clearInterval(timer); timer = null; } });
    box.addEventListener('mouseleave', function () { restart(); });
    var sx = null;
    box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 40) { go(cur + (dx < 0 ? 1 : -1)); restart(); }
    }, { passive: true });
    paint(); restart();
  }
  function viewHome() {
    app.innerHTML = '<p class="muted">Loading\u2026</p>';
    Promise.all([loadCategories(), loadProducts({ sort: 'popular' })]).then(function (r) {
      var cats = r[0], all = r[1];
      var slides = heroSlides(all);
      var hoodieCount = all.filter(function (p) { return /hoodie/i.test(p.slug); }).length;
      var watchCount = all.filter(function (p) { return !/hoodie/i.test(p.slug); }).length;
      var premiumStrip = all.filter(function (p) { return !/hoodie/i.test(p.slug); }).map(function (p) {
        return '<a href="#/product/' + esc(p.slug) + '"><img src="' + esc(p.image_url || '') + '" alt="' + esc(p.name) + '" loading="lazy"></a>';
      }).join('');
      var catTiles = [
        { name: 'Watches', href: '#/shop?search=watch', img: '/assets/watches/rolex-datejust-black-1.jpg', count: watchCount },
        { name: 'Hoodies', href: '#/shop?search=hoodie', img: '/assets/hoodies/hoodie-1-navy.jpg', count: hoodieCount }
      ];
      app.innerHTML =
        '<a class="home-banner" href="#/shop"><img src="/assets/banner-grand-opening.jpg" alt="AM Collection \u2014 Grand Opening, Flat 35% OFF"></a>' +
        '<section class="hero-slider" id="heroSlider" aria-label="Featured watches">' +
          '<div class="hero-slides" id="heroSlides">' + slides.map(function (s, i) {
            return '<div class="hero-slide"><section class="hero"><div>' +
              '<span class="kick">' + esc(s.kick) + '</span>' +
              '<h1>' + s.title + '</h1>' +
              '<p>' + esc(s.text) + '</p>' +
              (s.priceHtml ? '<p class="hero-price">' + s.priceHtml + '</p>' : '') +
              '<div class="hero-cta"><a class="btn btn-primary" href="' + esc(s.href) + '">' + esc(s.cta) + '</a></div>' +
            '</div><img src="' + esc(s.img) + '" alt="' + esc(s.alt) + '"></section></div>';
          }).join('') + '</div>' +
          '<button class="hero-arrow prev" id="heroPrev" type="button" aria-label="Previous slide">\u2039</button>' +
          '<button class="hero-arrow next" id="heroNext" type="button" aria-label="Next slide">\u203a</button>' +
          '<div class="hero-dots" id="heroDots">' + slides.map(function (s, i) {
            return '<button type="button" data-dot="' + i + '" aria-label="Go to slide ' + (i + 1) + '"' + (i === 0 ? ' class="active"' : '') + '></button>';
          }).join('') + '</div>' +
        '</section>' +
        '<h2 class="section-title">Hoodies</h2>' +
        '<section class="hoodie-rail" id="hoodieRail" aria-label="Hoodies">' +
          '<div class="hoodie-rail-bar"></div>' +
          '<div class="hoodie-track" id="hoodieTrack">' + hoodieSlides.map(function (h, i) {
            return '<button class="hoodie-card' + (i === 0 ? ' active' : '') + '" type="button" data-idx="' + i + '" data-slug="' + esc(h.slug) + '">' +
              '<span class="hoodie-hook"></span>' +
              '<img src="' + esc(h.img) + '" alt="' + esc(h.name) + '" loading="lazy">' +
              '<span class="hoodie-name">' + esc(h.name) + '</span>' +
            '</button>';
          }).join('') + '</div>' +
        '</section>' +
        '<h2 class="section-title">All Collections</h2>' +
        '<div class="collections">' + catTiles.map(function (t) {
          return '<a class="collection-tile" href="' + esc(t.href) + '"><img src="' + esc(t.img) + '" alt="' + esc(t.name) + '" loading="lazy"><span class="ct-overlay"></span><span class="ct-title">' + esc(t.name) + '</span><span class="ct-count">' + t.count + (t.count === 1 ? ' product' : ' products') + '</span></a>';
        }).join('') + '</div>' +
        '<h2 class="section-title">All Products</h2>' + gridHtml(all) +
        (all.length ? '<div style="text-align:center;margin:30px 0 14px"><div style="letter-spacing:.28em;font-weight:800;font-size:.78rem;color:#e30613">FEATURED</div><h2 style="margin:6px 0 0;font-size:1.5rem">Our Signature Collection</h2></div>' +
        '<section class="featured" id="featuredBox" aria-label="Featured products">' +
          '<div class="feat-track" id="featTrack">' +
            all.map(function (p, i) {
              return '<article class="feat-card hidden" data-idx="' + i + '">' +
                '<a href="#/product/' + esc(p.slug) + '"><img src="' + esc(p.image_url || '') + '" alt="' + esc(p.name) + '" loading="lazy"></a>' +
                '<div class="feat-info"><h3>' + esc(p.name) + '</h3>' +
                '<p class="feat-price">' + (p.wasPrice ? '<s>' + rs(p.wasPrice) + '</s> ' : '') + rs(p.price) + '</p>' +
                '<a class="feat-discover" href="#/product/' + esc(p.slug) + '">DISCOVER</a></div>' +
              '</article>';
            }).join('') +
          '</div>' +
          '<button class="featured-arrow prev" id="featPrev" type="button" aria-label="Previous product">\u2039</button>' +
          '<button class="featured-arrow next" id="featNext" type="button" aria-label="Next product">\u203a</button>' +
        '</section>' : '') +
        '<section class="premium-section">' +
        '<div class="premium-strip"><div class="premium-track">' + premiumStrip + premiumStrip + '</div></div>' +
        '<div class="premium-text"><span class="premium-pill">PREMIUM WATCH COLLECTION</span>' +
        '<h2>Timeless Elegance For Every Moment</h2>' +
        '<p>Premium watches for every moment — classic style, modern designs, and honest prices. Every watch is selected for quality, durability, and a look that fits your everyday life.</p>' +
        '<a class="btn btn-primary" href="#/shop?search=watch">Explore Collection</a></div>' +
        '</section>' +
        '<div class="outlet-banner">' +
        '<svg class="outlet-wave" viewBox="0 0 1440 36" preserveAspectRatio="none" aria-hidden="true"><path d="M0,18 C180,2 360,34 540,18 C720,2 900,34 1080,18 C1260,2 1380,34 1440,18 L1440,36 L0,36 Z" fill="#000"/></svg>' +
        '<div class="outlet-inner">\uD83D\uDECD\uFE0F GRAND OPENING \u2014 Flat 35% OFF on All Watches &amp; Hoodies \u2728</div>' +
        '<svg class="outlet-wave flip" viewBox="0 0 1440 36" preserveAspectRatio="none" aria-hidden="true"><path d="M0,18 C180,2 360,34 540,18 C720,2 900,34 1080,18 C1260,2 1380,34 1440,18 L1440,36 L0,36 Z" fill="#000"/></svg>' +
        '</div>' +
        '<section class="reviews-section" id="reviewsSection">' +
        '<div style="text-align:center;margin:26px 0 14px"><div style="letter-spacing:.28em;font-weight:800;font-size:.78rem;color:#e30613">TESTIMONIALS</div>' +
        '<h2 style="margin:6px 0 4px;font-size:1.5rem">Hear From Our Happy Customers</h2>' +
        '<p class="muted" style="margin:0">Real customers share their experience shopping with AM Collection.</p></div>' +
        '<div class="reviews-strip"><div class="reviews-track" id="reviewsTrack"></div></div>' +
        '</section>' +
        '<div class="offer-banner"><div><b>Free Delivery</b><br><span class="muted">On all orders of Rs. 5,000 or more — anywhere in Pakistan.</span></div><a class="btn btn-primary" href="#/offers">See Offers</a></div>' +
        '<h2 class="section-title">Why Choose Us</h2>' +
        '<section class="why-carousel" id="whyCarousel" aria-label="Why choose AM Collection">' +
          '<div class="why-track" id="whyTrack">' +
            '<div class="why-slide"><span class="why-ico"><svg viewBox="0 0 24 24" width="58" height="58" fill="none" stroke="#111" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3.2"/><path d="M5.5 9.8h.01M18.5 14.2h.01"/></svg></span><b>Cash on Delivery</b><span class="muted small">Pay at your doorstep</span></div>' +
            '<div class="why-slide"><span class="why-ico"><svg viewBox="0 0 24 24" width="58" height="58" fill="none" stroke="#111" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 7h12v9H2z"/><path d="M14 10h4l3 3v3h-7z"/><circle cx="6.5" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/></svg></span><b>Delivery Rs. 200</b><span class="muted small">FREE on orders Rs. 5,000+</span></div>' +
            '<div class="why-slide"><span class="why-ico"><svg viewBox="0 0 24 24" width="58" height="58" fill="none" stroke="#111" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/><path d="M6 15h4"/></svg></span><b>Easy Payments</b><span class="muted small">JazzCash \u00b7 Easypaisa</span></div>' +
            '<div class="why-slide"><span class="why-ico"><svg viewBox="0 0 24 24" width="58" height="58" fill="none" stroke="#111" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 2.6-6.4"/><path d="M3 4v5h5"/></svg></span><b>7-Day Easy Return</b><span class="muted small">Damaged or wrong item</span></div>' +
          '</div>' +
          '<div class="why-dots" id="whyDots">' +
            '<button type="button" data-dot="0" class="active" aria-label="Cash on Delivery"></button>' +
            '<button type="button" data-dot="1" aria-label="Delivery Rs. 200"></button>' +
            '<button type="button" data-dot="2" aria-label="Easy Payments"></button>' +
            '<button type="button" data-dot="3" aria-label="7-Day Easy Return"></button>' +
          '</div>' +
        '</section>' +
        '<section class="faq-dark"><h2>FAQ\'s</h2>' +
          '<details class="faq-dark-card"><summary>Are your watches premium quality?</summary><p>Yes, every product at AM Collection is carefully selected for premium quality, durability, and a stylish look.</p></details>' +
          '<details class="faq-dark-card"><summary>How is my order packed?</summary><p>All orders are shipped in secure, premium packaging so your product reaches you safe and in perfect condition.</p></details>' +
          '<details class="faq-dark-card"><summary>How long does delivery take?</summary><p>Orders are usually delivered within 2\u20135 working days across Pakistan.</p></details>' +
          '<details class="faq-dark-card"><summary>Do you offer Cash on Delivery?</summary><p>Yes, we offer Cash on Delivery (COD) nationwide for your convenience.</p></details>' +
        '</section>';
      bindCardButtons(app);
      initHeroSlider();
      initHoodieRail();
      initFeatured();
      initWhyCarousel();
      loadReviews(all);
      window.scrollTo(0, 0);
    });
  }

  /* ---------- CATEGORIES ---------- */
  function viewCategories() {
    Promise.all([loadCategories(), loadProducts({})]).then(function (r) {
      var cats = r[0], all = r[1];
      app.innerHTML = '<h1 class="section-title">Categories</h1><div class="tiles">' + cats.map(function (c) {
        var count = all.filter(function (p) { return p.category_slug === c.slug; }).length;
        return '<a class="tile" href="#/shop?category=' + encodeURIComponent(c.slug) + '"><img src="' + esc(catTileImg(c)) + '" alt="' + esc(c.name) + '"><small>' + count + ' watches</small><span>' + esc(c.name) + '</span></a>';
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
  /* ---------- PRODUCT GALLERY: extra images per product slug ---------- */
  var PRODUCT_GALLERY = {
    'men-color-block-fleece-hoodie-black': ['/assets/hoodies/hoodie-2-black-closeup.jpg', '/assets/hoodies/hoodie-size-chart.jpg'],
    'men-color-block-fleece-hoodie-navy': ['/assets/hoodies/hoodie-size-chart.jpg'],
    'men-color-block-fleece-hoodie-olive': ['/assets/hoodies/hoodie-size-chart.jpg'],
    'rolex-datejust': ['/assets/watches/rolex-datejust-gold.jpg', '/assets/watches/rolex-datejust-blue.jpg', '/assets/watches/rolex-datejust-black-2.jpg', '/assets/watches/rolex-datejust-maroon.jpg', '/assets/watches/rolex-datejust-green.jpg'],
    'diamond-stone-mens-luxury-fashion-watch': ['/assets/watches/diamond-stone-green-2.jpg', '/assets/watches/diamond-stone-green-3.jpg', '/assets/watches/diamond-stone-green-video.mp4'],
    'black-skeleton-chronograph-watch-for-men': ['/assets/watches/black-skeleton-2.jpg', '/assets/watches/black-skeleton-3.jpg', '/assets/watches/black-skeleton-4.jpg', '/assets/watches/black-skeleton-5.jpg', '/assets/watches/black-skeleton-6.jpg', '/assets/watches/black-skeleton-video.mp4'],
    'diamond-stone-mens-luxury-fashion-watch-black': ['/assets/watches/diamond-stone-black-2.jpg', '/assets/watches/diamond-stone-black-3.jpg', '/assets/watches/diamond-stone-black-4.jpg', '/assets/watches/diamond-stone-black-5.jpg', '/assets/watches/diamond-stone-black-6.jpg', '/assets/watches/diamond-stone-black-7.jpg', '/assets/watches/diamond-stone-black-8.jpg', '/assets/watches/diamond-stone-black-9.jpg'],
    'cartier-tank-watch': ['/assets/watches/cartier-tank-2.jpg', '/assets/watches/cartier-tank-3.jpg', '/assets/watches/cartier-tank-4.jpg'],
    'jakuta-zipper-hoodie-sleeveless': ['/assets/hoodies/jakuta-2.jpg', '/assets/hoodies/jakuta-3.jpg', '/assets/hoodies/jakuta-4.jpg', '/assets/hoodies/jakuta-5.jpg'],
    'black-rubber-strap-watch-for-men': ['/assets/watches/black-rubber-strap-2.jpg', '/assets/watches/black-rubber-strap-3.jpg', '/assets/watches/black-rubber-strap-4.jpg', '/assets/watches/black-rubber-strap-5.jpg', '/assets/watches/black-rubber-strap-6.jpg', '/assets/watches/black-rubber-strap-7.jpg', '/assets/watches/black-rubber-strap-8.jpg', '/assets/watches/fitross-video.mp4'],
    'mens-comfort-fit-strap-watch': ['/assets/watches/comfort-fit-2.jpg', '/assets/watches/comfort-fit-3.jpg', '/assets/watches/comfort-fit-4.jpg', '/assets/watches/comfort-fit-5.jpg'],
    'mens-hoursly-luxury-skeleton-watch': ['/assets/watches/hoursly-skeleton-2.jpg', '/assets/watches/hoursly-skeleton-3.jpg', '/assets/watches/hoursly-skeleton-video.mp4'],
    'womens-lightweight-and-comfortable-for-all-day-wear-watch': ['/assets/watches/womens-lightweight-watch-2.jpg', '/assets/watches/womens-lightweight-watch-3.jpg'],
    'womens-red-silicone-diamond-watch-with-gold-case': ['/assets/watches/womens-red-silicone-diamond-2.jpg', '/assets/watches/womens-red-silicone-diamond-3.jpg', '/assets/watches/womens-red-silicone-diamond-4.jpg'],
    'luxury-rose-gold-womens-watch-with-crystal-diamond': ['/assets/watches/luxury-rose-gold-womens-2.jpg', '/assets/watches/luxury-rose-gold-womens-3.jpg', '/assets/watches/luxury-rose-gold-womens-4.jpg'],
    'smart-watch-with-round-digital-display-bluetooth': ['/assets/watches/smartwatch-2.jpg', '/assets/watches/smartwatch-3.jpg', '/assets/watches/smartwatch-4.jpg', '/assets/watches/smartwatch-5.jpg', '/assets/watches/smartwatch-6.jpg'],
    'new-series-11-bluetooth-smart-watch-with-7-straps-waterproof': ['/assets/watches/series11-smartwatch-2.jpg', '/assets/watches/series11-smartwatch-3.jpg', '/assets/watches/series11-smartwatch-4.jpg', '/assets/watches/series11-smartwatch-5.jpg'],
    'mens-hublot-style-skeleton-watch': ['/assets/watches/hublot-skeleton-2.jpg', '/assets/watches/hublot-skeleton-3.jpg', '/assets/watches/hublot-skeleton-4.jpg', '/assets/watches/hublot-skeleton-5.jpg', '/assets/watches/hublot-skeleton-6.jpg'],
    'mens-time-worth-slim-square-watch': ['/assets/watches/timeworth-square-2.jpg', '/assets/watches/timeworth-square-3.jpg', '/assets/watches/timeworth-square-4.jpg', '/assets/watches/timeworth-square-5.jpg', '/assets/watches/timeworth-square-6.jpg', '/assets/watches/timeworth-square-7.jpg', '/assets/watches/timeworth-square-8.jpg', '/assets/watches/timeworth-square-9.jpg'],
    'mens-magnet-strap-watch': ['/assets/watches/magnet-strap-2.jpg', '/assets/watches/magnet-strap-3.jpg', '/assets/watches/magnet-strap-4.jpg', '/assets/watches/magnet-strap-5.jpg', '/assets/watches/magnet-strap-6.jpg', '/assets/watches/magnet-strap-7.jpg', '/assets/watches/magnet-strap-video.mp4'],
    'series-11-apple-logo-smartwatch-amoled-display': ['/assets/watches/series11-amoled-2.jpg', '/assets/watches/series11-amoled-3.jpg', '/assets/watches/series11-amoled-4.jpg', '/assets/watches/series11-amoled-5.jpg', '/assets/watches/series11-amoled-6.jpg', '/assets/watches/series11-amoled-7.jpg', '/assets/watches/series11-amoled-8.jpg', '/assets/watches/series11-amoled-9.jpg'],
    'multicolor-gold-watch-for-men-with-black-dial': ['/assets/watches/multicolor-gold-2.jpg']
  };

  function viewProduct(slug) {
    app.innerHTML = '<p class="muted">Loading…</p>';
    loadProduct(slug).then(function (d) {
      if (!d) { app.innerHTML = '<div class="empty">Product not found. <a href="#/shop">Back to shop</a></div>'; return; }
      var p = d.product, qty = 1;
      var waHref = AMC.WHATSAPP_LINK + '?text=' + encodeURIComponent('Hello AM Collection! I want to order ' + p.name + ' (' + rs(p.price) + ').');
      var gal = [p.image_url].concat(PRODUCT_GALLERY[p.slug] || []).filter(Boolean);
      var galHtml = gal.length > 1 ?
        '<div class="pd-gallery" id="pdGallery"><div class="pd-slides" id="pdSlides">' + gal.map(function (src) {
          var isVid = /\.mp4(\?|$)/i.test(src);
          return '<div class="pd-slide">' + (isVid ? '<video src="' + esc(src) + '" controls muted loop playsinline preload="metadata"></video>' : '<img src="' + esc(src) + '" alt="' + esc(p.name) + '">') + '</div>';
        }).join('') + '</div>' +
        '<button class="pd-arrow prev" id="pdPrev" type="button" aria-label="Previous image">\u2039</button>' +
        '<button class="pd-arrow next" id="pdNext" type="button" aria-label="Next image">\u203a</button>' +
        '<div class="pd-dots" id="pdDots">' + gal.map(function (s, i) {
          return '<button type="button" data-dot="' + i + '"' + (i === 0 ? ' class="active"' : '') + ' aria-label="Go to image ' + (i + 1) + '"></button>';
        }).join('') + '</div></div>' :
        '<div class="pd-img"><img src="' + esc(p.image_url || '') + '" alt="' + esc(p.name) + '"></div>';
      var isHoodie = /hoodie/i.test(p.slug);
      var sizeHtml = isHoodie ?
        '<div class="size-guide"><h3>Size Guide (inches)</h3><table class="table"><thead><tr><th>Size</th><th>Chest</th><th>Length</th><th>Waist</th><th>Length</th></tr></thead><tbody>' +
        '<tr><td><b>M</b></td><td>18</td><td>25</td><td>26-29</td><td>38</td></tr>' +
        '<tr><td><b>L</b></td><td>19</td><td>26</td><td>30-32</td><td>38</td></tr>' +
        '<tr><td><b>XL</b></td><td>20</td><td>28</td><td>33-35</td><td>40</td></tr>' +
        '</tbody></table></div>' : '';
      var sum = d.reviewSummary || { count: 0, averageRating: 0 };
      app.innerHTML =
        '<p class="small"><a href="#/">Home</a> / <a href="#/shop?category=' + encodeURIComponent(p.category_slug) + '">' + esc(p.category_name || 'Watches') + '</a> / ' + esc(p.name) + '</p>' +
        '<div class="pd">' + galHtml +
        '<div><span class="muted small">' + esc(p.category_name || '') + (p.sku ? ' · SKU ' + esc(p.sku) : '') + '</span>' +
        '<h1>' + esc(p.name) + '</h1>' +
        (sum.count ? '<p class="stars">' + '★★★★★'.slice(0, Math.round(sum.averageRating)) + ' <span class="muted small">' + sum.averageRating + ' (' + sum.count + ' reviews)</span></p>' : '') +
        '<p class="big-price">' + rs(p.price) + (p.wasPrice ? ' <span class="was">' + rs(p.wasPrice) + '</span><span class="save-pill">SAVE ' + rs(p.wasPrice - p.price) + '</span>' : '') + '</p>' +
        '<p class="muted">' + (p.stock_qty > 0 ? 'In stock — ready to dispatch' : 'Out of stock') + ' · Delivery Rs. 200 (FREE on orders Rs. 5,000+)</p>' +
        '<p>' + esc(p.description || '') + '</p>' +
        sizeHtml +
        (isHoodie ? '<div class="pd-size"><span class="small muted">Size — select one *</span><div class="size-btns" id="pdSizes">' + ['M', 'L', 'XL', 'XXL'].map(function (s) { return '<button type="button" data-size="' + s + '">' + s + '</button>'; }).join('') + '</div><p class="form-error" id="pdSizeErr" style="display:none">Please select a size first.</p></div>' : '') +
        '<div class="pd-size-qty"><div><span class="small muted">Quantity</span><div class="qty-ctrl"><button id="qMinus" type="button">−</button><input id="qVal" value="1" readonly><button id="qPlus" type="button">+</button></div></div></div>' +
        '<div style="display:grid;gap:10px;margin-top:16px">' +
          '<button class="btn btn-add" id="pdAdd">Add to Cart</button>' +
          '<button class="btn btn-buy" id="pdBuy">Buy it now</button>' +
          '<a class="btn btn-wa" href="' + waHref + '" target="_blank" rel="noopener">Order on WhatsApp</a>' +
          '<button class="btn" id="pdWish" style="justify-self:center">' + (wishlist.indexOf(p.slug) >= 0 ? '♥ Wishlisted' : '♡ Wishlist') + '</button></div>' +
        '<ol class="delivery-timeline"><li><b>Order placed</b>We confirm your order</li><li><b>Dispatched</b>Packed &amp; shipped</li><li><b>Delivered</b>2–5 working days</li></ol>' +
        '<div class="trust-box" style="text-align:left;margin-top:16px"><b>Payment options</b><br><span class="muted small">Cash on Delivery, JazzCash, Easypaisa — ' + AMC.PAYMENT_NUMBER + '</span></div>' +
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
      var galIdx = 0;
      var pdTrack = document.getElementById('pdSlides');
      function pdShow(i) {
        if (!pdTrack) return;
        galIdx = (i + gal.length) % gal.length;
        pdTrack.style.transform = 'translateX(-' + (galIdx * 100) + '%)';
        document.querySelectorAll('#pdDots button').forEach(function (b, j) { b.classList.toggle('active', j === galIdx); });
      }
      var pdPrev = document.getElementById('pdPrev');
      var pdNext = document.getElementById('pdNext');
      if (pdPrev) pdPrev.addEventListener('click', function () { pdShow(galIdx - 1); });
      if (pdNext) pdNext.addEventListener('click', function () { pdShow(galIdx + 1); });
      document.querySelectorAll('#pdDots button').forEach(function (b) { b.addEventListener('click', function () { pdShow(Number(b.getAttribute('data-dot'))); }); });
      var pdGal = document.getElementById('pdGallery');
      if (pdGal) {
        var pdSX = 0;
        pdGal.addEventListener('touchstart', function (e) { pdSX = e.touches[0].clientX; }, { passive: true });
        pdGal.addEventListener('touchend', function (e) {
          var dx = e.changedTouches[0].clientX - pdSX;
          if (Math.abs(dx) > 40) pdShow(galIdx + (dx < 0 ? 1 : -1));
        }, { passive: true });
      }
      document.getElementById('qMinus').addEventListener('click', function () { qty = Math.max(1, qty - 1); document.getElementById('qVal').value = qty; });
      document.getElementById('qPlus').addEventListener('click', function () { qty = Math.min(p.stock_qty || 20, qty + 1); document.getElementById('qVal').value = qty; });
      var selSize = null;
      var sizeBtns = document.querySelectorAll('#pdSizes button');
      sizeBtns.forEach(function (b) { b.addEventListener('click', function () { selSize = b.getAttribute('data-size'); sizeBtns.forEach(function (x) { x.classList.toggle('sel', x === b); }); var e = document.getElementById('pdSizeErr'); if (e) e.style.display = 'none'; }); });
      function needSize() { if (isHoodie && !selSize) { var e = document.getElementById('pdSizeErr'); if (e) e.style.display = 'block'; AMC.toast('Please select a size first'); return true; } return false; }
      document.getElementById('pdAdd').addEventListener('click', function () { if (needSize()) return; addToCart(p, qty, selSize); AMC.toast('Added to cart'); });
      document.getElementById('pdBuy').addEventListener('click', function () { if (needSize()) return; addToCart(p, qty, selSize); location.hash = '#/checkout'; });
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
          '<div><a href="#/product/' + encodeURIComponent(c.slug) + '"><b>' + esc(c.name) + '</b></a>' + (c.size ? '<br><span class="muted small">Size: ' + esc(c.size) + '</span>' : (/hoodie/i.test(c.slug) ? '<br><span class="muted small">Size — select one *</span><div class="size-btns" data-cart-size="' + i + '">' + ['M', 'L', 'XL', 'XXL'].map(function (s) { return '<button type="button" data-size="' + s + '">' + s + '</button>'; }).join('') + '</div>' : '')) + '<br><span class="muted small">' + rs(c.price) + ' each</span>' +
          '<div class="qty-ctrl" style="margin-top:6px"><button data-dec="' + i + '">−</button><input value="' + c.qty + '" readonly><button data-inc="' + i + '">+</button></div></div>' +
          '<div style="text-align:right"><b>' + rs(c.price * c.qty) + '</b><br><button class="btn btn-sm btn-ghost" data-del="' + i + '">Remove</button></div></div>';
      }).join('') + summaryHtml(sub, del) +
      '<p class="muted small">Delivery is Rs. 200 — FREE on orders of Rs. 5,000 or more. Final delivery is confirmed at checkout.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><a class="btn btn-primary" href="#/checkout">Proceed to Checkout</a><a class="btn" href="#/shop">Continue Shopping</a></div></div>';
    app.querySelectorAll('[data-inc]').forEach(function (b) { b.addEventListener('click', function () { var c = cart[Number(b.getAttribute('data-inc'))]; c.qty = Math.min(c.stock || 20, c.qty + 1); saveCart(); viewCart(); }); });
    app.querySelectorAll('[data-dec]').forEach(function (b) { b.addEventListener('click', function () { var c = cart[Number(b.getAttribute('data-dec'))]; c.qty = Math.max(1, c.qty - 1); saveCart(); viewCart(); }); });
    app.querySelectorAll('[data-del]').forEach(function (b) { b.addEventListener('click', function () { cart.splice(Number(b.getAttribute('data-del')), 1); saveCart(); viewCart(); }); });
    app.querySelectorAll('[data-cart-size] button').forEach(function (b) { b.addEventListener('click', function () { var wrap = b.closest('[data-cart-size]'); var idx = Number(wrap.getAttribute('data-cart-size')); cart[idx].size = b.getAttribute('data-size'); saveCart(); viewCart(); }); });
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
      '</div>' +
      '<div id="payOnlineBox" hidden style="margin-top:12px;padding:12px;border:1px solid var(--border);border-radius:10px;background:#fff8e6">' +
      '<b id="payOnlineTitle">JazzCash Payment</b>' +
      '<p class="muted small" style="margin:6px 0">Is number par payment karein:<br>Account Number: <strong>' + AMC.PAYMENT_NUMBER + '</strong><br>Account Title: <strong>' + esc(AMC.PAYMENT_TITLE) + '</strong></p>' +
      '<label>Transaction ID *<input id="coTxnId" placeholder="Payment ke baad milne wali Transaction ID yahan likhein" autocomplete="off"></label>' +
      '<p class="muted small" style="margin:6px 0 0">Transaction ID ke baghair order complete nahi hoga.</p>' +
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
      var items = cart.map(function (c) { return { productId: c.productId, quantity: c.qty, size: c.size || undefined }; });
      api.post('/api/delivery/quote', { items: items, province: provEl.value || undefined, city: cityEl.value || undefined }).then(function (q) {
        document.getElementById('coSummary').innerHTML = summaryHtml(q.subtotal, q.deliveryFee);
      }).catch(function () {
        var sub = cartSubtotal();
        document.getElementById('coSummary').innerHTML = summaryHtml(sub, deliveryEstimate(sub));
      });
    }
    provEl.addEventListener('change', fillCities);
    cityEl.addEventListener('change', quote);
    function updatePayBox() {
      var sel = (app.querySelector('input[name="pay"]:checked') || {}).value || 'COD';
      var box = document.getElementById('payOnlineBox');
      if (!box) return;
      if (sel === 'JAZZCASH' || sel === 'EASYPAISA') {
        box.hidden = false;
        document.getElementById('payOnlineTitle').textContent = (sel === 'JAZZCASH' ? 'JazzCash' : 'Easypaisa') + ' Payment';
      } else { box.hidden = true; }
    }
    app.querySelectorAll('.pay-card').forEach(function (card) { card.addEventListener('click', function () { app.querySelectorAll('.pay-card').forEach(function (x) { x.classList.remove('sel'); }); card.classList.add('sel'); updatePayBox(); }); });
    updatePayBox();
    quote();
    document.getElementById('coForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var missingSize = cart.some(function (c) { return /hoodie/i.test(c.slug) && !c.size; });
      if (missingSize) { AMC.toast('Please select a size for the hoodie in your cart first'); location.hash = '#/cart'; return; }
      var pay = (app.querySelector('input[name="pay"]:checked') || {}).value || 'COD';
      var txnId = ((document.getElementById('coTxnId') || {}).value || '').trim();
      if ((pay === 'JAZZCASH' || pay === 'EASYPAISA') && !txnId) {
        document.getElementById('coErr').textContent = 'Transaction ID zaroori hai — pehle ' + (pay === 'JAZZCASH' ? 'JazzCash' : 'Easypaisa') + ' par payment karein, phir us ki Transaction ID yahan likhein.';
        var pb = document.getElementById('payOnlineBox'); if (pb) window.scrollTo(0, pb.offsetTop - 20);
        return;
      }
      var body = {
        customer: { fullName: document.getElementById('coName').value.trim(), mobile: document.getElementById('coMobile').value.trim(), email: document.getElementById('coEmail').value.trim() || undefined },
        address: { province: provEl.value, city: cityEl.value, area: document.getElementById('coArea').value.trim(), houseAddress: document.getElementById('coHouse').value.trim(), postalCode: document.getElementById('coPostal').value.trim() || undefined },
        paymentMethod: pay,
        transactionId: txnId || undefined,
        items: cart.map(function (c) { return { productId: c.productId, quantity: c.qty, size: c.size || undefined }; })
      };
      var btn = document.getElementById('coPlace'); btn.disabled = true; btn.textContent = 'Placing order…';
      api.post('/api/orders', body, { 'Idempotency-Key': idemKey }).then(function (res) {
        var o = res.order || res;
        var placed = { orderNumber: o.orderNumber || res.orderNumber, grandTotal: o.grandTotal || res.grandTotal, paymentMethod: o.paymentMethod || res.paymentMethod || pay, paymentNumber: res.paymentNumber || AMC.PAYMENT_NUMBER, transactionId: txnId || '', nextStep: res.nextStep || '' };
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
      '<p class="muted">' + esc(o.nextStep || 'We will call or message you to confirm your order before dispatch.') + (o.paymentMethod && o.paymentMethod !== 'COD' ? '<br>Payment number: <strong>' + esc(o.paymentNumber || AMC.PAYMENT_NUMBER) + '</strong> — your payment is marked paid after verified confirmation.' + (o.transactionId ? '<br>Transaction ID: <strong>' + esc(o.transactionId) + '</strong>' : '') : '') + '</p>' +
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
        '<div class="offer-banner"><div><b>Cash on Delivery</b><br><span class="muted">Order now and pay at your doorstep, anywhere in Pakistan. JazzCash and Easypaisa also accepted.</span></div><a class="btn" href="#/cart">My Cart</a></div>' +
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
      '<form id="authForm">' +
      '<label>Email or Username *<input id="authEmail" type="text" required autocomplete="username"></label>' +
      '<label>Password *<input id="authPass" type="password" required autocomplete="current-password"></label>' +
      '<p class="form-error" id="authErr"></p><button class="btn btn-primary btn-block" id="authBtn" type="submit">Login</button></form>' +
      '<p class="muted small">Store owner? Login with the admin username and password — the Admin Dashboard opens automatically.</p>' +
      '<p class="muted small">No account needed to order — you can always check out as a guest.</p></div>';
    document.getElementById('authForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('authEmail').value.trim(), pass = document.getElementById('authPass').value;
      var errEl = document.getElementById('authErr');
      // Pehle customer login; fail ho to admin login try (owner ke liye).
      api.post('/api/auth/login', { email: email, password: pass }).then(function (d) {
        if (d.token) AMC.setToken(d.token);
        session = { name: (d.user && (d.user.full_name || d.user.name)) || email, email: (d.user && d.user.email) || email };
        saveSession(); AMC.toast('Welcome back!'); viewAccount();
      }).catch(function () {
        api.post('/api/admin/login', { username: email, password: pass }).then(function (d) {
          if (d.token) AMC.setAdminToken(d.token);
          AMC.toast('Admin login successful'); viewAccount();
        }).catch(function (err2) { errEl.textContent = err2.message || 'Login failed — check email/username and password.'; });
      });
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
      '<p class="muted">JazzCash / Easypaisa account:<br>Account Number: <b style="color:var(--gold-soft)">' + AMC.PAYMENT_NUMBER + '</b><br>Account Title: <b style="color:var(--gold-soft)">' + esc(AMC.PAYMENT_TITLE) + '</b></p>' +
      '<p class="muted">JazzCash ya Easypaisa se payment karne ke baad checkout par apni Transaction ID zaroor likhein — bina Transaction ID ke order complete nahi hoga. Prepaid payments are marked paid only after verified confirmation from the payment provider.</p></div>';
    window.scrollTo(0, 0);
  }
  function viewAbout() {
    app.innerHTML = '<h1 class="section-title">About AM Collection</h1><div id="aboutPic"></div><div class="card policy-body">' +
      '<p>AM Collection is an online watch store in Pakistan, bringing stylish men\'s, luxury and sports watches to your doorstep at honest prices.</p>' +
      '<p>Premium Quality, Best Prices — Cash on Delivery across Pakistan. Pay cash at your doorstep, or through JazzCash and Easypaisa.</p>' +
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
