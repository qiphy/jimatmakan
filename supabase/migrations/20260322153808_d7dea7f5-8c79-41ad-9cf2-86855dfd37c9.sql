
-- =============================================
-- LISTINGS TABLE
-- =============================================
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'other',
  original_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  discounted_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'item',
  image_url TEXT,
  pickup_address TEXT,
  pickup_start TIMESTAMPTZ,
  pickup_end TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  weight_kg NUMERIC(8,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_listings_vendor ON public.listings(vendor_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_listings_category ON public.listings(category);

-- RLS
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can browse active listings
CREATE POLICY "Anyone can view active listings"
  ON public.listings FOR SELECT
  TO authenticated
  USING (status = 'active' OR vendor_id = auth.uid());

-- Vendors can insert their own listings
CREATE POLICY "Vendors can create listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (vendor_id = auth.uid());

-- Vendors can update their own listings
CREATE POLICY "Vendors can update own listings"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (vendor_id = auth.uid())
  WITH CHECK (vendor_id = auth.uid());

-- Vendors can delete their own listings
CREATE POLICY "Vendors can delete own listings"
  ON public.listings FOR DELETE
  TO authenticated
  USING (vendor_id = auth.uid());

-- =============================================
-- ORDERS TABLE (links buyers to listings)
-- =============================================
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  weight_kg NUMERIC(8,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_orders_buyer ON public.orders(buyer_id);
CREATE INDEX idx_orders_vendor ON public.orders(vendor_id);
CREATE INDEX idx_orders_status ON public.orders(status);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Buyers can see their own orders
CREATE POLICY "Buyers can view own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (buyer_id = auth.uid() OR vendor_id = auth.uid());

-- Buyers can create orders
CREATE POLICY "Buyers can create orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (buyer_id = auth.uid());

-- Participants can update order status
CREATE POLICY "Participants can update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (buyer_id = auth.uid() OR vendor_id = auth.uid())
  WITH CHECK (buyer_id = auth.uid() OR vendor_id = auth.uid());

-- =============================================
-- IMPACT METRICS TABLE (per-user cumulative)
-- =============================================
CREATE TABLE public.impact_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  food_saved_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
  co2_reduced_kg NUMERIC(10,2) NOT NULL DEFAULT 0,
  meals_rescued INTEGER NOT NULL DEFAULT 0,
  money_saved NUMERIC(10,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_impact_user ON public.impact_metrics(user_id);

ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;

-- Users can read their own metrics
CREATE POLICY "Users can view own metrics"
  ON public.impact_metrics FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow upsert for own metrics
CREATE POLICY "Users can insert own metrics"
  ON public.impact_metrics FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own metrics"
  ON public.impact_metrics FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- Auto-update impact metrics when order completes
-- =============================================
CREATE OR REPLACE FUNCTION public.update_impact_on_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status <> 'completed') THEN
    -- Update buyer metrics
    INSERT INTO public.impact_metrics (user_id, food_saved_kg, co2_reduced_kg, meals_rescued, money_saved)
    VALUES (
      NEW.buyer_id,
      NEW.weight_kg,
      NEW.weight_kg * 2.5,
      NEW.quantity,
      (SELECT l.original_price - l.discounted_price FROM public.listings l WHERE l.id = NEW.listing_id) * NEW.quantity
    )
    ON CONFLICT (user_id) DO UPDATE SET
      food_saved_kg = impact_metrics.food_saved_kg + EXCLUDED.food_saved_kg,
      co2_reduced_kg = impact_metrics.co2_reduced_kg + EXCLUDED.co2_reduced_kg,
      meals_rescued = impact_metrics.meals_rescued + EXCLUDED.meals_rescued,
      money_saved = impact_metrics.money_saved + EXCLUDED.money_saved,
      updated_at = now();

    -- Update vendor metrics too
    INSERT INTO public.impact_metrics (user_id, food_saved_kg, co2_reduced_kg, meals_rescued, money_saved)
    VALUES (
      NEW.vendor_id,
      NEW.weight_kg,
      NEW.weight_kg * 2.5,
      NEW.quantity,
      0
    )
    ON CONFLICT (user_id) DO UPDATE SET
      food_saved_kg = impact_metrics.food_saved_kg + EXCLUDED.food_saved_kg,
      co2_reduced_kg = impact_metrics.co2_reduced_kg + EXCLUDED.co2_reduced_kg,
      meals_rescued = impact_metrics.meals_rescued + EXCLUDED.meals_rescued,
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_status_change
  AFTER INSERT OR UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_impact_on_order();
