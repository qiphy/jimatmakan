import { useState } from "react";
import { MapPin, Leaf, Sprout } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useImpactMetrics } from "@/hooks/useImpactMetrics";
import FoodListingCard from "@/components/FoodListingCard";
import { useListings } from "@/hooks/useListings";
import BottomNav from "@/components/BottomNav";
import LanguageToggle from "@/components/LanguageToggle";
import LocationPicker, { DEFAULT_CENTER } from "@/components/LocationPicker";
import NotificationBell from "@/components/NotificationBell";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface ReorderStore {
  vendorId: string;
  name: string;
  lastItem: string;
  hasActiveListing: boolean;
}

const CATEGORY_EMOJI: Record<string, string> = {
  rice: "🍚", bread: "🫓", vegetables: "🥬", fruits: "🍎",
  meat: "🍗", seafood: "🦐", pastries: "🍡", other: "📦",
};

const Index = () => {
  const { t } = useLanguage();
  const { metrics } = useImpactMetrics();
  const { session } = useAuth();
  const { listings, loading: listingsLoading } = useListings();
  const [reorderStores, setReorderStores] = useState<ReorderStore[]>([]);
  const [reorderLoading, setReorderLoading] = useState(true);
  const [locationOpen, setLocationOpen] = useState(false);
  const [location, setLocation] = useState({ lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1], name: "Kuala Lumpur" });

  // Fetch reorder stores from past orders
  useEffect(() => {
    if (!session?.user) {
      setReorderLoading(false);
      return;
    }

    const fetchReorderStores = async () => {
      const { data: orders } = await supabase
        .from("orders")
        .select("vendor_id, listing_id, created_at")
        .eq("buyer_id", session.user.id)
        .order("created_at", { ascending: false });

      if (!orders || orders.length === 0) {
        setReorderStores([]);
        setReorderLoading(false);
        return;
      }

      // Get unique vendors (most recent first)
      const seen = new Set<string>();
      const uniqueVendorOrders = orders.filter((o) => {
        if (seen.has(o.vendor_id)) return false;
        seen.add(o.vendor_id);
        return true;
      }).slice(0, 5);

      // Fetch vendor profiles
      const vendorIds = uniqueVendorOrders.map((o) => o.vendor_id);
      const listingIds = uniqueVendorOrders.map((o) => o.listing_id);

      const [{ data: profiles }, { data: orderListings }, { data: activeListings }] = await Promise.all([
        supabase.from("profiles").select("id, business_name, full_name").in("id", vendorIds),
        supabase.from("listings").select("id, title").in("id", listingIds),
        supabase.from("listings").select("vendor_id").in("vendor_id", vendorIds).eq("status", "active"),
      ]);

      const profileMap = new Map((profiles || []).map((p) => [p.id, p.business_name || p.full_name]));
      const listingMap = new Map((orderListings || []).map((l) => [l.id, l.title]));
      const activeVendors = new Set((activeListings || []).map((l) => l.vendor_id));

      setReorderStores(
        uniqueVendorOrders.map((o) => ({
          vendorId: o.vendor_id,
          name: profileMap.get(o.vendor_id) || "Vendor",
          lastItem: listingMap.get(o.listing_id) || "Item",
          hasActiveListing: activeVendors.has(o.vendor_id),
        }))
      );
      setReorderLoading(false);
    };

    fetchReorderStores();
  }, [session]);

  // Recent available listings for the home feed
  const now = Date.now();
  const availableListings = listings
    .filter((l) => {
      const end = l.pickup_end ? new Date(l.pickup_end).getTime() : new Date(l.created_at).getTime() + 2 * 3600000;
      return end > now && l.status === "active";
    })
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top,12px)] pb-1">
        <button onClick={() => setLocationOpen(true)} className="text-left">
          <p className="text-[11px] text-muted-foreground font-body flex items-center gap-1">
            <MapPin className="h-3 w-3 text-primary" />
            {t("deliverTo")}
          </p>
          <h1 className="text-lg font-bold font-display text-foreground flex items-center gap-1">
            {location.name}
            <span className="text-xs text-primary">▼</span>
          </h1>
        </button>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <NotificationBell />
        </div>
      </header>

      <LocationPicker
        open={locationOpen}
        onClose={() => setLocationOpen(false)}
        location={location}
        onLocationChange={setLocation}
      />

      {/* Impact Bubble */}
      <div className="px-4 py-3">
        <div className="rounded-2xl bg-primary/10 border border-primary/20 p-5 text-center">
          <Leaf className="h-6 w-6 text-primary mx-auto mb-2" />
          <h2 className="font-display font-bold text-sm text-foreground mb-3">
            {t("impactTitle")}
          </h2>
          <div className="flex justify-center gap-6">
            <div className="rounded-2xl bg-card border border-border px-5 py-3 min-w-[100px]">
              <span className="text-2xl font-bold font-display text-primary block">{metrics.foodSavedKg}</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t("foodSaved")}</p>
            </div>
            <div className="rounded-2xl bg-card border border-border px-5 py-3 min-w-[100px]">
              <span className="text-2xl font-bold font-display text-primary block">{metrics.co2ReducedKg}</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t("co2Reduced")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reorder Section */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-1.5 mb-3">
          <RotateCcw className="h-4 w-4 text-primary" />
          <h2 className="font-display font-bold text-sm text-foreground">
            {t("reorderTitle")}
          </h2>
        </div>

        {reorderLoading ? (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">Loading...</p>
          </div>
        ) : reorderStores.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border p-6 text-center">
            <p className="text-2xl mb-2">🏪</p>
            <p className="text-xs text-muted-foreground font-body">
              {t("noReorderHistory")}
            </p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {reorderStores.map((store) => (
              <button
                key={store.vendorId}
                className={`flex flex-col items-center gap-2 rounded-2xl bg-card border p-4 min-w-[120px] transition-colors ${
                  store.hasActiveListing
                    ? "border-border hover:border-primary/40"
                    : "border-border opacity-60"
                }`}
              >
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-2xl">
                  🏪
                </div>
                <span className="text-xs font-medium text-foreground text-center leading-tight font-body">
                  {store.name}
                </span>
                {store.hasActiveListing ? (
                  <span className="text-[10px] text-muted-foreground">{store.lastItem}</span>
                ) : (
                  <span className="text-[10px] text-accent font-medium">{t("storeUnavailable")}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Recent Available Listings */}
      {!listingsLoading && availableListings.length > 0 && (
        <div className="px-4 py-2">
          <h2 className="font-display font-bold text-sm text-foreground mb-3">
            {t("availableNow")}
          </h2>
          <div className="space-y-3">
            {availableListings.map((listing) => (
              <FoodListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {/* Motivational Bubble */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-3 rounded-2xl bg-secondary border border-border px-5 py-4">
          <Sprout className="h-5 w-5 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground font-body italic leading-relaxed">
            {t("motivationalMsg")}
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
