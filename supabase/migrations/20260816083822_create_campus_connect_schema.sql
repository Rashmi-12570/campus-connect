/*
# Campus Connect - Full Schema

A campus marketplace + community platform for Indian engineering students.
No-auth (single-tenant, public/shared) app: all data is intentionally public
so anon+authenticated roles have full CRUD.

1. New Tables
- `sellers` — seller profiles (name, whatsapp). Identified by a client-generated UUID stored in localStorage.
- `items` — marketplace listings linked to a seller. Categories: clothes, food, electronics, books_notes, event_tickets, appliances, other. Condition: new, like_new, used, old.
- `seller_ratings` — reviews of a seller (not the item). Sub-ratings: ease, bargaining, quality, honesty, item_quality (each 1-5). Overall = average.
- `lost_found` — lost & found posts. type: lost/found. status: with_me/with_authorities/returned.
- `travel_companions` — travel buddy requests. destination, reason, travel_date, requirements.

2. Storage
- Public bucket `campus-media` for item images, lost-found photos, and travel photos.

3. Security
- RLS enabled on all tables.
- All policies TO anon, authenticated with USING(true)/WITH CHECK(true) — data is intentionally public/shared (no-auth campus app).
- Storage bucket is public with anon upload/read policies.
*/

-- Sellers
CREATE TABLE IF NOT EXISTS sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  whatsapp text NOT NULL,
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_sellers" ON sellers;
CREATE POLICY "anon_select_sellers" ON sellers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_sellers" ON sellers;
CREATE POLICY "anon_insert_sellers" ON sellers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_sellers" ON sellers;
CREATE POLICY "anon_update_sellers" ON sellers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_sellers" ON sellers;
CREATE POLICY "anon_delete_sellers" ON sellers FOR DELETE TO anon, authenticated USING (true);

-- Items
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  price numeric(10,2) NOT NULL,
  category text NOT NULL DEFAULT 'other',
  condition text NOT NULL DEFAULT 'used',
  image_url text,
  status text NOT NULL DEFAULT 'available',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_seller_id ON items(seller_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_items" ON items;
CREATE POLICY "anon_select_items" ON items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_items" ON items;
CREATE POLICY "anon_insert_items" ON items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_items" ON items;
CREATE POLICY "anon_update_items" ON items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_items" ON items;
CREATE POLICY "anon_delete_items" ON items FOR DELETE TO anon, authenticated USING (true);

-- Seller Ratings (review of the SELLER, not the item)
CREATE TABLE IF NOT EXISTS seller_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  reviewer_name text NOT NULL,
  ease_rating int NOT NULL DEFAULT 5,
  bargaining_rating int NOT NULL DEFAULT 5,
  quality_rating int NOT NULL DEFAULT 5,
  honesty_rating int NOT NULL DEFAULT 5,
  item_quality_rating int NOT NULL DEFAULT 5,
  comment text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ratings_seller_id ON seller_ratings(seller_id);

ALTER TABLE seller_ratings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_ratings" ON seller_ratings;
CREATE POLICY "anon_select_ratings" ON seller_ratings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_ratings" ON seller_ratings;
CREATE POLICY "anon_insert_ratings" ON seller_ratings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_ratings" ON seller_ratings;
CREATE POLICY "anon_delete_ratings" ON seller_ratings FOR DELETE TO anon, authenticated USING (true);

-- Lost & Found
CREATE TABLE IF NOT EXISTS lost_found (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL DEFAULT 'found',
  title text NOT NULL,
  description text NOT NULL,
  location text NOT NULL,
  image_url text,
  status text NOT NULL DEFAULT 'with_me',
  contact_name text NOT NULL,
  contact_number text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lost_found_type ON lost_found(type);

ALTER TABLE lost_found ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_lf" ON lost_found;
CREATE POLICY "anon_select_lf" ON lost_found FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_lf" ON lost_found;
CREATE POLICY "anon_insert_lf" ON lost_found FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_lf" ON lost_found;
CREATE POLICY "anon_update_lf" ON lost_found FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_lf" ON lost_found;
CREATE POLICY "anon_delete_lf" ON lost_found FOR DELETE TO anon, authenticated USING (true);

-- Travel Companions
CREATE TABLE IF NOT EXISTS travel_companions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_name text NOT NULL,
  destination text NOT NULL,
  reason text NOT NULL,
  travel_date date,
  requirements text,
  contact_name text NOT NULL,
  contact_number text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE travel_companions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_travel" ON travel_companions;
CREATE POLICY "anon_select_travel" ON travel_companions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_travel" ON travel_companions;
CREATE POLICY "anon_insert_travel" ON travel_companions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_travel" ON travel_companions;
CREATE POLICY "anon_delete_travel" ON travel_companions FOR DELETE TO anon, authenticated USING (true);

-- Storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('campus-media', 'campus-media', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "anon_upload_campus_media" ON storage.objects;
CREATE POLICY "anon_upload_campus_media" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'campus-media');

DROP POLICY IF EXISTS "anon_read_campus_media" ON storage.objects;
CREATE POLICY "anon_read_campus_media" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'campus-media');

DROP POLICY IF EXISTS "anon_delete_campus_media" ON storage.objects;
CREATE POLICY "anon_delete_campus_media" ON storage.objects
  FOR DELETE TO anon, authenticated USING (bucket_id = 'campus-media');