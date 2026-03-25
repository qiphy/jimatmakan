import { useState, useRef, useEffect } from "react";
import { Plus, Clock, Trash2, Camera, Sparkles, Loader2, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useListings } from "@/hooks/useListings";
import BottomNav from "@/components/BottomNav";
import LocationPicker, { DEFAULT_CENTER } from "@/components/LocationPicker";
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

const ListItemPage = () => {
  const { t } = useLanguage();
  const { user, session } = useAuth();
  const { listings: myListings, loading, refetch } = useListings(true);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [reducedPrice, setReducedPrice] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setAnalyzing(true);
      toast.info(t("aiAnalyzing"));

      try {
        const { data, error } = await supabase.functions.invoke("analyze-food", {
          body: { imageBase64: base64 },
        });

        if (error) throw error;

        if (data) {
          if (data.title) setName(data.title);
          if (data.category) setCategory(data.category);
          if (data.estimatedOriginalPrice) setOriginalPrice(String(data.estimatedOriginalPrice));
          if (data.estimatedReducedPrice) setReducedPrice(String(data.estimatedReducedPrice));
          if (data.estimatedWeightKg) setWeightKg(String(data.estimatedWeightKg));
          toast.success(t("aiAutofilled"));
        }
      } catch (err: any) {
        console.error("AI analysis error:", err);
        toast.error(err?.message || "Failed to analyze image.");
      } finally {
        setAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!name || !category || !originalPrice || !reducedPrice || !weightKg) {
      toast.error(t("fillAllFields"));
      return;
    }
    if (!session?.user) {
      toast.error("Please log in first.");
      return;
    }

    setSubmitting(true);
    const now = new Date();
    const pickupEnd = new Date(now.getTime() + 2 * 60 * 60000);

    const { error } = await supabase.from("listings").insert({
      title: name,
      category,
      original_price: parseFloat(originalPrice),
      discounted_price: parseFloat(reducedPrice),
      weight_kg: parseFloat(weightKg),
      vendor_id: session.user.id,
      pickup_start: now.toISOString(),
      pickup_end: pickupEnd.toISOString(),
      status: "active",
    });

    setSubmitting(false);

    if (error) {
      console.error("Insert error:", error);
      toast.error("Failed to create listing.");
    } else {
      setName("");
      setCategory("");
      setOriginalPrice("");
      setReducedPrice("");
      setWeightKg("");
      setPreviewUrl(null);
      toast.success(t("listingCreated"));
      refetch();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete listing.");
    } else {
      refetch();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-4 pt-[env(safe-area-inset-top,12px)] pb-2">
        <h1 className="text-lg font-bold font-display text-foreground">{t("addListing")}</h1>
        <p className="text-xs text-muted-foreground font-body">
          {user?.businessName ?? user?.fullName}
        </p>
      </header>

      <div className="px-4 py-3 space-y-3">
        <div className="rounded-2xl bg-card border border-border p-4 space-y-3">

          {/* AI Camera Capture */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCapture}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={analyzing}
            className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 py-5 text-sm font-medium text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {t("aiAnalyzing")}
              </>
            ) : (
              <>
                <Camera className="h-5 w-5" />
                <Sparkles className="h-4 w-4" />
                {t("snapToAutofill")}
              </>
            )}
          </button>

          {/* Image Preview */}
          {previewUrl && (
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img
                src={previewUrl}
                alt="Captured food"
                className="w-full h-40 object-cover"
              />
              {analyzing && (
                <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-primary">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-xs font-medium">{t("aiAnalyzing")}</span>
                  </div>
                </div>
              )}
            </div>
          )}

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

          {/* Weight */}
          <div>
            <label className="text-xs font-medium text-foreground font-body block mb-1">
              {t("quantityLabel")} (kg)
            </label>
            <input
              type="number"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder={t("quantityPlaceholder")}
              className="w-full rounded-xl bg-secondary border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none font-body"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-3 py-2.5">
            <Clock className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-[11px] text-muted-foreground font-body">{t("twoHourNotice")}</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium font-body disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {submitting ? "..." : t("publishListing")}
          </button>
        </div>
      </div>

      {/* Listed items */}
      {loading ? (
        <div className="px-4 py-4 text-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      ) : myListings.length > 0 && (
        <div className="px-4 py-2">
          <h2 className="font-display font-bold text-sm text-foreground mb-3">
            {t("yourListings")}
          </h2>
          <div className="space-y-2">
            {myListings.map((item) => {
              const emoji = categories.find((c) => c.value === item.category)?.emoji ?? "📦";
              const end = item.pickup_end ? new Date(item.pickup_end) : new Date(new Date(item.created_at).getTime() + 2 * 3600000);
              const remaining = Math.max(0, end.getTime() - Date.now());
              const hours = Math.floor(remaining / 3600000);
              const mins = Math.floor((remaining % 3600000) / 60000);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-card border border-border p-3 flex items-center gap-3"
                >
                  <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-lg flex-shrink-0">
                    {emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate font-body">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      RM{item.discounted_price}{" "}
                      <span className="line-through">RM{item.original_price}</span> · {item.weight_kg} kg
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {remaining > 0 ? (
                      <div className="flex items-center gap-1 text-primary">
                        <Clock className="h-3 w-3" />
                        <span className="text-[10px] font-medium">{hours}h {mins}m</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Expired</span>
                    )}
                    <button onClick={() => handleDelete(item.id)} className="p-1 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default ListItemPage;
