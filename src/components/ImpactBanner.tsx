import { useLanguage } from "@/contexts/LanguageContext";
import { Leaf } from "lucide-react";

const ImpactBanner = () => {
  const { t } = useLanguage();

  return (
    <div className="px-4 py-2">
      <div className="rounded-xl bg-primary/10 border border-primary/20 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Leaf className="h-4 w-4 text-primary" />
          <h2 className="font-display font-bold text-sm text-foreground">
            {t("impactTitle")}
          </h2>
        </div>
        <div className="flex gap-4">
          <div>
            <span className="text-xl font-bold font-display text-primary">127</span>
            <p className="text-[11px] text-muted-foreground">{t("foodSaved")}</p>
          </div>
          <div>
            <span className="text-xl font-bold font-display text-primary">89</span>
            <p className="text-[11px] text-muted-foreground">{t("co2Reduced")}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactBanner;
