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
      about_settings: {
        Row: {
          description: string | null
          description2: string | null
          eyebrow: string | null
          id: string
          image_url: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          description?: string | null
          description2?: string | null
          eyebrow?: string | null
          id?: string
          image_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          description?: string | null
          description2?: string | null
          eyebrow?: string | null
          id?: string
          image_url?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          created_at: string
          form_data: Json
          id: string
          payment_status: string
          project_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["application_status"]
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          form_data?: Json
          id?: string
          payment_status?: string
          project_id: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          form_data?: Json
          id?: string
          payment_status?: string
          project_id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      banners: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          title?: string
        }
        Relationships: []
      }
      form_schemas: {
        Row: {
          created_at: string
          fields: Json
          id: string
          project_id: string
        }
        Insert: {
          created_at?: string
          fields?: Json
          id?: string
          project_id: string
        }
        Update: {
          created_at?: string
          fields?: Json
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_schemas_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery: {
        Row: {
          created_at: string
          id: string
          image_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
        }
        Relationships: []
      }
      homepage_about_card: {
        Row: {
          about_text: string | null
          description: string | null
          id: string
          images: Json | null
          title: string | null
          updated_at: string
        }
        Insert: {
          about_text?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          about_text?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      homepage_settings: {
        Row: {
          button_link: string | null
          button_text: string | null
          button2_link: string | null
          button2_text: string | null
          hero_bg: string | null
          hero_eyebrow: string | null
          hero_subtext: string | null
          hero_title: string | null
          id: string
          updated_at: string
        }
        Insert: {
          button_link?: string | null
          button_text?: string | null
          button2_link?: string | null
          button2_text?: string | null
          hero_bg?: string | null
          hero_eyebrow?: string | null
          hero_subtext?: string | null
          hero_title?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          button_link?: string | null
          button_text?: string | null
          button2_link?: string | null
          button2_text?: string | null
          hero_bg?: string | null
          hero_eyebrow?: string | null
          hero_subtext?: string | null
          hero_title?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string | null
          form_data: Json | null
          id: string
          name: string | null
          phone: string | null
          project_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          form_data?: Json | null
          id?: string
          name?: string | null
          phone?: string | null
          project_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          form_data?: Json | null
          id?: string
          name?: string | null
          phone?: string | null
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_settings: {
        Row: {
          id: string
          instructions: string | null
          qr_image_url: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          instructions?: string | null
          qr_image_url?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          instructions?: string | null
          qr_image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          block: string | null
          created_at: string
          district: string | null
          email: string | null
          id: string
          name: string | null
          panchayat: string | null
          phone: string | null
          referral_code: string | null
          referred_by: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          block?: string | null
          created_at?: string
          district?: string | null
          email?: string | null
          id: string
          name?: string | null
          panchayat?: string | null
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          block?: string | null
          created_at?: string
          district?: string | null
          email?: string | null
          id?: string
          name?: string | null
          panchayat?: string | null
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          project_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          project_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          id: string
          joined_at: string
          project_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          project_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          project_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          about: string | null
          created_at: string
          description: string | null
          download_file_url: string | null
          form_link: string | null
          id: string
          image_url: string | null
          status: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at: string
        }
        Insert: {
          about?: string | null
          created_at?: string
          description?: string | null
          download_file_url?: string | null
          form_link?: string | null
          id?: string
          image_url?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title: string
          updated_at?: string
        }
        Update: {
          about?: string | null
          created_at?: string
          description?: string | null
          download_file_url?: string | null
          form_link?: string | null
          id?: string
          image_url?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          title?: string
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          thumbnail_url: string | null
          title: string
          youtube_id: string
          youtube_url: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          thumbnail_url?: string | null
          title?: string
          youtube_id: string
          youtube_url: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          thumbnail_url?: string | null
          title?: string
          youtube_id?: string
          youtube_url?: string
        }
        Relationships: []
      }
      website_settings: {
        Row: {
          description: string | null
          favicon_url: string | null
          footer_content: Json | null
          header_content: Json | null
          id: string
          logo_url: string | null
          site_name: string
          updated_at: string
        }
        Insert: {
          description?: string | null
          favicon_url?: string | null
          footer_content?: Json | null
          header_content?: Json | null
          id?: string
          logo_url?: string | null
          site_name?: string
          updated_at?: string
        }
        Update: {
          description?: string | null
          favicon_url?: string | null
          footer_content?: Json | null
          header_content?: Json | null
          id?: string
          logo_url?: string | null
          site_name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: { Args: never; Returns: string }
      get_user_field: {
        Args: { _field: string; _user_id: string }
        Returns: string
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      lookup_referral_code: {
        Args: { _code: string }
        Returns: {
          referrer_id: string
          referrer_name: string
        }[]
      }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "state_admin"
        | "admin"
        | "district_coordinator"
        | "block_coordinator"
        | "panchayat_coordinator"
        | "user"
      application_status: "pending" | "under_review" | "approved" | "rejected"
      project_status: "active" | "inactive"
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
      app_role: [
        "super_admin",
        "state_admin",
        "admin",
        "district_coordinator",
        "block_coordinator",
        "panchayat_coordinator",
        "user",
      ],
      application_status: ["pending", "under_review", "approved", "rejected"],
      project_status: ["active", "inactive"],
    },
  },
} as const
