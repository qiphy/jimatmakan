import { Search, MapPin, SlidersHorizontal } from "lucide-react";

const SearchBar = () => {
  return (
    <div className="px-4 py-2">
      <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-3 shadow-card">
        <Search className="h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search restaurants, dishes..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none font-body"
        />
        <button className="rounded-md bg-primary p-1.5">
          <SlidersHorizontal className="h-4 w-4 text-primary-foreground" />
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
