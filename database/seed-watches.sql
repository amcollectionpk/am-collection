-- ============================================================================
-- AM Collection — Watch Catalog Seed (79 watches)
-- Run AFTER database/schema.sql:  psql "$DATABASE_URL" -f database/seed-watches.sql
-- (Render par ye file scripts/init-db.js se build ke waqt khud chal jati hai.)
-- Idempotent: safe to run more than once (existing slugs are skipped).
-- Schema-matched: products.stock_qty + products.image_url seedha products
-- table mein jate hain (server.js yehi columns parhta/likhta hai), aur har
-- product ki photo product_images mein bhi record hoti hai.
-- Photos are served by the website itself from public/assets/watches/.
-- ============================================================================
BEGIN;

INSERT INTO categories (name, slug, description, image_url, sort_order) VALUES
    ('Men''s Watches', 'mens-watches', 'Watches at AM Collection — Men''s Watches.', '/assets/watches/watch-01.jpg', 1)
ON CONFLICT (slug) DO UPDATE SET image_url = EXCLUDED.image_url, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

INSERT INTO categories (name, slug, description, image_url, sort_order) VALUES
    ('Women''s Watches', 'womens-watches', 'Watches at AM Collection — Women''s Watches.', '/assets/watches/watch-28.jpg', 2)
ON CONFLICT (slug) DO UPDATE SET image_url = EXCLUDED.image_url, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

INSERT INTO categories (name, slug, description, image_url, sort_order) VALUES
    ('Smartwatches', 'smartwatches', 'Watches at AM Collection — Smartwatches.', '/assets/watches/watch-59.jpg', 3)
ON CONFLICT (slug) DO UPDATE SET image_url = EXCLUDED.image_url, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rolex Datejust Blue Dial — Silver', 'rolex-datejust-blue-dial-silver', 'AM-W01', 'Rolex Datejust Blue Dial — Silver — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3700, 2950, '/assets/watches/watch-01.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-01.jpg', 'Rolex Datejust Blue Dial — Silver', 0, true FROM products WHERE slug = 'rolex-datejust-blue-dial-silver'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-01.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rolex Datejust Green Dial — Two-Tone', 'rolex-datejust-green-dial-two-tone', 'AM-W02', 'Rolex Datejust Green Dial — Two-Tone — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3700, 2950, '/assets/watches/watch-02.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-02.jpg', 'Rolex Datejust Green Dial — Two-Tone', 0, true FROM products WHERE slug = 'rolex-datejust-green-dial-two-tone'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-02.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rolex Datejust Black Dial — Two-Tone Gold', 'rolex-datejust-black-dial-two-tone-gold', 'AM-W03', 'Rolex Datejust Black Dial — Two-Tone Gold — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3700, 2950, '/assets/watches/watch-03.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-03.jpg', 'Rolex Datejust Black Dial — Two-Tone Gold', 0, true FROM products WHERE slug = 'rolex-datejust-black-dial-two-tone-gold'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-03.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rolex Datejust Mother of Pearl — Diamond Bezel', 'rolex-datejust-mother-of-pearl-diamond-bezel', 'AM-W04', 'Rolex Datejust Mother of Pearl — Diamond Bezel — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 4350, 3250, '/assets/watches/watch-04.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-04.jpg', 'Rolex Datejust Mother of Pearl — Diamond Bezel', 0, true FROM products WHERE slug = 'rolex-datejust-mother-of-pearl-diamond-bezel'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-04.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rolex Datejust Rainbow Diamond Dial', 'rolex-datejust-rainbow-diamond-dial', 'AM-W05', 'Rolex Datejust Rainbow Diamond Dial — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 4600, 3450, '/assets/watches/watch-05.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-05.jpg', 'Rolex Datejust Rainbow Diamond Dial', 0, true FROM products WHERE slug = 'rolex-datejust-rainbow-diamond-dial'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-05.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Casio Quartz Spiky Black', 'casio-quartz-spiky-black', 'AM-W06', 'Casio Quartz Spiky Black — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3450, 2750, '/assets/watches/watch-06.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-06.jpg', 'Casio Quartz Spiky Black', 0, true FROM products WHERE slug = 'casio-quartz-spiky-black'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-06.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'D1 Milano Black', 'd1-milano-black', 'AM-W07', 'D1 Milano Black — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 2450, 1950, '/assets/watches/watch-07.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-07.jpg', 'D1 Milano Black', 0, true FROM products WHERE slug = 'd1-milano-black'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-07.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Hublot Classic Fusion Gold — Grey Strap', 'hublot-classic-fusion-gold-grey-strap', 'AM-W08', 'Hublot Classic Fusion Gold — Grey Strap — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 4200, 3150, '/assets/watches/watch-08.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-08.jpg', 'Hublot Classic Fusion Gold — Grey Strap', 0, true FROM products WHERE slug = 'hublot-classic-fusion-gold-grey-strap'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-08.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rolex Datejust Green Dial — Silver', 'rolex-datejust-green-dial-silver', 'AM-W09', 'Rolex Datejust Green Dial — Silver — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3700, 2950, '/assets/watches/watch-09.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-09.jpg', 'Rolex Datejust Green Dial — Silver', 0, true FROM products WHERE slug = 'rolex-datejust-green-dial-silver'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-09.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Titan Edge Ceramic Blue', 'titan-edge-ceramic-blue', 'AM-W10', 'Titan Edge Ceramic Blue — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3550, 2850, '/assets/watches/watch-10.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-10.jpg', 'Titan Edge Ceramic Blue', 0, true FROM products WHERE slug = 'titan-edge-ceramic-blue'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-10.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rolex Datejust Ice Blue Honeycomb Dial', 'rolex-datejust-ice-blue-honeycomb-dial', 'AM-W11', 'Rolex Datejust Ice Blue Honeycomb Dial — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 4200, 3150, '/assets/watches/watch-11.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-11.jpg', 'Rolex Datejust Ice Blue Honeycomb Dial', 0, true FROM products WHERE slug = 'rolex-datejust-ice-blue-honeycomb-dial'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-11.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Poedagar Green Dial', 'poedagar-green-dial', 'AM-W12', 'Poedagar Green Dial — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 4350, 3250, '/assets/watches/watch-12.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-12.jpg', 'Poedagar Green Dial', 0, true FROM products WHERE slug = 'poedagar-green-dial'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-12.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Hublot Big Bang Black Skeleton', 'hublot-big-bang-black-skeleton', 'AM-W13', 'Hublot Big Bang Black Skeleton — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 4200, 3150, '/assets/watches/watch-13.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-13.jpg', 'Hublot Big Bang Black Skeleton', 0, true FROM products WHERE slug = 'hublot-big-bang-black-skeleton'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-13.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Omega Seamaster Gold — Brown Leather Strap', 'omega-seamaster-gold-brown-leather-strap', 'AM-W14', 'Omega Seamaster Gold — Brown Leather Strap — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 5050, 3550, '/assets/watches/watch-14.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-14.jpg', 'Omega Seamaster Gold — Brown Leather Strap', 0, true FROM products WHERE slug = 'omega-seamaster-gold-brown-leather-strap'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-14.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Richard Mille Red Strap', 'richard-mille-red-strap', 'AM-W15', 'Richard Mille Red Strap — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 5650, 3950, '/assets/watches/watch-15.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-15.jpg', 'Richard Mille Red Strap', 0, true FROM products WHERE slug = 'richard-mille-red-strap'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-15.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Richard Mille Black & Gold', 'richard-mille-black-and-gold', 'AM-W16', 'Richard Mille Black & Gold — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 5650, 3950, '/assets/watches/watch-16.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-16.jpg', 'Richard Mille Black & Gold', 0, true FROM products WHERE slug = 'richard-mille-black-and-gold'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-16.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Richard Mille Red — Diamond Bezel', 'richard-mille-red-diamond-bezel', 'AM-W17', 'Richard Mille Red — Diamond Bezel — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 5650, 3950, '/assets/watches/watch-17.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-17.jpg', 'Richard Mille Red — Diamond Bezel', 0, true FROM products WHERE slug = 'richard-mille-red-diamond-bezel'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-17.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Richard Mille Green Strap — Diamond Bezel', 'richard-mille-green-strap-diamond-bezel', 'AM-W18', 'Richard Mille Green Strap — Diamond Bezel — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 5650, 3950, '/assets/watches/watch-18.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-18.jpg', 'Richard Mille Green Strap — Diamond Bezel', 0, true FROM products WHERE slug = 'richard-mille-green-strap-diamond-bezel'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-18.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Richard Mille Green Strap — Rose Gold', 'richard-mille-green-strap-rose-gold', 'AM-W19', 'Richard Mille Green Strap — Rose Gold — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 5650, 3950, '/assets/watches/watch-19.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-19.jpg', 'Richard Mille Green Strap — Rose Gold', 0, true FROM products WHERE slug = 'richard-mille-green-strap-rose-gold'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-19.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Richard Mille Black', 'richard-mille-black', 'AM-W20', 'Richard Mille Black — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 5650, 3950, '/assets/watches/watch-20.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-20.jpg', 'Richard Mille Black', 0, true FROM products WHERE slug = 'richard-mille-black'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-20.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Richard Mille McLaren — Blue Strap', 'richard-mille-mclaren-blue-strap', 'AM-W21', 'Richard Mille McLaren — Blue Strap — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 5650, 3950, '/assets/watches/watch-21.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-21.jpg', 'Richard Mille McLaren — Blue Strap', 0, true FROM products WHERE slug = 'richard-mille-mclaren-blue-strap'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-21.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Richard Mille White Strap', 'richard-mille-white-strap', 'AM-W22', 'Richard Mille White Strap — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 5650, 3950, '/assets/watches/watch-22.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-22.jpg', 'Richard Mille White Strap', 0, true FROM products WHERE slug = 'richard-mille-white-strap'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-22.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Franck Muller Yachting — Blue Dial', 'franck-muller-yachting-blue-dial', 'AM-W23', 'Franck Muller Yachting — Blue Dial — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 5650, 3950, '/assets/watches/watch-23.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-23.jpg', 'Franck Muller Yachting — Blue Dial', 0, true FROM products WHERE slug = 'franck-muller-yachting-blue-dial'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-23.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rolex Oyster Perpetual Date Blue — Watch + Bracelet Set', 'rolex-oyster-perpetual-date-blue-watch-bracelet-set', 'AM-W24', 'Rolex Oyster Perpetual Date Blue — Watch + Bracelet Set — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 5100, 3560, '/assets/watches/watch-24.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-24.jpg', 'Rolex Oyster Perpetual Date Blue — Watch + Bracelet Set', 0, true FROM products WHERE slug = 'rolex-oyster-perpetual-date-blue-watch-bracelet-set'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-24.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rolex Datejust Blue Dial — Watch + Bracelet Set', 'rolex-datejust-blue-dial-watch-bracelet-set', 'AM-W25', 'Rolex Datejust Blue Dial — Watch + Bracelet Set — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 5100, 3560, '/assets/watches/watch-25.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-25.jpg', 'Rolex Datejust Blue Dial — Watch + Bracelet Set', 0, true FROM products WHERE slug = 'rolex-datejust-blue-dial-watch-bracelet-set'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-25.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Patek Philippe Nautilus Blue — Denim Strap', 'patek-philippe-nautilus-blue-denim-strap', 'AM-W26', 'Patek Philippe Nautilus Blue — Denim Strap — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 4350, 3250, '/assets/watches/watch-26.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-26.jpg', 'Patek Philippe Nautilus Blue — Denim Strap', 0, true FROM products WHERE slug = 'patek-philippe-nautilus-blue-denim-strap'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-26.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Jacob & Co The Godfather', 'jacob-and-co-the-godfather', 'AM-W27', 'Jacob & Co The Godfather — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 8550, 5550, '/assets/watches/watch-27.jpg', 20, true, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-27.jpg', 'Jacob & Co The Godfather', 0, true FROM products WHERE slug = 'jacob-and-co-the-godfather'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-27.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Michael Kors Rose Gold — Pink Dial', 'michael-kors-rose-gold-pink-dial', 'AM-W28', 'Michael Kors Rose Gold — Pink Dial — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3200, 2550, '/assets/watches/watch-28.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-28.jpg', 'Michael Kors Rose Gold — Pink Dial', 0, true FROM products WHERE slug = 'michael-kors-rose-gold-pink-dial'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-28.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rose Gold Roman Numerals — Diamond Bezel', 'rose-gold-roman-numerals-diamond-bezel', 'AM-W29', 'Rose Gold Roman Numerals — Diamond Bezel — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3200, 2550, '/assets/watches/watch-29.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-29.jpg', 'Rose Gold Roman Numerals — Diamond Bezel', 0, true FROM products WHERE slug = 'rose-gold-roman-numerals-diamond-bezel'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-29.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Bvlgari Serpenti Gold — Black Dial', 'bvlgari-serpenti-gold-black-dial', 'AM-W30', 'Bvlgari Serpenti Gold — Black Dial — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3200, 2550, '/assets/watches/watch-30.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-30.jpg', 'Bvlgari Serpenti Gold — Black Dial', 0, true FROM products WHERE slug = 'bvlgari-serpenti-gold-black-dial'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-30.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'BS Gold & Silver — White Dial, Diamond Bezel', 'bs-gold-and-silver-white-dial-diamond-bezel', 'AM-W31', 'BS Gold & Silver — White Dial, Diamond Bezel — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3200, 2550, '/assets/watches/watch-31.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-31.jpg', 'BS Gold & Silver — White Dial, Diamond Bezel', 0, true FROM products WHERE slug = 'bs-gold-and-silver-white-dial-diamond-bezel'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-31.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Citizen Eco-Drive — Pink Dial', 'citizen-eco-drive-pink-dial', 'AM-W32', 'Citizen Eco-Drive — Pink Dial — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3200, 2550, '/assets/watches/watch-32.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-32.jpg', 'Citizen Eco-Drive — Pink Dial', 0, true FROM products WHERE slug = 'citizen-eco-drive-pink-dial'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-32.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Oval Watch + Knot Bangle Set — Limited Edition', 'oval-watch-knot-bangle-set-limited-edition', 'AM-W33', 'Oval Watch + Knot Bangle Set — Limited Edition — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3350, 2670, '/assets/watches/watch-33.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-33.jpg', 'Oval Watch + Knot Bangle Set — Limited Edition', 0, true FROM products WHERE slug = 'oval-watch-knot-bangle-set-limited-edition'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-33.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Fossil Black — Watch + Bracelet & Ring Set', 'fossil-black-watch-bracelet-and-ring-set', 'AM-W34', 'Fossil Black — Watch + Bracelet & Ring Set — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3350, 2670, '/assets/watches/watch-34.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-34.jpg', 'Fossil Black — Watch + Bracelet & Ring Set', 0, true FROM products WHERE slug = 'fossil-black-watch-bracelet-and-ring-set'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-34.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Bvlgari Serpenti Gold — White Dial', 'bvlgari-serpenti-gold-white-dial', 'AM-W35', 'Bvlgari Serpenti Gold — White Dial — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3350, 2670, '/assets/watches/watch-35.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-35.jpg', 'Bvlgari Serpenti Gold — White Dial', 0, true FROM products WHERE slug = 'bvlgari-serpenti-gold-white-dial'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-35.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rolex Datejust Pink Dial — Two-Tone + Pink Clover Bracelet Set', 'rolex-datejust-pink-dial-two-tone-pink-clover-bracelet-set', 'AM-W36', 'Rolex Datejust Pink Dial — Two-Tone + Pink Clover Bracelet Set — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3350, 2670, '/assets/watches/watch-36.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-36.jpg', 'Rolex Datejust Pink Dial — Two-Tone + Pink Clover Bracelet Set', 0, true FROM products WHERE slug = 'rolex-datejust-pink-dial-two-tone-pink-clover-bracelet-set'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-36.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'URAB Pink Crystal', 'urab-pink-crystal', 'AM-W37', 'URAB Pink Crystal — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3350, 2670, '/assets/watches/watch-37.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-37.jpg', 'URAB Pink Crystal', 0, true FROM products WHERE slug = 'urab-pink-crystal'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-37.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Green Crystal Bracelet Watch', 'green-crystal-bracelet-watch', 'AM-W38', 'Green Crystal Bracelet Watch — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3350, 2670, '/assets/watches/watch-38.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-38.jpg', 'Green Crystal Bracelet Watch', 0, true FROM products WHERE slug = 'green-crystal-bracelet-watch'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-38.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rolex Datejust Green Dial — Watch + Green Clover Bracelet Set', 'rolex-datejust-green-dial-watch-green-clover-bracelet-set', 'AM-W39', 'Rolex Datejust Green Dial — Watch + Green Clover Bracelet Set — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3350, 2670, '/assets/watches/watch-39.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-39.jpg', 'Rolex Datejust Green Dial — Watch + Green Clover Bracelet Set', 0, true FROM products WHERE slug = 'rolex-datejust-green-dial-watch-green-clover-bracelet-set'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-39.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Diamond Pavé Watch + Bracelets', 'diamond-pav-watch-bracelets', 'AM-W40', 'Diamond Pavé Watch + Bracelets — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3350, 2670, '/assets/watches/watch-40.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-40.jpg', 'Diamond Pavé Watch + Bracelets', 0, true FROM products WHERE slug = 'diamond-pav-watch-bracelets'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-40.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Chanel Premiere Black & Gold', 'chanel-premiere-black-and-gold', 'AM-W41', 'Chanel Premiere Black & Gold — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3350, 2670, '/assets/watches/watch-41.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-41.jpg', 'Chanel Premiere Black & Gold', 0, true FROM products WHERE slug = 'chanel-premiere-black-and-gold'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-41.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Michael Kors Rose Gold — Champagne Dial', 'michael-kors-rose-gold-champagne-dial', 'AM-W42', 'Michael Kors Rose Gold — Champagne Dial — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 2950, 2350, '/assets/watches/watch-42.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-42.jpg', 'Michael Kors Rose Gold — Champagne Dial', 0, true FROM products WHERE slug = 'michael-kors-rose-gold-champagne-dial'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-42.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Cartier Baignoire Gold — White Dial', 'cartier-baignoire-gold-white-dial', 'AM-W43', 'Cartier Baignoire Gold — White Dial — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 2950, 2350, '/assets/watches/watch-43.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-43.jpg', 'Cartier Baignoire Gold — White Dial', 0, true FROM products WHERE slug = 'cartier-baignoire-gold-white-dial'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-43.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rolex Datejust Gold — Diamond Bezel (on wrist)', 'rolex-datejust-gold-diamond-bezel-on-wrist', 'AM-W44', 'Rolex Datejust Gold — Diamond Bezel (on wrist) — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 2950, 2350, '/assets/watches/watch-44.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-44.jpg', 'Rolex Datejust Gold — Diamond Bezel (on wrist)', 0, true FROM products WHERE slug = 'rolex-datejust-gold-diamond-bezel-on-wrist'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-44.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'YSL Beauté Square — Diamond Heart-Link Bracelet', 'ysl-beaut-square-diamond-heart-link-bracelet', 'AM-W45', 'YSL Beauté Square — Diamond Heart-Link Bracelet — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 2950, 2350, '/assets/watches/watch-45.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-45.jpg', 'YSL Beauté Square — Diamond Heart-Link Bracelet', 0, true FROM products WHERE slug = 'ysl-beaut-square-diamond-heart-link-bracelet'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-45.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Chopard Happy Diamonds Gold — Black Leather Strap', 'chopard-happy-diamonds-gold-black-leather-strap', 'AM-W46', 'Chopard Happy Diamonds Gold — Black Leather Strap — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 2950, 2350, '/assets/watches/watch-46.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-46.jpg', 'Chopard Happy Diamonds Gold — Black Leather Strap', 0, true FROM products WHERE slug = 'chopard-happy-diamonds-gold-black-leather-strap'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-46.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Olivia Burton London Rose Gold — Mesh Strap', 'olivia-burton-london-rose-gold-mesh-strap', 'AM-W47', 'Olivia Burton London Rose Gold — Mesh Strap — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 2950, 2350, '/assets/watches/watch-47.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-47.jpg', 'Olivia Burton London Rose Gold — Mesh Strap', 0, true FROM products WHERE slug = 'olivia-burton-london-rose-gold-mesh-strap'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-47.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Butterfly Crystal Watch + Heart Bracelet Set — Rose Gold', 'butterfly-crystal-watch-heart-bracelet-set-rose-gold', 'AM-W48', 'Butterfly Crystal Watch + Heart Bracelet Set — Rose Gold — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 2950, 2350, '/assets/watches/watch-48.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-48.jpg', 'Butterfly Crystal Watch + Heart Bracelet Set — Rose Gold', 0, true FROM products WHERE slug = 'butterfly-crystal-watch-heart-bracelet-set-rose-gold'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-48.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rose Gold Square — Minimal Dial', 'rose-gold-square-minimal-dial', 'AM-W49', 'Rose Gold Square — Minimal Dial — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 2950, 2350, '/assets/watches/watch-49.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-49.jpg', 'Rose Gold Square — Minimal Dial', 0, true FROM products WHERE slug = 'rose-gold-square-minimal-dial'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-49.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Casio Rose Gold Digital — Gift Box', 'casio-rose-gold-digital-gift-box', 'AM-W50', 'Casio Rose Gold Digital — Gift Box — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 2950, 2350, '/assets/watches/watch-50.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-50.jpg', 'Casio Rose Gold Digital — Gift Box', 0, true FROM products WHERE slug = 'casio-rose-gold-digital-gift-box'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-50.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rosefield Gold Rectangular — Women''s Watch', 'rosefield-gold-rectangular-women-s-watch', 'AM-W51', 'Rosefield Gold Rectangular — Women''s Watch — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 2450, 1950, '/assets/watches/watch-51.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-51.jpg', 'Rosefield Gold Rectangular — Women''s Watch', 0, true FROM products WHERE slug = 'rosefield-gold-rectangular-women-s-watch'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-51.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Smartwatch Orange Strap — Horizon Box', 'smartwatch-orange-strap-horizon-box', 'AM-W52', 'Smartwatch Orange Strap — Horizon Box — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 5300, 3699, '/assets/watches/watch-52.jpg', 20, false, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-52.jpg', 'Smartwatch Orange Strap — Horizon Box', 0, true FROM products WHERE slug = 'smartwatch-orange-strap-horizon-box'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-52.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Samsung Galaxy Watch Black', 'samsung-galaxy-watch-black', 'AM-W53', 'Samsung Galaxy Watch Black — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 5300, 3699, '/assets/watches/watch-53.jpg', 20, false, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-53.jpg', 'Samsung Galaxy Watch Black', 0, true FROM products WHERE slug = 'samsung-galaxy-watch-black'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-53.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Apple Watch Silver — Metal Strap', 'apple-watch-silver-metal-strap', 'AM-W54', 'Apple Watch Silver — Metal Strap — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 5300, 3699, '/assets/watches/watch-54.jpg', 20, false, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-54.jpg', 'Apple Watch Silver — Metal Strap', 0, true FROM products WHERE slug = 'apple-watch-silver-metal-strap'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-54.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Smartwatch Black — World Time Face', 'smartwatch-black-world-time-face', 'AM-W55', 'Smartwatch Black — World Time Face — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 5300, 3699, '/assets/watches/watch-55.jpg', 20, false, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-55.jpg', 'Smartwatch Black — World Time Face', 0, true FROM products WHERE slug = 'smartwatch-black-world-time-face'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-55.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Apple Watch White Strap', 'apple-watch-white-strap', 'AM-W56', 'Apple Watch White Strap — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 5300, 3699, '/assets/watches/watch-56.jpg', 20, false, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-56.jpg', 'Apple Watch White Strap', 0, true FROM products WHERE slug = 'apple-watch-white-strap'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-56.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Smartwatch Orange Strap + Box', 'smartwatch-orange-strap-box', 'AM-W57', 'Smartwatch Orange Strap + Box — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 5300, 3699, '/assets/watches/watch-57.jpg', 20, false, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-57.jpg', 'Smartwatch Orange Strap + Box', 0, true FROM products WHERE slug = 'smartwatch-orange-strap-box'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-57.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Apple Watch Ultra Titanium — Metal Strap', 'apple-watch-ultra-titanium-metal-strap', 'AM-W58', 'Apple Watch Ultra Titanium — Metal Strap — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 5300, 3699, '/assets/watches/watch-58.jpg', 20, false, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-58.jpg', 'Apple Watch Ultra Titanium — Metal Strap', 0, true FROM products WHERE slug = 'apple-watch-ultra-titanium-metal-strap'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-58.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Apple Watch Ultra Silver — Metal Strap', 'apple-watch-ultra-silver-metal-strap', 'AM-W59', 'Apple Watch Ultra Silver — Metal Strap — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 5300, 3699, '/assets/watches/watch-59.jpg', 20, false, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-59.jpg', 'Apple Watch Ultra Silver — Metal Strap', 0, true FROM products WHERE slug = 'apple-watch-ultra-silver-metal-strap'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-59.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Garmin Fenix 7 Pro Solar', 'garmin-fenix-7-pro-solar', 'AM-W60', 'Garmin Fenix 7 Pro Solar — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 5300, 3699, '/assets/watches/watch-60.jpg', 20, false, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-60.jpg', 'Garmin Fenix 7 Pro Solar', 0, true FROM products WHERE slug = 'garmin-fenix-7-pro-solar'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-60.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Apple Watch Grey Ocean Strap', 'apple-watch-grey-ocean-strap', 'AM-W61', 'Apple Watch Grey Ocean Strap — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 5300, 3699, '/assets/watches/watch-61.jpg', 20, false, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-61.jpg', 'Apple Watch Grey Ocean Strap', 0, true FROM products WHERE slug = 'apple-watch-grey-ocean-strap'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-61.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Apple Watch Black — Metal Strap', 'apple-watch-black-metal-strap', 'AM-W62', 'Apple Watch Black — Metal Strap — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 6000, 4199, '/assets/watches/watch-62.jpg', 20, true, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-62.jpg', 'Apple Watch Black — Metal Strap', 0, true FROM products WHERE slug = 'apple-watch-black-metal-strap'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-62.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Apple Watch Silver — Metal Strap (11:28)', 'apple-watch-silver-metal-strap-11-28', 'AM-W63', 'Apple Watch Silver — Metal Strap (11:28) — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 6000, 4199, '/assets/watches/watch-63.jpg', 20, true, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-63.jpg', 'Apple Watch Silver — Metal Strap (11:28)', 0, true FROM products WHERE slug = 'apple-watch-silver-metal-strap-11-28'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-63.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Casio G-Shock Black — Notification Display', 'casio-g-shock-black-notification-display', 'AM-W64', 'Casio G-Shock Black — Notification Display — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 6000, 4199, '/assets/watches/watch-64.jpg', 20, true, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-64.jpg', 'Casio G-Shock Black — Notification Display', 0, true FROM products WHERE slug = 'casio-g-shock-black-notification-display'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-64.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Smartwatch Rose Gold + Black Strap', 'smartwatch-rose-gold-black-strap', 'AM-W65', 'Smartwatch Rose Gold + Black Strap — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 6000, 4199, '/assets/watches/watch-65.jpg', 20, true, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-65.jpg', 'Smartwatch Rose Gold + Black Strap', 0, true FROM products WHERE slug = 'smartwatch-rose-gold-black-strap'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-65.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Smartwatch Ultra 7-in-1 Strap Box Set', 'smartwatch-ultra-7-in-1-strap-box-set', 'AM-W66', 'Smartwatch Ultra 7-in-1 Strap Box Set — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 6000, 4199, '/assets/watches/watch-66.jpg', 20, true, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-66.jpg', 'Smartwatch Ultra 7-in-1 Strap Box Set', 0, true FROM products WHERE slug = 'smartwatch-ultra-7-in-1-strap-box-set'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-66.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Smartwatch Round Black — In Hand', 'smartwatch-round-black-in-hand', 'AM-W67', 'Smartwatch Round Black — In Hand — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 6000, 4199, '/assets/watches/watch-67.jpg', 20, true, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-67.jpg', 'Smartwatch Round Black — In Hand', 0, true FROM products WHERE slug = 'smartwatch-round-black-in-hand'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-67.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, '4G SIM Smartwatch Orange Strap', '4g-sim-smartwatch-orange-strap', 'AM-W68', '4G SIM Smartwatch Orange Strap — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 6000, 4199, '/assets/watches/watch-68.jpg', 20, true, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-68.jpg', '4G SIM Smartwatch Orange Strap', 0, true FROM products WHERE slug = '4g-sim-smartwatch-orange-strap'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-68.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Apple Watch Black + Box', 'apple-watch-black-box', 'AM-W69', 'Apple Watch Black + Box — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 6000, 4199, '/assets/watches/watch-69.jpg', 20, false, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-69.jpg', 'Apple Watch Black + Box', 0, true FROM products WHERE slug = 'apple-watch-black-box'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-69.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Smartwatch Gold & Silver Metal — Fitness Face', 'smartwatch-gold-and-silver-metal-fitness-face', 'AM-W70', 'Smartwatch Gold & Silver Metal — Fitness Face — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 6000, 4199, '/assets/watches/watch-70.jpg', 20, false, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-70.jpg', 'Smartwatch Gold & Silver Metal — Fitness Face', 0, true FROM products WHERE slug = 'smartwatch-gold-and-silver-metal-fitness-face'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-70.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Smartwatch + Earbuds Combo — Black', 'smartwatch-earbuds-combo-black', 'AM-W71', 'Smartwatch + Earbuds Combo — Black — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 6000, 4199, '/assets/watches/watch-71.jpg', 20, false, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-71.jpg', 'Smartwatch + Earbuds Combo — Black', 0, true FROM products WHERE slug = 'smartwatch-earbuds-combo-black'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-71.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Apple Watch Milanese Loop', 'apple-watch-milanese-loop', 'AM-W72', 'Apple Watch Milanese Loop — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 4650, 3499, '/assets/watches/watch-72.jpg', 20, false, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-72.jpg', 'Apple Watch Milanese Loop', 0, true FROM products WHERE slug = 'apple-watch-milanese-loop'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-72.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Round Sport Smartwatch — App Icons Face', 'round-sport-smartwatch-app-icons-face', 'AM-W73', 'Round Sport Smartwatch — App Icons Face — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 4650, 3499, '/assets/watches/watch-73.jpg', 20, false, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-73.jpg', 'Round Sport Smartwatch — App Icons Face', 0, true FROM products WHERE slug = 'round-sport-smartwatch-app-icons-face'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-73.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Casio Gold Digital', 'casio-gold-digital', 'AM-W74', 'Casio Gold Digital — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 4650, 3499, '/assets/watches/watch-74.jpg', 20, false, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-74.jpg', 'Casio Gold Digital', 0, true FROM products WHERE slug = 'casio-gold-digital'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-74.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rugged Sport Smartwatch Black', 'rugged-sport-smartwatch-black', 'AM-W75', 'Rugged Sport Smartwatch Black — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 4650, 3499, '/assets/watches/watch-75.jpg', 20, false, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-75.jpg', 'Rugged Sport Smartwatch Black', 0, true FROM products WHERE slug = 'rugged-sport-smartwatch-black'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-75.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Amazfit Round Black', 'amazfit-round-black', 'AM-W76', 'Amazfit Round Black — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 4650, 3499, '/assets/watches/watch-76.jpg', 20, false, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-76.jpg', 'Amazfit Round Black', 0, true FROM products WHERE slug = 'amazfit-round-black'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-76.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Watch 4 Pro Round — Super AMOLED', 'watch-4-pro-round-super-amoled', 'AM-W77', 'Watch 4 Pro Round — Super AMOLED — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 4650, 3499, '/assets/watches/watch-77.jpg', 20, false, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-77.jpg', 'Watch 4 Pro Round — Super AMOLED', 0, true FROM products WHERE slug = 'watch-4-pro-round-super-amoled'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-77.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Apple Watch Steel Case — Metal Strap', 'apple-watch-steel-case-metal-strap', 'AM-W78', 'Apple Watch Steel Case — Metal Strap — a stylish wristwatch in the Smartwatches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 4650, 3499, '/assets/watches/watch-78.jpg', 20, false, true FROM categories WHERE slug = 'smartwatches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-78.jpg', 'Apple Watch Steel Case — Metal Strap', 0, true FROM products WHERE slug = 'apple-watch-steel-case-metal-strap'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-78.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, discount_price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rolex Datejust Gold — Watch + Bracelet Set', 'rolex-datejust-gold-watch-bracelet-set', 'AM-W79', 'Rolex Datejust Gold — Watch + Bracelet Set — a stylish wristwatch in the Women''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3200, 2550, '/assets/watches/watch-79.jpg', 20, false, true FROM categories WHERE slug = 'womens-watches'
ON CONFLICT (slug) DO UPDATE SET category_id = EXCLUDED.category_id, price = EXCLUDED.price, discount_price = EXCLUDED.discount_price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-79.jpg', 'Rolex Datejust Gold — Watch + Bracelet Set', 0, true FROM products WHERE slug = 'rolex-datejust-gold-watch-bracelet-set'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-79.jpg');

COMMIT;
