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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_events: {
        Row: {
          app_name: string | null
          child_id: string
          device_id: string | null
          duration_seconds: number | null
          event_type: string
          id: string
          metadata: Json | null
          occurred_at: string
          parent_id: string
          url: string | null
        }
        Insert: {
          app_name?: string | null
          child_id: string
          device_id?: string | null
          duration_seconds?: number | null
          event_type: string
          id?: string
          metadata?: Json | null
          occurred_at?: string
          parent_id: string
          url?: string | null
        }
        Update: {
          app_name?: string | null
          child_id?: string
          device_id?: string | null
          duration_seconds?: number | null
          event_type?: string
          id?: string
          metadata?: Json | null
          occurred_at?: string
          parent_id?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_events_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_events_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      alerts: {
        Row: {
          child_id: string | null
          created_at: string
          description: string | null
          id: string
          parent_id: string
          read: boolean
          severity: string
          title: string
        }
        Insert: {
          child_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          parent_id: string
          read?: boolean
          severity?: string
          title: string
        }
        Update: {
          child_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          parent_id?: string
          read?: boolean
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      app_limits: {
        Row: {
          app_name: string
          blocked: boolean
          child_id: string
          created_at: string
          daily_minutes: number
          id: string
          package_id: string | null
          parent_id: string
        }
        Insert: {
          app_name: string
          blocked?: boolean
          child_id: string
          created_at?: string
          daily_minutes?: number
          id?: string
          package_id?: string | null
          parent_id: string
        }
        Update: {
          app_name?: string
          blocked?: boolean
          child_id?: string
          created_at?: string
          daily_minutes?: number
          id?: string
          package_id?: string | null
          parent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_limits_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          avatar_url: string | null
          birth_year: number | null
          color: string | null
          created_at: string
          id: string
          name: string
          parent_id: string
        }
        Insert: {
          avatar_url?: string | null
          birth_year?: number | null
          color?: string | null
          created_at?: string
          id?: string
          name: string
          parent_id: string
        }
        Update: {
          avatar_url?: string | null
          birth_year?: number | null
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          parent_id?: string
        }
        Relationships: []
      }
      devices: {
        Row: {
          child_id: string
          created_at: string
          device_name: string | null
          id: string
          last_seen: string | null
          paired_at: string | null
          pairing_code: string | null
          parent_id: string
          platform: string | null
          status: string
        }
        Insert: {
          child_id: string
          created_at?: string
          device_name?: string | null
          id?: string
          last_seen?: string | null
          paired_at?: string | null
          pairing_code?: string | null
          parent_id: string
          platform?: string | null
          status?: string
        }
        Update: {
          child_id?: string
          created_at?: string
          device_name?: string | null
          id?: string
          last_seen?: string | null
          paired_at?: string | null
          pairing_code?: string | null
          parent_id?: string
          platform?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "devices_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          accuracy: number | null
          child_id: string
          device_id: string | null
          id: string
          latitude: number
          longitude: number
          parent_id: string
          recorded_at: string
        }
        Insert: {
          accuracy?: number | null
          child_id: string
          device_id?: string | null
          id?: string
          latitude: number
          longitude: number
          parent_id: string
          recorded_at?: string
        }
        Update: {
          accuracy?: number | null
          child_id?: string
          device_id?: string | null
          id?: string
          latitude?: number
          longitude?: number
          parent_id?: string
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "locations_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "devices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          pin_hash: string | null
          theme: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          pin_hash?: string | null
          theme?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          pin_hash?: string | null
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      web_blocklist: {
        Row: {
          category: string | null
          child_id: string
          created_at: string
          domain: string
          id: string
          parent_id: string
        }
        Insert: {
          category?: string | null
          child_id: string
          created_at?: string
          domain: string
          id?: string
          parent_id: string
        }
        Update: {
          category?: string | null
          child_id?: string
          created_at?: string
          domain?: string
          id?: string
          parent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "web_blocklist_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "children"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "parent"
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
      app_role: ["admin", "parent"],
    },
  },
} as const
