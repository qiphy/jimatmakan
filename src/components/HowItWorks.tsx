import { ArrowRight, Recycle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const HowItWorks = () => {
  const { t } = useLanguage();

  const steps = [
    { emoji: "🏪", title: t("step1Title"), desc: t("step1Desc") },
    { emoji: "🛒", title: t("step2Title"), desc: t("step2Desc") },
    { emoji: "♻️", title: t("step3Title"), desc: t("step3Desc") },
  ];

  return (
    <div className="px-4 py-3">
      <h2 className="font-display font-bold text-base text-foreground mb-3">
        {t("howItWorks")}
      </h2>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {steps.map((step, i) => (
          <div
            key={i}
            className="min-w-[160px] flex-shrink-0 rounded-xl bg-card border border-border p-3"
          >
            <div className="text-2xl mb-2">{step.emoji}</div>
            <h3 className="font-display font-semibold text-xs text-card-foreground">
              {step.title}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
