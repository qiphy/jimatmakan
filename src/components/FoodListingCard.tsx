import { useState } from "react";
import { Timer, Recycle, Loader2, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCountdown } from "@/hooks/useCountdown";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUserLocation } from "@/contexts/UserLocationContext";
import { haversineDistance, formatDistance } from "@/utils/haversine";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { SupabaseListing } from "@/hooks/useListings";

const CATEGORY_EMOJI: Record<string, string> = {
  rice: "🍚",
  bread: "🫓",
  vegetables: "🥬",
  fruits: "🍎",
  meat: "🍗",
  seafood: "🦐",
  pastries: "🍡",
  other: "📦",
};

const FoodListingCard = ({ listing }: { listing: SupabaseListing }) => {
  const { t } = useLanguage();
  const { user, session } = useAuth();
  const { location: userLocation } = useUserLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [claiming, setClaiming] = useState(false);

  const distance = listing.pickup_lat != null && listing.pickup_lng != null
    ? haversineDistance(userLocation.lat, userLocation.lng, listing.pickup_lat, listing.pickup_lng)
    : null;
  const expiresAt = listing.pickup_end ? new Date(listing.pickup_end) : new Date(new Date(listing.created_at).getTime() + 2 * 60 * 60000);
  const { isExpired, isUrgent, formatted } = useCountdown(expiresAt);

  const discount = listing.original_price > 0
    ? Math.round((1 - listing.discounted_price / listing.original_price) * 100)
    : 0;

  const emoji = CATEGORY_EMOJI[listing.category] || "📦";
  const isComposter = user?.role === "composter";

  const handleCompostClaim = async () => {
    if (!session?.user || !isComposter) {
      toast({ title: t("loginRequired"), description: t("compostLoginMsg"), variant: "destructive" });
      return;
    }
    setClaiming(true);
    const { error } = await supabase.from("orders").insert({
      buyer_id: session.user.id,
      vendor_id: listing.vendor_id,
      listing_id: listing.id,
      quantity: listing.quantity,
      weight_kg: listing.weight_kg * listing.quantity,
      total_price: 0,
      status: "pending",
    });
    setClaiming(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("compostClaimSuccess"), description: t("compostClaimSuccessDesc") });
    }
  };

  return (
    <div
      className={`rounded-xl border bg-card p-4 transition-all ${
        isExpired ? "opacity-70 border-border" : isUrgent ? "border-accent" : "border-border"
      }`}
    >
      <div className="flex gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-secondary text-2xl flex-shrink-0">
          {listing.image_url ? (
            <img src={listing.image_url} alt={listing.title} className="h-full w-full object-cover rounded-lg" />
          ) : (
            emoji
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-sm text-card-foreground truncate">
              {listing.title}
            </h3>
            {discount > 0 && (
              <span className="text-xs font-semibold text-primary bg-secondary px-2 py-0.5 rounded-full flex-shrink-0">
                -{discount}%
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            {t("listedBy")} {listing.vendor_name || "Vendor"}
            {distance != null && (
              <span className="inline-flex items-center gap-0.5 text-primary font-medium ml-1">
                <MapPin className="h-3 w-3" />
                {formatDistance(distance)}
              </span>
            )}
          </p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-card-foreground">
                RM{listing.discounted_price}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                RM{listing.original_price}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{listing.weight_kg} kg</span>
              <span className="text-primary font-medium">{listing.quantity} {t("availableNow").toLowerCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timer / Status bar */}
      <div className="mt-3 flex items-center justify-between">
        {isExpired ? (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Recycle className="h-3.5 w-3.5" />
            <span>{t("movedToCompost")}</span>
          </div>
        ) : (
          <div
            className={`flex items-center gap-1.5 text-xs font-medium ${
              isUrgent ? "text-accent" : "text-muted-foreground"
            }`}
          >
            <Timer className={`h-3.5 w-3.5 ${isUrgent ? "animate-pulse" : ""}`} />
            <span>
              {formatted} {t("timeLeft")}
            </span>
          </div>
        )}

        {isExpired ? (
          isComposter ? (
            <button
              onClick={handleCompostClaim}
              disabled={claiming}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground disabled:opacity-50 flex items-center gap-1.5"
            >
              {claiming && <Loader2 className="h-3 w-3 animate-spin" />}
              {t("compostClaim")}
            </button>
          ) : (
            <span className="text-xs font-medium px-3 py-1.5 rounded-lg bg-muted text-muted-foreground">
              {t("compostClaim")}
            </span>
          )
        ) : (
          <button
            onClick={() => navigate(`/checkout/${listing.id}`)}
            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground"
          >
            {t("buyNow")}
          </button>
        )}
      </div>
    </div>
  );
};

export default FoodListingCard;
