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
          code: string
          name: string | null
          price: number | null
          last_buy_date: string | null
          meeting_date: string | null
          meeting_type: string | null
          location: string | null
          souvenir_item: string | null
          odd_lot: boolean | null
          source_url: string | null
          data_hash: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          doc_id: string
          code: string
          name?: string | null
          price?: number | null
          last_buy_date?: string | null
          meeting_date?: string | null
          meeting_type?: string | null
          location?: string | null
          souvenir_item?: string | null
          odd_lot?: boolean | null
          source_url?: string | null
          data_hash?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          doc_id?: string
          code?: string
          name?: string | null
          price?: number | null
          last_buy_date?: string | null
          meeting_date?: string | null
          meeting_type?: string | null
          location?: string | null
          souvenir_item?: string | null
          odd_lot?: boolean | null
          source_url?: string | null
          data_hash?: string | null
          status?: string | null
          updated_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          role: 'admin' | 'user' | null
          created_at: string | null
          is_primary_admin: boolean | null
          added_at: string | null
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          role?: 'admin' | 'user' | null
          created_at?: string | null
          is_primary_admin?: boolean | null
          added_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          role?: 'admin' | 'user' | null
          created_at?: string | null
          is_primary_admin?: boolean | null
          added_at?: string | null
        }
      }
      user_collections: {
        Row: {
          id: number
          user_id: string
          souvenir_id: number
          status: 'pending' | 'collected' | 'missed' | 'holding' | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: number
          user_id: string
          souvenir_id: number
          status?: 'pending' | 'collected' | 'missed' | 'holding' | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: number
          user_id?: string
          souvenir_id?: number
          status?: 'pending' | 'collected' | 'missed' | 'holding' | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      scraper_sources: {
        Row: {
          id: number
          source_name: string
          source_url: string
          method: string | null
          target_rules: Json | null
          is_active: boolean | null
          last_scraped_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          source_name: string
          source_url: string
          method?: string | null
          target_rules?: Json | null
          is_active?: boolean | null
          last_scraped_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          source_name?: string
          source_url?: string
          method?: string | null
          target_rules?: Json | null
          is_active?: boolean | null
          last_scraped_at?: string | null
          created_at?: string | null
        }
      }
    }
    Views: {
      admin_user_favorites: {
        Row: {
          collection_id: number
          user_id: string
          email: string | null
          souvenir_id: number
          stock_code: string | null
          company_name: string | null
          souvenir_item: string | null
          collected_at: string | null
          last_buy_date: string | null
          meeting_date: string | null
        }
      }
    }
    Functions: {
      [_: string]: never
    }
    Enums: {
      [_: string]: never
    }
  }
}
