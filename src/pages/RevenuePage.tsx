import { ArrowLeft, DollarSign, ShoppingBag, Package } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { useActivityData } from "@/hooks/useActivityData";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const RevenuePage = () => {
  const { t } = useLanguage();
  const { monthly, recentSales, totalRevenue, totalOrders, loading } = useActivityData();
  const navigate = useNavigate();

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
      <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate("/activity")} className="text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="font-display font-bold text-foreground">{t("totalRevenue")}</h1>
      </div>

      {/* Summary bubbles */}
      <div className="px-4 py-4 flex gap-3">
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
            <h2 className="font-display font-bold text-sm text-foreground mb-3">{t("revenueChart")}</h2>
            <ResponsiveContainer width="100%" height={200}>
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
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
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
          <h2 className="font-display font-bold text-sm text-foreground mb-3">{t("recentSales")}</h2>
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

      <BottomNav />
    </div>
  );
};

export default RevenuePage;
