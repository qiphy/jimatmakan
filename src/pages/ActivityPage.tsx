import { Leaf, DollarSign, ShoppingBag, ClipboardList } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

interface TileProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const Tile = ({ icon, label, onClick }: TileProps) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-card border border-border p-5 aspect-square transition-colors hover:bg-secondary/50 active:scale-95"
  >
    <div className="rounded-xl bg-primary/10 p-3">
      {icon}
    </div>
    <span className="text-[11px] font-medium font-display text-foreground text-center leading-tight">{label}</span>
  </button>
);

const ActivityPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isVendor = user?.role === "vendor";

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-4 pt-[env(safe-area-inset-top,12px)] pb-2">
        <h1 className="text-lg font-bold font-display text-foreground">{t("activity")}</h1>
      </header>

      <div className="px-4 py-4 grid grid-cols-2 gap-3">
        <Tile
          icon={<Leaf className="h-6 w-6 text-primary" />}
          label="Sustainability Statistics"
          onClick={() => navigate("/sustainability")}
        />

        {isVendor && (
          <Tile
            icon={<DollarSign className="h-6 w-6 text-primary" />}
            label={t("totalRevenue")}
            onClick={() => navigate("/revenue")}
          />
        )}

        <Tile
          icon={<ClipboardList className="h-6 w-6 text-primary" />}
          label={t("yourOrders")}
          onClick={() => navigate("/orders")}
        />

        <Tile
          icon={<ShoppingBag className="h-6 w-6 text-primary" />}
          label={t("browseListing")}
          onClick={() => navigate("/browse")}
        />
      </div>

      <BottomNav />
    </div>
  );
};

export default ActivityPage;
