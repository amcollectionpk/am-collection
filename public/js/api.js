/* AM Collection — shared API client.
   Saari calls backend server.js ke asal routes par jati hain:
   GET  /api/categories            GET  /api/products?category&search&sort&page&limit
   GET  /api/products/:slug        POST /api/delivery/quote
   POST /api/orders  (header: Idempotency-Key)
   GET  /api/orders/track?orderNumber&phone
   POST /api/complaints            (public — customer complaint form)
   GET  /api/admin/complaints      (admin token lazmi)
   POST /api/admin/about-picture   DELETE /api/admin/about-picture (admin token lazmi)
   GET  /api/pages/about           (public — { pictureUrl } — na ho to null, sirf text)
   POST /api/auth/register         POST /api/auth/login
   POST /api/admin/login           (username + password, .env ADMIN_USER/ADMIN_PASSWORD -> admin token)
                                   NOTE: yehi endpoint storefront ke aam Login screen se bhi
                                   call hota hai — owner wahan admin username/password dale to
                                   admin token (amc-admin-token) save karke dashboard khud khul
                                   jata hai; #/admin ya /admin type karna NAHI padta. Customer
                                   login (/api/auth/login) bilkul alag hai — us ka token admin
                                   routes NAHI khol sakta.
   GET  /api/auth/me/orders        (Bearer token)
   GET  /api/admin/orders          GET  /api/admin/orders/:orderNumber
   PATCH /api/admin/orders/:orderNumber/status
   PATCH /api/admin/orders/:orderNumber/payment
   GET  /api/admin/dashboard
   POST /api/admin/products        PATCH /api/admin/products/:id
   GET  /api/products/:slug/reviews  (public — sirf APPROVED)
   POST /api/reviews | POST /api/products/:slug/reviews  (naya review = PENDING)
   GET  /api/admin/reviews  PATCH /api/admin/reviews/:id/approve|reject|status
   DELETE /api/admin/reviews/:id  (admin moderation)
*/
(function () {
  'use strict';
  var TOKEN_KEY = 'amc-token';
  var ADMIN_TOKEN_KEY = 'amc-admin-token'; // admin token customer token se ALAG — customer login se dashboard kabhi nahi khulta

  function getToken() { try { return localStorage.getItem(TOKEN_KEY); } catch (e) { return null; } }
  function setToken(t) { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch (e) {} }
  function getAdminToken() { try { return localStorage.getItem(ADMIN_TOKEN_KEY); } catch (e) { return null; } }
  function setAdminToken(t) { try { t ? localStorage.setItem(ADMIN_TOKEN_KEY, t) : localStorage.removeItem(ADMIN_TOKEN_KEY); } catch (e) {} }

  function request(method, url, body, extraHeaders) {
    var headers = { 'Content-Type': 'application/json' };
    // /api/admin/* calls par SIRF admin token jata hai; baaki calls par customer token.
    var token = (url.indexOf('/api/admin/') === 0 && url !== '/api/admin/login') ? getAdminToken() : getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    if (extraHeaders) Object.keys(extraHeaders).forEach(function (k) { headers[k] = extraHeaders[k]; });
    return fetch(url, {
      method: method,
      headers: headers,
      body: body ? JSON.stringify(body) : undefined
    }).then(function (res) {
      return res.text().then(function (text) {
        var data = {};
        try { data = text ? JSON.parse(text) : {}; } catch (e) { data = { error: text }; }
        if (!res.ok) {
          var err = new Error(data.error || ('Request failed (' + res.status + ')'));
          err.status = res.status; err.details = data.details || null; err.data = data;
          throw err;
        }
        return data;
      });
    });
  }

  window.AMC = {
    getToken: getToken,
    setToken: setToken,
    getAdminToken: getAdminToken,
    setAdminToken: setAdminToken,
    api: {
      get: function (url) { return request('GET', url); },
      post: function (url, body, headers) { return request('POST', url, body, headers); },
      patch: function (url, body) { return request('PATCH', url, body); },
      del: function (url) { return request('DELETE', url); },
      delete: function (url) { return request('DELETE', url); }
    },
    // Money hamesha "Rs. 2,000" format mein
    rs: function (n) { return 'Rs. ' + (Math.round(Number(n) || 0)).toLocaleString('en-PK'); },
    esc: function (s) {
      return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    },
    toast: function (msg) {
      var el = document.getElementById('toast');
      if (!el) return;
      el.textContent = msg; el.classList.add('show');
      setTimeout(function () { el.classList.remove('show'); }, 3200);
    },
    PAYMENT_NUMBER: '03147656328',
    WHATSAPP_LINK: 'https://wa.me/923147656328'
  };
})();
