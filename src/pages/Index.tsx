import { MapPin, Bell, Leaf, Sprout, RotateCcw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import BottomNav from "@/components/BottomNav";
import LanguageToggle from "@/components/LanguageToggle";

const reorderStores = [
  { name: "Restoran Seri Melur", emoji: "🍚", lastOrder: "Nasi Lemak" },
  { name: "Mamak Corner", emoji: "🫓", lastOrder: "Roti Canai" },
  { name: "Grand Seasons Hotel", emoji: "🥬", lastOrder: "Mixed Vegetables" },
];

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

      {/* Impact Bubble */}
      <div className="px-4 py-3">
        <div className="rounded-2xl bg-primary/10 border border-primary/20 p-5 text-center">
          <Leaf className="h-6 w-6 text-primary mx-auto mb-2" />
          <h2 className="font-display font-bold text-sm text-foreground mb-3">
            {t("impactTitle")}
          </h2>
          <div className="flex justify-center gap-6">
            <div className="rounded-2xl bg-card border border-border px-5 py-3 min-w-[100px]">
              <span className="text-2xl font-bold font-display text-primary block">127</span>
              <p className="text-[10px] text-muted-foreground mt-0.5">{t("foodSaved")}</p>
            </div>
            <div className="rounded-2xl bg-card border border-border px-5 py-3 min-w-[100px]">
              <span className="text-2xl font-bold font-display text-primary block">89</span>
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
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {reorderStores.map((store) => (
            <button
              key={store.name}
              className="flex flex-col items-center gap-2 rounded-2xl bg-card border border-border p-4 min-w-[120px] transition-colors hover:border-primary/40"
            >
              <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-2xl">
                {store.emoji}
              </div>
              <span className="text-xs font-medium text-foreground text-center leading-tight font-body">
                {store.name}
              </span>
              <span className="text-[10px] text-muted-foreground">{store.lastOrder}</span>
            </button>
          ))}
        </div>
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
