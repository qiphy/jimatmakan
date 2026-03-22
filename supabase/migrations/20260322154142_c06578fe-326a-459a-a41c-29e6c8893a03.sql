
-- Auto-create impact_metrics row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user_impact()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.impact_metrics (user_id, food_saved_kg, co2_reduced_kg, meals_rescued, money_saved)
  VALUES (NEW.id, 0, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_impact
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_impact();
