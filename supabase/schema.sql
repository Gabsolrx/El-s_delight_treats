-- ==============================================================================
-- El's Delight Treats - Complete Supabase PostgreSQL Database Schema
-- Production Schema for Orders, Inquiries, Products Catalog (18 Products),
-- Categories (8 Active Categories), Reviews, Business Settings & Site CMS Content
-- 
-- How to apply:
-- 1. Open your project at https://supabase.com
-- 2. Go to: SQL Editor -> New Query
-- 3. Paste this entire script and click "Run" (Ctrl+Enter or Cmd+Enter)
-- ==============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 1. ORDERS TABLE
-- Matches Admin Dashboard Orders Manager & Checkout Flow
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_type TEXT DEFAULT 'delivery',
  delivery_method TEXT,
  delivery_address TEXT,
  delivery_area TEXT,
  landmark TEXT,
  delivery_date TEXT,
  delivery_time TEXT DEFAULT 'Morning (9am - 1pm)',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  discount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT DEFAULT 'transfer',
  payment_status TEXT DEFAULT 'pending',
  payment_reference TEXT,
  order_notes TEXT,
  admin_notes TEXT,
  status TEXT DEFAULT 'pending_payment_verification',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Upgrade existing orders tables if missing columns
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_method TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS landmark TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_notes TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_time TEXT DEFAULT 'Morning (9am - 1pm)';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'transfer';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public order placement" ON public.orders;
DROP POLICY IF EXISTS "Allow reading orders" ON public.orders;
DROP POLICY IF EXISTS "Allow updating orders" ON public.orders;
DROP POLICY IF EXISTS "Allow deleting orders" ON public.orders;
DROP POLICY IF EXISTS "Allow all on orders" ON public.orders;
CREATE POLICY "Allow all on orders" 
  ON public.orders FOR ALL 
  TO anon, authenticated 
  USING (true)
  WITH CHECK (true);


-- ==============================================================================
-- 2. BESPOKE CUSTOM CAKE INQUIRIES TABLE
-- Matches Admin Dashboard Custom Inquiries Tab & Bespoke Consultation Form
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.inquiries (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  occasion TEXT,
  tiers INTEGER DEFAULT 1,
  cake_size TEXT,
  flavour TEXT,
  colour_theme TEXT,
  theme_description TEXT,
  cake_message TEXT,
  budget_range TEXT,
  preferred_date TEXT,
  delivery_type TEXT DEFAULT 'delivery',
  delivery_method TEXT,
  delivery_area TEXT,
  reference_url TEXT,
  special_instructions TEXT,
  admin_notes TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Upgrade existing inquiries table
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS delivery_method TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS special_instructions TEXT;
ALTER TABLE public.inquiries ADD COLUMN IF NOT EXISTS reference_url TEXT;

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_phone ON public.inquiries(phone);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries(status);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public inquiry submission" ON public.inquiries;
DROP POLICY IF EXISTS "Allow reading inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Allow updating inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Allow deleting inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Allow all on inquiries" ON public.inquiries;
CREATE POLICY "Allow all on inquiries" 
  ON public.inquiries FOR ALL 
  TO anon, authenticated 
  USING (true)
  WITH CHECK (true);


-- ==============================================================================
-- 3. PRODUCTS CATALOG TABLE (18 Live Website Products)
-- Matches Admin Dashboard Products Manager
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  old_price NUMERIC,
  discount NUMERIC,
  description TEXT,
  full_description TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  flavours JSONB DEFAULT '[]'::jsonb,
  sizes JSONB DEFAULT '[]'::jsonb,
  occasion JSONB DEFAULT '[]'::jsonb,
  bestseller BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  is_new BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  rating NUMERIC DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  budget_range TEXT,
  preparation_time TEXT DEFAULT '24 hours notice',
  tag TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Upgrade existing products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS budget_range TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS preparation_time TEXT DEFAULT '24 hours notice';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS tag TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS full_description TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS flavours JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sizes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS occasion JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(slug);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public reading products" ON public.products;
DROP POLICY IF EXISTS "Allow admin inserting products" ON public.products;
DROP POLICY IF EXISTS "Allow admin updating products" ON public.products;
DROP POLICY IF EXISTS "Allow admin deleting products" ON public.products;
DROP POLICY IF EXISTS "Allow all on products" ON public.products;
CREATE POLICY "Allow all on products" 
  ON public.products FOR ALL 
  TO anon, authenticated 
  USING (true)
  WITH CHECK (true);


-- ==============================================================================
-- 4. CATEGORIES TABLE (8 Active Categories)
-- Matches Admin Dashboard Categories Tab
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
  name TEXT PRIMARY KEY,
  label TEXT,
  count TEXT,
  image TEXT,
  slug TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Upgrade existing categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS count TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS slug TEXT;

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public reading categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin managing categories" ON public.categories;
DROP POLICY IF EXISTS "Allow all on categories" ON public.categories;
CREATE POLICY "Allow all on categories" 
  ON public.categories FOR ALL 
  TO anon, authenticated 
  USING (true)
  WITH CHECK (true);


-- ==============================================================================
-- 5. CUSTOMER TESTIMONIALS & REVIEWS TABLE
-- Matches Admin Dashboard Reviews Tab & "What Our Customers Say"
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  occasion TEXT,
  rating INTEGER DEFAULT 5,
  date TEXT,
  text TEXT NOT NULL,
  product_name TEXT,
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Upgrade existing reviews table
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT true;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS product_name TEXT;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public reading reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow admin inserting reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow admin updating reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow admin deleting reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow all on reviews" ON public.reviews;
CREATE POLICY "Allow all on reviews" 
  ON public.reviews FOR ALL 
  TO anon, authenticated 
  USING (true)
  WITH CHECK (true);


-- ==============================================================================
-- 6. STORE & BRAND SETTINGS TABLE
-- Matches Admin Dashboard Store & Brand Settings Tab
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.business_settings (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  name TEXT NOT NULL,
  tagline TEXT,
  type TEXT,
  phone TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  whatsapp_url_number TEXT NOT NULL,
  email TEXT NOT NULL,
  instagram TEXT NOT NULL,
  instagram_url TEXT,
  facebook TEXT,
  facebook_url TEXT,
  address TEXT NOT NULL,
  pickup_note TEXT,
  opening_hours TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  admin_pin TEXT DEFAULT 'chinazor',
  logo_settings JSONB DEFAULT '{}'::jsonb,
  delivery_settings JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Upgrade existing business_settings table
ALTER TABLE public.business_settings ADD COLUMN IF NOT EXISTS admin_pin TEXT DEFAULT 'chinazor';
ALTER TABLE public.business_settings ADD COLUMN IF NOT EXISTS pickup_note TEXT;
ALTER TABLE public.business_settings ADD COLUMN IF NOT EXISTS logo_settings JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.business_settings ADD COLUMN IF NOT EXISTS delivery_settings JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public reading business settings" ON public.business_settings;
DROP POLICY IF EXISTS "Allow admin updating business settings" ON public.business_settings;
DROP POLICY IF EXISTS "Allow all on business settings" ON public.business_settings;
CREATE POLICY "Allow all on business settings" 
  ON public.business_settings FOR ALL 
  TO anon, authenticated 
  USING (true)
  WITH CHECK (true);


-- ==============================================================================
-- 7. SITE CONTENT & CMS TABLE
-- Matches Admin Dashboard Site Content & Banners Tab
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.site_content (
  id TEXT PRIMARY KEY DEFAULT 'primary',
  hero JSONB NOT NULL DEFAULT '{}'::jsonb,
  announcements JSONB NOT NULL DEFAULT '[]'::jsonb,
  brand_promises JSONB NOT NULL DEFAULT '[]'::jsonb,
  about JSONB NOT NULL DEFAULT '{}'::jsonb,
  faqs JSONB NOT NULL DEFAULT '[]'::jsonb,
  corporate JSONB NOT NULL DEFAULT '{}'::jsonb,
  occasions_section JSONB NOT NULL DEFAULT '{}'::jsonb,
  sweet_moments JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Upgrade existing site_content table
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS occasions_section JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.site_content ADD COLUMN IF NOT EXISTS sweet_moments JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public reading site content" ON public.site_content;
DROP POLICY IF EXISTS "Allow admin updating site content" ON public.site_content;
DROP POLICY IF EXISTS "Allow all on site content" ON public.site_content;
CREATE POLICY "Allow all on site content" 
  ON public.site_content FOR ALL 
  TO anon, authenticated 
  USING (true)
  WITH CHECK (true);

-- Drop deprecated subscribers table if previously created
DROP TABLE IF EXISTS public.subscribers CASCADE;


-- ==============================================================================
-- INITIAL SEED DATA
-- Populates all 18 products, categories, reviews, settings, content & demo orders
-- ==============================================================================

-- 1. Seed Business Settings
INSERT INTO public.business_settings (
  id, name, tagline, type, phone, whatsapp_number, whatsapp_url_number,
  email, instagram, instagram_url, facebook, facebook_url, address,
  pickup_note, opening_hours, bank_name, account_name, account_number, admin_pin,
  delivery_settings
) VALUES (
  'primary',
  'El''s Delight Treats',
  'Beautiful Cakes. Memorable Moments.',
  'Premium Nigerian Cake & Treats Store',
  '09138761465',
  '09138761465',
  '2349138761465',
  'elsdelight20@gmail.com',
  'els_delighttreats',
  'https://www.instagram.com/els_delighttreats?stkn=MTVtMWxjYWtveWI0aA==',
  'els_delight',
  'https://www.facebook.com/share/1CDErKS8QJ/',
  'Lakeview Phase 1, Amuwo-Odofin, Lagos, Nigeria',
  'Pickup available at our bakery studio: Lakeview Phase 1, Amuwo-Odofin, Lagos.',
  'Mon – Sat: 8:00 AM – 7:00 PM (Sunday Deliveries by Pre-order)',
  'Stanbic IBTC',
  'Chinazor Adaora Arinze',
  '0086485307',
  'chinazor',
  '{"deliveryFeeFlat": 2500, "freeDeliveryThreshold": 50000, "deliveryPolicyNotice": "Cakes are packaged in rigid protective boxes and hand-delivered via temperature-controlled courier."}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  phone = EXCLUDED.phone,
  whatsapp_number = EXCLUDED.whatsapp_number,
  whatsapp_url_number = EXCLUDED.whatsapp_url_number,
  email = EXCLUDED.email,
  instagram = EXCLUDED.instagram,
  instagram_url = EXCLUDED.instagram_url,
  facebook = EXCLUDED.facebook,
  facebook_url = EXCLUDED.facebook_url,
  address = EXCLUDED.address,
  bank_name = EXCLUDED.bank_name,
  account_name = EXCLUDED.account_name,
  account_number = EXCLUDED.account_number,
  admin_pin = EXCLUDED.admin_pin,
  delivery_settings = EXCLUDED.delivery_settings;

-- 2. Seed All 8 Categories
INSERT INTO public.categories (name, label, count, image, slug) VALUES
('Birthday Cakes', 'Celebration wonders', '10+ designs', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80', 'birthday-cakes'),
('Wedding Cakes', 'Grand tiered love', 'Bridal luxe', 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=400&q=80', 'wedding-cakes'),
('Anniversary Cakes', 'Romantic milestones', 'Love & bliss', 'https://images.unsplash.com/photo-1518047601542-4505c440a469?auto=format&fit=crop&w=400&q=80', 'anniversary-cakes'),
('Corporate/Office Cakes', 'Executive & brand events', 'Pro sheets', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80', 'corporate-office-cakes'),
('Graduation Cakes', 'Degrees & achievements', 'Academic win', 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=400&q=80', 'graduation-cakes'),
('Baby Shower Cakes', 'Sweet arrivals & pastel bliss', 'Miracle joys', 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=400&q=80', 'baby-shower-cakes'),
('Christmas Cakes', 'Festive holiday cheer', 'Seasonal luxe', 'https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&crop=center&w=800&h=800&q=85', 'christmas-cakes'),
('Custom Cakes', 'Your idea, our craft', 'Bespoke art', 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=400&q=80', 'custom-cakes')
ON CONFLICT (name) DO UPDATE SET
  label = EXCLUDED.label,
  count = EXCLUDED.count,
  image = EXCLUDED.image;

-- 3. Seed Verified Customer Testimonials
INSERT INTO public.reviews (id, name, location, occasion, rating, date, text, product_name, verified) VALUES
('rev-1', 'Ijeoma', 'Lagos, Nigeria', 'Celebration Cake', 5, 'Verified Order', 'I was shocked when I saw the cake. Thank you so much. I really appreciate it. I knew the cake was worth more than the amount I paid. It was too big and beautiful.', 'Celebration Cake', true),
('rev-2', 'Mrs Ngozi', 'Lagos, Nigeria', 'Character Themed Cake', 5, 'Verified Order', 'The cake is so beautiful. You really tried with inserting the characters. Kudos!', 'Character Cake', true),
('rev-3', 'Mrs Ugwushie', 'Lagos, Nigeria', 'KK''s Celebration', 5, 'Verified Order', 'KK’s cake was beautiful. We loved it. You are going higher and higher. Forward ever!', 'Custom Celebration Cake', true),
('rev-4', 'Faidah', 'Lagos, Nigeria', 'Cake Order', 5, 'Verified Order', 'It went well. It was fine, thank you. The cake was so moist and nice. Thank you. I just got back from work and I’m eating the slice I brought home.', 'Moist Fresh Cake', true),
('rev-5', 'Anu', 'Lagos, Nigeria', 'Cake Treat', 5, 'Verified Order', 'Good morning, sis. I just want to thank you for the cake. I’m actually eating it now, and it still tastes so nice. 😘😘', 'Fresh Baked Treat', true)
ON CONFLICT (id) DO UPDATE SET
  text = EXCLUDED.text,
  name = EXCLUDED.name,
  occasion = EXCLUDED.occasion;

-- 4. Seed All 18 Catalog Products
INSERT INTO public.products (
  id, name, slug, category, price, old_price, discount, description, full_description,
  images, flavours, sizes, occasion, bestseller, featured, is_new, in_stock, rating, review_count, budget_range, preparation_time, tag
) VALUES 
(
  'prod-1', 'Classic Chocolate Birthday Cake', 'classic-chocolate-birthday-cake', 'Birthday Cakes',
  25000, 28000, 11,
  'Decadent chocolate sponge layered with creamy cocoa frosting and finished with chocolate curls & truffles.',
  'Our signature chocolate masterpiece. Baked with premium Belgian cocoa, layered with velvety chocolate frosting, and delicately decorated with handmade chocolate curls and fresh seasonal berries. Ideal for adult and children celebrations.',
  '["https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=900&q=80"]'::jsonb,
  '["Rich Chocolate Ganache", "Vanilla Buttercream", "Marble Swirl", "Salted Caramel"]'::jsonb,
  '[{"name": "6 inch (Feeds 6–8)", "label": "6 inch", "priceModifier": 1, "isBase": true}, {"name": "8 inch (Feeds 12–16)", "label": "8 inch", "priceModifier": 1.35}, {"name": "10 inch (Feeds 20–25)", "label": "10 inch", "priceModifier": 1.75}]'::jsonb,
  '["Birthday", "Anniversary", "General"]'::jsonb,
  true, true, false, true, 4.9, 128, '₦20,000–₦40,000', '24 hours notice', 'BEST SELLER'
),
(
  'prod-2', 'Red Velvet Celebration Cake', 'red-velvet-celebration-cake', 'Birthday Cakes',
  30000, null, null,
  'Signature crimson sponge with silky cream cheese frosting, ruby crumbs, and edible gold leaf touches.',
  'A Nigerian celebration staple crafted with artisanal flair. Deep scarlet moist crumb infused with buttermilk and cocoa, paired harmoniously with tangy-sweet cream cheese frosting and gold leaf.',
  '["https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=900&q=80"]'::jsonb,
  '["Velvet Red Velvet", "Vanilla Buttercream", "Rich Chocolate Ganache"]'::jsonb,
  '[{"name": "6 inch (Feeds 6–8)", "label": "6 inch", "priceModifier": 1, "isBase": true}, {"name": "8 inch (Feeds 12–16)", "label": "8 inch", "priceModifier": 1.35}, {"name": "10 inch (Feeds 20–25)", "label": "10 inch", "priceModifier": 1.75}]'::jsonb,
  '["Birthday", "Wedding", "Anniversary"]'::jsonb,
  true, true, false, true, 5.0, 94, '₦20,000–₦40,000', '24 hours notice', 'POPULAR'
),
(
  'prod-3', 'Vanilla Buttercream Cake', 'vanilla-buttercream-cake', 'Birthday Cakes',
  20000, null, null,
  'Tender vanilla bean cake wrapped in velvety Swiss meringue buttercream with soft pastel rosettes.',
  'Timeless elegance in every bite. Pure Bourbon vanilla infused cake layers covered in silky whipped buttercream, perfect for children and adult birthdays alike.',
  '["https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1562440499-64c9a111f713?auto=format&fit=crop&w=900&q=80"]'::jsonb,
  '["Vanilla Buttercream", "Fresh Strawberry Cream", "Toasted Coconut"]'::jsonb,
  '[{"name": "6 inch (Feeds 6–8)", "label": "6 inch", "priceModifier": 1, "isBase": true}, {"name": "8 inch (Feeds 12–16)", "label": "8 inch", "priceModifier": 1.35}, {"name": "10 inch (Feeds 20–25)", "label": "10 inch", "priceModifier": 1.75}]'::jsonb,
  '["Birthday", "General"]'::jsonb,
  false, true, false, true, 4.8, 76, '₦10,000–₦20,000', '24 hours notice', 'POPULAR'
),
(
  'prod-4', 'Strawberry Cream Cake', 'strawberry-cream-cake', 'Birthday Cakes',
  28000, 32000, 12,
  'Light sponge layered with real strawberry compote, chantilly cream, and glazed fresh strawberries.',
  'Refreshing, summery, and luxuriously light. Made with layers of fluffy sponge infused with wild strawberry essence, house reduction, and whipped cream frosting.',
  '["https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&w=900&q=80"]'::jsonb,
  '["Fresh Strawberry Cream", "Vanilla Buttercream", "Velvet Red Velvet"]'::jsonb,
  '[{"name": "6 inch (Feeds 6–8)", "label": "6 inch", "priceModifier": 1, "isBase": true}, {"name": "8 inch (Feeds 12–16)", "label": "8 inch", "priceModifier": 1.35}, {"name": "10 inch (Feeds 20–25)", "label": "10 inch", "priceModifier": 1.75}]'::jsonb,
  '["Birthday", "General"]'::jsonb,
  false, true, false, true, 4.9, 63, '₦20,000–₦40,000', '24 hours notice', 'FRESH PICK'
),
(
  'prod-5', 'Chocolate Drip Cake', 'chocolate-drip-cake', 'Birthday Cakes',
  35000, null, null,
  'Dramatic dark chocolate drizzle cascading over smooth cream with Ferrero Rocher & golden sprinkles.',
  'The ultimate celebratory showstopper. Moist chocolate cake cloaked in velvet frosting, featuring a glossy handcrafted chocolate ganache drip cascading over the sides.',
  '["https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80"]'::jsonb,
  '["Rich Chocolate Ganache", "Salted Caramel", "Marble Swirl"]'::jsonb,
  '[{"name": "6 inch (Feeds 6–8)", "label": "6 inch", "priceModifier": 1, "isBase": true}, {"name": "8 inch (Feeds 12–16)", "label": "8 inch", "priceModifier": 1.35}, {"name": "10 inch (Feeds 20–25)", "label": "10 inch", "priceModifier": 1.75}]'::jsonb,
  '["Birthday", "Anniversary", "General"]'::jsonb,
  true, true, false, true, 4.95, 112, '₦20,000–₦40,000', '24 hours notice', 'BEST SELLER'
),
(
  'prod-6', 'Pink Heart Cake', 'pink-heart-cake', 'Anniversary Cakes',
  25000, null, null,
  'Romantic vintage heart-shaped cake piped with classic Lambeth shell borders and delicate cherry accents.',
  'Trending vintage Lambeth aesthetic crafted with romantic flair. Carved into an adorable heart shape, featuring ruffled buttercream borders and bespoke custom lettering.',
  '["https://images.unsplash.com/photo-1518047601542-4505c440a469?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=900&q=80"]'::jsonb,
  '["Vanilla Buttercream", "Velvet Red Velvet", "Fresh Strawberry Cream"]'::jsonb,
  '[{"name": "6 inch (Feeds 6–8)", "label": "6 inch", "priceModifier": 1, "isBase": true}, {"name": "8 inch (Feeds 12–16)", "label": "8 inch", "priceModifier": 1.35}]'::jsonb,
  '["Anniversary", "Birthday"]'::jsonb,
  false, true, false, true, 4.9, 88, '₦20,000–₦40,000', '24 hours notice', 'TRENDING'
),
(
  'prod-7', 'Caramel Drizzle Birthday Cake', 'caramel-drizzle-birthday-cake', 'Birthday Cakes',
  32000, 36000, 11,
  'Golden butterscotch sponge crowned with house-made salted caramel drip, toffee crunch, and gilded macarons.',
  'A caramel lover’s absolute dream. Alternating layers of fluffy vanilla sponge and gooey salted caramel drizzle, coated in smooth whipped caramel buttercream.',
  '["https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=900&q=80"]'::jsonb,
  '["Salted Caramel", "Vanilla Buttercream", "Marble Swirl"]'::jsonb,
  '[{"name": "6 inch (Feeds 6–8)", "label": "6 inch", "priceModifier": 1, "isBase": true}, {"name": "8 inch (Feeds 12–16)", "label": "8 inch", "priceModifier": 1.35}, {"name": "10 inch (Feeds 20–25)", "label": "10 inch", "priceModifier": 1.75}]'::jsonb,
  '["Birthday", "Anniversary", "General"]'::jsonb,
  true, false, false, true, 4.94, 71, '₦20,000–₦40,000', '24 hours notice', 'CARAMEL LUXE'
),
(
  'prod-8', 'Vanilla & Fresh Berry Bliss Cake', 'vanilla-fresh-berry-bliss-cake', 'Birthday Cakes',
  28000, null, null,
  'Pure vanilla bean sponge layered with wild berry reduction, snowy Swiss buttercream, and hand-selected berries.',
  'Understated elegance meets vibrant freshness. Made with authentic Bourbon vanilla, frosted in ultra-light Swiss meringue buttercream, and piled high with fresh berries.',
  '["https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=900&q=80"]'::jsonb,
  '["Vanilla Buttercream", "Fresh Strawberry Cream", "Toasted Coconut"]'::jsonb,
  '[{"name": "6 inch (Feeds 6–8)", "label": "6 inch", "priceModifier": 1, "isBase": true}, {"name": "8 inch (Feeds 12–16)", "label": "8 inch", "priceModifier": 1.35}, {"name": "10 inch (Feeds 20–25)", "label": "10 inch", "priceModifier": 1.75}]'::jsonb,
  '["Birthday", "General"]'::jsonb,
  false, true, false, true, 4.89, 58, '₦20,000–₦40,000', '24 hours notice', 'BERRY FRESH'
),
(
  'prod-9', 'Bespoke Floral Milestone Cake', 'bespoke-floral-milestone-cake', 'Anniversary Cakes',
  38000, 42000, 10,
  'Statuesque celebratory cake adorned with delicate pastel sugar blossoms, shimmering edible pearls, and custom gold lettering.',
  'Created for life’s most cherished celebrations—from 21st, 30th, 50th birthdays to wedding anniversaries. Features textured ivory buttercream and handmade sugar flora.',
  '["https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1518047601542-4505c440a469?auto=format&fit=crop&w=900&q=80"]'::jsonb,
  '["Velvet Red Velvet", "Vanilla Buttercream", "Rich Chocolate Ganache"]'::jsonb,
  '[{"name": "6 inch (Feeds 6–8)", "label": "6 inch", "priceModifier": 1, "isBase": true}, {"name": "8 inch (Feeds 12–16)", "label": "8 inch", "priceModifier": 1.35}, {"name": "10 inch (Feeds 20–25)", "label": "10 inch", "priceModifier": 1.75}]'::jsonb,
  '["Anniversary", "Birthday", "Wedding"]'::jsonb,
  true, false, false, true, 4.96, 83, '₦20,000–₦40,000', '24 hours notice', 'FLORAL ELEGANCE'
),
(
  'prod-11', 'Anniversary Heart Cake', 'anniversary-heart-cake', 'Anniversary Cakes',
  30000, null, null,
  'Sculpted romantic double-layer heart cake with delicate vintage piping, rosebud accents, and gold script.',
  'Designed specifically to celebrate milestone anniversaries and deep romantic bonds. Features vintage European shell piping, hand-crafted sugar roses, and lustrous gold text.',
  '["https://images.unsplash.com/photo-1518047601542-4505c440a469?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=900&q=80"]'::jsonb,
  '["Velvet Red Velvet", "Rich Chocolate Ganache", "Vanilla Buttercream"]'::jsonb,
  '[{"name": "6 inch (Feeds 6–8)", "label": "6 inch", "priceModifier": 1, "isBase": true}, {"name": "8 inch (Feeds 12–16)", "label": "8 inch", "priceModifier": 1.35}]'::jsonb,
  '["Anniversary", "General"]'::jsonb,
  false, false, false, true, 4.95, 67, '₦20,000–₦40,000', '24 hours notice', 'ROMANTIC'
),
(
  'prod-12', 'Baby Shower Cake', 'baby-shower-cake', 'Baby Shower Cakes',
  35000, null, null,
  'Charming pastel cake decorated with fluffy cloud buttercream, soft macarons, and baby celebration topper.',
  'Celebrate the arrival of your bundle of joy with this whimsical creation. Decorated in gentle baby pastels, finished with airy clouds and sweet toppers.',
  '["https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=900&q=80"]'::jsonb,
  '["Vanilla Buttercream", "Fresh Strawberry Cream", "Toasted Coconut"]'::jsonb,
  '[{"name": "6 inch (Feeds 6–8)", "label": "6 inch", "priceModifier": 1, "isBase": true}, {"name": "8 inch (Feeds 12–16)", "label": "8 inch", "priceModifier": 1.35}, {"name": "10 inch (Feeds 20–25)", "label": "10 inch", "priceModifier": 1.75}]'::jsonb,
  '["Baby Shower", "General"]'::jsonb,
  false, false, true, true, 4.92, 54, '₦20,000–₦40,000', '24 hours notice', 'NEW ARRIVAL'
),
(
  'prod-13', 'Graduation Cake', 'graduation-cake', 'Graduation Cakes',
  30000, null, null,
  'Commemorative celebration cake with miniature fondant mortarboard cap, rolled diploma, and gold accents.',
  'Salute university and high school graduates in style. Customized with faculty colors, a handcrafted fondant graduation cap, edible scroll, and inspiring personal message.',
  '["https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80"]'::jsonb,
  '["Rich Chocolate Ganache", "Velvet Red Velvet", "Vanilla Buttercream"]'::jsonb,
  '[{"name": "6 inch (Feeds 6–8)", "label": "6 inch", "priceModifier": 1, "isBase": true}, {"name": "8 inch (Feeds 12–16)", "label": "8 inch", "priceModifier": 1.35}, {"name": "10 inch (Feeds 20–25)", "label": "10 inch", "priceModifier": 1.75}]'::jsonb,
  '["Graduation", "General"]'::jsonb,
  false, false, false, true, 4.88, 49, '₦20,000–₦40,000', '24 hours notice', 'ACHIEVEMENT'
),
(
  'prod-14', 'Photo Cake', 'photo-cake', 'Birthday Cakes',
  35000, null, null,
  'High-definition edible sugar sheet photo print framed with tailored whipped buttercream piping borders.',
  'Bring personal memories to life on a delicious cake. Send us any high-resolution portrait, family photograph, or company logo, rendered vividly on delicious buttercream.',
  '["https://images.unsplash.com/photo-1562440499-64c9a111f713?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=900&q=80"]'::jsonb,
  '["Vanilla Buttercream", "Rich Chocolate Ganache", "Marble Swirl", "Velvet Red Velvet"]'::jsonb,
  '[{"name": "6 inch (Feeds 6–8)", "label": "6 inch", "priceModifier": 1, "isBase": true}, {"name": "8 inch (Feeds 12–16)", "label": "8 inch", "priceModifier": 1.35}, {"name": "10 inch (Feeds 20–25)", "label": "10 inch", "priceModifier": 1.75}]'::jsonb,
  '["Birthday", "Corporate", "General"]'::jsonb,
  false, false, false, true, 4.9, 82, '₦20,000–₦40,000', '24 hours notice', 'CUSTOM PRINT'
),
(
  'prod-15', 'Premium Birthday Cake', 'premium-birthday-cake', 'Birthday Cakes',
  40000, 45000, 11,
  'Luxury double-barrel celebration cake with French macarons, metallic wafer sails, and lush drip details.',
  'An impressive, towering statement cake crafted for major milestone birthdays (30th, 40th, 50th, 60th+). Features elevated double-barrel height, gold-leaf leafing, and macarons.',
  '["https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=900&q=80"]'::jsonb,
  '["Velvet Red Velvet", "Rich Chocolate Ganache", "Spiced Carrot & Walnut", "Salted Caramel"]'::jsonb,
  '[{"name": "6 inch (Feeds 6–8)", "label": "6 inch", "priceModifier": 1, "isBase": true}, {"name": "8 inch (Feeds 12–16)", "label": "8 inch", "priceModifier": 1.35}, {"name": "10 inch (Feeds 20–25)", "label": "10 inch", "priceModifier": 1.75}]'::jsonb,
  '["Birthday", "Anniversary", "General"]'::jsonb,
  true, true, false, true, 4.96, 97, '₦40,000–₦80,000', '24 hours notice', 'LUXURY'
),
(
  'prod-16', 'Luxury Wedding Cake', 'luxury-wedding-cake', 'Wedding Cakes',
  120000, null, null,
  'Magnificent 2-tier bridal masterpiece adorned with handcrafted sugar petals and delicate champagne textures.',
  'Handcrafted for intimate to mid-sized Nigerian weddings and traditional marriage receptions. Clad in smooth ivory fondant or velvet buttercream with cascading sugar flora.',
  '["https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=900&q=80"]'::jsonb,
  '["Vanilla Buttercream", "Velvet Red Velvet", "Rich Chocolate Ganache", "Toasted Coconut"]'::jsonb,
  '[{"name": "2-Tier Classic Wedding Cake (Feeds 50-70)", "label": "2-Tier (50-70 guests)", "priceModifier": 1, "isBase": true}, {"name": "3-Tier Grand Wedding Cake (Feeds 100-150)", "label": "3-Tier (100-150 guests)", "priceModifier": 1.5}]'::jsonb,
  '["Wedding", "Anniversary"]'::jsonb,
  false, true, false, true, 5.0, 38, '₦80,000+', '48–72 hours notice (Consultation included)', 'BRIDAL COLLECTION'
),
(
  'prod-17', 'Three-Tier Wedding Cake', 'three-tier-wedding-cake', 'Wedding Cakes',
  180000, 200000, 10,
  'Grand three-tier luxury architectural cake featuring bespoke structural support, gold leaf, and floral cascade.',
  'The pinnacle of luxury patisserie. Three majestic tiers structured with internal dowelling for flawless stability. Flavour combinations can be customized per tier.',
  '["https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=900&q=80"]'::jsonb,
  '["Vanilla Buttercream", "Velvet Red Velvet", "Rich Chocolate Ganache", "Toasted Coconut"]'::jsonb,
  '[{"name": "2-Tier Classic Wedding Cake (Feeds 50-70)", "label": "2-Tier (50-70 guests)", "priceModifier": 1, "isBase": true}, {"name": "3-Tier Grand Wedding Cake (Feeds 100-150)", "label": "3-Tier (100-150 guests)", "priceModifier": 1.5}, {"name": "4-Tier Royal Wedding Cake (Feeds 200+)", "label": "4-Tier (200+ guests)", "priceModifier": 2.2}]'::jsonb,
  '["Wedding", "Anniversary"]'::jsonb,
  true, true, false, true, 5.0, 29, '₦80,000+', '72 hours notice (Setup included)', 'ROYAL TIER'
),
(
  'prod-18', 'Corporate Celebration Cake', 'corporate-celebration-cake', 'Corporate/Office Cakes',
  50000, null, null,
  'Polished corporate sheet or tiered cake branded with precision corporate logo, sharp lines, and team greetings.',
  'Engineered for executive events, staff birthdays, client appreciation, product launches, and end-of-year office festivities in Lagos. Feeds 30 to 60 colleagues.',
  '["https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80", "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=900&q=80"]'::jsonb,
  '["Rich Chocolate Ganache", "Vanilla Buttercream", "Velvet Red Velvet"]'::jsonb,
  '[{"name": "6 inch (Feeds 6–8)", "label": "6 inch", "priceModifier": 1, "isBase": true}, {"name": "8 inch (Feeds 12–16)", "label": "8 inch", "priceModifier": 1.35}, {"name": "10 inch (Feeds 20–25)", "label": "10 inch", "priceModifier": 1.75}]'::jsonb,
  '["Corporate", "General"]'::jsonb,
  false, false, false, true, 4.9, 44, '₦40,000–₦80,000', '24 hours notice (Invoice available)', 'CORPORATE'
),
(
  'prod-christmas', 'Festive Buttercream Christmas Cake', 'festive-buttercream-christmas-cake', 'Christmas Cakes',
  35000, null, null,
  'Enchanting holiday showpiece crowned with snow-white buttercream, rich candied berries, festive rosemary wreaths, and gleaming gold greetings.',
  'Spread festive joy and holiday warmth with our signature Christmas showpiece. Handcrafted with spiced vanilla or rich Belgian cocoa, winter pine accents, and lustrous gold greetings.',
  '["https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&crop=center&w=1000&h=1000&q=85", "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?auto=format&fit=crop&crop=center&w=1000&h=1000&q=85"]'::jsonb,
  '["Rich Chocolate Ganache", "Velvet Red Velvet", "Vanilla Buttercream", "Spiced Carrot & Walnut"]'::jsonb,
  '[{"name": "6 inch (Feeds 6–8)", "label": "6 inch", "priceModifier": 1, "isBase": true}, {"name": "8 inch (Feeds 12–16)", "label": "8 inch", "priceModifier": 1.35}, {"name": "10 inch (Feeds 20–25)", "label": "10 inch", "priceModifier": 1.75}]'::jsonb,
  '["Christmas", "General"]'::jsonb,
  true, true, false, true, 4.98, 62, '₦20,000–₦40,000', 'Same-day available in December', 'FESTIVE SPECIAL'
)
ON CONFLICT (id) DO UPDATE SET
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  full_description = EXCLUDED.full_description,
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  images = EXCLUDED.images,
  flavours = EXCLUDED.flavours,
  sizes = EXCLUDED.sizes,
  occasion = EXCLUDED.occasion,
  budget_range = EXCLUDED.budget_range,
  preparation_time = EXCLUDED.preparation_time,
  tag = EXCLUDED.tag,
  updated_at = timezone('utc'::text, now());

-- 5. Seed Initial Customer Orders (Admin Dashboard Live Orders)
INSERT INTO public.orders (
  id, customer_name, customer_phone, customer_email, delivery_type,
  delivery_address, delivery_area, landmark, delivery_date, delivery_time,
  items, subtotal, delivery_fee, total, payment_method, payment_status,
  order_notes, admin_notes, status
) VALUES
(
  'ELD-89241', 'Bolanle Adeleke', '08023456789', 'bolanle.adeleke@gmail.com', 'delivery',
  'Plot 14, 23 Road, Festac Town', 'Festac Town / Amuwo-Odofin', 'Near First Bank Festac',
  'Tomorrow Morning', 'Morning (10 AM – 1 PM)',
  '[{"id": "prod-1_8inch", "productId": "prod-1", "product": {"id": "prod-1", "name": "Classic Chocolate Birthday Cake", "price": 25000}, "selectedSize": {"name": "8 inch (Feeds 12–16)", "label": "8 inch"}, "selectedFlavour": "Rich Chocolate Ganache", "cakeMessage": "Happy 30th Birthday Funke!", "quantity": 1, "unitPrice": 37800}]'::jsonb,
  37800, 3500, 41300, 'transfer', 'pending',
  'Call before arriving at the gate security.',
  'Customer sent transfer receipt on WhatsApp. Confirming with Stanbic IBTC app.',
  'pending_payment_verification'
),
(
  'ELD-89190', 'Chinedu Eze', '08139876543', 'chinedu.eze@yahoo.com', 'pickup',
  '', 'Amuwo-Odofin', 'Lakeview Estate Gate',
  'Today', 'Afternoon (2 PM – 5 PM)',
  '[{"id": "prod-3_6inch", "productId": "prod-3", "product": {"id": "prod-3", "name": "Vanilla Buttercream Cake", "price": 20000}, "selectedSize": {"name": "6 inch (Feeds 6–8)", "label": "6 inch"}, "selectedFlavour": "Velvet Red Velvet", "cakeMessage": "Happy Graduation Babe", "quantity": 2, "unitPrice": 8500}]'::jsonb,
  17000, 0, 17000, 'transfer', 'confirmed',
  'Will pick up in person at the studio.',
  'Payment verified. Cake in oven, preparing blush pink buttercream swirl.',
  'baking'
),
(
  'ELD-89045', 'Adaeze Nwosu', '09087654321', 'adaeze.nwosu@outlook.com', 'delivery',
  'The Civic Centre, Ozumba Mbadiwe', 'Victoria Island', 'Near 1004 Estate',
  'Saturday', 'Morning (9 AM – 11 AM)',
  '[{"id": "prod-4_2tier", "productId": "prod-4", "product": {"id": "prod-4", "name": "Strawberry Cream Cake", "price": 28000}, "selectedSize": {"name": "2-Tier Classic Wedding Cake", "label": "2-Tier"}, "selectedFlavour": "Vanilla Buttercream", "cakeMessage": "Mr & Mrs Nwosu", "quantity": 1, "unitPrice": 95000}]'::jsonb,
  95000, 7000, 102000, 'transfer', 'confirmed',
  'Deliver to event planner directly at reception hall.',
  'Wedding order deposit and balance received via Stanbic IBTC.',
  'confirmed'
)
ON CONFLICT (id) DO UPDATE SET
  customer_name = EXCLUDED.customer_name,
  customer_phone = EXCLUDED.customer_phone,
  customer_email = EXCLUDED.customer_email,
  delivery_type = EXCLUDED.delivery_type,
  delivery_address = EXCLUDED.delivery_address,
  delivery_area = EXCLUDED.delivery_area,
  landmark = EXCLUDED.landmark,
  delivery_date = EXCLUDED.delivery_date,
  delivery_time = EXCLUDED.delivery_time,
  items = EXCLUDED.items,
  subtotal = EXCLUDED.subtotal,
  delivery_fee = EXCLUDED.delivery_fee,
  total = EXCLUDED.total,
  payment_method = EXCLUDED.payment_method,
  payment_status = EXCLUDED.payment_status,
  order_notes = EXCLUDED.order_notes,
  admin_notes = EXCLUDED.admin_notes,
  status = EXCLUDED.status,
  updated_at = timezone('utc'::text, now());

-- 6. Seed Initial Custom Cake Consultation Inquiry
INSERT INTO public.inquiries (
  id, full_name, phone, email, occasion, tiers, cake_size, flavour,
  colour_theme, theme_description, cake_message, budget_range,
  preferred_date, delivery_type, delivery_area, special_instructions,
  admin_notes, status
) VALUES
(
  'inq-101', 'Folashade Balogun', '08055123456', 'folashade.balogun@gmail.com', 'Wedding', 3,
  '3-Tier (Feeds 120)', 'Velvet Red Velvet & Belgian Chocolate Ganache',
  'Emerald Green & Polished Champagne Gold',
  'Royal wedding anniversary celebration. Want delicate edible floral cascade and custom acrylic monogram topper.',
  'Happy 10th Wedding Anniversary Tunde & Folashade', '₦150,000–₦250,000',
  '2026-11-28', 'delivery', 'Victoria Island, Lagos',
  'Setup required directly on banquet table at the venue by 11am.',
  'Initial inquiry received. Shared our 3-tier lookbook via WhatsApp.',
  'new'
)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  occasion = EXCLUDED.occasion,
  tiers = EXCLUDED.tiers,
  cake_size = EXCLUDED.cake_size,
  flavour = EXCLUDED.flavour,
  colour_theme = EXCLUDED.colour_theme,
  theme_description = EXCLUDED.theme_description,
  cake_message = EXCLUDED.cake_message,
  budget_range = EXCLUDED.budget_range,
  preferred_date = EXCLUDED.preferred_date,
  delivery_type = EXCLUDED.delivery_type,
  delivery_area = EXCLUDED.delivery_area,
  special_instructions = EXCLUDED.special_instructions,
  admin_notes = EXCLUDED.admin_notes,
  status = EXCLUDED.status,
  updated_at = timezone('utc'::text, now());

-- 7. Seed Site Content & CMS
INSERT INTO public.site_content (
  id, hero, announcements, brand_promises, about, faqs, corporate, occasions_section, sweet_moments
) VALUES
(
  'primary',
  '{"badge": "Freshly Baked in Lagos", "title": "Artisanal Celebration Cakes Crafted for Unforgettable Moments", "subtitle": "From breathtaking birthday centerpieces to magnificent wedding tiers, we create handcrafted masterpieces using premium ingredients with reliable delivery across Lagos.", "ctaText": "Explore Cake Catalog", "secondaryCta": "Order Bespoke Cake"}'::jsonb,
  '[{"id": "ann-1", "text": "🎉 Same-day delivery available across Lagos for selected signature cakes! Order before 11:00 AM.", "link": "/catalog", "active": true}, {"id": "ann-2", "text": "✨ Planning a wedding or milestone party? Book your custom cake consultation today.", "link": "/custom-cake", "active": true}]'::jsonb,
  '[{"id": "p-1", "title": "Freshness Guaranteed", "description": "Baked fresh to order with pure butter and real chocolate."}, {"id": "p-2", "title": "On-Time Lagos Delivery", "description": "Safe, temperature-controlled courier delivery across Lagos."}, {"id": "p-3", "title": "Custom Artistry", "description": "Handmade sugar flowers, custom lettering, and bespoke designs."}]'::jsonb,
  '{"title": "Meet Baker Chinazor", "story": "At El''s Delight Treats, every cake is a labor of love. What began as a passionate kitchen experiment has blossomed into one of Lagos'' most trusted boutique bakeries.", "experience": "Over 7 years crafting celebration cakes, bridal towers, and bespoke treats."}'::jsonb,
  '[{"id": "faq-1", "question": "How far in advance should I place my order?", "answer": "For signature catalog cakes, 24 to 48 hours notice is ideal. For grand bespoke wedding cakes, we recommend 1 to 2 weeks.", "category": "Ordering"}, {"id": "faq-2", "question": "Do you deliver across Lagos?", "answer": "Yes, we deliver across Lagos Mainland and Island, including Lekki, Ikoyi, Victoria Island, Ikeja, Festac, and Amuwo-Odofin.", "category": "Delivery"}]'::jsonb,
  '{"title": "Corporate Events & Office Celebrations", "subtitle": "Celebrate milestones, end-of-year banquets, and product launches with branded celebration cakes."}'::jsonb,
  '{"badge": "Curated for Nigerian Celebrations", "headline": "Find a Cake for Every Occasion", "viewAllText": "View All Occasion Collections", "items": [{"id": "Birthday", "title": "Birthday", "subtitle": "Make their special day unforgettable.", "image": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80"}, {"id": "Wedding", "title": "Wedding", "subtitle": "Elegant cakes for beautiful beginnings.", "image": "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=600&q=80"}, {"id": "Christmas", "title": "Christmas", "subtitle": "Celebrate the festive season with holiday sweetness.", "image": "https://images.unsplash.com/photo-1543257580-7269da773bf5?auto=format&fit=crop&crop=center&w=800&h=800&q=85"}, {"id": "Anniversary", "title": "Anniversary", "subtitle": "Celebrate your love with something delicious.", "image": "https://images.unsplash.com/photo-1518047601542-4505c440a469?auto=format&fit=crop&w=600&q=80"}, {"id": "Graduation", "title": "Graduation", "subtitle": "Celebrate every proud milestone & academic win.", "image": "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=600&q=80"}, {"id": "Corporate", "title": "Corporate", "subtitle": "Professional cakes for memorable business moments.", "image": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80"}, {"id": "Baby Shower", "title": "Baby Shower", "subtitle": "Sweet treats for welcoming little miracles.", "image": "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80"}]}'::jsonb,
  '{"badge": "els_delighttreats", "headline": "Sweet Moments at El''s", "subtitle": "Follow our daily baking journey, live frosting reels, and client setups in Lagos.", "buttonText": "Follow Us on Instagram", "buttonUrl": "https://www.instagram.com/els_delighttreats?stkn=MTVtMWxjYWtveWI0aA==", "items": [{"id": "gal-1", "image": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80", "tag": "#BirthdayGlam", "likes": "248", "category": "Birthday"}, {"id": "gal-2", "image": "https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=600&q=80", "tag": "#LagosWeddings", "likes": "412", "category": "Wedding"}, {"id": "gal-3", "image": "https://images.unsplash.com/photo-1586788680434-30d324b2d46f?auto=format&fit=crop&w=600&q=80", "tag": "#CelebrationCakes", "likes": "195", "category": "Birthday Cakes"}, {"id": "gal-4", "image": "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80", "tag": "#CustomCakes", "likes": "284", "category": "Custom Cakes"}, {"id": "gal-5", "image": "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=600&q=80", "tag": "#BirthdayCakes", "likes": "310", "category": "Birthday Cakes"}, {"id": "gal-6", "image": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80", "tag": "#CorporateGifting", "likes": "162", "category": "Corporate"}]}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  hero = EXCLUDED.hero,
  announcements = EXCLUDED.announcements,
  brand_promises = EXCLUDED.brand_promises,
  about = EXCLUDED.about,
  faqs = EXCLUDED.faqs,
  corporate = EXCLUDED.corporate,
  occasions_section = EXCLUDED.occasions_section,
  sweet_moments = EXCLUDED.sweet_moments,
  updated_at = timezone('utc'::text, now());
