import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, CheckCircle2, Wallet, CreditCard, Building2, Leaf, TrendingDown, ShoppingBag, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useActivityData } from "@/hooks/useActivityData";
import { generateESGReport } from "@/utils/generateESGReport";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";

type PaymentMethod = "tng" | "card" | "fpx";

const ESGCheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { monthly, totalRevenue, totalOrders, totalFood, totalCO2, loading } = useActivityData();

  const [payment, setPayment] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const price = 30;

  const handlePurchase = () => {
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      generateESGReport({
        userName: user?.fullName || "User",
        totalFood,
        totalCO2,
        totalOrders,
        totalRevenue,
        monthly,
      });
      setProcessing(false);
      setSuccess(true);
      toast.success(t("esgReportGenerated"));
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center gap-4">
        <CheckCircle2 className="h-16 w-16 text-primary" />
        <h2 className="text-xl font-display font-bold text-foreground">{t("esgPurchaseSuccess")}</h2>
        <p className="text-muted-foreground text-sm max-w-xs">{t("esgPurchaseSuccessDesc")}</p>
        <Button onClick={() => navigate("/activity")} className="mt-4">{t("backToActivity")}</Button>
        <BottomNav />
      </div>
    );
  }

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
        <h1 className="font-display font-bold text-foreground">{t("esgCheckout")}</h1>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Product card */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-card-foreground">{t("esgReportTitle")}</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t("esgReportDesc")}</p>
              <p className="text-lg font-bold text-primary mt-2">RM{price.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Report preview - what's included */}
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm font-medium text-card-foreground mb-3">{t("esgReportIncludes")}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Leaf className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{totalFood.toFixed(1)} kg {t("foodSaved")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingDown className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{totalCO2.toFixed(1)} {t("co2Reduced")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShoppingBag className="h-4 w-4 text-primary flex-shrink-0" />
              <span>{totalOrders} {t("totalOrders").toLowerCase()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4 text-primary flex-shrink-0" />
              <span>RM{totalRevenue.toFixed(2)} {t("totalRevenue").toLowerCase()}</span>
            </div>
          </div>
          {monthly.length > 0 && (
            <p className="text-xs text-muted-foreground mt-3 border-t border-border pt-2">
              {t("esgMonthlyBreakdown")}
            </p>
          )}
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
            <span className="text-muted-foreground">{t("esgReportTitle")}</span>
            <span className="text-foreground font-semibold">RM{price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm pt-1 border-t border-border font-semibold">
            <span className="text-foreground">{t("esgTotal")}</span>
            <span className="text-primary">RM{price.toFixed(2)}</span>
          </div>
        </div>

        {/* Purchase button */}
        {!payment && (
          <p className="text-xs text-destructive text-center">Please select a payment method to continue</p>
        )}
        <Button onClick={handlePurchase} disabled={processing || !payment} className="w-full h-12 text-base font-semibold">
          {processing ? (
            <div className="animate-spin h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
          ) : `${t("esgPayAndDownload")} — RM${price.toFixed(2)}`}
        </Button>
      </div>

      <BottomNav />
    </div>
  );
};

export default ESGCheckoutPage;
