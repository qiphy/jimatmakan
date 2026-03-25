import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type PaymentMethodType = "tng" | "card" | "fpx";

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  nickname: string;
  detail: string;
  created_at: string;
}

export function usePaymentMethods() {
  const { session } = useAuth();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!session?.user) { setMethods([]); setLoading(false); return; }
    const { data } = await supabase
      .from("payment_methods" as any)
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: true });
    setMethods((data as any as PaymentMethod[]) || []);
    setLoading(false);
  }, [session?.user?.id]);

  useEffect(() => { fetch(); }, [fetch]);

  const add = useCallback(async (type: PaymentMethodType, nickname: string, detail: string) => {
    if (!session?.user) return;
    const { error } = await supabase.from("payment_methods" as any).insert({
      user_id: session.user.id,
      type,
      nickname,
      detail,
    } as any);
    if (!error) await fetch();
    return error;
  }, [session?.user?.id, fetch]);

  const remove = useCallback(async (id: string) => {
    if (!session?.user) return;
    await supabase.from("payment_methods" as any).delete().eq("id", id);
    await fetch();
  }, [session?.user?.id, fetch]);

  return { methods, loading, add, remove, refetch: fetch };
}
