export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      impact_metrics: {
        Row: {
          co2_reduced_kg: number
          food_saved_kg: number
          id: string
          meals_rescued: number
          money_saved: number
          updated_at: string
          user_id: string
        }
        Insert: {
          co2_reduced_kg?: number
          food_saved_kg?: number
          id?: string
          meals_rescued?: number
          money_saved?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          co2_reduced_kg?: number
          food_saved_kg?: number
          id?: string
          meals_rescued?: number
          money_saved?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      listings: {
        Row: {
          category: string
          created_at: string
          description: string | null
          discounted_price: number
          id: string
          image_url: string | null
          original_price: number
          pickup_address: string | null
          pickup_end: string | null
          pickup_start: string | null
          quantity: number
          status: string
          title: string
          unit: string
          updated_at: string
          vendor_id: string
          weight_kg: number
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          discounted_price?: number
          id?: string
          image_url?: string | null
          original_price?: number
          pickup_address?: string | null
          pickup_end?: string | null
          pickup_start?: string | null
          quantity?: number
          status?: string
          title: string
          unit?: string
          updated_at?: string
          vendor_id: string
          weight_kg?: number
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          discounted_price?: number
          id?: string
          image_url?: string | null
          original_price?: number
          pickup_address?: string | null
          pickup_end?: string | null
          pickup_start?: string | null
          quantity?: number
          status?: string
          title?: string
          unit?: string
          updated_at?: string
          vendor_id?: string
          weight_kg?: number
        }
        Relationships: []
      }
      orders: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          listing_id: string
          quantity: number
          status: string
          total_price: number
          updated_at: string
          vendor_id: string
          weight_kg: number
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          listing_id: string
          quantity?: number
          status?: string
          total_price?: number
          updated_at?: string
          vendor_id: string
          weight_kg?: number
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          listing_id?: string
          quantity?: number
          status?: string
          total_price?: number
          updated_at?: string
          vendor_id?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_name: string | null
          created_at: string
          email: string
          full_name: string
          halal_cert_url: string | null
          halal_status: string
          halal_verified: boolean
          id: string
          phone: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          email?: string
          full_name?: string
          halal_cert_url?: string | null
          halal_status?: string
          halal_verified?: boolean
          id: string
          phone?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          business_name?: string | null
          created_at?: string
          email?: string
          full_name?: string
          halal_cert_url?: string | null
          halal_status?: string
          halal_verified?: boolean
          id?: string
          phone?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "vendor" | "user" | "composter"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["vendor", "user", "composter"],
    },
  },
} as const
