import { Home, Search, ShoppingBag, Heart, User } from "lucide-react";

const tabs = [
  { icon: Home, label: "Home", active: true },
  { icon: Search, label: "Browse" },
  { icon: ShoppingBag, label: "Orders" },
  { icon: Heart, label: "Favorites" },
  { icon: User, label: "Profile" },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2 pb-[env(safe-area-inset-bottom,8px)]">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
              tab.active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <tab.icon
              className={`h-5 w-5 ${tab.active ? "fill-primary" : ""}`}
              strokeWidth={tab.active ? 2.5 : 1.8}
            />
            <span className="text-[10px] font-medium font-body">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
