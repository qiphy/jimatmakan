import { FileText, TrendingDown, Leaf, ShoppingBag, DollarSign, Package } from "lucide-react";
import ActivityOrderStatus from "@/components/ActivityOrderStatus";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useActivityData } from "@/hooks/useActivityData";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";

const ActivityPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { monthly, recentSales, totalRevenue, totalOrders, totalFood, totalCO2, loading } = useActivityData();
  const isVendor = user?.role === "vendor";
  const showESG = user?.role === "vendor" || user?.role === "composter";

  const handleGenerateESG = () => {
    toast.success(t("esgReportGenerated"));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const hasMonthlyData = monthly.length > 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="px-4 pt-[env(safe-area-inset-top,12px)] pb-2">
        <h1 className="text-lg font-bold font-display text-foreground">{t("activity")}</h1>
      </header>

      {/* Vendor Sales Summary */}
      {isVendor && (
        <>
          <div className="px-4 py-2 flex gap-3">
            <div className="flex-1 rounded-2xl bg-primary/10 border border-primary/20 p-4 text-center">
              <DollarSign className="h-5 w-5 text-primary mx-auto mb-1" />
              <span className="text-2xl font-bold font-display text-primary block">RM{totalRevenue}</span>
              <p className="text-[10px] text-muted-foreground">{t("totalRevenue")}</p>
            </div>
            <div className="flex-1 rounded-2xl bg-secondary border border-border p-4 text-center">
              <ShoppingBag className="h-5 w-5 text-primary mx-auto mb-1" />
              <span className="text-2xl font-bold font-display text-primary block">{totalOrders}</span>
              <p className="text-[10px] text-muted-foreground">{t("totalOrders")}</p>
            </div>
          </div>

          {/* Revenue Chart */}
          {hasMonthlyData && (
            <div className="px-4 py-3">
              <div className="rounded-2xl bg-card border border-border p-4">
                <h2 className="font-display font-bold text-sm text-foreground mb-3">
                  {t("revenueChart")}
                </h2>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={monthly}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={35} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(value: number) => [`RM${value}`, t("totalRevenue")]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#revGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent Sales */}
          {recentSales.length > 0 && (
            <div className="px-4 py-2">
              <h2 className="font-display font-bold text-sm text-foreground mb-3">
                {t("recentSales")}
              </h2>
              <div className="space-y-2">
                {recentSales.map((sale) => (
                  <div key={sale.id} className="rounded-2xl bg-card border border-border p-3 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate font-body">{sale.item}</p>
                      <p className="text-[11px] text-muted-foreground">{sale.buyer} · {sale.qty}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-primary font-display">RM{sale.price}</p>
                      <p className="text-[10px] text-muted-foreground">{sale.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Impact Summary */}
      <div className="px-4 py-2 flex gap-3">
        <div className="flex-1 rounded-2xl bg-primary/10 border border-primary/20 p-4 text-center">
          <Leaf className="h-5 w-5 text-primary mx-auto mb-1" />
          <span className="text-2xl font-bold font-display text-primary block">{totalFood}</span>
          <p className="text-[10px] text-muted-foreground">{t("foodSaved")}</p>
        </div>
        <div className="flex-1 rounded-2xl bg-secondary border border-border p-4 text-center">
          <TrendingDown className="h-5 w-5 text-primary mx-auto mb-1" />
          <span className="text-2xl font-bold font-display text-primary block">{totalCO2}</span>
          <p className="text-[10px] text-muted-foreground">{t("co2Reduced")}</p>
        </div>
      </div>

      {/* User Order Status */}
      {!isVendor && <ActivityOrderStatus />}

      {/* Food Waste Saved Chart */}
      {hasMonthlyData && (
        <div className="px-4 py-3">
          <div className="rounded-2xl bg-card border border-border p-4">
            <h2 className="font-display font-bold text-sm text-foreground mb-3">
              {t("foodSavedChart")}
            </h2>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="foodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={30} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="foodSaved" stroke="hsl(var(--primary))" fill="url(#foodGrad)" strokeWidth={2} name={t("foodSaved")} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* CO2 Reduced Chart */}
      {hasMonthlyData && (
        <div className="px-4 py-2">
          <div className="rounded-2xl bg-card border border-border p-4">
            <h2 className="font-display font-bold text-sm text-foreground mb-3">
              {t("co2ReducedChart")}
            </h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={30} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="co2Reduced" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name={t("co2Reduced")} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* No data message when no orders exist */}
      {!hasMonthlyData && (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">{t("noActivityYet")}</p>
        </div>
      )}

      {/* ESG Report */}
      {showESG && (
        <div className="px-4 py-3">
          <div className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-sm text-foreground">{t("esgReportTitle")}</h3>
                <p className="text-xs text-muted-foreground mt-1 font-body leading-relaxed">{t("esgReportDesc")}</p>
              </div>
            </div>
            <button onClick={handleGenerateESG} className="mt-4 w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium font-body">
              {t("esgReportBtn")} — RM30
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default ActivityPage;
