import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ImpactMetrics {
  foodSavedKg: number;
  co2ReducedKg: number;
  mealsRescued: number;
  moneySaved: number;
}

const defaultMetrics: ImpactMetrics = {
  foodSavedKg: 0,
  co2ReducedKg: 0,
  mealsRescued: 0,
  moneySaved: 0,
};

export const useImpactMetrics = () => {
  const { session } = useAuth();
  const [metrics, setMetrics] = useState<ImpactMetrics>(defaultMetrics);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      setMetrics(defaultMetrics);
      setLoading(false);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("impact_metrics")
        .select("food_saved_kg, co2_reduced_kg, meals_rescued, money_saved")
        .eq("user_id", session.user.id)
        .single();

      if (data && !error) {
        setMetrics({
          foodSavedKg: Number(data.food_saved_kg),
          co2ReducedKg: Number(data.co2_reduced_kg),
          mealsRescued: data.meals_rescued,
          moneySaved: Number(data.money_saved),
        });
      }
      setLoading(false);
    };

    fetch();
  }, [session]);

  return { metrics, loading };
};
