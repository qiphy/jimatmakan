import { ArrowLeft, Leaf, TrendingDown } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useActivityData } from "@/hooks/useActivityData";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";

const SustainabilityPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { monthly, totalFood, totalCO2, loading } = useActivityData();
  const navigate = useNavigate();
  const showESG = user?.role === "vendor" || user?.role === "composter";

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
        <h1 className="font-display font-bold text-foreground">Sustainability Statistics</h1>
      </div>

      {/* Summary bubbles */}
      <div className="px-4 py-4 flex gap-3">
        <div className="flex-1 rounded-2xl bg-primary/10 border border-primary/20 p-4 text-center">
          <Leaf className="h-5 w-5 text-primary mx-auto mb-1" />
          <span className="text-2xl font-bold font-display text-primary block">{totalFood.toFixed(1)}</span>
          <p className="text-[10px] text-muted-foreground">kg {t("foodSaved")}</p>
        </div>
        <div className="flex-1 rounded-2xl bg-secondary border border-border p-4 text-center">
          <TrendingDown className="h-5 w-5 text-primary mx-auto mb-1" />
          <span className="text-2xl font-bold font-display text-primary block">{totalCO2.toFixed(1)}</span>
          <p className="text-[10px] text-muted-foreground">kg {t("co2Reduced")}</p>
        </div>
      </div>

      {/* Food Waste Saved Chart */}
      {hasMonthlyData && (
        <div className="px-4 py-3">
          <div className="rounded-2xl bg-card border border-border p-4">
            <h2 className="font-display font-bold text-sm text-foreground mb-3">{t("foodSavedChart")}</h2>
            <ResponsiveContainer width="100%" height={200}>
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
            <h2 className="font-display font-bold text-sm text-foreground mb-3">{t("co2ReducedChart")}</h2>
            <ResponsiveContainer width="100%" height={200}>
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

      {!hasMonthlyData && (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">{t("noActivityYet")}</p>
        </div>
      )}

      {/* ESG Report CTA */}
      {showESG && (
        <div className="px-4 py-3">
          <div className="rounded-2xl bg-card border border-border p-5">
            <h3 className="font-display font-bold text-sm text-foreground">{t("esgReportTitle")}</h3>
            <p className="text-xs text-muted-foreground mt-1 font-body leading-relaxed">{t("esgReportDesc")}</p>
            <button onClick={() => navigate("/esg-checkout")} className="mt-4 w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-medium font-body">
              {t("esgReportBtn")} — RM30
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default SustainabilityPage;
