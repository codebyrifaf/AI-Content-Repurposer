export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          monthly_generations: number;
          monthly_reset_date: string;
          subscription_status: string;
          subscription_updated_at: string;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          monthly_generations?: number;
          monthly_reset_date?: string;
          subscription_status?: string;
          subscription_updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          monthly_generations?: number;
          monthly_reset_date?: string;
          subscription_status?: string;
          subscription_updated_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      generations: {
        Row: {
          id: string;
          user_id: string;
          niche: string;
          audience: string | null;
          topic: string;
          tone: string | null;
          result_json: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          niche: string;
          audience?: string | null;
          topic: string;
          tone?: string | null;
          result_json: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          niche?: string;
          audience?: string | null;
          topic?: string;
          tone?: string | null;
          result_json?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      brand_profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          business_description: string | null;
          target_audience: string | null;
          offer: string | null;
          tone_of_voice: string | null;
          cta_style: string | null;
          platform_focus: string[];
          brand_keywords: string[];
          forbidden_phrases: string[];
          writing_style: string | null;
          posting_goals: string | null;
          profile_version: number;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          business_description?: string | null;
          target_audience?: string | null;
          offer?: string | null;
          tone_of_voice?: string | null;
          cta_style?: string | null;
          platform_focus?: string[];
          brand_keywords?: string[];
          forbidden_phrases?: string[];
          writing_style?: string | null;
          posting_goals?: string | null;
          profile_version?: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          business_description?: string | null;
          target_audience?: string | null;
          offer?: string | null;
          tone_of_voice?: string | null;
          cta_style?: string | null;
          platform_focus?: string[];
          brand_keywords?: string[];
          forbidden_phrases?: string[];
          writing_style?: string | null;
          posting_goals?: string | null;
          profile_version?: number;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_usage_status: {
        Args: { p_limit?: number };
        Returns: {
          monthly_generations: number;
          remaining: number | null;
          subscription_status: string;
          monthly_reset_date: string;
        }[];
      };
      consume_generation: {
        Args: { p_limit?: number };
        Returns: {
          allowed: boolean;
          remaining: number | null;
          monthly_generations: number;
          subscription_status: string;
          monthly_reset_date: string;
        }[];
      };
      refund_generation: {
        Args: Record<string, never>;
        Returns: number;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
