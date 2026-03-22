import { useLanguage } from "@/contexts/LanguageContext";

const categories = [
  { key: "allCategories" as const, emoji: "🍽️" },
  { key: "rice" as const, emoji: "🍚" },
  { key: "bread" as const, emoji: "🫓" },
  { key: "vegetables" as const, emoji: "🥬" },
  { key: "fruits" as const, emoji: "🍎" },
  { key: "meat" as const, emoji: "🍗" },
  { key: "seafood" as const, emoji: "🦐" },
  { key: "pastries" as const, emoji: "🍡" },
];

const CategoryRow = () => {
  const { t } = useLanguage();

  return (
    <div className="px-4 py-2">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat, i) => (
          <button
            key={cat.key}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              i === 0
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-foreground"
            }`}
          >
            <span>{cat.emoji}</span>
            {t(cat.key)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryRow;
