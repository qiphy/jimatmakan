import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, CheckCircle2, Wallet, CreditCard, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";

const CATEGORY_EMOJI: Record<string, string> = {
  rice: "🍚", bread: "🫓", vegetables: "🥬", fruits: "🍎",
  meat: "🍗", seafood: "🦐", pastries: "🍡", other: "📦",
};

const PAYMENT_ICON: Record<string, React.ReactNode> = {
  tng: <Wallet className="h-4 w-4" />,
  card: <CreditCard className="h-4 w-4" />,
  fpx: <Building2 className="h-4 w-4" />,
};

const CheckoutPage = () => {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [listing, setListing] = useState<any>(null);
  const [vendorName, setVendorName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { methods: savedPayments } = usePaymentMethods();
  const [payment, setPayment] = useState<string | null>(null);
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

  const maxQty = listing ? listing.quantity : 1;
  const unitWeight = listing ? listing.weight_kg : 0;
  const totalWeight = unitWeight * quantity;
  const subtotal = listing ? listing.discounted_price * quantity : 0;
  const savings = listing ? (listing.original_price - listing.discounted_price) * quantity : 0;

  const placeOrder = async () => {
    if (!session?.user || !listing) return;
    setPlacing(true);
    const { error } = await supabase.from("orders").insert({
      buyer_id: session.user.id,
      vendor_id: listing.vendor_id,
      listing_id: listing.id,
      quantity,
      weight_kg: totalWeight,
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
  const hasPaymentMethods = savedPayments.length > 0;

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
            <p className="text-sm font-medium text-card-foreground">{t("selectAmount")}</p>
            <span className="text-xs text-muted-foreground">{maxQty} {t("stockAvailable")}</span>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="h-10 w-10 rounded-lg border border-border flex items-center justify-center text-foreground disabled:opacity-40 transition-colors hover:border-primary/40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <div className="text-center min-w-[80px]">
              <span className="text-2xl font-bold text-foreground">{quantity}</span>
              <p className="text-xs text-muted-foreground mt-0.5">{(unitWeight * quantity).toFixed(1)} kg</p>
            </div>
            <button
              onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
              disabled={quantity >= maxQty}
              className="h-10 w-10 rounded-lg border border-border flex items-center justify-center text-foreground disabled:opacity-40 transition-colors hover:border-primary/40"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Quick select */}
          {maxQty > 1 && (
            <div className="flex gap-2 mt-4 flex-wrap justify-center">
              {[1, 2, 3, 5, 10].filter(q => q <= maxQty).map(q => (
                <button
                  key={q}
                  onClick={() => setQuantity(q)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    quantity === q
                      ? "border-primary bg-secondary text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {q} {listing.unit}{q > 1 ? "s" : ""}
                </button>
              ))}
              {maxQty > 1 && !([1, 2, 3, 5, 10].includes(maxQty)) && (
                <button
                  onClick={() => setQuantity(maxQty)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    quantity === maxQty
                      ? "border-primary bg-secondary text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {t("allStock")}
                </button>
              )}
            </div>
          )}

          <div className="flex justify-between mt-3 pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">{t("estimatedPrice")}</span>
            <span className="text-sm font-semibold text-primary">RM{subtotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-card-foreground">{t("selectPayment")}</p>
            {!hasPaymentMethods && (
              <button onClick={() => navigate("/profile")} className="text-xs text-primary font-medium">
                {t("addPayment")}
              </button>
            )}
          </div>
          {hasPaymentMethods ? (
            <div className="space-y-2">
              {savedPayments.map(pm => (
                <button
                  key={pm.id}
                  onClick={() => setPayment(pm.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-sm transition-colors ${
                    payment === pm.id
                      ? "border-primary bg-secondary text-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {PAYMENT_ICON[pm.type] || <Wallet className="h-4 w-4" />}
                  <div className="text-left">
                    <span className="block">{pm.nickname}</span>
                    <span className="text-xs text-muted-foreground">{pm.detail}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("noPayments")}</p>
          )}
        </div>

        {/* Order summary */}
        <div className="rounded-xl border border-border bg-card p-4 space-y-2">
          <p className="text-sm font-medium text-card-foreground">{t("orderSummary")}</p>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{quantity} × RM{listing.discounted_price.toFixed(2)}</span>
            <span className="text-foreground font-semibold">RM{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("youSave")}</span>
            <span className="text-primary font-semibold">-RM{savings.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm pt-1 border-t border-border">
            <span className="text-muted-foreground">{t("totalWeight")}</span>
            <span className="text-foreground font-semibold">{totalWeight.toFixed(1)} kg</span>
          </div>
        </div>

        {/* Place order */}
        {!payment && (
          <p className="text-xs text-destructive text-center">Please select a payment method to continue</p>
        )}
        <Button onClick={placeOrder} disabled={placing || !payment} className="w-full h-12 text-base font-semibold">
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
