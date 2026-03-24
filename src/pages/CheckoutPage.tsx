import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, CheckCircle2, Wallet, CreditCard, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";

const CATEGORY_EMOJI: Record<string, string> = {
  rice: "🍚", bread: "🫓", vegetables: "🥬", fruits: "🍎",
  meat: "🍗", seafood: "🦐", pastries: "🍡", other: "📦",
};

type PaymentMethod = "tng" | "card" | "fpx";

const CheckoutPage = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [listing, setListing] = useState<any>(null);
  const [vendorName, setVendorName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [payment, setPayment] = useState<PaymentMethod>("tng");
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!listingId) return;
    (async () => {
      const { data } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .single();
      if (data) {
        setListing(data);
        const { data: profile } = await supabase
          .from("profiles")
          .select("business_name, full_name")
          .eq("id", data.vendor_id)
          .single();
        setVendorName(profile?.business_name || profile?.full_name || "Vendor");
      }
      setLoading(false);
    })();
  }, [listingId]);

  const subtotal = listing ? listing.discounted_price * quantity : 0;
  const savings = listing ? (listing.original_price - listing.discounted_price) * quantity : 0;
  const weightTotal = listing ? listing.weight_kg * quantity : 0;

  const placeOrder = async () => {
    if (!session?.user || !listing) return;
    setPlacing(true);
    const { error } = await supabase.from("orders").insert({
      buyer_id: session.user.id,
      vendor_id: listing.vendor_id,
      listing_id: listing.id,
      quantity,
      weight_kg: weightTotal,
      total_price: subtotal,
      status: "pending",
    });
    setPlacing(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSuccess(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center gap-4">
        <p className="text-muted-foreground">{t("itemUnavailable")}</p>
        <Button onClick={() => navigate("/browse")}>{t("backToBrowse")}</Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center gap-4">
        <CheckCircle2 className="h-16 w-16 text-primary" />
        <h2 className="text-xl font-display font-bold text-foreground">{t("orderPlaced")}</h2>
        <p className="text-muted-foreground text-sm max-w-xs">{t("orderConfirmation")}</p>
        <Button onClick={() => navigate("/orders")} className="mt-4">{t("myOrders")}</Button>
        <Button onClick={() => navigate("/browse")} variant="outline">{t("backToBrowse")}</Button>
        <BottomNav />
      </div>
    );
  }

  const emoji = CATEGORY_EMOJI[listing.category] || "📦";
  const discount = listing.original_price > 0
    ? Math.round((1 - listing.discounted_price / listing.original_price) * 100)
    : 0;

  const paymentOptions: { id: PaymentMethod; label: string; icon: React.ReactNode }[] = [
    { id: "tng", label: t("tngWallet"), icon: <Wallet className="h-4 w-4" /> },
    { id: "card", label: t("creditDebit"), icon: <CreditCard className="h-4 w-4" /> },
    { id: "fpx", label: t("bankTransfer"), icon: <Building2 className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display font-bold text-foreground">{t("checkout")}</h1>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Item card */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-secondary text-2xl flex-shrink-0">
              {listing.image_url ? (
                <img src={listing.image_url} alt={listing.title} className="h-full w-full object-cover rounded-lg" />
              ) : emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-card-foreground truncate">{listing.title}</h3>
              <p className="text-xs text-muted-foreground">{t("listedBy")} {vendorName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-semibold text-card-foreground">RM{listing.discounted_price}/{listing.unit}</span>
                <span className="text-xs text-muted-foreground line-through">RM{listing.original_price}</span>
                {discount > 0 && (
                  <span className="text-xs font-semibold text-primary bg-secondary px-2 py-0.5 rounded-full">-{discount}%</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs text-muted-foreground">{listing.weight_kg} kg/{listing.unit}</span>
                <span className="text-xs font-medium text-primary">{listing.quantity} {t("stockAvailable")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quantity selector */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-card-foreground">{t("quantity")}</p>
            <span className="text-xs text-muted-foreground">{listing.quantity} {t("stockAvailable")}</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-foreground disabled:opacity-40"
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-lg font-semibold text-foreground w-8 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(q => Math.min(listing.quantity, q + 1))}
              className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-foreground disabled:opacity-40"
              disabled={quantity >= listing.quantity}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {t("totalWeight")}: {weightTotal.toFixed(1)} kg
          </p>
        </div>

        {/* Payment */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-card-foreground mb-3">{t("selectPayment")}</p>
          <div className="space-y-2">
            {paymentOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setPayment(opt.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                  payment === opt.id
                    ? "border-primary bg-secondary text-foreground"
                    : "border-border text-muted-foreground"
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <p className="text-sm font-medium text-card-foreground">{t("orderSummary")}</p>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("subtotal")} ({quantity}×)</span>
            <span className="text-foreground font-semibold">RM{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("youSave")}</span>
            <span className="text-primary font-semibold">-RM{savings.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm pt-1 border-t border-border">
            <span className="text-muted-foreground">{t("quantityLabel")}</span>
            <span className="text-foreground">{weightTotal.toFixed(1)} kg</span>
          </div>
        </div>

        {/* Place order */}
        <Button onClick={placeOrder} disabled={placing} className="w-full h-12 text-base font-semibold">
          {placing ? (
            <div className="animate-spin h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
          ) : t("placeOrder")}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default CheckoutPage;
