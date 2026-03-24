import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Package, MapPin, Clock, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface OrderWithDetails {
  id: string;
  quantity: number;
  total_price: number;
  weight_kg: number;
  status: string;
  created_at: string;
  listing_title: string;
  vendor_name: string;
  pickup_address: string | null;
  pickup_lat: number | null;
  pickup_lng: number | null;
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  pending: { icon: <Clock className="h-4 w-4" />, color: "text-accent" },
  completed: { icon: <CheckCircle2 className="h-4 w-4" />, color: "text-primary" },
  cancelled: { icon: <XCircle className="h-4 w-4" />, color: "text-destructive" },
};

const KL_CENTER = { lat: 3.139, lng: 101.6869 };

const PickupMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const map = L.map(mapRef.current, {
      center: [lat, lng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

    const icon = L.divIcon({
      html: `<div style="background:hsl(152,55%,42%);width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
      className: "",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    L.marker([lat, lng], { icon }).addTo(map);

    return () => { map.remove(); };
  }, [lat, lng]);

  return <div ref={mapRef} className="h-32 w-full rounded-lg overflow-hidden" />;
};

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmOrderId, setConfirmOrderId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    (async () => {
      const { data: rawOrders } = await supabase
        .from("orders")
        .select("id, quantity, total_price, weight_kg, status, created_at, listing_id, vendor_id")
        .eq("buyer_id", session.user.id)
        .order("created_at", { ascending: false });

      if (!rawOrders || rawOrders.length === 0) {
        setLoading(false);
        return;
      }

      const listingIds = [...new Set(rawOrders.map((o) => o.listing_id))];
      const vendorIds = [...new Set(rawOrders.map((o) => o.vendor_id))];

      const [{ data: listings }, { data: vendors }] = await Promise.all([
        supabase.from("listings").select("id, title, pickup_address").in("id", listingIds),
        supabase.from("profiles").select("id, business_name, full_name").in("id", vendorIds),
      ]);

      const listingMap = Object.fromEntries((listings || []).map((l) => [l.id, l]));
      const vendorMap = Object.fromEntries((vendors || []).map((v) => [v.id, v]));

      setOrders(
        rawOrders.map((o) => ({
          id: o.id,
          quantity: o.quantity,
          total_price: o.total_price,
          weight_kg: o.weight_kg,
          status: o.status,
          created_at: o.created_at,
          listing_title: listingMap[o.listing_id]?.title || "Unknown Item",
          vendor_name: vendorMap[o.vendor_id]?.business_name || vendorMap[o.vendor_id]?.full_name || "Vendor",
          pickup_address: listingMap[o.listing_id]?.pickup_address || null,
          pickup_lat: KL_CENTER.lat + (Math.random() - 0.5) * 0.01,
          pickup_lng: KL_CENTER.lng + (Math.random() - 0.5) * 0.01,
        }))
      );
      setLoading(false);
    })();
  }, [session]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-MY", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display font-bold text-foreground">{t("myOrders")}</h1>
      </div>

      <div className="p-4 space-y-3 max-w-lg mx-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Package className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground text-sm">{t("noOrdersYet")}</p>
          </div>
        ) : (
          orders.map((order) => {
            const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const isExpanded = expandedId === order.id;

            return (
              <div
                key={order.id}
                className="rounded-xl border border-border bg-card overflow-hidden transition-all"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-sm text-card-foreground truncate">
                        {order.listing_title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{order.vendor_name}</p>
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${cfg.color}`}>
                      {cfg.icon}
                      <span className="capitalize">{t(order.status as any)}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold text-card-foreground">
                      RM{order.total_price.toFixed(2)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {order.quantity}× · {order.weight_kg} kg · {formatDate(order.created_at)}
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-card-foreground">{t("pickupLocation")}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.pickup_address || t("contactVendor")}
                        </p>
                      </div>
                    </div>
                    {order.pickup_lat && order.pickup_lng && (
                      <PickupMap lat={order.pickup_lat} lng={order.pickup_lng} />
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MyOrdersPage;
