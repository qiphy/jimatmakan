import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useUserLocation } from "@/contexts/UserLocationContext";
import { haversineDistance } from "@/utils/haversine";
import FoodListingCard from "@/components/FoodListingCard";
import BottomNav from "@/components/BottomNav";
import { useListings, type SupabaseListing } from "@/hooks/useListings";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const categories = [
  { key: "allCategories" as const, emoji: "🍽️", value: "all" },
  { key: "rice" as const, emoji: "🍚", value: "rice" },
  { key: "bread" as const, emoji: "🫓", value: "bread" },
  { key: "vegetables" as const, emoji: "🥬", value: "vegetables" },
  { key: "fruits" as const, emoji: "🍎", value: "fruits" },
  { key: "meat" as const, emoji: "🍗", value: "meat" },
  { key: "seafood" as const, emoji: "🦐", value: "seafood" },
  { key: "pastries" as const, emoji: "🍡", value: "pastries" },
];

const dietaryOptions = [
  { key: "halal", label: "Halal", emoji: "🕌" },
  { key: "vegetarian", label: "Vegetarian", emoji: "🥗" },
  { key: "vegan", label: "Vegan", emoji: "🌱" },
];

const fuzzyMatch = (text: string, query: string): number => {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (t.includes(q)) return 3;
  const words = t.split(/\s+/);
  if (words.some((w) => w.startsWith(q))) return 2;
  let qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  if (qi === q.length) return 1;
  return 0;
};

const getRelevance = (listing: SupabaseListing, query: string): number => {
  if (!query) return 1;
  const nameScore = fuzzyMatch(listing.title, query);
  const vendorScore = fuzzyMatch(listing.vendor_name || "", query);
  const categoryScore = fuzzyMatch(listing.category, query);
  return Math.max(nameScore, vendorScore * 0.8, categoryScore * 0.6);
};

const BrowsePage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { location: userLocation } = useUserLocation();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [maxDistance, setMaxDistance] = useState(50); // km
  const [maxPrice, setMaxPrice] = useState(100); // RM
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const { listings, loading } = useListings();
  const showComposting = user?.role === "vendor" || user?.role === "composter";

  const activeFilterCount = (maxDistance < 50 ? 1 : 0) + (maxPrice < 100 ? 1 : 0) + (selectedDietary.length > 0 ? 1 : 0);

  const toggleDietary = (key: string) => {
    setSelectedDietary((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  };

  const clearFilters = () => {
    setMaxDistance(50);
    setMaxPrice(100);
    setSelectedDietary([]);
  };

  const filtered = useMemo(() => {
    let results = listings;

    if (activeCategory !== "all") {
      results = results.filter((l) => l.category === activeCategory);
    }

    // Distance filter
    if (maxDistance < 50) {
      results = results.filter((l) => {
        if (l.pickup_lat == null || l.pickup_lng == null) return true;
        const dist = haversineDistance(userLocation.lat, userLocation.lng, l.pickup_lat, l.pickup_lng);
        return dist <= maxDistance;
      });
    }

    // Price filter
    if (maxPrice < 100) {
      results = results.filter((l) => l.discounted_price <= maxPrice);
    }

    // Dietary filter — match against category/title/description keywords
    if (selectedDietary.length > 0) {
      results = results.filter((l) => {
        const text = `${l.title} ${l.description || ""} ${l.category}`.toLowerCase();
        return selectedDietary.every((d) => {
          if (d === "vegetarian") return ["vegetables", "fruits", "bread", "pastries", "rice"].includes(l.category) || text.includes("vegetarian");
          if (d === "vegan") return ["vegetables", "fruits"].includes(l.category) || text.includes("vegan");
          if (d === "halal") return text.includes("halal");
          return true;
        });
      });
    }

    if (query.trim()) {
      const scored = results
        .map((l) => ({ listing: l, score: getRelevance(l, query.trim()) }))
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score);
      results = scored.map((r) => r.listing);
    }

    return results;
  }, [listings, query, activeCategory, maxDistance, maxPrice, selectedDietary, userLocation]);

  const now = Date.now();
  const available = filtered.filter((l) => {
    const end = l.pickup_end ? new Date(l.pickup_end).getTime() : new Date(l.created_at).getTime() + 2 * 3600000;
    return end > now && l.status === "active" && l.quantity > 0;
  });
  const expired = filtered.filter((l) => {
    const end = l.pickup_end ? new Date(l.pickup_end).getTime() : new Date(l.created_at).getTime() + 2 * 3600000;
    return end <= now || l.status !== "active";
  });

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-4 pt-[env(safe-area-inset-top,12px)] pb-2">
        <h1 className="text-lg font-bold font-display text-foreground">{t("browse")}</h1>
      </header>

      <div className="px-4 py-2">
        <div className="flex items-center gap-2 rounded-xl bg-card border border-border px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-body"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-0.5">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
          <button className="rounded-lg bg-secondary p-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5 text-foreground" />
          </button>
        </div>
      </div>

      <div className="px-4 py-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-foreground"
              }`}
            >
              <span>{cat.emoji}</span>
              {t(cat.key)}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">🔍</p>
            <p className="text-sm text-muted-foreground font-body">{t("noResults")}</p>
          </div>
        ) : (
          <>
            {available.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-base text-foreground mb-3">
                  {t("availableNow")} ({available.length})
                </h2>
                <div className="space-y-3">
                  {available.map((listing) => (
                    <FoodListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </div>
            )}
            {showComposting && expired.length > 0 && (
              <div>
                <h2 className="font-display font-bold text-base text-foreground mb-3">
                  {t("forComposting")} ({expired.length})
                </h2>
                <div className="space-y-3">
                  {expired.map((listing) => (
                    <FoodListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default BrowsePage;
