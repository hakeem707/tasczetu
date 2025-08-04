export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_date: string
          client_name: string
          client_phone: string
          created_at: string
          id: string
          is_read: boolean
          provider_id: string
          service_id: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          booking_date: string
          client_name: string
          client_phone: string
          created_at?: string
          id?: string
          is_read?: boolean
          provider_id: string
          service_id: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          booking_date?: string
          client_name?: string
          client_phone?: string
          created_at?: string
          id?: string
          is_read?: boolean
          provider_id?: string
          service_id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message: string | null
          last_message_at: string
          participant_1_id: string
          participant_2_id: string
          related_booking_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string
          participant_1_id: string
          participant_2_id: string
          related_booking_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_message?: string | null
          last_message_at?: string
          participant_1_id?: string
          participant_2_id?: string
          related_booking_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_related_booking_id_fkey"
            columns: ["related_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          receiver_id: string
          related_booking_id: string | null
          sender_id: string
          updated_at: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id: string
          related_booking_id?: string | null
          sender_id: string
          updated_at?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          receiver_id?: string
          related_booking_id?: string | null
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_messages_conversation_id"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_related_booking_id_fkey"
            columns: ["related_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_booking_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_booking_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_booking_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_related_booking_id_fkey"
            columns: ["related_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolios: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          provider_id: string
          title: string
          video_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          provider_id: string
          title: string
          video_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          provider_id?: string
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_suspended: boolean | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_suspended?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_suspended?: boolean | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      provider_services: {
        Row: {
          created_at: string
          id: string
          provider_id: string
          service_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          provider_id: string
          service_id: string
        }
        Update: {
          created_at?: string
          id?: string
          provider_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          bio: string | null
          certifications: string[] | null
          created_at: string
          id: string
          id_document_url: string | null
          image_url: string | null
          is_verified: boolean | null
          location: string | null
          name: string
          phone: string | null
          profile_photo_url: string | null
          service_category: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          id?: string
          id_document_url?: string | null
          image_url?: string | null
          is_verified?: boolean | null
          location?: string | null
          name: string
          phone?: string | null
          profile_photo_url?: string | null
          service_category?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          id?: string
          id_document_url?: string | null
          image_url?: string | null
          is_verified?: boolean | null
          location?: string | null
          name?: string
          phone?: string | null
          profile_photo_url?: string | null
          service_category?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          communication: number | null
          created_at: string
          id: string
          provider_id: string
          punctuality: number | null
          review_text: string | null
          stars: number
          user_id: string
          work_quality: number | null
        }
        Insert: {
          comment?: string | null
          communication?: number | null
          created_at?: string
          id?: string
          provider_id: string
          punctuality?: number | null
          review_text?: string | null
          stars: number
          user_id: string
          work_quality?: number | null
        }
        Update: {
          comment?: string | null
          communication?: number | null
          created_at?: string
          id?: string
          provider_id?: string
          punctuality?: number | null
          review_text?: string | null
          stars?: number
          user_id?: string
          work_quality?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          description: string | null
          id: string
          reason: string
          reported_provider_id: string | null
          reported_user_id: string | null
          reporter_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          reason: string
          reported_provider_id?: string | null
          reported_user_id?: string | null
          reporter_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          reason?: string
          reported_provider_id?: string | null
          reported_user_id?: string | null
          reporter_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_provider_id_fkey"
            columns: ["reported_provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      skills: {
        Row: {
          created_at: string
          id: string
          level: string | null
          name: string
          provider_id: string
          updated_at: string
          years_experience: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          level?: string | null
          name: string
          provider_id: string
          updated_at?: string
          years_experience?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          level?: string | null
          name?: string
          provider_id?: string
          updated_at?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "skills_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      work_experience: {
        Row: {
          client_feedback: string | null
          client_rating: number | null
          created_at: string
          description: string
          end_date: string | null
          id: string
          is_current: boolean | null
          job_title: string
          media_urls: string[] | null
          provider_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          client_feedback?: string | null
          client_rating?: number | null
          created_at?: string
          description: string
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          job_title: string
          media_urls?: string[] | null
          provider_id: string
          start_date: string
          updated_at?: string
        }
        Update: {
          client_feedback?: string | null
          client_rating?: number | null
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          job_title?: string
          media_urls?: string[] | null
          provider_id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_experience_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_account: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_conversation_id: {
        Args: {
          sender_user_id: string
          receiver_user_id: string
          booking_id?: string
        }
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user" | "provider"
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
      app_role: ["admin", "user", "provider"],
    },
  },
} as const
