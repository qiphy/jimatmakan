import { Utensils, Pizza, Salad, Coffee, Cake, Fish, Sandwich, Soup } from "lucide-react";

const categories = [
  { icon: Utensils, label: "All", active: true },
  { icon: Pizza, label: "Pizza" },
  { icon: Sandwich, label: "Burgers" },
  { icon: Salad, label: "Salads" },
  { icon: Fish, label: "Sushi" },
  { icon: Coffee, label: "Drinks" },
  { icon: Cake, label: "Desserts" },
  { icon: Soup, label: "Soups" },
];

const CategoryRow = () => {
  return (
    <div className="px-4 py-3">
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.label}
            className={`flex flex-col items-center gap-1.5 min-w-[64px] ${
              cat.active
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-colors ${
                cat.active
                  ? "bg-primary text-primary-foreground shadow-elevated"
                  : "bg-card shadow-card"
              }`}
            >
              <cat.icon className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium font-body">{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryRow;
