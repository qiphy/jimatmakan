import { MapPin, Bell } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import CategoryRow from "@/components/CategoryRow";
import PromoBanner from "@/components/PromoBanner";
import RestaurantList from "@/components/RestaurantList";
import BottomNav from "@/components/BottomNav";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-4 pt-[env(safe-area-inset-top,12px)] pb-1">
        <div>
          <p className="text-xs text-muted-foreground font-body flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Deliver to
          </p>
          <h1 className="text-base font-bold font-display text-foreground">
            123 Main Street
          </h1>
        </div>
        <button className="relative rounded-xl bg-card p-2.5 shadow-card">
          <Bell className="h-5 w-5 text-foreground" />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-background" />
        </button>
      </header>

      <SearchBar />
      <CategoryRow />
      <PromoBanner />
      <RestaurantList />

      <BottomNav />
    </div>
  );
};

export default Index;
