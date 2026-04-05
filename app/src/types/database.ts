export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          logo_url: string | null;
          phone: string | null;
          email: string | null;
          settings_json: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          address?: string | null;
          logo_url?: string | null;
          phone?: string | null;
          email?: string | null;
          settings_json?: Json | null;
        };
        Update: {
          name?: string;
          address?: string | null;
          logo_url?: string | null;
          phone?: string | null;
          email?: string | null;
          settings_json?: Json | null;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          org_id: string | null;
          email: string;
          full_name: string;
          role: "admin" | "coordinator" | "mentor";
          avatar_url: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          org_id?: string | null;
          email: string;
          full_name: string;
          role?: "admin" | "coordinator" | "mentor";
          avatar_url?: string | null;
          phone?: string | null;
          is_active?: boolean;
        };
        Update: {
          org_id?: string | null;
          email?: string;
          full_name?: string;
          role?: "admin" | "coordinator" | "mentor";
          avatar_url?: string | null;
          phone?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      roles: {
        Row: { id: string; name: string; permissions_json: Json; created_at: string };
        Insert: { name: string; permissions_json: Json };
        Update: { name?: string; permissions_json?: Json };
        Relationships: [];
      };
      activity_log: {
        Row: {
          id: string; user_id: string; entity_type: string; entity_id: string;
          action: string; old_value: Json | null; new_value: Json | null; created_at: string;
        };
        Insert: {
          user_id: string; entity_type: string; entity_id: string;
          action: string; old_value?: Json | null; new_value?: Json | null;
        };
        Update: {
          user_id?: string; entity_type?: string; entity_id?: string;
          action?: string; old_value?: Json | null; new_value?: Json | null;
        };
        Relationships: [];
      };
      boys: {
        Row: {
          id: string; full_name: string; date_of_birth: string | null; school_id: string | null;
          county: string; sub_county: string | null; guardian_name: string | null;
          guardian_phone: string | null; enrollment_date: string;
          status: "active" | "graduated" | "inactive"; notes: string | null;
          created_at: string; updated_at: string; created_by: string;
        };
        Insert: {
          full_name: string; date_of_birth?: string | null; school_id?: string | null;
          county: string; sub_county?: string | null; guardian_name?: string | null;
          guardian_phone?: string | null; enrollment_date: string;
          status?: "active" | "graduated" | "inactive"; notes?: string | null; created_by: string;
        };
        Update: {
          full_name?: string; date_of_birth?: string | null; school_id?: string | null;
          county?: string; sub_county?: string | null; guardian_name?: string | null;
          guardian_phone?: string | null; enrollment_date?: string;
          status?: "active" | "graduated" | "inactive"; notes?: string | null;
        };
        Relationships: [];
      };
      schools: {
        Row: {
          id: string; name: string; county: string; sub_county: string | null;
          contact_person: string | null; phone: string | null; email: string | null;
          partnership_date: string | null; is_active: boolean;
          created_at: string; updated_at: string;
        };
        Insert: {
          name: string; county: string; sub_county?: string | null;
          contact_person?: string | null; phone?: string | null; email?: string | null;
          partnership_date?: string | null; is_active?: boolean;
        };
        Update: {
          name?: string; county?: string; sub_county?: string | null;
          contact_person?: string | null; phone?: string | null; email?: string | null;
          partnership_date?: string | null; is_active?: boolean;
        };
        Relationships: [];
      };
      mentors: {
        Row: {
          id: string; user_id: string | null; full_name: string; phone: string | null;
          email: string | null; expertise: string | null; county: string | null;
          availability_json: Json | null; is_active: boolean;
          created_at: string; updated_at: string;
        };
        Insert: {
          user_id?: string | null; full_name: string; phone?: string | null;
          email?: string | null; expertise?: string | null; county?: string | null;
          availability_json?: Json | null; is_active?: boolean;
        };
        Update: {
          user_id?: string | null; full_name?: string; phone?: string | null;
          email?: string | null; expertise?: string | null; county?: string | null;
          availability_json?: Json | null; is_active?: boolean;
        };
        Relationships: [];
      };
      mentor_assignments: {
        Row: {
          id: string; mentor_id: string; boy_id: string; assigned_date: string;
          status: "active" | "completed"; notes: string | null; created_at: string;
        };
        Insert: {
          mentor_id: string; boy_id: string; assigned_date: string;
          status?: "active" | "completed"; notes?: string | null;
        };
        Update: {
          mentor_id?: string; boy_id?: string; assigned_date?: string;
          status?: "active" | "completed"; notes?: string | null;
        };
        Relationships: [];
      };
      progress_notes: {
        Row: {
          id: string; boy_id: string; mentor_id: string; date: string;
          category: "academic" | "emotional" | "behavioral" | "leadership";
          note: string; rating: number; created_at: string;
        };
        Insert: {
          boy_id: string; mentor_id: string; date: string;
          category: "academic" | "emotional" | "behavioral" | "leadership";
          note: string; rating: number;
        };
        Update: {
          boy_id?: string; mentor_id?: string; date?: string;
          category?: "academic" | "emotional" | "behavioral" | "leadership";
          note?: string; rating?: number;
        };
        Relationships: [];
      };
      boy_documents: {
        Row: {
          id: string; boy_id: string; file_url: string;
          doc_type: "report_card" | "photo" | "certificate";
          uploaded_by: string; created_at: string;
        };
        Insert: {
          boy_id: string; file_url: string;
          doc_type: "report_card" | "photo" | "certificate"; uploaded_by: string;
        };
        Update: {
          boy_id?: string; file_url?: string;
          doc_type?: "report_card" | "photo" | "certificate"; uploaded_by?: string;
        };
        Relationships: [];
      };
      donations: {
        Row: {
          id: string; donor_name: string | null; donor_email: string | null;
          donor_phone: string | null; amount: number; currency: "KES" | "USD";
          payment_method: "mpesa" | "stripe" | "cash" | "bank";
          transaction_ref: string | null; status: "pending" | "completed" | "failed";
          purpose: string | null; campaign_id: string | null; receipt_url: string | null;
          is_anonymous: boolean; created_at: string; updated_at: string;
        };
        Insert: {
          donor_name?: string | null; donor_email?: string | null;
          donor_phone?: string | null; amount: number; currency?: "KES" | "USD";
          payment_method: "mpesa" | "stripe" | "cash" | "bank";
          transaction_ref?: string | null; status?: "pending" | "completed" | "failed";
          purpose?: string | null; campaign_id?: string | null; receipt_url?: string | null;
          is_anonymous?: boolean;
        };
        Update: {
          donor_name?: string | null; donor_email?: string | null;
          donor_phone?: string | null; amount?: number; currency?: "KES" | "USD";
          payment_method?: "mpesa" | "stripe" | "cash" | "bank";
          transaction_ref?: string | null; status?: "pending" | "completed" | "failed";
          purpose?: string | null; campaign_id?: string | null; receipt_url?: string | null;
          is_anonymous?: boolean;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string; category: "transport" | "materials" | "venue" | "food" | "admin" | "other";
          amount: number; description: string; receipt_url: string | null;
          approved_by: string | null; event_id: string | null;
          status: "pending" | "approved" | "rejected";
          created_by: string; created_at: string; updated_at: string;
        };
        Insert: {
          category: "transport" | "materials" | "venue" | "food" | "admin" | "other";
          amount: number; description: string; receipt_url?: string | null;
          approved_by?: string | null; event_id?: string | null;
          status?: "pending" | "approved" | "rejected"; created_by: string;
        };
        Update: {
          category?: "transport" | "materials" | "venue" | "food" | "admin" | "other";
          amount?: number; description?: string; receipt_url?: string | null;
          approved_by?: string | null; event_id?: string | null;
          status?: "pending" | "approved" | "rejected";
        };
        Relationships: [];
      };
      donation_campaigns: {
        Row: {
          id: string; name: string; description: string | null;
          target_amount: number; raised_amount: number; start_date: string;
          end_date: string | null; is_active: boolean;
          created_at: string; updated_at: string;
        };
        Insert: {
          name: string; description?: string | null;
          target_amount: number; raised_amount?: number; start_date: string;
          end_date?: string | null; is_active?: boolean;
        };
        Update: {
          name?: string; description?: string | null;
          target_amount?: number; raised_amount?: number; start_date?: string;
          end_date?: string | null; is_active?: boolean;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string; title: string; description: string | null;
          event_type: "seminar" | "school_visit" | "workshop" | "fundraiser" | "community";
          school_id: string | null; location: string; county: string;
          date: string; start_time: string | null; end_time: string | null;
          status: "planned" | "ongoing" | "completed" | "cancelled";
          budget: number | null; actual_cost: number | null;
          coordinator_id: string | null;
          created_at: string; updated_at: string; created_by: string;
        };
        Insert: {
          title: string; description?: string | null;
          event_type: "seminar" | "school_visit" | "workshop" | "fundraiser" | "community";
          school_id?: string | null; location: string; county: string;
          date: string; start_time?: string | null; end_time?: string | null;
          status?: "planned" | "ongoing" | "completed" | "cancelled";
          budget?: number | null; actual_cost?: number | null;
          coordinator_id?: string | null; created_by: string;
        };
        Update: {
          title?: string; description?: string | null;
          event_type?: "seminar" | "school_visit" | "workshop" | "fundraiser" | "community";
          school_id?: string | null; location?: string; county?: string;
          date?: string; start_time?: string | null; end_time?: string | null;
          status?: "planned" | "ongoing" | "completed" | "cancelled";
          budget?: number | null; actual_cost?: number | null;
          coordinator_id?: string | null;
        };
        Relationships: [];
      };
      event_attendees: {
        Row: { id: string; event_id: string; boy_id: string; attended: boolean; created_at: string };
        Insert: { event_id: string; boy_id: string; attended?: boolean };
        Update: { event_id?: string; boy_id?: string; attended?: boolean };
        Relationships: [];
      };
      event_media: {
        Row: {
          id: string; event_id: string; file_url: string;
          media_type: "photo" | "video"; caption: string | null;
          uploaded_by: string; created_at: string;
        };
        Insert: {
          event_id: string; file_url: string;
          media_type: "photo" | "video"; caption?: string | null; uploaded_by: string;
        };
        Update: {
          event_id?: string; file_url?: string;
          media_type?: "photo" | "video"; caption?: string | null; uploaded_by?: string;
        };
        Relationships: [];
      };
      event_notes: {
        Row: { id: string; event_id: string; user_id: string; note: string; created_at: string };
        Insert: { event_id: string; user_id: string; note: string };
        Update: { event_id?: string; user_id?: string; note?: string };
        Relationships: [];
      };
      content_posts: {
        Row: {
          id: string; title: string | null; body: string; media_urls: Json;
          platforms: Json; first_comment: string | null;
          status: "draft" | "scheduled" | "posted" | "failed";
          scheduled_at: string | null; posted_at: string | null;
          created_by: string; created_at: string; updated_at: string;
        };
        Insert: {
          title?: string | null; body: string; media_urls?: Json;
          platforms?: Json; first_comment?: string | null;
          status?: "draft" | "scheduled" | "posted" | "failed";
          scheduled_at?: string | null; posted_at?: string | null; created_by: string;
        };
        Update: {
          title?: string | null; body?: string; media_urls?: Json;
          platforms?: Json; first_comment?: string | null;
          status?: "draft" | "scheduled" | "posted" | "failed";
          scheduled_at?: string | null; posted_at?: string | null;
        };
        Relationships: [];
      };
      content_post_results: {
        Row: {
          id: string; post_id: string; platform: string;
          external_post_id: string | null; post_url: string | null;
          status: "success" | "failed"; error_message: string | null;
          posted_at: string | null; created_at: string;
        };
        Insert: {
          post_id: string; platform: string;
          external_post_id?: string | null; post_url?: string | null;
          status: "success" | "failed"; error_message?: string | null;
          posted_at?: string | null;
        };
        Update: {
          post_id?: string; platform?: string;
          external_post_id?: string | null; post_url?: string | null;
          status?: "success" | "failed"; error_message?: string | null;
          posted_at?: string | null;
        };
        Relationships: [];
      };
      social_accounts: {
        Row: {
          id: string; platform: string; account_name: string;
          access_token_encrypted: string; refresh_token_encrypted: string | null;
          token_expires_at: string | null; is_active: boolean;
          created_at: string; updated_at: string;
        };
        Insert: {
          platform: string; account_name: string;
          access_token_encrypted: string; refresh_token_encrypted?: string | null;
          token_expires_at?: string | null; is_active?: boolean;
        };
        Update: {
          platform?: string; account_name?: string;
          access_token_encrypted?: string; refresh_token_encrypted?: string | null;
          token_expires_at?: string | null; is_active?: boolean;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          id: string; name: string; role: "mentor" | "parent" | "boy" | "community_leader";
          quote: string; photo_url: string | null; is_featured: boolean;
          sort_order: number; created_at: string; updated_at: string;
        };
        Insert: {
          name: string; role: "mentor" | "parent" | "boy" | "community_leader";
          quote: string; photo_url?: string | null; is_featured?: boolean; sort_order?: number;
        };
        Update: {
          name?: string; role?: "mentor" | "parent" | "boy" | "community_leader";
          quote?: string; photo_url?: string | null; is_featured?: boolean; sort_order?: number;
        };
        Relationships: [];
      };
      impact_metrics: {
        Row: {
          id: string; label: string; value: number; icon: string | null;
          sort_order: number; created_at: string; updated_at: string;
        };
        Insert: { label: string; value: number; icon?: string | null; sort_order?: number };
        Update: { label?: string; value?: number; icon?: string | null; sort_order?: number };
        Relationships: [];
      };
      contact_submissions: {
        Row: {
          id: string; name: string; email: string; phone: string | null;
          subject: string | null; message: string;
          status: "new" | "read" | "replied"; replied_by: string | null; created_at: string;
        };
        Insert: {
          name: string; email: string; phone?: string | null;
          subject?: string | null; message: string;
          status?: "new" | "read" | "replied"; replied_by?: string | null;
        };
        Update: {
          name?: string; email?: string; phone?: string | null;
          subject?: string | null; message?: string;
          status?: "new" | "read" | "replied"; replied_by?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
