import { Star, Clock, MapPin } from "lucide-react";

import burgerImg from "@/assets/burger.jpg";
import pizzaImg from "@/assets/pizza.jpg";
import pokeImg from "@/assets/poke-bowl.jpg";
import sushiImg from "@/assets/sushi.jpg";

const restaurants = [
  {
    name: "Smash & Stack",
    image: burgerImg,
    cuisine: "Burgers · American",
    rating: 4.8,
    time: "15-25 min",
    distance: "1.2 km",
    promo: "20% OFF",
  },
  {
    name: "Napoli Fires",
    image: pizzaImg,
    cuisine: "Pizza · Italian",
    rating: 4.6,
    time: "20-30 min",
    distance: "2.1 km",
  },
  {
    name: "Poké Paradise",
    image: pokeImg,
    cuisine: "Bowls · Healthy",
    rating: 4.9,
    time: "10-20 min",
    distance: "0.8 km",
    promo: "Free delivery",
  },
  {
    name: "Sakura Sushi",
    image: sushiImg,
    cuisine: "Sushi · Japanese",
    rating: 4.7,
    time: "25-35 min",
    distance: "3.0 km",
  },
];

const RestaurantCard = ({ restaurant }: { restaurant: (typeof restaurants)[0] }) => (
  <div className="min-w-[260px] max-w-[280px] flex-shrink-0 animate-fade-in-up">
    <div className="overflow-hidden rounded-2xl bg-card shadow-card">
      <div className="relative">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="h-36 w-full object-cover"
        />
        {restaurant.promo && (
          <span className="absolute left-3 top-3 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground font-body shadow-elevated">
            {restaurant.promo}
          </span>
        )}
      </div>
      <div className="p-3.5">
        <h3 className="text-base font-bold font-display text-card-foreground">
          {restaurant.name}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground font-body">
          {restaurant.cuisine}
        </p>
        <div className="mt-2.5 flex items-center gap-3 text-xs text-muted-foreground font-body">
          <span className="flex items-center gap-1 font-medium text-warning">
            <Star className="h-3.5 w-3.5 fill-warning" />
            {restaurant.rating}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {restaurant.time}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {restaurant.distance}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const RestaurantList = () => {
  return (
    <div className="py-3">
      <div className="flex items-center justify-between px-4 mb-3">
        <h2 className="text-lg font-bold font-display text-foreground">
          Popular Near You
        </h2>
        <button className="text-sm font-medium text-primary font-body">
          See all
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {restaurants.map((r) => (
          <RestaurantCard key={r.name} restaurant={r} />
        ))}
      </div>
    </div>
  );
};

export default RestaurantList;
