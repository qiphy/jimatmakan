import { Clock, Timer, Recycle } from "lucide-react";
import { useCountdown } from "@/hooks/useCountdown";
import { useLanguage } from "@/contexts/LanguageContext";
import type { FoodListing } from "@/data/listings";

const FoodListingCard = ({ listing }: { listing: FoodListing }) => {
  const { lang, t } = useLanguage();
  const { isExpired, isUrgent, formatted } = useCountdown(listing.expiresAt);

  const name = lang === "ms" ? listing.nameMy : listing.name;
  const discount = Math.round((1 - listing.reducedPrice / listing.originalPrice) * 100);

  return (
    <div
      className={`rounded-xl border bg-card p-4 transition-all ${
        isExpired ? "opacity-70 border-border" : isUrgent ? "border-accent" : "border-border"
      }`}
    >
      <div className="flex gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-secondary text-2xl flex-shrink-0">
          {listing.image}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-semibold text-sm text-card-foreground truncate">
              {name}
            </h3>
            <span className="text-xs font-semibold text-primary bg-secondary px-2 py-0.5 rounded-full flex-shrink-0">
              -{discount}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("listedBy")} {listing.restaurant}
          </p>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-card-foreground">
                RM{listing.reducedPrice}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                RM{listing.originalPrice}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {lang === "ms" ? listing.quantityMy : listing.quantity}
            </span>
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
          <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-muted text-muted-foreground">
            {t("compostClaim")}
          </button>
        ) : (
          <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-primary text-primary-foreground">
            {t("buyNow")}
          </button>
        )}
      </div>
    </div>
  );
};

export default FoodListingCard;
