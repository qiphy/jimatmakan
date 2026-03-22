import { useLanguage } from "@/contexts/LanguageContext";

const LanguageToggle = () => {
  const { lang, setLang, t } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === "en" ? "ms" : "en")}
      className="rounded-full bg-card border border-border px-2.5 py-1 text-[11px] font-medium text-foreground"
    >
      {lang === "en" ? "🇲🇾 BM" : "🇬🇧 EN"}
    </button>
  );
};

export default LanguageToggle;
