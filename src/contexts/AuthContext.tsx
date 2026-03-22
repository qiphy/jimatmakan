import React, { createContext, useContext, useState, useCallback } from "react";

export type UserRole = "vendor" | "user" | "composter";

export interface UserProfile {
  fullName: string;
  phone: string;
  role: UserRole;
  businessName?: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  login: (email: string, password: string) => boolean;
  signup: (profile: UserProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo accounts for testing
const DEMO_ACCOUNTS: Record<string, { password: string; profile: UserProfile }> = {
  "vendor@demo.com": {
    password: "demo123",
    profile: {
      fullName: "Ahmad bin Ismail",
      phone: "+60123456789",
      role: "vendor",
      businessName: "Ahmad's Nasi Lemak",
      email: "vendor@demo.com",
    },
  },
  "student@demo.com": {
    password: "demo123",
    profile: {
      fullName: "Siti Nurhaliza",
      phone: "+60198765432",
      role: "user",
      email: "student@demo.com",
    },
  },
  "compost@demo.com": {
    password: "demo123",
    profile: {
      fullName: "GreenCycle Sdn Bhd",
      phone: "+60112233445",
      role: "composter",
      businessName: "GreenCycle Composting",
      email: "compost@demo.com",
    },
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  const login = useCallback((email: string, _password: string): boolean => {
    const account = DEMO_ACCOUNTS[email.toLowerCase()];
    if (account) {
      setUser(account.profile);
      return true;
    }
    return false;
  }, []);

  const signup = useCallback((profile: UserProfile) => {
    setUser(profile);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
