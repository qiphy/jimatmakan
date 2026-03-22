import { Home, Search, PlusCircle, Activity, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNavigate, useLocation } from "react-router-dom";

const BottomNav = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { icon: Home, label: t("home"), path: "/" },
    { icon: Search, label: t("browse"), path: "/" },
    { icon: PlusCircle, label: t("addListing"), path: "/", accent: true },
    { icon: Activity, label: t("activity"), path: "/" },
    { icon: User, label: t("profile"), path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2 pb-[env(safe-area-inset-bottom,8px)]">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 ${
                isActive
                  ? "text-primary"
                  : tab.accent
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <tab.icon
                className={`h-5 w-5 ${tab.accent ? "h-6 w-6" : ""}`}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className="text-[10px] font-medium font-body">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
