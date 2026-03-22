import { useState } from "react";
import { Plus, Clock, Package } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

const categories = [
  { key: "rice" as const, emoji: "🍚", value: "rice" },
  { key: "bread" as const, emoji: "🫓", value: "bread" },
  { key: "vegetables" as const, emoji: "🥬", value: "vegetables" },
  { key: "fruits" as const, emoji: "🍎", value: "fruits" },
  { key: "meat" as const, emoji: "🍗", value: "meat" },
  { key: "seafood" as const, emoji: "🦐", value: "seafood" },
  { key: "pastries" as const, emoji: "🍡", value: "pastries" },
];

interface ListedItem {
  id: string;
  name: string;
  category: string;
  originalPrice: number;
  reducedPrice: number;
  quantity: string;
  listedAt: Date;
}

const ListItemPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [reducedPrice, setReducedPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [listedItems, setListedItems] = useState<ListedItem[]>([]);

  const handleSubmit = () => {
    if (!name || !category || !originalPrice || !reducedPrice || !quantity) {
      toast.error(t("fillAllFields"));
      return;
    }
    const newItem: ListedItem = {
      id: Date.now().toString(),
      name,
      category,
      originalPrice: parseFloat(originalPrice),
      reducedPrice: parseFloat(reducedPrice),
      quantity,
      listedAt: new Date(),
    };
    setListedItems((prev) => [newItem, ...prev]);
    setName("");
    setCategory("");
    setOriginalPrice("");
    setReducedPrice("");
    setQuantity("");
    toast.success(t("listingCreated"));
  };

  const categoryEmoji = categories.find((c) => c.value === category)?.emoji ?? "📦";

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-4 pt-[env(safe-area-inset-top,12px)] pb-2">
        <h1 className="text-lg font-bold font-display text-foreground">{t("addListing")}</h1>
        <p className="text-xs text-muted-foreground font-body">
          {user?.businessName ?? user?.fullName}
        </p>
      </header>

      {/* Form */}
      <div className="px-4 py-3 space-y-3">
        <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
          {/* Item name */}
          <div>
            <label className="text-xs font-medium text-foreground font-body block mb-1">
              {t("itemName")}
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("itemNamePlaceholder")}
              className="w-full rounded-xl bg-secondary border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none font-body"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-medium text-foreground font-body block mb-1.5">
              {t("categories")}
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                    category === cat.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary border border-border text-foreground"
                  }`}
                >
                  <span>{cat.emoji}</span>
                  {t(cat.key)}
                </button>
              ))}
            </div>
          </div>

          {/* Prices */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-foreground font-body block mb-1">
                {t("originalPrice")} (RM)
              </label>
              <input
                type="number"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl bg-secondary border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none font-body"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-foreground font-body block mb-1">
                {t("priceReduced")} (RM)
              </label>
              <input
                type="number"
                value={reducedPrice}
                onChange={(e) => setReducedPrice(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl bg-secondary border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none font-body"
              />
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="text-xs font-medium text-foreground font-body block mb-1">
              {t("quantityLabel")}
            </label>
            <input
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={t("quantityPlaceholder")}
              className="w-full rounded-xl bg-secondary border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none font-body"
            />
          </div>

          {/* 2-hour notice */}
          <div className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-3 py-2.5">
            <Clock className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-[11px] text-muted-foreground font-body">{t("twoHourNotice")}</p>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium font-body"
          >
            <Plus className="h-4 w-4" />
            {t("publishListing")}
          </button>
        </div>
      </div>

      {/* Listed items */}
      {listedItems.length > 0 && (
        <div className="px-4 py-2">
          <h2 className="font-display font-bold text-sm text-foreground mb-3">
            {t("yourListings")}
          </h2>
          <div className="space-y-2">
            {listedItems.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-card border border-border p-3 flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-lg flex-shrink-0">
                  {categories.find((c) => c.value === item.category)?.emoji ?? "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate font-body">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    RM{item.reducedPrice}{" "}
                    <span className="line-through">RM{item.originalPrice}</span> · {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-primary">
                  <Clock className="h-3 w-3" />
                  <span className="text-[10px] font-medium">2h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default ListItemPage;
