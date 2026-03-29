import { useEffect, useState } from "react";
import { Bell, DollarSign, ShoppingBag, Leaf, TrendingDown, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  path: string;
}

const NotificationBell = () => {
  const { t } = useLanguage();
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!session?.user || !user) return;

    const buildNotifications = async () => {
      const items: Notification[] = [];
      const userId = session.user.id;
      const isVendor = user.role === "vendor";
      const isComposter = user.role === "composter";

      if (isVendor) {
        // Vendor: total earnings & pending orders
        const [{ data: orders }, { data: impact }] = await Promise.all([
          supabase
            .from("orders")
            .select("id, total_price, status")
            .eq("vendor_id", userId),
          supabase
            .from("impact_metrics")
            .select("food_saved_kg, co2_reduced_kg")
            .eq("user_id", userId)
            .single(),
        ]);

        const allOrders = orders || [];
        const totalEarnings = allOrders.reduce((s, o) => s + Number(o.total_price), 0);
        const pendingCount = allOrders.filter((o) => o.status === "pending").length;

        if (totalEarnings > 0) {
          items.push({
            id: "vendor-earnings",
            icon: <DollarSign className="h-4 w-4 text-primary" />,
            title: `RM${totalEarnings.toFixed(2)} ${t("notifTotalEarnings")}`,
            description: t("notifViewActivity"),
            path: "/revenue",
          });
        }

        if (pendingCount > 0) {
          items.push({
            id: "vendor-pending",
            icon: <Package className="h-4 w-4 text-primary" />,
            title: `${pendingCount} ${t("notifPendingOrders")}`,
            description: t("notifCheckOrders"),
            path: "/orders",
          });
        }

        if (impact) {
          items.push({
            id: "vendor-impact",
            icon: <Leaf className="h-4 w-4 text-primary" />,
            title: `${Number(impact.food_saved_kg).toFixed(1)}kg ${t("notifFoodRescued")}`,
            description: t("notifViewImpact"),
            path: "/sustainability",
          });
        }
      } else if (isComposter) {
        // Composter: impact metrics
        const { data: impact } = await supabase
          .from("impact_metrics")
          .select("food_saved_kg, co2_reduced_kg")
          .eq("user_id", userId)
          .single();

        if (impact) {
          items.push({
            id: "composter-food",
            icon: <Leaf className="h-4 w-4 text-primary" />,
            title: `${Number(impact.food_saved_kg).toFixed(1)}kg ${t("notifFoodRescued")}`,
            description: t("notifViewImpact"),
            path: "/sustainability",
          });
          items.push({
            id: "composter-co2",
            icon: <TrendingDown className="h-4 w-4 text-primary" />,
            title: `${Number(impact.co2_reduced_kg).toFixed(1)}kg ${t("notifCO2Saved")}`,
            description: t("notifViewActivity"),
            path: "/sustainability",
          });
        }
      } else {
        // Regular user (student): orders & savings
        const [{ data: orders }, { data: impact }] = await Promise.all([
          supabase
            .from("orders")
            .select("id, status")
            .eq("buyer_id", userId),
          supabase
            .from("impact_metrics")
            .select("money_saved, meals_rescued")
            .eq("user_id", userId)
            .single(),
        ]);

        const pendingOrders = (orders || []).filter((o) => o.status === "pending").length;
        const completedOrders = (orders || []).filter((o) => o.status === "completed").length;

        if (pendingOrders > 0) {
          items.push({
            id: "user-pending",
            icon: <ShoppingBag className="h-4 w-4 text-primary" />,
            title: `${pendingOrders} ${t("notifPendingPickup")}`,
            description: t("notifGoToOrders"),
            path: "/my-orders",
          });
        }

        if (completedOrders > 0) {
          items.push({
            id: "user-completed",
            icon: <Package className="h-4 w-4 text-primary" />,
            title: `${completedOrders} ${t("notifOrdersCompleted")}`,
            description: t("notifViewActivity"),
            path: "/activity",
          });
        }

        if (impact && Number(impact.money_saved) > 0) {
          items.push({
            id: "user-savings",
            icon: <DollarSign className="h-4 w-4 text-primary" />,
            title: `RM${Number(impact.money_saved).toFixed(2)} ${t("notifSaved")}`,
            description: t("notifKeepSaving"),
            path: "/activity",
          });
        }
      }

      setNotifications(items);
    };

    buildNotifications();
  }, [session, user, t]);

  const handleClick = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative rounded-xl bg-card border border-border p-2">
          <Bell className="h-4 w-4 text-foreground" />
          {notifications.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-display font-bold text-sm text-foreground">{t("notifications")}</h3>
        </div>
        {notifications.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-xs text-muted-foreground">{t("noNotifications")}</p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto">
            {notifications.map((notif) => (
              <button
                key={notif.id}
                onClick={() => handleClick(notif.path)}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-secondary/50 transition-colors text-left border-b border-border last:border-b-0"
              >
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {notif.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground font-body leading-tight">{notif.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{notif.description}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
