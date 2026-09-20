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
      ingredients: {
        Row: {
          id: string;
          name: string;
          expiry_date: string;
          storage: '냉장' | '냉동' | '실온';
          status: '여유' | '임박' | '오늘' | '초과';
          quantity: string | null;
          created_at: string;
          user_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          expiry_date: string;
          storage: '냉장' | '냉동' | '실온';
          status?: '여유' | '임박' | '오늘' | '초과';
          quantity?: string | null;
          created_at?: string;
          user_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          expiry_date?: string;
          storage?: '냉장' | '냉동' | '실온';
          status?: '여유' | '임박' | '오늘' | '초과';
          quantity?: string | null;
          created_at?: string;
          user_id?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
