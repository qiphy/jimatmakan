import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Clock, CheckCircle2, XCircle, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface OrderItem {
  id: string;
  listing_title: string;
  vendor_name: string;
  total_price: number;
  quantity: number;
  weight_kg: number;
  status: string;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  pending: { icon: <Clock className="h-3.5 w-3.5" />, color: "text-accent", bg: "bg-accent/10" },
  completed: { icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: "text-primary", bg: "bg-primary/10" },
  cancelled: { icon: <XCircle className="h-3.5 w-3.5" />, color: "text-destructive", bg: "bg-destructive/10" },
};

const ActivityOrderStatus = () => {
  const { session } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      const { data: rawOrders } = await supabase
        .from("orders")
        .select("id, quantity, total_price, weight_kg, status, created_at, listing_id, vendor_id")
        .eq("buyer_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (!rawOrders || rawOrders.length === 0) {
        setLoading(false);
        return;
      }

      const listingIds = [...new Set(rawOrders.map((o) => o.listing_id))];
      const vendorIds = [...new Set(rawOrders.map((o) => o.vendor_id))];

      const [{ data: listings }, { data: vendors }] = await Promise.all([
        supabase.from("listings").select("id, title").in("id", listingIds),
        supabase.from("vendor_public_info").select("id, business_name, full_name").in("id", vendorIds),
      ]);

      const listingMap = Object.fromEntries((listings || []).map((l) => [l.id, l.title]));
      const vendorMap = Object.fromEntries((vendors || []).map((v) => [v.id, v.business_name || v.full_name]));

      setOrders(
        rawOrders.map((o) => ({
          id: o.id,
          listing_title: listingMap[o.listing_id] || "Item",
          vendor_name: vendorMap[o.vendor_id] || "Vendor",
          total_price: o.total_price,
          quantity: o.quantity,
          weight_kg: o.weight_kg,
          status: o.status,
          created_at: o.created_at,
        }))
      );
      setLoading(false);
    })();
  }, [session]);

  if (loading) return null;
  if (orders.length === 0) return null;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-MY", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="px-4 py-2">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-sm text-foreground">{t("yourOrders")}</h2>
        <button
          onClick={() => navigate("/orders")}
          className="text-xs text-primary font-medium flex items-center gap-0.5"
        >
          {t("viewAllOrders")}
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="space-y-2">
        {orders.map((order) => {
          const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
          return (
            <button
              key={order.id}
              onClick={() => navigate("/orders")}
              className="w-full rounded-2xl bg-card border border-border p-3 flex items-center gap-3 text-left transition-colors hover:bg-muted/50"
            >
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Package className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate font-body">{order.listing_title}</p>
                <p className="text-[11px] text-muted-foreground">{order.vendor_name} · {order.quantity}× · {order.weight_kg} kg</p>
              </div>
              <div className="text-right flex-shrink-0 space-y-0.5">
                <p className="text-sm font-bold text-primary font-display">RM{order.total_price.toFixed(2)}</p>
                <div className={`inline-flex items-center gap-1 text-[10px] font-medium ${cfg.color} ${cfg.bg} px-1.5 py-0.5 rounded-full`}>
                  {cfg.icon}
                  <span className="capitalize">{t(order.status as any)}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityOrderStatus;
