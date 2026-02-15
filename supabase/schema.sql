-- ============================================
-- The Royale Indian - Complete Database Schema
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- 1. Site Content (key-value store for all editable text/images)
CREATE TABLE IF NOT EXISTS site_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'html')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day TEXT NOT NULL CHECK (day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')),
  appetizer TEXT NOT NULL,
  curry TEXT NOT NULL,
  biryani TEXT NOT NULL,
  egg TEXT NOT NULL DEFAULT '1 pc Boiled Egg',
  naan TEXT NOT NULL DEFAULT '2 pc Naan',
  price DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT UNIQUE NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  selected_days JSONB NOT NULL, -- [{day: "Monday", mealType: "lunch"}, ...]
  num_weeks INTEGER NOT NULL,
  total_meals INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_session_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Subscription Orders (individual deliveries)
CREATE TABLE IF NOT EXISTS subscription_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL, -- same as parent subscription order_id for tracking
  delivery_date TIMESTAMPTZ NOT NULL,
  day TEXT NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('lunch', 'dinner')),
  meal_price DECIMAL(10,2) NOT NULL DEFAULT 10.00,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'delivered', 'cancelled')),
  refund_status TEXT DEFAULT 'none' CHECK (refund_status IN ('none', 'refunded', 'no_refund')),
  stripe_refund_id TEXT,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Contact Submissions
CREATE TABLE IF NOT EXISTS contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Cancellation Requests
CREATE TABLE IF NOT EXISTS cancellation_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL,
  cancelled_order_ids UUID[] NOT NULL,
  total_refund_amount DECIMAL(10,2) DEFAULT 0,
  refund_eligible_count INTEGER DEFAULT 0,
  no_refund_count INTEGER DEFAULT 0,
  reason TEXT,
  status TEXT DEFAULT 'processed' CHECK (status IN ('pending', 'processed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(customer_email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_order_id ON subscriptions(order_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_subscription_id ON subscription_orders(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_delivery_date ON subscription_orders(delivery_date);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_status ON subscription_orders(status);
CREATE INDEX IF NOT EXISTS idx_subscription_orders_order_id ON subscription_orders(order_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_day ON menu_items(day);
CREATE INDEX IF NOT EXISTS idx_site_content_key ON site_content(key);

-- Enable RLS
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancellation_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public read for site content and menu
CREATE POLICY "Public read site_content" ON site_content FOR SELECT USING (true);
CREATE POLICY "Public read menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Public read subscriptions" ON subscriptions FOR SELECT USING (true);
CREATE POLICY "Public read subscription_orders" ON subscription_orders FOR SELECT USING (true);
CREATE POLICY "Public insert subscriptions" ON subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert subscription_orders" ON subscription_orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert contact_submissions" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read contact_submissions" ON contact_submissions FOR SELECT USING (true);
CREATE POLICY "Public read cancellation_requests" ON cancellation_requests FOR SELECT USING (true);
CREATE POLICY "Public insert cancellation_requests" ON cancellation_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update subscriptions" ON subscriptions FOR UPDATE USING (true);
CREATE POLICY "Public update subscription_orders" ON subscription_orders FOR UPDATE USING (true);
CREATE POLICY "Public update menu_items" ON menu_items FOR UPDATE USING (true);
CREATE POLICY "Public update site_content" ON site_content FOR UPDATE USING (true);
CREATE POLICY "Public update contact_submissions" ON contact_submissions FOR UPDATE USING (true);
CREATE POLICY "Public delete menu_items" ON menu_items FOR DELETE USING (true);

-- ============================================
-- SEED DATA
-- ============================================

-- Menu Items (from Menu.csv)
INSERT INTO menu_items (day, appetizer, curry, biryani, egg, naan, price, description, image_url) VALUES
('Monday', 'Chicken Pepper Fry', 'Chicken Curry', 'Chicken Dum Biryani', '1 pc Boiled Egg', '2 pc Naan', 10.00, 'Start your week with our aromatic Chicken Dum Biryani paired with classic Chicken Curry and crispy Chicken Pepper Fry.', '/Mon.png'),
('Tuesday', 'Karampodi Chicken', 'Butter Chicken', 'Tandoori Spl Biryani', '1 pc Boiled Egg', '2 pc Naan', 10.00, 'Treat yourself to our Tandoori Special Biryani with creamy Butter Chicken and spicy Karampodi Chicken.', '/Tue.png'),
('Wednesday', 'Chicken Majestic', 'Chicken Mughlai', 'Chicken Biryani', '1 pc Boiled Egg', '2 pc Naan', 10.00, 'Midweek feast with our Chicken Biryani, rich Chicken Mughlai gravy, and the crowd-favorite Chicken Majestic.', '/Wed.png'),
('Thursday', 'Chicken 555', 'Butter Chicken', 'Chicken Pulav', '1 pc Boiled Egg', '2 pc Naan', 10.00, 'Enjoy our flavorful Chicken Pulav with creamy Butter Chicken and the fiery Chicken 555.', '/Thu.png'),
('Friday', 'Chicken Majestic', 'Butter Chicken', 'Chicken Dum Biryani', '1 pc Boiled Egg', '2 pc Naan', 10.00, 'End the week with our signature Chicken Dum Biryani, luscious Butter Chicken, and crispy Chicken Majestic.', '/Fri.png')
ON CONFLICT DO NOTHING;

-- Site Content
INSERT INTO site_content (key, value, type) VALUES
-- Hero Section
('hero_title', 'The Royale Indian', 'text'),
('hero_subtitle', 'Taste the royal food. Feel the royalty.', 'text'),
('hero_description', 'At Royale Indian, we invite you to experience the true essence of authentic Indian cuisine, where rich traditions meet royal flavors. Every bite is designed to make you taste the royal food and feel the royalty.', 'text'),
('hero_image', '/logo.png', 'image'),
-- About Section
('about_title', 'About The Royale Indian', 'text'),
('about_description', 'At Royale Indian, we invite you to experience the true essence of authentic Indian cuisine, where rich traditions meet royal flavors. Every bite is designed to make you taste the royal food and feel the royalty.', 'text'),
('about_mission', 'Taste the royal food. Feel the royalty. Our mission is to bring the rich traditions and royal flavors of authentic Indian cuisine right to your doorstep, making every meal a celebration of India''s culinary heritage.', 'text'),
('about_image', '/logo.png', 'image'),
-- Menu Section
('menu_title', 'Our Weekly Menu', 'text'),
('menu_subtitle', 'A new culinary experience every day of the week', 'text'),
-- Subscribe Section
('subscribe_title', 'Subscribe to Your Meals', 'text'),
('subscribe_subtitle', 'Choose your days, pick lunch or dinner, and let us handle the rest. Fresh, authentic Indian meals delivered to your door.', 'text'),
-- Contact Section
('contact_title', 'Get In Touch', 'text'),
('contact_subtitle', 'Have questions? We would love to hear from you. Send us a message and we will respond as soon as possible.', 'text'),
('contact_email', 'info@theroyaleindian.com', 'text'),
('contact_phone', '+1 (555) 123-4567', 'text'),
('contact_address', '123 Spice Avenue, Flavor Town, CA 90210', 'text'),
-- Footer
('footer_text', '© 2024 The Royale Indian. All rights reserved.', 'text'),
('footer_tagline', 'Authentic Indian Cuisine, Delivered Fresh Daily', 'text'),
-- Policies
('privacy_policy', E'<h2>Privacy Policy</h2>\n<p><strong>Last updated: January 2024</strong></p>\n<h3>Information We Collect</h3>\n<p>When you subscribe to our meal delivery service, we collect your name, email address, phone number, and delivery address. We also collect payment information through our secure payment processor, Stripe.</p>\n<h3>How We Use Your Information</h3>\n<p>We use your information to process your meal subscriptions, deliver your orders, communicate about your deliveries, and improve our services.</p>\n<h3>Payment Security</h3>\n<p>All payment processing is handled by Stripe. We do not store your credit card information on our servers.</p>\n<h3>Data Sharing</h3>\n<p>We do not sell or share your personal information with third parties except as necessary to provide our delivery service.</p>\n<h3>Contact Us</h3>\n<p>If you have questions about this privacy policy, contact us at info@theroyaleindian.com.</p>', 'html'),
('terms_conditions', E'<h2>Terms and Conditions</h2>\n<p><strong>Last updated: January 2024</strong></p>\n<h3>Service Description</h3>\n<p>The Royale Indian provides a subscription-based Indian meal delivery service. Meals are available Monday through Friday for lunch (1:00 PM) and dinner (7:00 PM).</p>\n<h3>Subscription Terms</h3>\n<p>Subscriptions are activated 24 hours after purchase. You may subscribe to specific days and meal times for a set number of weeks.</p>\n<h3>Pricing</h3>\n<p>Each meal is priced at $10.00 USD. The total subscription cost is calculated as the number of selected meals multiplied by the per-meal price.</p>\n<h3>Delivery</h3>\n<p>Meals are delivered at the scheduled times: Lunch at 1:00 PM and Dinner at 7:00 PM. You must provide a valid delivery address.</p>\n<h3>Cancellation and Refunds</h3>\n<p>Please refer to our Cancellation Policy for details on cancellations and refunds.</p>\n<h3>Changes to Terms</h3>\n<p>We reserve the right to update these terms at any time. Continued use of our service constitutes acceptance of updated terms.</p>', 'html'),
('cancellation_policy', E'<h2>Cancellation Policy</h2>\n<p><strong>Last updated: January 2024</strong></p>\n<h3>Order Cancellation</h3>\n<p>You may cancel individual upcoming meals or all remaining meals in your subscription at any time through our order tracking page.</p>\n<h3>Refund Policy</h3>\n<ul>\n<li><strong>More than 48 hours before delivery:</strong> Full refund of $10.00 per cancelled meal will be credited to your original payment method.</li>\n<li><strong>Less than 48 hours before delivery:</strong> No refund will be issued as the meal preparation has already begun.</li>\n</ul>\n<h3>How to Cancel</h3>\n<p>Visit our order tracking page and enter your Order ID. You will see all upcoming deliveries and can cancel individual meals or all remaining orders.</p>\n<h3>Refund Processing</h3>\n<p>Refunds are processed automatically through Stripe and typically appear in your account within 5-10 business days.</p>\n<h3>Contact Us</h3>\n<p>For any questions regarding cancellations, please contact us at info@theroyaleindian.com.</p>', 'html')
ON CONFLICT (key) DO NOTHING;
fftdy7re8565