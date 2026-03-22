import { useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import FoodListingCard from "@/components/FoodListingCard";
import { getListings } from "@/data/listings";

const FoodListings = () => {
  const { t } = useLanguage();
  const listings = useMemo(() => getListings(), []);

  const available = listings.filter((l) => l.expiresAt.getTime() > Date.now());
  const expired = listings.filter((l) => l.expiresAt.getTime() <= Date.now());

  return (
    <div className="px-4 py-3 space-y-4">
      {/* Available listings */}
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

      {/* Expired → Composting */}
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
    </div>
  );
};

export default FoodListings;
