import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type SupabaseListing = Tables<"listings"> & {
  vendor_name?: string;
  pickup_lat?: number | null;
  pickup_lng?: number | null;
};

export const useListings = (vendorOnly = false) => {
  const [listings, setListings] = useState<SupabaseListing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: { session } } = await supabase.auth.getSession();

    if (vendorOnly) {
      if (session?.user) {
        query = query.eq("vendor_id", session.user.id);
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching listings:", error);
      setListings([]);
    } else {
      // Fetch user's ordered listing IDs to exclude them
      let orderedListingIds = new Set<string>();
      if (session?.user) {
        const { data: orders } = await supabase
          .from("orders")
          .select("listing_id")
          .eq("buyer_id", session.user.id);
        orderedListingIds = new Set((orders || []).map((o) => o.listing_id));
      }

      // Enrich with vendor names
      const vendorIds = [...new Set((data || []).map((l) => l.vendor_id))];
      let vendorMap = new Map<string, string>();
      if (vendorIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, business_name, full_name")
          .in("id", vendorIds);
        vendorMap = new Map(
          (profiles || []).map((p) => [p.id, p.business_name || p.full_name])
        );
      }

      // Filter out listings the user has already ordered (unless vendor viewing own)
      const filtered = (data || []).filter((l) => 
        vendorOnly || !orderedListingIds.has(l.id)
      );

      setListings(
        filtered.map((l) => ({
          ...l,
          vendor_name: vendorMap.get(l.vendor_id) || "Vendor",
        }))
      );
    }
    setLoading(false);
  }, [vendorOnly]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { listings, loading, refetch: fetchListings };
};
