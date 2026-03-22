import { Search, SlidersHorizontal } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const SearchBar = () => {
  const { t } = useLanguage();

  return (
    <div className="px-4 py-2">
      <div className="flex items-center gap-2 rounded-xl bg-card border border-border px-3 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-body"
        />
        <button className="rounded-lg bg-secondary p-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-foreground" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
