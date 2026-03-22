import React, { createContext, useContext, useState, useCallback } from "react";

type Lang = "en" | "ms";

const translations = {
  en: {
    appName: "JimatMakan",
    tagline: "Save food. Save money.",
    home: "Home",
    browse: "Browse",
    addListing: "List",
    activity: "Activity",
    profile: "Profile",
    availableNow: "Available Now",
    expiringSoon: "Expiring Soon",
    forComposting: "For Composting",
    seeAll: "See all",
    searchPlaceholder: "Search surplus food...",
    timeLeft: "left",
    expired: "Expired",
    movedToCompost: "Moved to composting",
    categories: "Categories",
    restaurants: "Restaurants",
    nightMarket: "Night Market",
    students: "Students",
    composting: "Composting",
    allCategories: "All",
    rice: "Rice",
    bread: "Bread",
    vegetables: "Vegetables",
    fruits: "Fruits",
    meat: "Meat",
    seafood: "Seafood",
    pastries: "Pastries",
    deliverTo: "Location",
    howItWorks: "How It Works",
    step1Title: "Restaurants list surplus",
    step1Desc: "Excess food listed with a 2-hour freshness window",
    step2Title: "Vendors & students buy",
    step2Desc: "Night market vendors and students get quality food cheaper",
    step3Title: "Unsold → Composting",
    step3Desc: "After 2 hours, remaining food goes to composting partners",
    priceReduced: "Reduced",
    originalPrice: "Original",
    listedBy: "Listed by",
    buyNow: "Buy Now",
    compostClaim: "Claim for Composting",
    language: "Language",
    english: "English",
    malay: "Bahasa Melayu",
    impactTitle: "Your Impact",
    foodSaved: "kg food saved",
    co2Reduced: "kg CO₂ reduced",
  },
  ms: {
    appName: "JimatMakan",
    tagline: "Jimat makanan. Jimat wang.",
    home: "Utama",
    browse: "Cari",
    addListing: "Senarai",
    activity: "Aktiviti",
    profile: "Profil",
    availableNow: "Tersedia Sekarang",
    expiringSoon: "Hampir Tamat",
    forComposting: "Untuk Kompos",
    seeAll: "Lihat semua",
    searchPlaceholder: "Cari makanan lebihan...",
    timeLeft: "lagi",
    expired: "Tamat Tempoh",
    movedToCompost: "Dipindahkan ke kompos",
    categories: "Kategori",
    restaurants: "Restoran",
    nightMarket: "Pasar Malam",
    students: "Pelajar",
    composting: "Kompos",
    allCategories: "Semua",
    rice: "Nasi",
    bread: "Roti",
    vegetables: "Sayur",
    fruits: "Buah",
    meat: "Daging",
    seafood: "Makanan Laut",
    pastries: "Pastri",
    deliverTo: "Lokasi",
    howItWorks: "Cara Ia Berfungsi",
    step1Title: "Restoran senaraikan lebihan",
    step1Desc: "Makanan lebihan disenaraikan dengan tempoh kesegaran 2 jam",
    step2Title: "Peniaga & pelajar beli",
    step2Desc: "Peniaga pasar malam dan pelajar dapat makanan berkualiti dengan harga murah",
    step3Title: "Tidak terjual → Kompos",
    step3Desc: "Selepas 2 jam, makanan selebihnya dihantar kepada rakan kompos",
    priceReduced: "Dikurangkan",
    originalPrice: "Asal",
    listedBy: "Disenaraikan oleh",
    buyNow: "Beli Sekarang",
    compostClaim: "Tuntut untuk Kompos",
    language: "Bahasa",
    english: "English",
    malay: "Bahasa Melayu",
    impactTitle: "Impak Anda",
    foodSaved: "kg makanan diselamatkan",
    co2Reduced: "kg CO₂ dikurangkan",
  },
} as const;

type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>("en");

  const t = useCallback(
    (key: TranslationKey) => translations[lang][key] || key,
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
