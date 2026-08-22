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
      admin_audit: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          detail: Json | null
          id: string
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          detail?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          detail?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          is_new_visitor: boolean
          path: string | null
          prompt_id: string | null
          referrer: string | null
          session_id: string | null
          visitor_id: string
        }
        Insert: {
          created_at?: string
          event_type?: string
          id?: string
          is_new_visitor?: boolean
          path?: string | null
          prompt_id?: string | null
          referrer?: string | null
          session_id?: string | null
          visitor_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          is_new_visitor?: boolean
          path?: string | null
          prompt_id?: string | null
          referrer?: string | null
          session_id?: string | null
          visitor_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          active: boolean
          body: string | null
          created_at: string
          id: string
          level: string
          title: string
        }
        Insert: {
          active?: boolean
          body?: string | null
          created_at?: string
          id?: string
          level?: string
          title: string
        }
        Update: {
          active?: boolean
          body?: string | null
          created_at?: string
          id?: string
          level?: string
          title?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          author: string
          blocks: Json
          category: string
          created_at: string
          created_by: string | null
          description: string
          emoji: string
          id: string
          intro: string
          published_at: string
          read_minutes: number
          slug: string
          status: string
          takeaways: Json
          title: string
          updated_at: string
        }
        Insert: {
          author?: string
          blocks?: Json
          category?: string
          created_at?: string
          created_by?: string | null
          description: string
          emoji?: string
          id?: string
          intro: string
          published_at?: string
          read_minutes?: number
          slug: string
          status?: string
          takeaways?: Json
          title: string
          updated_at?: string
        }
        Update: {
          author?: string
          blocks?: Json
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          emoji?: string
          id?: string
          intro?: string
          published_at?: string
          read_minutes?: number
          slug?: string
          status?: string
          takeaways?: Json
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      collection_items: {
        Row: {
          collection_id: string
          id: string
          prompt_id: string
          sort_order: number
        }
        Insert: {
          collection_id: string
          id?: string
          prompt_id: string
          sort_order?: number
        }
        Update: {
          collection_id?: string
          id?: string
          prompt_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          cover: string | null
          created_at: string
          creator_id: string
          description: string
          featured: boolean
          id: string
          is_free: boolean
          price_pence: number
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          cover?: string | null
          created_at?: string
          creator_id: string
          description?: string
          featured?: boolean
          id?: string
          is_free?: boolean
          price_pence?: number
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          cover?: string | null
          created_at?: string
          creator_id?: string
          description?: string
          featured?: boolean
          id?: string
          is_free?: boolean
          price_pence?: number
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collections_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          level: string
          message: string
          source: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          level?: string
          message: string
          source?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          level?: string
          message?: string
          source?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      fb_autopilot_cycles: {
        Row: {
          attach_media: boolean
          created_at: string
          cycle_id: number
          notes: string | null
          updated_at: string
        }
        Insert: {
          attach_media?: boolean
          created_at?: string
          cycle_id: number
          notes?: string | null
          updated_at?: string
        }
        Update: {
          attach_media?: boolean
          created_at?: string
          cycle_id?: number
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      fb_autopilot_schedule: {
        Row: {
          created_at: string
          days_of_week: number[]
          enabled: boolean
          id: number
          post_hour: number
          start_date: string
          updated_at: string
          weeks: number
        }
        Insert: {
          created_at?: string
          days_of_week?: number[]
          enabled?: boolean
          id?: number
          post_hour?: number
          start_date?: string
          updated_at?: string
          weeks?: number
        }
        Update: {
          created_at?: string
          days_of_week?: number[]
          enabled?: boolean
          id?: number
          post_hour?: number
          start_date?: string
          updated_at?: string
          weeks?: number
        }
        Relationships: []
      }
      fb_credentials: {
        Row: {
          created_at: string
          expires_at: string | null
          id: number
          last_checked_at: string | null
          last_error: string | null
          page_access_token: string | null
          page_id: string | null
          page_name: string | null
          token_type: string
          updated_at: string
          user_access_token: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: number
          last_checked_at?: string | null
          last_error?: string | null
          page_access_token?: string | null
          page_id?: string | null
          page_name?: string | null
          token_type?: string
          updated_at?: string
          user_access_token?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: number
          last_checked_at?: string | null
          last_error?: string | null
          page_access_token?: string | null
          page_id?: string | null
          page_name?: string | null
          token_type?: string
          updated_at?: string
          user_access_token?: string | null
        }
        Relationships: []
      }
      fb_groups: {
        Row: {
          active: boolean
          created_at: string
          group_id: string
          id: string
          last_error: string | null
          last_posted_at: string | null
          name: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          group_id: string
          id?: string
          last_error?: string | null
          last_posted_at?: string | null
          name?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          group_id?: string
          id?: string
          last_error?: string | null
          last_posted_at?: string | null
          name?: string
        }
        Relationships: []
      }
      fb_post_pool: {
        Row: {
          content: string
          created_at: string
          cycle_id: number
          emoji_only: boolean
          fb_post_id: string | null
          generated_at: string
          has_media: boolean
          id: string
          image_url: string | null
          last_error: string | null
          posted_at: string | null
        }
        Insert: {
          content: string
          created_at?: string
          cycle_id?: number
          emoji_only?: boolean
          fb_post_id?: string | null
          generated_at?: string
          has_media?: boolean
          id?: string
          image_url?: string | null
          last_error?: string | null
          posted_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          cycle_id?: number
          emoji_only?: boolean
          fb_post_id?: string | null
          generated_at?: string
          has_media?: boolean
          id?: string
          image_url?: string | null
          last_error?: string | null
          posted_at?: string | null
        }
        Relationships: []
      }
      feature_flags: {
        Row: {
          description: string | null
          enabled: boolean
          key: string
          updated_at: string
        }
        Insert: {
          description?: string | null
          enabled?: boolean
          key: string
          updated_at?: string
        }
        Update: {
          description?: string | null
          enabled?: boolean
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          admin_note: string | null
          category: string
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_note?: string | null
          category?: string
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_note?: string | null
          category?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          creator_id: string
          follower_id: string
          id: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          follower_id: string
          id?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          follower_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_runs: {
        Row: {
          created_at: string
          id: string
          ok: boolean
          summary: Json
          tasks: string[]
        }
        Insert: {
          created_at?: string
          id?: string
          ok?: boolean
          summary?: Json
          tasks?: string[]
        }
        Update: {
          created_at?: string
          id?: string
          ok?: boolean
          summary?: Json
          tasks?: string[]
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      output_showcases: {
        Row: {
          content: string
          created_at: string
          id: string
          image_url: string | null
          prompt_id: string
          upvotes: number
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          prompt_id: string
          upvotes?: number
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          prompt_id?: string
          upvotes?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "output_showcases_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      private_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          is_admin_system: boolean
          metadata: Json | null
          read_at: string | null
          receiver_id: string
          sender_id: string | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          is_admin_system?: boolean
          metadata?: Json | null
          read_at?: string | null
          receiver_id: string
          sender_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          is_admin_system?: boolean
          metadata?: Json | null
          read_at?: string | null
          receiver_id?: string
          sender_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          early_bird_granted_at: string | null
          early_bird_recipient: boolean
          handle: string
          id: string
          is_creator: boolean
          membership_tier: Database["public"]["Enums"]["membership_tier"]
          promo_expires_at: string | null
          referral_code: string | null
          stripe_account_id: string | null
          total_earnings_pence: number
          total_sales: number
          twitter_handle: string | null
          updated_at: string
          upload_credits: number
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          early_bird_granted_at?: string | null
          early_bird_recipient?: boolean
          handle: string
          id: string
          is_creator?: boolean
          membership_tier?: Database["public"]["Enums"]["membership_tier"]
          promo_expires_at?: string | null
          referral_code?: string | null
          stripe_account_id?: string | null
          total_earnings_pence?: number
          total_sales?: number
          twitter_handle?: string | null
          updated_at?: string
          upload_credits?: number
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          early_bird_granted_at?: string | null
          early_bird_recipient?: boolean
          handle?: string
          id?: string
          is_creator?: boolean
          membership_tier?: Database["public"]["Enums"]["membership_tier"]
          promo_expires_at?: string | null
          referral_code?: string | null
          stripe_account_id?: string | null
          total_earnings_pence?: number
          total_sales?: number
          twitter_handle?: string | null
          updated_at?: string
          upload_credits?: number
          website_url?: string | null
        }
        Relationships: []
      }
      prompt_versions: {
        Row: {
          body: string
          changelog: string
          created_at: string
          id: string
          prompt_id: string
          version: number
        }
        Insert: {
          body: string
          changelog?: string
          created_at?: string
          id?: string
          prompt_id: string
          version: number
        }
        Update: {
          body?: string
          changelog?: string
          created_at?: string
          id?: string
          prompt_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompt_versions_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      prompts: {
        Row: {
          body: string
          category_id: string
          copies_count: number
          created_at: string
          creator_id: string
          description: string
          example_output: string
          featured: boolean
          id: string
          image_url: string | null
          is_free: boolean
          model: Database["public"]["Enums"]["ai_model"]
          price_pence: number
          rating_avg: number
          rating_count: number
          sales_count: number
          slug: string
          status: Database["public"]["Enums"]["prompt_status"]
          tags: string[]
          title: string
          trending_score: number
          updated_at: string
          version: number
          views: number
        }
        Insert: {
          body: string
          category_id: string
          copies_count?: number
          created_at?: string
          creator_id: string
          description: string
          example_output: string
          featured?: boolean
          id?: string
          image_url?: string | null
          is_free?: boolean
          model?: Database["public"]["Enums"]["ai_model"]
          price_pence?: number
          rating_avg?: number
          rating_count?: number
          sales_count?: number
          slug: string
          status?: Database["public"]["Enums"]["prompt_status"]
          tags?: string[]
          title: string
          trending_score?: number
          updated_at?: string
          version?: number
          views?: number
        }
        Update: {
          body?: string
          category_id?: string
          copies_count?: number
          created_at?: string
          creator_id?: string
          description?: string
          example_output?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          is_free?: boolean
          model?: Database["public"]["Enums"]["ai_model"]
          price_pence?: number
          rating_avg?: number
          rating_count?: number
          sales_count?: number
          slug?: string
          status?: Database["public"]["Enums"]["prompt_status"]
          tags?: string[]
          title?: string
          trending_score?: number
          updated_at?: string
          version?: number
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "prompts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prompts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          amount_pence: number
          buyer_id: string
          created_at: string
          creator_earning_pence: number
          id: string
          is_free: boolean
          platform_fee_pence: number
          prompt_id: string
          stripe_session_id: string | null
        }
        Insert: {
          amount_pence: number
          buyer_id: string
          created_at?: string
          creator_earning_pence?: number
          id?: string
          is_free?: boolean
          platform_fee_pence?: number
          prompt_id: string
          stripe_session_id?: string | null
        }
        Update: {
          amount_pence?: number
          buyer_id?: string
          created_at?: string
          creator_earning_pence?: number
          id?: string
          is_free?: boolean
          platform_fee_pence?: number
          prompt_id?: string
          stripe_session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchases_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          code: string
          created_at: string
          id: string
          referred_user_id: string | null
          referrer_id: string
          reward_pence: number
          status: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          referred_user_id?: string | null
          referrer_id: string
          reward_pence?: number
          status?: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          referred_user_id?: string | null
          referrer_id?: string
          reward_pence?: number
          status?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          id: string
          reason: string
          reporter_id: string | null
          status: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reporter_id?: string | null
          status?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reporter_id?: string | null
          status?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          body: string | null
          buyer_id: string
          created_at: string
          id: string
          prompt_id: string
          rating: number
          updated_at: string
        }
        Insert: {
          body?: string | null
          buyer_id: string
          created_at?: string
          id?: string
          prompt_id: string
          rating: number
          updated_at?: string
        }
        Update: {
          body?: string | null
          buyer_id?: string
          created_at?: string
          id?: string
          prompt_id?: string
          rating?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_prompts: {
        Row: {
          created_at: string
          prompt_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          prompt_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          prompt_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_prompts_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_prompts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_posts: {
        Row: {
          caption: string
          created_at: string
          created_by: string | null
          id: string
          media_url: string | null
          platform: string
          prompt_id: string | null
          result: Json | null
          scheduled_at: string
          status: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          caption: string
          created_at?: string
          created_by?: string | null
          id?: string
          media_url?: string | null
          platform: string
          prompt_id?: string | null
          result?: Json | null
          scheduled_at?: string
          status?: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          caption?: string
          created_at?: string
          created_by?: string | null
          id?: string
          media_url?: string | null
          platform?: string
          prompt_id?: string | null
          result?: Json | null
          scheduled_at?: string
          status?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          commission_percent: number
          id: number
          updated_at: string
        }
        Insert: {
          commission_percent?: number
          id?: number
          updated_at?: string
        }
        Update: {
          commission_percent?: number
          id?: number
          updated_at?: string
        }
        Relationships: []
      }
      showcase_votes: {
        Row: {
          created_at: string
          id: string
          showcase_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          showcase_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          showcase_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "showcase_votes_showcase_id_fkey"
            columns: ["showcase_id"]
            isOneToOne: false
            referencedRelation: "output_showcases"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      tiktok_automation_settings: {
        Row: {
          auto_post: boolean
          caption_instructions: string | null
          content_source: string
          created_at: string
          cron_secret: string
          enabled: boolean
          id: string
          image_style: string
          interval_hours: number
          last_run_at: string | null
          next_run_at: string | null
          posts_per_run: number
          schedule_mode: string
          slide_count: number
          time_slots: Json
          timezone: string
          tt_access_token: string | null
          tt_oauth_state: string | null
          tt_open_id: string | null
          tt_refresh_token: string | null
          tt_scope: string | null
          tt_token_expires_at: string | null
          tt_username: string | null
          updated_at: string
        }
        Insert: {
          auto_post?: boolean
          caption_instructions?: string | null
          content_source?: string
          created_at?: string
          cron_secret?: string
          enabled?: boolean
          id?: string
          image_style?: string
          interval_hours?: number
          last_run_at?: string | null
          next_run_at?: string | null
          posts_per_run?: number
          schedule_mode?: string
          slide_count?: number
          time_slots?: Json
          timezone?: string
          tt_access_token?: string | null
          tt_oauth_state?: string | null
          tt_open_id?: string | null
          tt_refresh_token?: string | null
          tt_scope?: string | null
          tt_token_expires_at?: string | null
          tt_username?: string | null
          updated_at?: string
        }
        Update: {
          auto_post?: boolean
          caption_instructions?: string | null
          content_source?: string
          created_at?: string
          cron_secret?: string
          enabled?: boolean
          id?: string
          image_style?: string
          interval_hours?: number
          last_run_at?: string | null
          next_run_at?: string | null
          posts_per_run?: number
          schedule_mode?: string
          slide_count?: number
          time_slots?: Json
          timezone?: string
          tt_access_token?: string | null
          tt_oauth_state?: string | null
          tt_open_id?: string | null
          tt_refresh_token?: string | null
          tt_scope?: string | null
          tt_token_expires_at?: string | null
          tt_username?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tiktok_videos: {
        Row: {
          caption: string | null
          created_at: string
          created_by: string | null
          error: string | null
          id: string
          posted_at: string | null
          prompt_id: string | null
          result: Json | null
          scheduled_for: string
          slides: Json
          source_type: string
          status: string
          tiktok_post_id: string | null
          topic: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          created_by?: string | null
          error?: string | null
          id?: string
          posted_at?: string | null
          prompt_id?: string | null
          result?: Json | null
          scheduled_for?: string
          slides?: Json
          source_type?: string
          status?: string
          tiktok_post_id?: string | null
          topic?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          created_by?: string | null
          error?: string | null
          id?: string
          posted_at?: string | null
          prompt_id?: string | null
          result?: Json | null
          scheduled_for?: string
          slides?: Json
          source_type?: string
          status?: string
          tiktok_post_id?: string | null
          topic?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tiktok_videos_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
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
          role: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_analytics: { Args: { _days?: number }; Returns: Json }
      admin_early_bird_recipients: {
        Args: never
        Returns: {
          avatar_url: string
          display_name: string
          granted_at: string
          handle: string
          id: string
          promo_expires_at: string
        }[]
      }
      admin_enqueue_email: {
        Args: { _html: string; _subject: string; _to: string }
        Returns: Json
      }
      admin_find_user: {
        Args: { _q: string }
        Returns: {
          display_name: string
          email: string
          handle: string
          id: string
        }[]
      }
      admin_list_users: {
        Args: { _q?: string }
        Returns: {
          avatar_url: string
          created_at: string
          display_name: string
          handle: string
          id: string
          is_creator: boolean
          membership_tier: Database["public"]["Enums"]["membership_tier"]
          total_earnings_pence: number
          total_sales: number
        }[]
      }
      admin_set_user_creator: {
        Args: { _is_creator: boolean; _user_id: string }
        Returns: undefined
      }
      admin_set_user_tier: {
        Args: {
          _tier: Database["public"]["Enums"]["membership_tier"]
          _user_id: string
        }
        Returns: undefined
      }
      cleanup_stale_creator_prompts: { Args: never; Returns: number }
      creator_follower_count: { Args: { _creator_id: string }; Returns: number }
      default_admin_id: { Args: never; Returns: string }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_creator_tier: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["membership_tier"]
      }
      get_my_billing: {
        Args: never
        Returns: {
          referral_code: string
          stripe_account_id: string
          total_earnings_pence: number
          total_sales: number
        }[]
      }
      get_my_sales: {
        Args: never
        Returns: {
          amount_pence: number
          created_at: string
          creator_earning_pence: number
          id: string
          is_free: boolean
          prompt_id: string
          prompt_title: string
        }[]
      }
      get_my_tier_info: {
        Args: never
        Returns: {
          membership_tier: Database["public"]["Enums"]["membership_tier"]
          upload_credits: number
        }[]
      }
      get_prompt_body: { Args: { _prompt_id: string }; Returns: string }
      get_prompt_changelog: {
        Args: { _prompt_id: string }
        Returns: {
          changelog: string
          created_at: string
          version: number
        }[]
      }
      grant_early_bird_promo: {
        Args: { target_user_id: string }
        Returns: Json
      }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_purchased: {
        Args: { _prompt_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_prompt_copies: {
        Args: { _prompt_id: string }
        Returns: undefined
      }
      increment_prompt_views: {
        Args: { _prompt_id: string }
        Returns: undefined
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      prompt_uploads_this_month: { Args: { _user_id: string }; Returns: number }
      prune_platform_prompts: {
        Args: { _remove_count: number }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      recompute_trending: { Args: never; Returns: number }
      tier_earning_pence: {
        Args: { _tier: Database["public"]["Enums"]["membership_tier"] }
        Returns: number
      }
      tier_fee_pence: {
        Args: { _tier: Database["public"]["Enums"]["membership_tier"] }
        Returns: number
      }
      tier_quota: {
        Args: { _tier: Database["public"]["Enums"]["membership_tier"] }
        Returns: number
      }
    }
    Enums: {
      ai_model:
        | "chatgpt"
        | "claude"
        | "gemini"
        | "midjourney"
        | "sora"
        | "dalle"
        | "other"
      app_role: "admin" | "moderator" | "user"
      membership_tier: "free" | "pro" | "platinum"
      prompt_status: "draft" | "pending" | "approved" | "rejected"
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
      ai_model: [
        "chatgpt",
        "claude",
        "gemini",
        "midjourney",
        "sora",
        "dalle",
        "other",
      ],
      app_role: ["admin", "moderator", "user"],
      membership_tier: ["free", "pro", "platinum"],
      prompt_status: ["draft", "pending", "approved", "rejected"],
    },
  },
} as const
