import { MapPin, Bell, Leaf, Sprout } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import SearchBar from "@/components/SearchBar";
import FoodListings from "@/components/FoodListings";
import BottomNav from "@/components/BottomNav";
import LanguageToggle from "@/components/LanguageToggle";

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top,12px)] pb-1">
        <div>
          <p className="text-[11px] text-muted-foreground font-body flex items-center gap-1">
            <MapPin className="h-3 w-3 text-primary" />
            {t("deliverTo")}
          </p>
          <h1 className="text-lg font-bold font-display text-foreground">
            {t("appName")}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <button className="relative rounded-xl bg-card border border-border p-2">
            <Bell className="h-4 w-4 text-foreground" />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
          </button>
        </div>
      </header>

      <SearchBar />

      {/* Impact Bar */}
      <div className="px-4 py-2">
        <div className="flex items-center gap-3 rounded-xl bg-primary/10 border border-primary/20 px-4 py-3">
          <Leaf className="h-5 w-5 text-primary flex-shrink-0" />
          <div className="flex items-center gap-4 flex-1">
            <div>
              <span className="text-lg font-bold font-display text-primary">127</span>
              <p className="text-[10px] text-muted-foreground leading-tight">{t("foodSaved")}</p>
            </div>
            <div className="w-px h-8 bg-border" />
            <div>
              <span className="text-lg font-bold font-display text-primary">89</span>
              <p className="text-[10px] text-muted-foreground leading-tight">{t("co2Reduced")}</p>
            </div>
          </div>
        </div>
      </div>

      <FoodListings />

      {/* Motivational message */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2 rounded-xl bg-secondary border border-border px-4 py-3">
          <Sprout className="h-4 w-4 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground font-body italic">
            {t("motivationalMsg")}
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Index;
