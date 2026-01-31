export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          email_notifications: boolean;
          notification_frequency: "instant" | "daily_digest";
          last_notified_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          email_notifications?: boolean;
          notification_frequency?: "instant" | "daily_digest";
          last_notified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          email_notifications?: boolean;
          notification_frequency?: "instant" | "daily_digest";
          last_notified_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_keywords: {
        Row: {
          id: string;
          user_id: string;
          keyword: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          keyword: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          keyword?: string;
          created_at?: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          user_id: string;
          tender_title: string;
          tender_organization: string;
          tender_location: string | null;
          tender_deadline: string | null;
          tender_url: string | null;
          tender_category: string | null;
          matched_keyword: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tender_title: string;
          tender_organization: string;
          tender_location?: string | null;
          tender_deadline?: string | null;
          tender_url?: string | null;
          tender_category?: string | null;
          matched_keyword: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tender_title?: string;
          tender_organization?: string;
          tender_location?: string | null;
          tender_deadline?: string | null;
          tender_url?: string | null;
          tender_category?: string | null;
          matched_keyword?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type UserKeyword = Database["public"]["Tables"]["user_keywords"]["Row"];
export type Alert = Database["public"]["Tables"]["alerts"]["Row"];
