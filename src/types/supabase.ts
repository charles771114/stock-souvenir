/**
 * Supabase Database Types
 * 
 * 這個檔案可以透過以下指令自動生成：
 * npm run supabase:types
 * 
 * 或手動執行：
 * supabase gen types typescript --local > src/types/supabase.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      souvenirs: {
        Row: {
          id: number
          doc_id: string
          number: string | null
          code: string
          name: string | null
          price: number | null
          last_buy_date: string | null
          meeting_date: string | null
          meeting_type: string | null
          location: string | null
          souvenir_item: string | null
          odd_lot: boolean
          source_url: string | null
          data_hash: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          doc_id: string
          number?: string | null
          code: string
          name?: string | null
          price?: number | null
          last_buy_date?: string | null
          meeting_date?: string | null
          meeting_type?: string | null
          location?: string | null
          souvenir_item?: string | null
          odd_lot?: boolean
          source_url?: string | null
          data_hash?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          doc_id?: string
          number?: string | null
          code?: string
          name?: string | null
          price?: number | null
          last_buy_date?: string | null
          meeting_date?: string | null
          meeting_type?: string | null
          location?: string | null
          souvenir_item?: string | null
          odd_lot?: boolean
          source_url?: string | null
          data_hash?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_collections: {
        Row: {
          id: number
          user_id: string
          souvenir_id: number
          status: string
          quantity: number
          note: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          souvenir_id: number
          status?: string
          quantity?: number
          note?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          souvenir_id?: number
          status?: string
          quantity?: number
          note?: string | null
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

// Helper types
export type Souvenir = Database['public']['Tables']['souvenirs']['Row']
export type SouvenirInsert = Database['public']['Tables']['souvenirs']['Insert']
export type SouvenirUpdate = Database['public']['Tables']['souvenirs']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type UserCollection = Database['public']['Tables']['user_collections']['Row']
export type UserCollectionInsert = Database['public']['Tables']['user_collections']['Insert']
export type UserCollectionUpdate = Database['public']['Tables']['user_collections']['Update']

// Extended types with relations
export type UserCollectionWithSouvenir = UserCollection & {
  souvenir: Souvenir
}

// Status enums
export type CollectionStatus = 'pending' | 'collected' | 'missed'
export type UserRole = 'admin' | 'user'
export type SouvenirStatus = 'active' | 'inactive'
