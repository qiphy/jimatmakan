export interface FoodListing {
  id: string;
  name: string;
  nameMy: string;
  restaurant: string;
  category: string;
  originalPrice: number;
  reducedPrice: number;
  quantity: string;
  quantityMy: string;
  image: string;
  listedAt: Date;
  expiresAt: Date;
}

// Create listings with dynamic expiry times relative to now
const createListings = (): FoodListing[] => {
  const now = Date.now();
  return [
    {
      id: "1",
      name: "Nasi Lemak Batch",
      nameMy: "Kelompok Nasi Lemak",
      restaurant: "Restoran Seri Melur",
      category: "rice",
      originalPrice: 45,
      reducedPrice: 18,
      quantity: "5 kg",
      quantityMy: "5 kg",
      image: "🍚",
      listedAt: new Date(now - 30 * 60000),
      expiresAt: new Date(now + 90 * 60000),
    },
    {
      id: "2",
      name: "Roti Canai Dough",
      nameMy: "Doh Roti Canai",
      restaurant: "Mamak Corner",
      category: "bread",
      originalPrice: 30,
      reducedPrice: 10,
      quantity: "3 kg",
      quantityMy: "3 kg",
      image: "🫓",
      listedAt: new Date(now - 100 * 60000),
      expiresAt: new Date(now + 20 * 60000),
    },
    {
      id: "3",
      name: "Mixed Vegetables",
      nameMy: "Sayur Campuran",
      restaurant: "Grand Seasons Hotel",
      category: "vegetables",
      originalPrice: 25,
      reducedPrice: 8,
      quantity: "4 kg",
      quantityMy: "4 kg",
      image: "🥬",
      listedAt: new Date(now - 115 * 60000),
      expiresAt: new Date(now + 5 * 60000),
    },
    {
      id: "4",
      name: "Assorted Kuih",
      nameMy: "Kuih Pelbagai",
      restaurant: "Dapur Kampung",
      category: "pastries",
      originalPrice: 40,
      reducedPrice: 15,
      quantity: "2 kg",
      quantityMy: "2 kg",
      image: "🍡",
      listedAt: new Date(now - 60 * 60000),
      expiresAt: new Date(now + 60 * 60000),
    },
    {
      id: "5",
      name: "Fried Chicken Pieces",
      nameMy: "Kepingan Ayam Goreng",
      restaurant: "Nasi Kandar Line Clear",
      category: "meat",
      originalPrice: 55,
      reducedPrice: 22,
      quantity: "6 kg",
      quantityMy: "6 kg",
      image: "🍗",
      listedAt: new Date(now - 125 * 60000),
      expiresAt: new Date(now - 5 * 60000), // already expired
    },
    {
      id: "6",
      name: "Seafood Surplus",
      nameMy: "Lebihan Makanan Laut",
      restaurant: "Ocean Seafood Restaurant",
      category: "seafood",
      originalPrice: 70,
      reducedPrice: 28,
      quantity: "3 kg",
      quantityMy: "3 kg",
      image: "🦐",
      listedAt: new Date(now - 45 * 60000),
      expiresAt: new Date(now + 75 * 60000),
    },
  ];
};

export const getListings = () => createListings();
