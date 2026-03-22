import { MapPin, Bell } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import SearchBar from "@/components/SearchBar";
import CategoryRow from "@/components/CategoryRow";
import HowItWorks from "@/components/HowItWorks";
import ImpactBanner from "@/components/ImpactBanner";
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
      <CategoryRow />
      <ImpactBanner />
      <HowItWorks />
      <FoodListings />

      <BottomNav />
    </div>
  );
};

export default Index;
