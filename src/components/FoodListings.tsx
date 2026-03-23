import { useLanguage } from "@/contexts/LanguageContext";
import FoodListingCard from "@/components/FoodListingCard";
import { useListings } from "@/hooks/useListings";

const FoodListings = () => {
  const { t } = useLanguage();
  const { listings, loading } = useListings();

  if (loading) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const now = Date.now();
  const available = listings.filter((l) => {
    const end = l.pickup_end ? new Date(l.pickup_end).getTime() : new Date(l.created_at).getTime() + 2 * 3600000;
    return end > now && l.status === "active";
  });
  const expired = listings.filter((l) => {
    const end = l.pickup_end ? new Date(l.pickup_end).getTime() : new Date(l.created_at).getTime() + 2 * 3600000;
    return end <= now || l.status !== "active";
  });

  return (
    <div className="px-4 py-3 space-y-4">
      {available.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-base text-foreground">
              {t("availableNow")}
            </h2>
            <button className="text-xs font-medium text-primary">{t("seeAll")}</button>
          </div>
          <div className="space-y-3">
            {available.map((listing) => (
              <FoodListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {expired.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-bold text-base text-foreground">
              {t("forComposting")}
            </h2>
          </div>
          <div className="space-y-3">
            {expired.map((listing) => (
              <FoodListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {listings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-3xl mb-2">🍽️</p>
          <p className="text-sm text-muted-foreground">{t("noResults")}</p>
        </div>
      )}
    </div>
  );
};

export default FoodListings;
