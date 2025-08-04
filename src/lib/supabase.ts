import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Database {
  public: {
    Tables: {
      providers: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string
          bio: string | null
          location: string
          pricing: string | null
          availability: string | null
          profile_photo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          phone: string
          bio?: string | null
          location: string
          pricing?: string | null
          availability?: string | null
          profile_photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string
          bio?: string | null
          location?: string
          pricing?: string | null
          availability?: string | null
          profile_photo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      provider_services: {
        Row: {
          id: string
          provider_id: string
          service_category: string
          created_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          service_category: string
          created_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          service_category?: string
          created_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          provider_id: string
          customer_name: string
          customer_phone: string
          customer_email: string
          service_date: string
          service_time: string
          location: string
          special_requests: string | null
          payment_method: string
          status: string
          total_amount: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          customer_name: string
          customer_phone: string
          customer_email: string
          service_date: string
          service_time: string
          location: string
          special_requests?: string | null
          payment_method: string
          status?: string
          total_amount?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          customer_name?: string
          customer_phone?: string
          customer_email?: string
          service_date?: string
          service_time?: string
          location?: string
          special_requests?: string | null
          payment_method?: string
          status?: string
          total_amount?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}