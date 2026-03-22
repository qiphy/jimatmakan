import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface MonthlyData {
  month: string;
  foodSaved: number;
  co2Reduced: number;
  revenue: number;
  orders: number;
}

interface RecentSale {
  id: string;
  item: string;
  buyer: string;
  qty: string;
  price: number;
  time: string;
}

export interface ActivityData {
  monthly: MonthlyData[];
  recentSales: RecentSale[];
  totalRevenue: number;
  totalOrders: number;
  totalFood: number;
  totalCO2: number;
  loading: boolean;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export const useActivityData = () => {
  const { session, user } = useAuth();
  const [data, setData] = useState<ActivityData>({
    monthly: [],
    recentSales: [],
    totalRevenue: 0,
    totalOrders: 0,
    totalFood: 0,
    totalCO2: 0,
    loading: true,
  });

  useEffect(() => {
    if (!session?.user) {
      setData((d) => ({ ...d, loading: false }));
      return;
    }

    const userId = session.user.id;
    const isVendor = user?.role === "vendor";

    const fetchData = async () => {
      // Fetch impact metrics
      const { data: impact } = await supabase
        .from("impact_metrics")
        .select("food_saved_kg, co2_reduced_kg")
        .eq("user_id", userId)
        .single();

      // Fetch orders for this user (as buyer or vendor)
      const { data: orders } = await supabase
        .from("orders")
        .select("id, total_price, weight_kg, quantity, status, created_at, listing_id, buyer_id, vendor_id")
        .or(isVendor ? `vendor_id.eq.${userId}` : `buyer_id.eq.${userId}`)
        .order("created_at", { ascending: true });

      const allOrders = orders || [];

      // Build monthly aggregation
      const monthMap = new Map<string, MonthlyData>();
      for (const order of allOrders) {
        const d = new Date(order.created_at);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        const label = MONTH_NAMES[d.getMonth()];
        if (!monthMap.has(key)) {
          monthMap.set(key, { month: label, foodSaved: 0, co2Reduced: 0, revenue: 0, orders: 0 });
        }
        const m = monthMap.get(key)!;
        m.foodSaved += Number(order.weight_kg);
        m.co2Reduced += Number(order.weight_kg) * 2.5;
        m.revenue += Number(order.total_price);
        m.orders += 1;
      }
      const monthly = Array.from(monthMap.values());

      // Recent sales (vendor only, last 10)
      let recentSales: RecentSale[] = [];
      if (isVendor) {
        const recentOrders = allOrders.slice(-10).reverse();
        // Fetch listing titles for these orders
        const listingIds = [...new Set(recentOrders.map((o) => o.listing_id))];
        const { data: listings } = listingIds.length
          ? await supabase.from("listings").select("id, title").in("id", listingIds)
          : { data: [] };
        const listingMap = new Map((listings || []).map((l) => [l.id, l.title]));

        // Fetch buyer names
        const buyerIds = [...new Set(recentOrders.map((o) => o.buyer_id))];
        const { data: profiles } = buyerIds.length
          ? await supabase.from("profiles").select("id, full_name").in("id", buyerIds)
          : { data: [] };
        const profileMap = new Map((profiles || []).map((p) => [p.id, p.full_name]));

        recentSales = recentOrders.map((o) => ({
          id: o.id,
          item: listingMap.get(o.listing_id) || "Item",
          buyer: profileMap.get(o.buyer_id) || "Buyer",
          qty: `${o.weight_kg} kg`,
          price: Number(o.total_price),
          time: timeAgo(o.created_at),
        }));
      }

      const totalRevenue = allOrders.reduce((s, o) => s + Number(o.total_price), 0);
      const totalOrders = allOrders.length;

      setData({
        monthly,
        recentSales,
        totalRevenue,
        totalOrders,
        totalFood: Number(impact?.food_saved_kg || 0),
        totalCO2: Number(impact?.co2_reduced_kg || 0),
        loading: false,
      });
    };

    fetchData();
  }, [session, user]);

  return data;
};
