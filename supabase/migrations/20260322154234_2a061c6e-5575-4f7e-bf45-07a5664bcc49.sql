
-- Seed impact metrics for existing users who don't have rows yet
INSERT INTO public.impact_metrics (user_id, food_saved_kg, co2_reduced_kg, meals_rescued, money_saved)
SELECT id, 0, 0, 0, 0 FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
