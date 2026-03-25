import React, { createContext, useContext, useState } from "react";

interface UserLocation {
  lat: number;
  lng: number;
  name: string;
}

interface UserLocationContextType {
  location: UserLocation;
  setLocation: (loc: UserLocation) => void;
}

const UserLocationContext = createContext<UserLocationContextType | undefined>(undefined);

export const UserLocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [location, setLocation] = useState<UserLocation>({
    lat: DEFAULT_CENTER[0],
    lng: DEFAULT_CENTER[1],
    name: "Kuala Lumpur",
  });

  return (
    <UserLocationContext.Provider value={{ location, setLocation }}>
      {children}
    </UserLocationContext.Provider>
  );
};

export const useUserLocation = () => {
  const ctx = useContext(UserLocationContext);
  if (!ctx) throw new Error("useUserLocation must be used within UserLocationProvider");
  return ctx;
};
