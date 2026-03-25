import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export type UserRole = "vendor" | "user" | "composter" | "admin";

export type HalalStatus = "none" | "pending" | "approved" | "rejected";

export interface UserProfile {
  fullName: string;
  phone: string;
  role: UserRole;
  businessName?: string;
  email: string;
  halalVerified?: boolean;
  halalCertUrl?: string;
  halalStatus?: HalalStatus;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string, profile: Omit<UserProfile, "email">) => Promise<{ error: string | null }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data && !error) {
      setUser({
        fullName: data.full_name,
        phone: data.phone,
        role: data.role as UserRole,
        businessName: data.business_name ?? undefined,
        email: data.email,
        halalVerified: data.halal_verified ?? false,
        halalCertUrl: (data as any).halal_cert_url ?? undefined,
        halalStatus: ((data as any).halal_status ?? "none") as HalalStatus,
      });
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          // Use setTimeout to avoid potential deadlock with Supabase client
          setTimeout(() => fetchProfile(newSession.user.id), 0);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      if (existingSession?.user) {
        fetchProfile(existingSession.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signup = useCallback(async (email: string, password: string, profile: Omit<UserProfile, "email">) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: profile.fullName,
          phone: profile.phone,
          role: profile.role,
          business_name: profile.businessName,
        },
      },
    });
    return { error: error?.message ?? null };
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!session?.user) return;
    const dbUpdates: Record<string, unknown> = {};
    if (updates.fullName !== undefined) dbUpdates.full_name = updates.fullName;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    // Role changes are not allowed via client-side updates (enforced by RLS)
    if (updates.businessName !== undefined) dbUpdates.business_name = updates.businessName;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.halalVerified !== undefined) dbUpdates.halal_verified = updates.halalVerified;
    if (updates.halalCertUrl !== undefined) dbUpdates.halal_cert_url = updates.halalCertUrl;
    if (updates.halalStatus !== undefined) dbUpdates.halal_status = updates.halalStatus;
    dbUpdates.updated_at = new Date().toISOString();

    await supabase.from("profiles").update(dbUpdates).eq("id", session.user.id);
    setUser((prev) => prev ? { ...prev, ...updates } : prev);
  }, [session]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!session, user, session, loading, login, signup, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
