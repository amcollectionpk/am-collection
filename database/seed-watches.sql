-- ============================================================================
-- AM Collection — Watch Catalog Seed (27 watches)
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
    ('Men''s Watches', 'mens-watches', 'Watches at AM Collection — Men''s Watches.', '/assets/watches/watch-06.jpg', 1)
ON CONFLICT (slug) DO UPDATE SET image_url = EXCLUDED.image_url, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

INSERT INTO categories (name, slug, description, image_url, sort_order) VALUES
    ('Luxury Watches', 'luxury-watches', 'Watches at AM Collection — Luxury Watches.', '/assets/watches/watch-27.jpg', 2)
ON CONFLICT (slug) DO UPDATE SET image_url = EXCLUDED.image_url, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

INSERT INTO categories (name, slug, description, image_url, sort_order) VALUES
    ('Sports Watches', 'sports-watches', 'Watches at AM Collection — Sports Watches.', '/assets/watches/watch-15.jpg', 3)
ON CONFLICT (slug) DO UPDATE SET image_url = EXCLUDED.image_url, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rolex Datejust Blue Dial — Silver', 'rolex-datejust-blue-dial-silver', 'AM-W01', 'Rolex Datejust Blue Dial — Silver — a stylish wristwatch in the Luxury Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 2950, '/assets/watches/watch-01.jpg', 20, false, true FROM categories WHERE slug = 'luxury-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-01.jpg', 'Rolex Datejust Blue Dial — Silver', 0, true FROM products WHERE slug = 'rolex-datejust-blue-dial-silver'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-01.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rolex Datejust Green Dial — Two-Tone', 'rolex-datejust-green-dial-two-tone', 'AM-W02', 'Rolex Datejust Green Dial — Two-Tone — a stylish wristwatch in the Luxury Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 2950, '/assets/watches/watch-02.jpg', 20, false, true FROM categories WHERE slug = 'luxury-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-02.jpg', 'Rolex Datejust Green Dial — Two-Tone', 0, true FROM products WHERE slug = 'rolex-datejust-green-dial-two-tone'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-02.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rolex Datejust Black Dial — Two-Tone Gold', 'rolex-datejust-black-dial-two-tone-gold', 'AM-W03', 'Rolex Datejust Black Dial — Two-Tone Gold — a stylish wristwatch in the Luxury Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 2950, '/assets/watches/watch-03.jpg', 20, false, true FROM categories WHERE slug = 'luxury-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-03.jpg', 'Rolex Datejust Black Dial — Two-Tone Gold', 0, true FROM products WHERE slug = 'rolex-datejust-black-dial-two-tone-gold'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-03.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rolex Datejust Mother of Pearl — Diamond Bezel', 'rolex-datejust-mother-of-pearl-diamond-bezel', 'AM-W04', 'Rolex Datejust Mother of Pearl — Diamond Bezel — a stylish wristwatch in the Luxury Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3250, '/assets/watches/watch-04.jpg', 20, true, true FROM categories WHERE slug = 'luxury-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-04.jpg', 'Rolex Datejust Mother of Pearl — Diamond Bezel', 0, true FROM products WHERE slug = 'rolex-datejust-mother-of-pearl-diamond-bezel'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-04.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rolex Datejust Rainbow Diamond Dial', 'rolex-datejust-rainbow-diamond-dial', 'AM-W05', 'Rolex Datejust Rainbow Diamond Dial — a stylish wristwatch in the Luxury Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3450, '/assets/watches/watch-05.jpg', 20, true, true FROM categories WHERE slug = 'luxury-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-05.jpg', 'Rolex Datejust Rainbow Diamond Dial', 0, true FROM products WHERE slug = 'rolex-datejust-rainbow-diamond-dial'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-05.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Casio Quartz Spiky Black', 'casio-quartz-spiky-black', 'AM-W06', 'Casio Quartz Spiky Black — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 2750, '/assets/watches/watch-06.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-06.jpg', 'Casio Quartz Spiky Black', 0, true FROM products WHERE slug = 'casio-quartz-spiky-black'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-06.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'D1 Milano Black', 'd1-milano-black', 'AM-W07', 'D1 Milano Black — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 1950, '/assets/watches/watch-07.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-07.jpg', 'D1 Milano Black', 0, true FROM products WHERE slug = 'd1-milano-black'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-07.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Hublot Classic Fusion Gold — Grey Strap', 'hublot-classic-fusion-gold-grey-strap', 'AM-W08', 'Hublot Classic Fusion Gold — Grey Strap — a stylish wristwatch in the Luxury Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3150, '/assets/watches/watch-08.jpg', 20, false, true FROM categories WHERE slug = 'luxury-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-08.jpg', 'Hublot Classic Fusion Gold — Grey Strap', 0, true FROM products WHERE slug = 'hublot-classic-fusion-gold-grey-strap'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-08.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rolex Datejust Green Dial — Silver', 'rolex-datejust-green-dial-silver', 'AM-W09', 'Rolex Datejust Green Dial — Silver — a stylish wristwatch in the Luxury Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 2950, '/assets/watches/watch-09.jpg', 20, false, true FROM categories WHERE slug = 'luxury-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-09.jpg', 'Rolex Datejust Green Dial — Silver', 0, true FROM products WHERE slug = 'rolex-datejust-green-dial-silver'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-09.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Titan Edge Ceramic Blue', 'titan-edge-ceramic-blue', 'AM-W10', 'Titan Edge Ceramic Blue — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 2850, '/assets/watches/watch-10.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-10.jpg', 'Titan Edge Ceramic Blue', 0, true FROM products WHERE slug = 'titan-edge-ceramic-blue'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-10.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rolex Datejust Ice Blue Honeycomb Dial', 'rolex-datejust-ice-blue-honeycomb-dial', 'AM-W11', 'Rolex Datejust Ice Blue Honeycomb Dial — a stylish wristwatch in the Luxury Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3150, '/assets/watches/watch-11.jpg', 20, false, true FROM categories WHERE slug = 'luxury-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-11.jpg', 'Rolex Datejust Ice Blue Honeycomb Dial', 0, true FROM products WHERE slug = 'rolex-datejust-ice-blue-honeycomb-dial'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-11.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Poedagar Green Dial', 'poedagar-green-dial', 'AM-W12', 'Poedagar Green Dial — a stylish wristwatch in the Men''s Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3250, '/assets/watches/watch-12.jpg', 20, false, true FROM categories WHERE slug = 'mens-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-12.jpg', 'Poedagar Green Dial', 0, true FROM products WHERE slug = 'poedagar-green-dial'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-12.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Hublot Big Bang Black Skeleton', 'hublot-big-bang-black-skeleton', 'AM-W13', 'Hublot Big Bang Black Skeleton — a stylish wristwatch in the Luxury Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3150, '/assets/watches/watch-13.jpg', 20, true, true FROM categories WHERE slug = 'luxury-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-13.jpg', 'Hublot Big Bang Black Skeleton', 0, true FROM products WHERE slug = 'hublot-big-bang-black-skeleton'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-13.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Omega Seamaster Gold — Brown Leather Strap', 'omega-seamaster-gold-brown-leather-strap', 'AM-W14', 'Omega Seamaster Gold — Brown Leather Strap — a stylish wristwatch in the Luxury Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3550, '/assets/watches/watch-14.jpg', 20, true, true FROM categories WHERE slug = 'luxury-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-14.jpg', 'Omega Seamaster Gold — Brown Leather Strap', 0, true FROM products WHERE slug = 'omega-seamaster-gold-brown-leather-strap'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-14.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Richard Mille Red Strap', 'richard-mille-red-strap', 'AM-W15', 'Richard Mille Red Strap — a stylish wristwatch in the Sports Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3950, '/assets/watches/watch-15.jpg', 20, true, true FROM categories WHERE slug = 'sports-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-15.jpg', 'Richard Mille Red Strap', 0, true FROM products WHERE slug = 'richard-mille-red-strap'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-15.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Richard Mille Black & Gold', 'richard-mille-black-and-gold', 'AM-W16', 'Richard Mille Black & Gold — a stylish wristwatch in the Sports Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3950, '/assets/watches/watch-16.jpg', 20, false, true FROM categories WHERE slug = 'sports-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-16.jpg', 'Richard Mille Black & Gold', 0, true FROM products WHERE slug = 'richard-mille-black-and-gold'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-16.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Richard Mille Red — Diamond Bezel', 'richard-mille-red-diamond-bezel', 'AM-W17', 'Richard Mille Red — Diamond Bezel — a stylish wristwatch in the Sports Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3950, '/assets/watches/watch-17.jpg', 20, false, true FROM categories WHERE slug = 'sports-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-17.jpg', 'Richard Mille Red — Diamond Bezel', 0, true FROM products WHERE slug = 'richard-mille-red-diamond-bezel'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-17.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Richard Mille Green Strap — Diamond Bezel', 'richard-mille-green-strap-diamond-bezel', 'AM-W18', 'Richard Mille Green Strap — Diamond Bezel — a stylish wristwatch in the Sports Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3950, '/assets/watches/watch-18.jpg', 20, false, true FROM categories WHERE slug = 'sports-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-18.jpg', 'Richard Mille Green Strap — Diamond Bezel', 0, true FROM products WHERE slug = 'richard-mille-green-strap-diamond-bezel'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-18.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Richard Mille Green Strap — Rose Gold', 'richard-mille-green-strap-rose-gold', 'AM-W19', 'Richard Mille Green Strap — Rose Gold — a stylish wristwatch in the Sports Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3950, '/assets/watches/watch-19.jpg', 20, false, true FROM categories WHERE slug = 'sports-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-19.jpg', 'Richard Mille Green Strap — Rose Gold', 0, true FROM products WHERE slug = 'richard-mille-green-strap-rose-gold'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-19.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Richard Mille Black', 'richard-mille-black', 'AM-W20', 'Richard Mille Black — a stylish wristwatch in the Sports Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3950, '/assets/watches/watch-20.jpg', 20, false, true FROM categories WHERE slug = 'sports-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-20.jpg', 'Richard Mille Black', 0, true FROM products WHERE slug = 'richard-mille-black'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-20.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Richard Mille McLaren — Blue Strap', 'richard-mille-mclaren-blue-strap', 'AM-W21', 'Richard Mille McLaren — Blue Strap — a stylish wristwatch in the Sports Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3950, '/assets/watches/watch-21.jpg', 20, true, true FROM categories WHERE slug = 'sports-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-21.jpg', 'Richard Mille McLaren — Blue Strap', 0, true FROM products WHERE slug = 'richard-mille-mclaren-blue-strap'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-21.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Richard Mille White Strap', 'richard-mille-white-strap', 'AM-W22', 'Richard Mille White Strap — a stylish wristwatch in the Sports Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3950, '/assets/watches/watch-22.jpg', 20, false, true FROM categories WHERE slug = 'sports-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-22.jpg', 'Richard Mille White Strap', 0, true FROM products WHERE slug = 'richard-mille-white-strap'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-22.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Franck Muller Yachting — Blue Dial', 'franck-muller-yachting-blue-dial', 'AM-W23', 'Franck Muller Yachting — Blue Dial — a stylish wristwatch in the Luxury Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3950, '/assets/watches/watch-23.jpg', 20, false, true FROM categories WHERE slug = 'luxury-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-23.jpg', 'Franck Muller Yachting — Blue Dial', 0, true FROM products WHERE slug = 'franck-muller-yachting-blue-dial'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-23.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rolex Oyster Perpetual Date Blue — Watch + Bracelet Set', 'rolex-oyster-perpetual-date-blue-watch-bracelet-set', 'AM-W24', 'Rolex Oyster Perpetual Date Blue — Watch + Bracelet Set — a stylish wristwatch in the Luxury Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3560, '/assets/watches/watch-24.jpg', 20, false, true FROM categories WHERE slug = 'luxury-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-24.jpg', 'Rolex Oyster Perpetual Date Blue — Watch + Bracelet Set', 0, true FROM products WHERE slug = 'rolex-oyster-perpetual-date-blue-watch-bracelet-set'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-24.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Rolex Datejust Blue Dial — Watch + Bracelet Set', 'rolex-datejust-blue-dial-watch-bracelet-set', 'AM-W25', 'Rolex Datejust Blue Dial — Watch + Bracelet Set — a stylish wristwatch in the Luxury Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3560, '/assets/watches/watch-25.jpg', 20, false, true FROM categories WHERE slug = 'luxury-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-25.jpg', 'Rolex Datejust Blue Dial — Watch + Bracelet Set', 0, true FROM products WHERE slug = 'rolex-datejust-blue-dial-watch-bracelet-set'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-25.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Patek Philippe Nautilus Blue — Denim Strap', 'patek-philippe-nautilus-blue-denim-strap', 'AM-W26', 'Patek Philippe Nautilus Blue — Denim Strap — a stylish wristwatch in the Luxury Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 3250, '/assets/watches/watch-26.jpg', 20, true, true FROM categories WHERE slug = 'luxury-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-26.jpg', 'Patek Philippe Nautilus Blue — Denim Strap', 0, true FROM products WHERE slug = 'patek-philippe-nautilus-blue-denim-strap'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-26.jpg');

INSERT INTO products (category_id, name, slug, sku, description, price, image_url, stock_qty, is_featured, is_active)
SELECT id, 'Jacob & Co The Godfather', 'jacob-and-co-the-godfather', 'AM-W27', 'Jacob & Co The Godfather — a stylish wristwatch in the Luxury Watches collection at AM Collection, shown exactly as pictured. Comfortable everyday wear with an elegant finish. Cash on Delivery available across Pakistan; delivery Rs. 200 (free on orders of Rs. 5,000 or more).', 5550, '/assets/watches/watch-27.jpg', 20, true, true FROM categories WHERE slug = 'luxury-watches'
ON CONFLICT (slug) DO UPDATE SET price = EXCLUDED.price, image_url = EXCLUDED.image_url, description = EXCLUDED.description, is_featured = EXCLUDED.is_featured;
INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
SELECT id, '/assets/watches/watch-27.jpg', 'Jacob & Co The Godfather', 0, true FROM products WHERE slug = 'jacob-and-co-the-godfather'
AND NOT EXISTS (SELECT 1 FROM product_images pi WHERE pi.product_id = products.id AND pi.image_url = '/assets/watches/watch-27.jpg');

COMMIT;
