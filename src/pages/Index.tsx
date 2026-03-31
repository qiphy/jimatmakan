import { useState } from "react";
import { MapPin, Leaf, Sprout } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserLocation } from "@/contexts/UserLocationContext";
import { useImpactMetrics } from "@/hooks/useImpactMetrics";
import FoodListingCard from "@/components/FoodListingCard";
import { useListings } from "@/hooks/useListings";
import BottomNav from "@/components/BottomNav";
import Chatbot from "@/components/Chatbot";
import LanguageToggle from "@/components/LanguageToggle";
import LocationPicker from "@/components/LocationPicker";
import NotificationBell from "@/components/NotificationBell";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const CATEGORY_EMOJI: Record<string, string> = {
  rice: "🍚", bread: "🫓", vegetables: "🥬", fruits: "🍎",
  meat: "🍗", seafood: "🦐", pastries: "🍡", other: "📦",
};

const Index = () => {
  const { t } = useLanguage();
  const { metrics } = useImpactMetrics();
  const { listings, loading: listingsLoading } = useListings();
  const { location, setLocation } = useUserLocation();
  const [locationOpen, setLocationOpen] = useState(false);

  const now = Date.now();
  const availableListings = listings.filter((l) => {
    const end = l.pickup_end ? new Date(l.pickup_end).getTime() : new Date(l.created_at).getTime() + 2 * 3600000;
    return end > now && l.status === "active";
  });

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

      {/* Current Listings Carousel */}
      <div className="px-4 py-2">
        <h2 className="font-display font-bold text-sm text-foreground mb-3">
          {t("availableNow")}
        </h2>
        {listingsLoading ? (
          <div className="text-center py-4">
            <p className="text-xs text-muted-foreground">Loading...</p>
          </div>
        ) : availableListings.length === 0 ? (
          <div className="rounded-2xl bg-card border border-border p-6 text-center">
            <p className="text-2xl mb-2">🍽️</p>
            <p className="text-xs text-muted-foreground font-body">
              {t("noResults")}
            </p>
          </div>
        ) : (
          <Carousel opts={{ align: "start", loop: availableListings.length > 1 }}>
            <CarouselContent className="-ml-3">
              {availableListings.map((listing) => (
                <CarouselItem key={listing.id} className="pl-3 basis-[85%]">
                  <FoodListingCard listing={listing} />
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}
      </div>

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
