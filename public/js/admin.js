/* AM Collection — Admin Dashboard.
   SECURITY: Ye page khulte hi SIRF Admin Login form dikhta hai — dashboard
   ka koi data login se pehle load NAHI hota. Login: POST /api/admin/login
   (username + password, server ki .env ke ADMIN_USER / ADMIN_PASSWORD se
   check hota hai) -> signed admin token (customer token se alag key mein
   save hota hai, har admin API call ke saath jata hai). Baghair valid admin
   token ke tamam /api/admin/* routes server par 401/403 dete hain.
   Data: GET /api/admin/dashboard, /api/admin/orders,
   /api/admin/orders/:orderNumber, PATCH .../status, PATCH .../payment,
   POST /api/admin/products, PATCH /api/admin/products/:id,
   GET /api/products, GET /api/categories,
   GET /api/admin/complaints  (customer complaints — sirf admin),
   POST /api/admin/about-picture + DELETE /api/admin/about-picture  (About page picture — sirf admin),
   GET /api/admin/reviews, PATCH /api/admin/reviews/:id/approve|reject|status,
   DELETE /api/admin/reviews/:id  (reviews sirf admin ko — public ko sirf APPROVED) */
(function () {
  'use strict';
  var api = AMC.api, rs = AMC.rs, esc = AMC.esc;
  var main = document.getElementById('adminApp');
  var loginBox = document.getElementById('adminLogin');
  var shell = document.getElementById('adminShell');
  var logoutBtn = document.getElementById('adminLogout');
  var ORDER_FLOW = ['PENDING_CONFIRMATION','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','RETURNED'];
  var BRA_TYPES = ['T-Shirt Bra','Sports Bra','Padded Bra','Wireless Bra / Bralette','Full-Coverage Bra','Strapless Bra','Balconette Bra','Nursing Bra','Lace Bra','Embroidered Bra','Satin Bra','Strappy Bra','Balconette Lace Bra','Mesh Bra'];
  var ordersCache = [];

  function label(s) { return String(s || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, function (c) { return c.toUpperCase(); }); }
  function fmtSizePrices(p) { var sp = p && p.size_prices; if (typeof sp === 'string') { try { sp = JSON.parse(sp); } catch (e) { sp = null; } } if (!sp || typeof sp !== 'object') return ''; var ks = Object.keys(sp).filter(function (k) { return Number(sp[k]) > 0; }).sort(function (a, b) { return (parseFloat(a) - parseFloat(b)) || (a < b ? -1 : 1); }); return ks.map(function (k) { return k + ': ' + rs(sp[k]); }).join(' · '); }
  function badgeCls(s) { s = String(s || '').toUpperCase(); if (['DELIVERED','PAID','COD_COLLECTED','APPROVED'].indexOf(s) >= 0) return 'ok'; if (['CANCELLED','FAILED','REJECTED'].indexOf(s) >= 0) return 'bad'; if (['SHIPPED','CONFIRMED','PROCESSING'].indexOf(s) >= 0) return 'info'; return ''; }
  function badge(s) { return '<span class="status-badge ' + badgeCls(s) + '">' + esc(label(s)) + '</span>'; }

  function showLogin(show) {
    loginBox.hidden = !show; shell.hidden = show; logoutBtn.hidden = show;
    if (show) { main.innerHTML = ''; }
  }
  document.getElementById('adminLoginForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var err = document.getElementById('adminLoginError'); err.textContent = '';
    api.post('/api/admin/login', { username: document.getElementById('adminUsername').value.trim(), password: document.getElementById('adminPassword').value }).then(function (d) {
      if (!d.token) { err.textContent = 'Login fail — server se admin token nahi mila.'; return; }
      AMC.setAdminToken(d.token); showLogin(false); route();
    }).catch(function (e2) { err.textContent = e2.message; });
  });
  logoutBtn.addEventListener('click', function () { AMC.setAdminToken(null); location.hash = ''; showLogin(true); });

  function setNav(name) {
    document.querySelectorAll('[data-admin-nav]').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-admin-nav') === name); });
  }
  function loadOrders(status) {
    return api.get('/api/admin/orders?limit=30&page=1' + (status ? '&status=' + encodeURIComponent(status) : '')).then(function (d) { ordersCache = d.orders || []; return ordersCache; });
  }

  /* ---------- OVERVIEW ---------- */
  function pageOverview() {
    setNav('overview');
    main.innerHTML = '<h1>Overview</h1><div id="ovStats"><div class="empty">Loading…</div></div>' +
      '<div class="section-title"><h2>Recent Orders</h2><a href="#orders">All orders →</a></div><div id="ovRecent"></div>' +
      '<div class="section-title"><h2>Low-Stock Alerts</h2><a href="#inventory">Inventory →</a></div><div id="ovLow"></div>';
    api.get('/api/admin/dashboard').then(function (d) {
      document.getElementById('ovStats').innerHTML = '<div class="stat-grid">' +
        '<div class="stat"><div class="stat-num">' + (d.today ? d.today.orders : 0) + '</div><div class="stat-label">Orders Today</div></div>' +
        '<div class="stat"><div class="stat-num">' + rs(d.today ? d.today.revenue : 0) + '</div><div class="stat-label">Sales Today</div></div>' +
        '<div class="stat"><div class="stat-num">' + (d.pendingConfirmation || 0) + '</div><div class="stat-label">Pending Confirmation</div></div>' +
        '<div class="stat"><div class="stat-num">' + (d.lowStock || []).length + '</div><div class="stat-label">Low-Stock Items</div></div></div>';
      document.getElementById('ovRecent').innerHTML = (d.recentOrders || []).length ? ordersTable(d.recentOrders) : '<div class="empty">Abhi koi order nahi.</div>';
      document.getElementById('ovLow').innerHTML = (d.lowStock || []).length ? '<div class="card">' + d.lowStock.map(function (p) { return '<div class="summary-line"><span>' + esc(p.name) + ' <span class="muted small">SKU: ' + esc(p.sku) + '</span></span><strong>' + p.stock_qty + ' left</strong></div>'; }).join('') + '</div>' : '<div class="empty">Low stock alert koi nahi 👍</div>';
      bindOrderRows();
    }).catch(function (e) { main.innerHTML = '<h1>Overview</h1><div class="empty">' + esc(e.message) + '</div>'; });
  }
  function ordersTable(orders) {
    return '<div class="admin-table-wrap"><table class="table"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th></th></tr></thead><tbody>' +
      orders.map(function (o) {
        return '<tr><td><strong>' + esc(o.order_number) + '</strong></td><td>' + esc(o.customer_name) + '<br><span class="muted small">' + esc(o.customer_phone) + '</span></td>' +
          '<td>' + rs(o.grand_total) + '</td><td>' + esc(o.payment_method) + '<br>' + badge(o.payment_status) + '</td><td>' + badge(o.order_status) + '</td>' +
          '<td>' + esc(new Date(o.created_at).toLocaleDateString()) + '</td><td><button class="btn btn-sm" data-view-order="' + esc(o.order_number) + '">View</button></td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  function bindOrderRows() {
    main.querySelectorAll('[data-view-order]').forEach(function (b) { b.addEventListener('click', function () { location.hash = '#order/' + encodeURIComponent(b.getAttribute('data-view-order')); }); });
  }

  /* ---------- ORDERS LIST + DETAILS ---------- */
  function pageOrders() {
    setNav('orders');
    main.innerHTML = '<h1>Orders</h1><div class="toolbar"><select id="ordStatus"><option value="">All Statuses</option>' +
      ORDER_FLOW.map(function (s) { return '<option value="' + s + '">' + label(s) + '</option>'; }).join('') + '</select></div><div id="ordList"><div class="empty">Loading…</div></div>';
    function reload() {
      loadOrders(document.getElementById('ordStatus').value).then(function (orders) {
        document.getElementById('ordList').innerHTML = orders.length ? ordersTable(orders) : '<div class="empty">Is status par koi order nahi.</div>';
        bindOrderRows();
      }).catch(function (e) { document.getElementById('ordList').innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
    }
    document.getElementById('ordStatus').addEventListener('change', reload);
    reload();
  }

  function pageOrderDetails(orderNumber) {
    setNav('orders');
    main.innerHTML = '<p><a href="#orders">← Orders</a></p><div class="empty">Loading order…</div>';
    api.get('/api/admin/orders/' + encodeURIComponent(orderNumber)).then(function (d) {
      var o = d.order, items = d.items || [];
      main.innerHTML =
        '<div class="card print-area"><div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">' +
        '<h2 style="margin:0">Order Details</h2>' + badge(o.order_status) + '</div>' +
        '<p class="muted">Order ID: <strong>' + esc(o.order_number) + '</strong> · ' + esc(new Date(o.created_at).toLocaleString()) + '</p>' +
        '<hr style="border:0;border-top:1px solid var(--border)"><h3>Customer</h3>' +
        '<p>Customer name: ' + esc(o.customer_name) + '<br>Phone: ' + esc(o.customer_phone) + (o.customer_email ? '<br>Email: ' + esc(o.customer_email) : '') +
        '<br>Address: ' + esc(o.house_address) + ', ' + esc(o.area) + ', ' + esc(o.city) + ', ' + esc(o.province) + ', Pakistan' + (o.postal_code ? ' (' + esc(o.postal_code) + ')' : '') + '</p>' +
        '<h3>Items Ordered</h3>' + items.map(function (it) {
          return '<div class="summary-line"><span><strong>' + esc(it.product_name) + '</strong><br><span class="muted small">SKU: ' + esc(it.sku) + (it.variant_name ? ' · ' + esc(it.variant_name) : '') + ' · Qty: ' + it.quantity + '</span></span><span>' + rs(it.line_total != null ? it.line_total : it.unit_price * it.quantity) + '</span></div>';
        }).join('') +
        '<hr style="border:0;border-top:1px solid var(--border)">' +
        '<div class="summary-line"><span>Subtotal</span><span>' + rs(o.subtotal) + '</span></div>' +
        (Number(o.discount_amount) ? '<div class="summary-line"><span>Discount</span><span>− ' + rs(o.discount_amount) + '</span></div>' : '') +
        '<div class="summary-line"><span>Delivery</span><span>' + rs(o.delivery_fee) + '</span></div>' +
        '<div class="summary-line total"><span>Total</span><span>' + rs(o.grand_total) + '</span></div>' +
        '<div class="summary-line"><span>Payment</span><strong>' + esc(label(o.payment_method)) + ' · ' + esc(label(o.payment_status)) + '</strong></div>' +
        (d.shipment ? '<p class="muted">Shipment: ' + esc(d.shipment.courier || '-') + ' · Tracking: ' + esc(d.shipment.tracking_number || '-') + ' · ' + esc(label(d.shipment.status)) + '</p>' : '') +
        '<div class="action-row no-print">' +
          '<button class="btn btn-primary" id="actConfirm">Confirm Order</button>' +
          '<button class="btn" id="actPrint">Print Invoice</button>' +
          '<button class="btn" id="actStatus">Update Status</button>' +
          '<button class="btn" id="actCancel" style="color:var(--red)">Cancel Order</button></div>' +
        '<div id="statusBox" class="no-print" hidden><label>New Status</label><select id="newStatus">' + ORDER_FLOW.map(function (s) { return '<option value="' + s + '"' + (s === o.order_status ? ' selected' : '') + '>' + label(s) + '</option>'; }).join('') + '</select>' +
          '<label>Courier (Shipped par)</label><input id="shipCourier" placeholder="TCS / Leopards / PostEx">' +
          '<label>Tracking Number</label><input id="shipTracking" placeholder="Tracking number">' +
          '<label>Note</label><input id="statusNote" placeholder="Optional note">' +
          '<div class="action-row"><button class="btn btn-primary" id="saveStatus">Save Status</button></div></div>' +
        '<div id="payBox" class="no-print"><label>Payment Status (COD reconciliation)</label><div style="display:flex;gap:8px;flex-wrap:wrap"><select id="payStatus" style="flex:1"><option value="PAID">PAID</option><option value="COD_COLLECTED">COD Collected</option><option value="REFUNDED">Refunded</option><option value="FAILED">Failed</option></select><button class="btn" id="savePay">Update Payment</button></div></div>' +
        '</div>';
      function patchStatus(status, extra) {
        var body = Object.assign({ status: status }, extra || {});
        api.patch('/api/admin/orders/' + encodeURIComponent(orderNumber) + '/status', body).then(function () { AMC.toast('Status updated: ' + label(status)); pageOrderDetails(orderNumber); }).catch(function (e) { AMC.toast(e.message); });
      }
      document.getElementById('actConfirm').addEventListener('click', function () { patchStatus('CONFIRMED'); });
      document.getElementById('actCancel').addEventListener('click', function () { if (confirm('Order cancel karein? Stock wapas add ho jayega.')) patchStatus('CANCELLED'); });
      document.getElementById('actPrint').addEventListener('click', function () { window.print(); });
      document.getElementById('actStatus').addEventListener('click', function () { document.getElementById('statusBox').hidden = false; });
      document.getElementById('saveStatus').addEventListener('click', function () {
        patchStatus(document.getElementById('newStatus').value, { courier: document.getElementById('shipCourier').value || undefined, trackingNumber: document.getElementById('shipTracking').value || undefined, note: document.getElementById('statusNote').value || undefined });
      });
      document.getElementById('savePay').addEventListener('click', function () {
        api.patch('/api/admin/orders/' + encodeURIComponent(orderNumber) + '/payment', { paymentStatus: document.getElementById('payStatus').value }).then(function () { AMC.toast('Payment status updated'); pageOrderDetails(orderNumber); }).catch(function (e) { AMC.toast(e.message); });
      });
    }).catch(function (e) { main.innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
  }

  /* ---------- PRODUCTS + INVENTORY ---------- */
  function productForm(p) {
    p = p || {};
    return '<form id="prodForm" class="inline-form">' +
      '<div><label>Product Name *</label><input id="pfName" required value="' + esc(p.name || '') + '"></div>' +
      '<div><label>SKU *</label><input id="pfSku" required value="' + esc(p.sku || '') + '"></div>' +
      '<div><label>Category</label><select id="pfCategory"><option value="">— Select —</option></select></div>' +
      '<div id="pfBraTypeWrap"><label>Bra Type (sirf Women Underwear and Bras subcategory ke products ke liye)</label><select id="pfBraType"><option value="">— Select Bra Type —</option>' + BRA_TYPES.map(function (t) { return '<option value="' + esc(t) + '"' + (p.bra_type === t ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</select></div>' +
      '<div><label>Slug</label><input id="pfSlug" value="' + esc(p.slug || '') + '" placeholder="auto from name"></div>' +
      '<div><label>Price (Rs.) *</label><input id="pfPrice" type="number" min="0" required value="' + (p.price != null ? p.price : '') + '"></div>' +
      '<div><label>Discount Price (Rs.)</label><input id="pfDiscount" type="number" min="0" value="' + (p.discount_price != null ? p.discount_price : '') + '"></div>' +
      '<div><label>Size Prices (JSON) — har size ki alag price; khaali = ek hi price. Price upar sab se chhote size ki rakhein</label><input id="pfSizePrices" value="' + esc(p.size_prices ? (typeof p.size_prices === 'string' ? p.size_prices : JSON.stringify(p.size_prices)) : '') + '" placeholder=\'{"32":2000,"34":2175,"36":2350,"38":2525}\'></div>' +
      '<div><label>Cost Price (Rs.) — profit report ke liye</label><input id="pfCost" type="number" min="0" value="' + (p.cost_price != null ? p.cost_price : '') + '"></div>' +
      '<div><label>Stock Qty</label><input id="pfStock" type="number" min="0" value="' + (p.stock_qty != null ? p.stock_qty : 0) + '"></div>' +
      '<div class="full"><label>Description</label><textarea id="pfDesc" rows="3">' + esc(p.description || '') + '</textarea></div>' +
      '<div class="full"><label>Image URL (object storage / hosting ka link)</label><input id="pfImage" value="' + esc(p.image_url || '') + '" placeholder="https://…/product.jpg"></div>' +
      '<p class="form-error full" id="pfError"></p>' +
      '<div class="full"><button class="btn btn-primary">' + (p.id ? 'Save Changes' : 'Add Product') + '</button></div></form>';
  }
  function fillCategories(selectedId) {
    api.get('/api/categories').then(function (d) {
      var sel = document.getElementById('pfCategory'); if (!sel) return;
      var cats = d.categories || [];
      sel.innerHTML = '<option value="">— Select —</option>' + cats.map(function (c) {
        return '<option value="' + esc(c.id) + '"' + (String(c.id) === String(selectedId) ? ' selected' : '') + '>' + (c.parent_id ? '— ' : '') + esc(c.name) + '</option>';
      }).join('');
      var byId = {}; cats.forEach(function (c) { byId[String(c.id)] = c; });
      function updateBraTypeVisibility() {
        var wrap = document.getElementById('pfBraTypeWrap'); if (!wrap) return;
        var chosen = byId[String(sel.value)];
        var isWomenUnderwearAndBras = chosen && (chosen.slug === 'women-underwear-and-bras' || chosen.name === 'Women Underwear and Bras');
        wrap.style.display = isWomenUnderwearAndBras ? '' : 'none';
        if (!isWomenUnderwearAndBras) { var bt = document.getElementById('pfBraType'); if (bt) bt.value = ''; }
      }
      sel.addEventListener('change', updateBraTypeVisibility);
      updateBraTypeVisibility();
    }).catch(function () {});
  }
  function pageProducts(editId) {
    setNav('products');
    main.innerHTML = '<h1>Products</h1><div class="card" style="margin-bottom:16px"><h3 style="margin-top:0" id="pfTitle">Add Product</h3><div id="pfWrap"></div></div>' +
      '<div id="prodList"><div class="empty">Loading products…</div></div>';
    function renderForm(p) {
      document.getElementById('pfTitle').textContent = p && p.id ? 'Edit Product — ' + p.name : 'Add Product';
      document.getElementById('pfWrap').innerHTML = productForm(p);
      fillCategories(p ? p.category_id : null);
      document.getElementById('prodForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var body = {
          name: document.getElementById('pfName').value.trim(),
          sku: document.getElementById('pfSku').value.trim(),
          slug: document.getElementById('pfSlug').value.trim() || undefined,
          categoryId: document.getElementById('pfCategory').value ? Number(document.getElementById('pfCategory').value) || document.getElementById('pfCategory').value : undefined,
          price: Number(document.getElementById('pfPrice').value),
          discountPrice: document.getElementById('pfDiscount').value ? Number(document.getElementById('pfDiscount').value) : undefined,
          costPrice: document.getElementById('pfCost').value ? Number(document.getElementById('pfCost').value) : undefined,
          stockQty: Number(document.getElementById('pfStock').value || 0),
          description: document.getElementById('pfDesc').value,
          image_url: (document.getElementById('pfImage') && document.getElementById('pfImage').value.trim()) ? document.getElementById('pfImage').value.trim() : undefined,
          braType: (document.getElementById('pfBraType') && document.getElementById('pfBraType').value) ? document.getElementById('pfBraType').value : null,
          sizePrices: document.getElementById('pfSizePrices') && document.getElementById('pfSizePrices').value.trim() ? document.getElementById('pfSizePrices').value.trim() : undefined
        };
        var req = (p && p.id) ? api.patch('/api/admin/products/' + p.id, body) : api.post('/api/admin/products', body);
        req.then(function () { AMC.toast('Product save ho gaya ✅'); pageProducts(); }).catch(function (err) { document.getElementById('pfError').textContent = err.message; });
      });
    }
    renderForm(null);
    api.get('/api/products?limit=60&sort=newest').then(function (d) {
      var list = d.products || [];
      var el = document.getElementById('prodList');
      el.innerHTML = list.length ? '<div class="admin-table-wrap"><table class="table"><thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Price</th><th>Stock</th><th>Active</th><th></th></tr></thead><tbody>' +
        list.map(function (p) {
          return '<tr><td><strong>' + esc(p.name) + '</strong>' + (p.bra_type ? '<br><span class="muted small">Bra Type: ' + esc(p.bra_type) + '</span>' : '') + (fmtSizePrices(p) ? '<br><span class="muted small">Size Prices: ' + esc(fmtSizePrices(p)) + '</span>' : '') + '</td><td>' + esc(p.sku) + '</td><td>' + esc(p.category_name || '-') + '</td><td>' + rs(p.discount_price != null ? p.discount_price : p.price) + '</td><td>' + (p.stock_qty != null ? p.stock_qty : '-') + '</td><td>' + (p.is_active ? 'Yes' : 'No') + '</td>' +
            '<td><button class="btn btn-sm" data-edit-prod="' + p.id + '">Edit</button> <button class="btn btn-sm" data-toggle-prod="' + p.id + '" data-active="' + (p.is_active ? 1 : 0) + '">' + (p.is_active ? 'Deactivate' : 'Activate') + '</button></td></tr>';
        }).join('') + '</tbody></table></div>'
        : '<div class="empty">Catalog khaali hai — upar walay form se pehla product add karein. (Delete = Deactivate; product store se hide ho jata hai, purane orders par asar nahi padta.)</div>';
      el.querySelectorAll('[data-edit-prod]').forEach(function (b) { b.addEventListener('click', function () { var prod = list.find(function (x) { return String(x.id) === b.getAttribute('data-edit-prod'); }); renderForm(prod); window.scrollTo(0, 0); }); });
      el.querySelectorAll('[data-toggle-prod]').forEach(function (b) { b.addEventListener('click', function () { api.patch('/api/admin/products/' + b.getAttribute('data-toggle-prod'), { is_active: b.getAttribute('data-active') !== '1' }).then(function () { pageProducts(); }).catch(function (err) { AMC.toast(err.message); }); }); });
    }).catch(function (e) { document.getElementById('prodList').innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
  }
  function pageInventory() {
    setNav('inventory');
    main.innerHTML = '<h1>Inventory</h1><div id="invWrap"><div class="empty">Loading…</div></div>' +
      '<p class="muted small">Stock order place hone par backend transaction mein khud kam hota hai; Cancel par wapas add ho jata hai. Stock yahan Products → Edit se badlein.</p>';
    api.get('/api/products?limit=60&sort=newest').then(function (d) {
      var list = d.products || [];
      var low = list.filter(function (p) { return Number(p.stock_qty || 0) <= 5; });
      document.getElementById('invWrap').innerHTML =
        (low.length ? '<div class="card" style="margin-bottom:14px"><h3 style="margin-top:0">⚠️ Low Stock (' + low.length + ')</h3>' + low.map(function (p) { return '<div class="summary-line"><span>' + esc(p.name) + '</span><strong>' + p.stock_qty + ' left</strong></div>'; }).join('') + '</div>' : '') +
        (list.length ? '<div class="admin-table-wrap"><table class="table"><thead><tr><th>Product</th><th>SKU</th><th>Stock</th><th>Status</th></tr></thead><tbody>' + list.map(function (p) { return '<tr><td>' + esc(p.name) + '</td><td>' + esc(p.sku) + '</td><td>' + (p.stock_qty != null ? p.stock_qty : '-') + '</td><td>' + (Number(p.stock_qty || 0) <= 0 ? badge('CANCELLED').replace('Cancelled', 'Out of Stock') : Number(p.stock_qty) <= 5 ? '<span class="status-badge">Low Stock</span>' : '<span class="status-badge ok">In Stock</span>') + '</td></tr>'; }).join('') + '</tbody></table></div>' : '<div class="empty">Inventory khaali hai — pehle products add karein.</div>');
    }).catch(function (e) { document.getElementById('invWrap').innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
  }

  /* ---------- REVIEWS MODERATION ---------- */
  // Customer reviews yahan SAARE dikhte hain (PENDING/APPROVED/REJECTED).
  // Public product page par sirf APPROVED dikhte hain — jab tak admin approve
  // na kare, review sirf yahin (admin mein) nazar aata hai.
  function starsTextAdmin(rating) { var r = Math.max(0, Math.min(5, Math.round(Number(rating) || 0))); return '★★★★★'.slice(0, r) + '☆☆☆☆☆'.slice(0, 5 - r); }
  function pageReviews() {
    setNav('reviews');
    main.innerHTML = '<h1>Reviews</h1>' +
      '<p class="muted">Naya customer review <strong>Pending</strong> hota hai aur publicly NAHI dikhta. <strong>Approve</strong> karne par hi wo product page par sab ko dikhega; <strong>Reject</strong> karne par wo kabhi public nahi hoga (record admin mein rahega), aur <strong>Delete</strong> se review hamesha ke liye hat jayega.</p>' +
      '<div class="toolbar"><select id="rvStatus"><option value="">All Statuses</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select><span class="muted small" id="rvSummary"></span></div>' +
      '<div id="rvList"><div class="empty">Loading reviews…</div></div>';
    function reload() {
      var st = document.getElementById('rvStatus').value;
      api.get('/api/admin/reviews?limit=100&page=1' + (st ? '&status=' + encodeURIComponent(st) : '')).then(function (d) {
        var list = d.reviews || [];
        var sum = d.summary || {};
        var sumEl = document.getElementById('rvSummary');
        if (sumEl) sumEl.textContent = 'Pending: ' + (sum.PENDING || 0) + ' · Approved: ' + (sum.APPROVED || 0) + ' · Rejected: ' + (sum.REJECTED || 0) + ' · Total: ' + (sum.total != null ? sum.total : list.length);
        var el = document.getElementById('rvList');
        el.innerHTML = list.length ? '<div class="admin-table-wrap"><table class="table"><thead><tr><th>Review</th><th>Product</th><th>Customer</th><th>Rating</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead><tbody>' +
          list.map(function (r) {
            var status = String(r.status || (r.is_approved ? 'APPROVED' : 'PENDING')).toUpperCase();
            return '<tr><td>' + (r.title ? '<strong>' + esc(r.title) + '</strong><br>' : '') + esc(r.body || '') + '</td>' +
              '<td>' + (r.product_slug ? '<a href="/#/product/' + encodeURIComponent(r.product_slug) + '" target="_blank" rel="noopener">' + esc(r.product_name || r.product_slug) + '</a>' : esc(r.product_name || '-')) + '</td>' +
              '<td>' + esc(r.customer_name || '-') + '</td>' +
              '<td><span class="stars">' + starsTextAdmin(r.rating) + '</span><br><span class="muted small">' + esc(r.rating) + ' / 5</span></td>' +
              '<td>' + badge(status) + '</td>' +
              '<td>' + esc(new Date(r.created_at).toLocaleDateString()) + '</td>' +
              '<td style="white-space:nowrap">' +
                (status !== 'APPROVED' ? '<button class="btn btn-sm btn-primary" data-rv-approve="' + esc(r.id) + '">Approve</button> ' : '') +
                (status !== 'REJECTED' ? '<button class="btn btn-sm" data-rv-reject="' + esc(r.id) + '">Reject</button> ' : '') +
                '<button class="btn btn-sm" data-rv-delete="' + esc(r.id) + '" style="color:var(--red)">Delete</button></td></tr>';
          }).join('') + '</tbody></table></div>'
          : '<div class="empty">Is status par koi review nahi. Naye customer reviews yahan Pending mein ayenge.</div>';
        el.querySelectorAll('[data-rv-approve]').forEach(function (b) { b.addEventListener('click', function () { api.patch('/api/admin/reviews/' + encodeURIComponent(b.getAttribute('data-rv-approve')) + '/approve', {}).then(function () { AMC.toast('Review approved — ab publicly dikhega ✅'); reload(); }).catch(function (e) { AMC.toast(e.message); }); }); });
        el.querySelectorAll('[data-rv-reject]').forEach(function (b) { b.addEventListener('click', function () { api.patch('/api/admin/reviews/' + encodeURIComponent(b.getAttribute('data-rv-reject')) + '/reject', {}).then(function () { AMC.toast('Review rejected — public nahi dikhega'); reload(); }).catch(function (e) { AMC.toast(e.message); }); }); });
        el.querySelectorAll('[data-rv-delete]').forEach(function (b) { b.addEventListener('click', function () { if (!confirm('Ye review delete karein? Ye wapas nahi ayega.')) return; var del = (api.del || api.delete); if (del) { del.call(api, '/api/admin/reviews/' + encodeURIComponent(b.getAttribute('data-rv-delete'))).then(function () { AMC.toast('Review deleted'); reload(); }).catch(function (e) { AMC.toast(e.message); }); } else { fetch('/api/admin/reviews/' + encodeURIComponent(b.getAttribute('data-rv-delete')), { method: 'DELETE', headers: { Authorization: 'Bearer ' + (AMC.getAdminToken() || '') } }).then(function () { AMC.toast('Review deleted'); reload(); }).catch(function (e) { AMC.toast(e.message); }); } }); });
      }).catch(function (e) { document.getElementById('rvList').innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
    }
    document.getElementById('rvStatus').addEventListener('change', reload);
    reload();
  }

  /* ---------- COMPLAINTS ---------- */
  // Customer complaints storefront ke Complaint form (footer Customer Care
  // -> Complaint) se POST /api/complaints par ati hain; yahan sirf admin
  // token se GET /api/admin/complaints par list hoti hain.
  function pageComplaints() {
    setNav('complaints');
    main.innerHTML = '<h1>Complaints</h1>' +
      '<p class="muted">Ye complaints customers ne storefront ke <strong>Complaint</strong> form se bheji hain. Nayi complaints (<strong>NEW</strong>) sab se upar dikhti hain — customer se us ke mobile number par rabta karein.</p>' +
      '<div id="cmpList"><div class="empty">Loading complaints…</div></div>';
    api.get('/api/admin/complaints?limit=100&page=1').then(function (d) {
      var list = d.complaints || [];
      var sum = d.summary || {};
      var el = document.getElementById('cmpList');
      el.innerHTML = '<p class="muted small">New: ' + (sum.NEW || 0) + ' · Total: ' + (sum.total != null ? sum.total : list.length) + '</p>' +
        (list.length ? '<div class="admin-table-wrap"><table class="table"><thead><tr><th>Complaint</th><th>Customer</th><th>Order Number</th><th>Status</th><th>Date</th></tr></thead><tbody>' +
          list.map(function (c) {
            return '<tr><td>' + esc(c.message || '') + '</td>' +
              '<td><strong>' + esc(c.name || '-') + '</strong><br><span class="muted small">' + esc(c.mobile || '') + '</span></td>' +
              '<td>' + (c.order_number ? esc(c.order_number) : '<span class="muted">—</span>') + '</td>' +
              '<td>' + badge(c.status || 'NEW') + '</td>' +
              '<td>' + esc(new Date(c.created_at).toLocaleDateString()) + '</td></tr>';
          }).join('') + '</tbody></table></div>'
          : '<div class="empty">Abhi koi complaint nahi — customer complaints yahan ayengi.</div>');
    }).catch(function (e) { document.getElementById('cmpList').innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
  }

  /* ---------- CUSTOMERS / PAYMENTS / MARKETING / REPORTS / SETTINGS ---------- */
  function pageCustomers() {
    setNav('customers');
    main.innerHTML = '<h1>Customers</h1><div id="custWrap"><div class="empty">Loading orders se customers…</div></div>' +
      '<p class="muted small">Customers ki list orders se banti hai (har order mein customer name, phone aur address ka snapshot save hota hai). Account wale customers login karke apni order history khud dekh sakte hain.</p>';
    loadOrders('').then(function (orders) {
      var byPhone = {};
      orders.forEach(function (o) { var k = o.customer_phone; if (!byPhone[k]) byPhone[k] = { name: o.customer_name, phone: o.customer_phone, orders: 0, spent: 0 }; byPhone[k].orders++; byPhone[k].spent += Number(o.grand_total || 0); });
      var list = Object.keys(byPhone).map(function (k) { return byPhone[k]; });
      document.getElementById('custWrap').innerHTML = list.length ? '<div class="admin-table-wrap"><table class="table"><thead><tr><th>Customer</th><th>Phone</th><th>Orders</th><th>Total Spent</th></tr></thead><tbody>' +
        list.map(function (c) { return '<tr><td><strong>' + esc(c.name) + '</strong></td><td>' + esc(c.phone) + '</td><td>' + c.orders + '</td><td>' + rs(c.spent) + '</td></tr>'; }).join('') + '</tbody></table></div>'
        : '<div class="empty">Abhi koi customer order nahi.</div>';
    }).catch(function (e) { document.getElementById('custWrap').innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
  }
  function pagePayments() {
    setNav('payments');
    main.innerHTML = '<h1>Payments</h1><div id="payWrap"><div class="empty">Loading…</div></div>' +
      '<div class="card" style="margin-top:14px"><h3 style="margin-top:0">Rules</h3><p class="muted">• COD order <strong>PAID tabhi</strong> hoga jab courier se cash collect ho — order details mein "COD Collected" mark karein.<br>• JazzCash / Easypaisa / NayaPay online payment sirf <strong>signed callback verify</strong> hone + amount/order match par PAID hoti hai (backend khud karta hai).<br>• Payment numbers: Easypaisa / JazzCash / NayaPay — <strong>' + AMC.PAYMENT_NUMBER + '</strong></p></div>';
    loadOrders('').then(function (orders) {
      var codPending = orders.filter(function (o) { return o.payment_method === 'COD' && String(o.payment_status).toUpperCase() !== 'PAID' && String(o.payment_status).toUpperCase() !== 'COD_COLLECTED'; });
      var failed = orders.filter(function (o) { return String(o.payment_status).toUpperCase() === 'FAILED'; });
      var refunds = orders.filter(function (o) { return String(o.payment_status).toUpperCase() === 'REFUNDED'; });
      function block(title, list, note) {
        return '<div class="section-title"><h2>' + title + ' (' + list.length + ')</h2></div>' + (list.length ? ordersTable(list) : '<div class="empty">' + note + '</div>');
      }
      document.getElementById('payWrap').innerHTML = block('COD — Collection Pending', codPending, 'COD collection pending koi order nahi.') + block('Failed Payments', failed, 'Failed payment koi nahi.') + block('Refunds', refunds, 'Refund koi nahi.');
      bindOrderRows();
    }).catch(function (e) { document.getElementById('payWrap').innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
  }
  function pageMarketing() {
    setNav('marketing');
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem('amc-marketing') || '{}'); } catch (e) {}
    main.innerHTML = '<h1>Marketing</h1><div class="card"><h3 style="margin-top:0">Coupons</h3>' +
      '<p class="muted">Coupon codes database ki <code>coupons</code> table se server-side verify hote hain (checkout par discount backend khud lagata hai). Naya coupon SQL se add karein, masalan:<br><code>INSERT INTO coupons(code, discount_type, discount_value, min_order_amount, is_active) VALUES (\'WELCOME10\', \'percent\', 10, 1000, true);</code></p>' +
      '<h3>Homepage Banner</h3><label>Banner Text</label><input id="mkBanner" value="' + esc(saved.banner || '') + '" placeholder="e.g. Sale — up to 30% OFF">' +
      '<label>Featured Category (slug)</label><input id="mkFeatured" value="' + esc(saved.featured || '') + '" placeholder="e.g. fashion-clothing">' +
      '<p class="form-error" id="mkMsg"></p><button class="btn btn-primary" id="mkSave">Save (is browser mein)</button>' +
      '<p class="muted small">Note: Ye values abhi sirf is browser mein save hoti hain — sab customers ko dikhane ke liye banner/featured ko database (banners table / product is_featured) mein set karein ya developer se store settings mein add karwayein.</p></div>';
    document.getElementById('mkSave').addEventListener('click', function () {
      localStorage.setItem('amc-marketing', JSON.stringify({ banner: document.getElementById('mkBanner').value, featured: document.getElementById('mkFeatured').value }));
      document.getElementById('mkMsg').textContent = ''; AMC.toast('Save ho gaya (local)');
    });
  }
  function pageReports() {
    setNav('reports');
    main.innerHTML = '<h1>Reports</h1><div id="repWrap"><div class="empty">Loading…</div></div>';
    loadOrders('').then(function (orders) {
      var valid = orders.filter(function (o) { return String(o.order_status).toUpperCase() !== 'CANCELLED'; });
      var sales = valid.reduce(function (s, o) { return s + Number(o.grand_total || 0); }, 0);
      var byMethod = {};
      valid.forEach(function (o) { byMethod[o.payment_method] = (byMethod[o.payment_method] || 0) + Number(o.grand_total || 0); });
      var byStatus = {};
      orders.forEach(function (o) { byStatus[o.order_status] = (byStatus[o.order_status] || 0) + 1; });
      document.getElementById('repWrap').innerHTML =
        '<div class="stat-grid"><div class="stat"><div class="stat-num">' + orders.length + '</div><div class="stat-label">Total Orders (recent 30)</div></div>' +
        '<div class="stat"><div class="stat-num">' + rs(sales) + '</div><div class="stat-label">Sales (non-cancelled)</div></div></div>' +
        '<div class="card" style="margin-bottom:14px"><h3 style="margin-top:0">Sales by Payment Method</h3>' + Object.keys(byMethod).map(function (k) { return '<div class="summary-line"><span>' + esc(k) + '</span><strong>' + rs(byMethod[k]) + '</strong></div>'; }).join('') + '</div>' +
        '<div class="card"><h3 style="margin-top:0">Orders by Status</h3>' + Object.keys(byStatus).map(function (k) { return '<div class="summary-line"><span>' + esc(label(k)) + '</span><strong>' + byStatus[k] + '</strong></div>'; }).join('') +
        '<p class="muted small">Estimated profit ke liye har product par Cost Price lazmi bharein (Products → Edit). Profit = (Sale Price − Cost Price) × Quantity, jo database ke products.cost_price aur order_items se calculate hota hai.</p></div>';
    }).catch(function (e) { document.getElementById('repWrap').innerHTML = '<div class="empty">' + esc(e.message) + '</div>'; });
  }
  function pageSettings() {
    setNav('settings');
    main.innerHTML = '<h1>Settings</h1><div class="card"><h3 style="margin-top:0">Delivery Rates &amp; Store</h3>' +
      '<table class="table"><tr><th>Default Delivery Fee</th><td>Rs. 200 (server .env: DELIVERY_BASE)</td></tr>' +
      '<tr><th>Free Delivery</th><td>Rs. 5,000+ ke order par (DELIVERY_FREE_ABOVE)</td></tr>' +
      '<tr><th>Remote Province Surcharge</th><td>+ Rs. 100 — Balochistan, Gilgit-Baltistan (server.js DELIVERY)</td></tr>' +
      '<tr><th>Store City</th><td>Bahawalnagar (STORE_CITY) — same city Rs. 3,000+ par Rs. 150</td></tr>' +
      '<tr><th>Payment Number</th><td>Easypaisa / JazzCash / NayaPay — ' + AMC.PAYMENT_NUMBER + ' (STORE_PAYMENT_NUMBER)</td></tr></table>' +
      '<p class="muted">Ye values change karne ke liye hosting par <code>.env</code> file edit karke server restart karein. City-wise alag rates database ki <code>delivery_rates</code> table mein bhi diye ja sakte hain.</p>' +
      '<h3>Categories</h3><div id="setCats">Loading…</div>' +
      '<h3>Policies</h3><p class="muted">Shipping / Return / Privacy / Terms ka text storefront code (<code>public/js/store.js</code> → POLICIES) mein hai — edit karke dobara deploy karein.</p></div>' +
      '<div class="card" style="margin-top:14px"><h3 style="margin-top:0">About Page Picture</h3>' +
      '<p class="muted">Ye picture customer wali <strong>About Us</strong> page ke <strong>top</strong> par dikhti hai. Picture set na ho to About page par sirf text dikhta hai — koi broken image NAHI ati. Upload sirf admin login se hota hai.</p>' +
      '<div id="aboutPicCurrent"><p class="muted small">Loading current picture…</p></div>' +
      '<label>Picture select karein (JPG / PNG / WebP / GIF, max 5MB)</label>' +
      '<input type="file" id="aboutPicFile" accept="image/jpeg,image/png,image/webp,image/gif">' +
      '<div class="action-row"><button class="btn btn-primary" id="aboutPicUpload">Upload / Change Picture</button>' +
      '<button class="btn" id="aboutPicRemove" style="color:var(--red)">Remove Picture</button></div>' +
      '<p class="form-error" id="aboutPicMsg"></p></div>';
    api.get('/api/categories').then(function (d) {
      document.getElementById('setCats').innerHTML = '<table class="table">' + (d.categories || []).map(function (c) { return '<tr><td>' + (c.parent_id ? '— ' : '<strong>') + esc(c.name) + (c.parent_id ? '' : '</strong>') + '</td><td>' + esc(c.slug) + '</td><td>' + (c.is_active ? 'Active' : 'Inactive') + '</td></tr>'; }).join('') + '</table>';
    }).catch(function (e) { document.getElementById('setCats').textContent = e.message; });
    // --- About Page Picture: current halat, upload/change, remove ---
    function renderAboutPic(url) {
      var w = document.getElementById('aboutPicCurrent'); if (!w) return;
      w.innerHTML = url
        ? '<img src="' + esc(url) + '" alt="About page picture" style="display:block;width:100%;max-height:260px;object-fit:cover;border-radius:10px;border:1px solid var(--border);margin-bottom:8px"><p class="muted small">Current picture: <code>' + esc(url) + '</code> — About Us page ke top par yehi dikh rahi hai.</p>'
        : '<p class="muted small">Abhi koi picture set NAHI hai — About Us page par sirf text dikhta hai.</p>';
    }
    api.get('/api/pages/about').then(function (d) { renderAboutPic(d && d.pictureUrl); }).catch(function () { renderAboutPic(null); });
    document.getElementById('aboutPicUpload').addEventListener('click', function () {
      var msg = document.getElementById('aboutPicMsg'); msg.textContent = '';
      var input = document.getElementById('aboutPicFile');
      var file = input && input.files && input.files[0];
      if (!file) { msg.textContent = 'Pehle picture file select karein.'; return; }
      if (file.size > 5 * 1024 * 1024) { msg.textContent = 'Picture 5MB se bari hai — chhoti file select karein.'; return; }
      fetch('/api/admin/about-picture', { method: 'POST', headers: { 'Authorization': 'Bearer ' + (AMC.getAdminToken() || ''), 'Content-Type': file.type }, body: file })
        .then(function (res) { return res.json().then(function (d) { if (!res.ok) throw new Error(d.error || 'Upload fail ho gaya'); return d; }); })
        .then(function (d) { renderAboutPic(d.pictureUrl); AMC.toast('About page picture save ho gayi ✅'); })
        .catch(function (e) { msg.textContent = e.message; });
    });
    document.getElementById('aboutPicRemove').addEventListener('click', function () {
      var msg = document.getElementById('aboutPicMsg'); msg.textContent = '';
      if (!confirm('About page ki picture remove karein? Page par phir sirf text dikhega.')) return;
      api.del('/api/admin/about-picture').then(function () { renderAboutPic(null); AMC.toast('About page picture remove ho gayi'); }).catch(function (e) { msg.textContent = e.message; });
    });
  }

  /* ---------- ROUTER ---------- */
  function route() {
    var hash = location.hash.replace(/^#/, '') || 'overview';
    if (hash === 'overview') pageOverview();
    else if (hash === 'products') pageProducts();
    else if (hash === 'inventory') pageInventory();
    else if (hash === 'orders') pageOrders();
    else if (hash.indexOf('order/') === 0) pageOrderDetails(decodeURIComponent(hash.slice('order/'.length)));
    else if (hash === 'customers') pageCustomers();
    else if (hash === 'complaints') pageComplaints();
    else if (hash === 'payments') pagePayments();
    else if (hash === 'reviews') pageReviews();
    else if (hash === 'marketing') pageMarketing();
    else if (hash === 'reports') pageReports();
    else if (hash === 'settings') pageSettings();
    else pageOverview();
  }
  window.addEventListener('hashchange', route);
  if (AMC.getAdminToken()) { showLogin(false); route(); } else { showLogin(true); }
})();
