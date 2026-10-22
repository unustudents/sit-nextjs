export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AppRole = 'admin' | 'user'
export type PageStatus = 'draft' | 'published' | 'archived'
export type EventType = 'page_view' | 'link_click'

export type ThemeTemplate = 'minimal' | 'glass' | 'bold'
export type ThemeFont = 'sans' | 'serif' | 'mono'
export type ButtonRadius = 'sm' | 'md' | 'lg' | 'full'
export type ThemeAnimation = 'off' | 'subtle'

export interface ThemeColors {
  background: string
  text: string
  button: string
  buttonText: string
}

export interface ThemeConfig {
  version: 1
  template: ThemeTemplate
  colors: ThemeColors
  font: ThemeFont
  buttonRadius: ButtonRadius
  backgroundStyle: 'solid' | 'gradient' | 'mesh'
  animation: ThemeAnimation
}

export interface SocialLink {
  label: string
  url: string
  icon: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string
          role: AppRole
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string
          role?: AppRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          role?: AppRole
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          id: string
          owner_id: string
          slug: string
          title: string
          description: string
          avatar_path: string | null
          status: PageStatus
          admin_disabled: boolean
          theme_config: ThemeConfig
          social_links: SocialLink[]
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          owner_id: string
          slug: string
          title: string
          description?: string
          avatar_path?: string | null
          status?: PageStatus
          admin_disabled?: boolean
          theme_config?: ThemeConfig
          social_links?: SocialLink[]
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          owner_id?: string
          slug?: string
          title?: string
          description?: string
          avatar_path?: string | null
          status?: PageStatus
          admin_disabled?: boolean
          theme_config?: ThemeConfig
          social_links?: SocialLink[]
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Relationships: []
      }
      links: {
        Row: {
          id: string
          page_id: string
          title: string
          url: string
          icon: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          page_id: string
          title: string
          url: string
          icon?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          page_id?: string
          title?: string
          url?: string
          icon?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          id: string
          page_id: string
          link_id: string | null
          event_type: EventType
          created_at: string
        }
        Insert: {
          id?: string
          page_id: string
          link_id?: string | null
          event_type: EventType
          created_at?: string
        }
        Update: {
          id?: string
          page_id?: string
          link_id?: string | null
          event_type?: EventType
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_active_user: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: {
      app_role: AppRole
      page_status: PageStatus
      event_type: EventType
    }
  }
}
