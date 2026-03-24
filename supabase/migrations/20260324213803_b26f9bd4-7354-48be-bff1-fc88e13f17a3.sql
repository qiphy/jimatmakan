
CREATE OR REPLACE FUNCTION public.decrement_listing_quantity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.listings
  SET quantity = quantity - NEW.quantity,
      updated_at = now()
  WHERE id = NEW.listing_id
    AND quantity >= NEW.quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for listing %', NEW.listing_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_order_decrement_stock
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_listing_quantity();
