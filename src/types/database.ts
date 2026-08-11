export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ClientStatus =
  | "inquiry"
  | "follow_up"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "archived";
export type WeddingStatus =
  | "inquiry"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type FinancialRecordType = "revenue" | "expense" | "payment";
export type FinancialRecordStatus =
  | "pending"
  | "paid"
  | "outstanding"
  | "cancelled";

export type InviteRole =
  | "admin"
  | "coordinator"
  | "event_planner"
  | "finance"
  | "sales"
  | "designer"
  | "staff";

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export type InvitationAuditAction =
  | "created"
  | "emailed"
  | "email_failed"
  | "accepted"
  | "expired"
  | "revoked"
  | "resent";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          display_name: string | null;
          avatar_url: string | null;
          company: string | null;
          role: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          company?: string | null;
          role?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          company?: string | null;
          role?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          status: ClientStatus;
          follow_up_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          status?: ClientStatus;
          follow_up_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          status?: ClientStatus;
          follow_up_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      weddings: {
        Row: {
          id: string;
          user_id: string;
          client_id: string | null;
          name: string;
          wedding_date: string;
          venue: string | null;
          status: WeddingStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id?: string | null;
          name: string;
          wedding_date: string;
          venue?: string | null;
          status?: WeddingStatus;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_id?: string | null;
          name?: string;
          wedding_date?: string;
          venue?: string | null;
          status?: WeddingStatus;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      meetings: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          starts_at: string;
          ends_at: string | null;
          client_id: string | null;
          wedding_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          starts_at: string;
          ends_at?: string | null;
          client_id?: string | null;
          wedding_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          starts_at?: string;
          ends_at?: string | null;
          client_id?: string | null;
          wedding_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          priority: TaskPriority;
          due_at: string | null;
          owner_id: string | null;
          status: TaskStatus;
          wedding_id: string | null;
          client_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          priority?: TaskPriority;
          due_at?: string | null;
          owner_id?: string | null;
          status?: TaskStatus;
          wedding_id?: string | null;
          client_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          priority?: TaskPriority;
          due_at?: string | null;
          owner_id?: string | null;
          status?: TaskStatus;
          wedding_id?: string | null;
          client_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      financial_records: {
        Row: {
          id: string;
          user_id: string;
          record_type: FinancialRecordType;
          amount: number;
          currency: string;
          status: FinancialRecordStatus;
          occurred_on: string;
          description: string | null;
          wedding_id: string | null;
          client_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          record_type: FinancialRecordType;
          amount: number;
          currency?: string;
          status?: FinancialRecordStatus;
          occurred_on?: string;
          description?: string | null;
          wedding_id?: string | null;
          client_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          record_type?: FinancialRecordType;
          amount?: number;
          currency?: string;
          status?: FinancialRecordStatus;
          occurred_on?: string;
          description?: string | null;
          wedding_id?: string | null;
          client_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      finance_records: {
        Row: {
          id: string;
          workspace_id: string;
          company_id: string;
          project_id: string | null;
          client_id: string | null;
          vendor_id: string | null;
          type: string;
          category: string;
          currency: string;
          amount: number;
          tax: number;
          discount: number;
          status: string;
          reference_number: string | null;
          issued_at: string | null;
          due_at: string | null;
          paid_at: string | null;
          converted_invoice_id: string | null;
          notes: string | null;
          internal_notes: string | null;
          document_content: Json;
          created_by: string;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          company_id: string;
          project_id?: string | null;
          client_id?: string | null;
          vendor_id?: string | null;
          type: string;
          category?: string;
          currency?: string;
          amount?: number;
          tax?: number;
          discount?: number;
          status?: string;
          reference_number?: string | null;
          issued_at?: string | null;
          due_at?: string | null;
          paid_at?: string | null;
          converted_invoice_id?: string | null;
          notes?: string | null;
          internal_notes?: string | null;
          document_content?: Json;
          created_by: string;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          company_id?: string;
          project_id?: string | null;
          client_id?: string | null;
          vendor_id?: string | null;
          type?: string;
          category?: string;
          currency?: string;
          amount?: number;
          tax?: number;
          discount?: number;
          status?: string;
          reference_number?: string | null;
          issued_at?: string | null;
          due_at?: string | null;
          paid_at?: string | null;
          converted_invoice_id?: string | null;
          notes?: string | null;
          internal_notes?: string | null;
          document_content?: Json;
          created_by?: string;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      finance_line_items: {
        Row: {
          id: string;
          finance_id: string;
          workspace_id: string;
          company_id: string;
          position: number;
          description: string;
          quantity: number;
          unit_price: number;
          tax: number;
          discount: number;
          amount: number;
          item_kind: string;
          unit_of_measure: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          finance_id: string;
          workspace_id: string;
          company_id: string;
          position?: number;
          description: string;
          quantity?: number;
          unit_price?: number;
          tax?: number;
          discount?: number;
          amount?: number;
          item_kind?: string;
          unit_of_measure?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          finance_id?: string;
          workspace_id?: string;
          company_id?: string;
          position?: number;
          description?: string;
          quantity?: number;
          unit_price?: number;
          tax?: number;
          discount?: number;
          amount?: number;
          item_kind?: string;
          unit_of_measure?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      finance_activities: {
        Row: {
          id: string;
          finance_id: string;
          workspace_id: string;
          company_id: string;
          actor_id: string | null;
          activity_type: string;
          message: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          finance_id: string;
          workspace_id: string;
          company_id: string;
          actor_id?: string | null;
          activity_type: string;
          message: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          finance_id?: string;
          workspace_id?: string;
          company_id?: string;
          actor_id?: string | null;
          activity_type?: string;
          message?: string;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      finance_documents: {
        Row: {
          id: string;
          workspace_id: string;
          company_id: string;
          finance_id: string;
          document_kind: string;
          version: number;
          status: string;
          storage_bucket: string;
          storage_path: string;
          filename: string;
          mime_type: string;
          size_bytes: number;
          generated_by: string;
          generated_at: string;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          company_id: string;
          finance_id: string;
          document_kind: string;
          version?: number;
          status?: string;
          storage_bucket?: string;
          storage_path: string;
          filename: string;
          mime_type?: string;
          size_bytes?: number;
          generated_by: string;
          generated_at?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          company_id?: string;
          finance_id?: string;
          document_kind?: string;
          version?: number;
          status?: string;
          storage_bucket?: string;
          storage_path?: string;
          filename?: string;
          mime_type?: string;
          size_bytes?: number;
          generated_by?: string;
          generated_at?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      finance_packages: {
        Row: {
          id: string;
          workspace_id: string;
          company_id: string;
          name: string;
          description: string | null;
          category: string | null;
          currency: string;
          default_tax: number;
          is_active: boolean;
          created_by: string;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          company_id: string;
          name: string;
          description?: string | null;
          category?: string | null;
          currency?: string;
          default_tax?: number;
          is_active?: boolean;
          created_by: string;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          company_id?: string;
          name?: string;
          description?: string | null;
          category?: string | null;
          currency?: string;
          default_tax?: number;
          is_active?: boolean;
          created_by?: string;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      finance_package_items: {
        Row: {
          id: string;
          package_id: string;
          workspace_id: string;
          company_id: string;
          position: number;
          description: string;
          quantity: number;
          unit_price: number;
          unit_of_measure: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          package_id: string;
          workspace_id: string;
          company_id: string;
          position?: number;
          description: string;
          quantity?: number;
          unit_price?: number;
          unit_of_measure?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          package_id?: string;
          workspace_id?: string;
          company_id?: string;
          position?: number;
          description?: string;
          quantity?: number;
          unit_price?: number;
          unit_of_measure?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invitations: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          company: string;
          role: InviteRole;
          token_hash: string;
          status: InvitationStatus;
          invited_by: string;
          expires_at: string;
          accepted_at: string | null;
          accepted_user_id: string | null;
          last_sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          full_name: string;
          company: string;
          role: InviteRole;
          token_hash: string;
          status?: InvitationStatus;
          invited_by: string;
          expires_at: string;
          accepted_at?: string | null;
          accepted_user_id?: string | null;
          last_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          company?: string;
          role?: InviteRole;
          token_hash?: string;
          status?: InvitationStatus;
          invited_by?: string;
          expires_at?: string;
          accepted_at?: string | null;
          accepted_user_id?: string | null;
          last_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      invitation_audit_logs: {
        Row: {
          id: string;
          invitation_id: string | null;
          action: InvitationAuditAction;
          actor_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          invitation_id?: string | null;
          action: InvitationAuditAction;
          actor_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          invitation_id?: string | null;
          action?: InvitationAuditAction;
          actor_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      // Sprint 009 — Core Foundation
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          status: string;
          timezone: string;
          locale: string;
          currency: string;
          country: string | null;
          logo_url: string | null;
          owner_id: string | null;
          custom_domain: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          status?: string;
          timezone?: string;
          locale?: string;
          currency?: string;
          country?: string | null;
          logo_url?: string | null;
          owner_id?: string | null;
          custom_domain?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          status?: string;
          timezone?: string;
          locale?: string;
          currency?: string;
          country?: string | null;
          logo_url?: string | null;
          owner_id?: string | null;
          custom_domain?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          slug: string;
          status: string;
          type: string | null;
          logo_url: string | null;
          country: string | null;
          timezone: string | null;
          locale: string | null;
          currency: string | null;
          registration_no: string | null;
          address: string | null;
          phone: string | null;
          email: string | null;
          website: string | null;
          bank_name: string | null;
          bank_account_name: string | null;
          bank_account_number: string | null;
          swift_code: string | null;
          signature_url: string | null;
          default_payment_terms: string | null;
          default_terms_and_conditions: string | null;
          default_document_footer: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          slug: string;
          status?: string;
          type?: string | null;
          logo_url?: string | null;
          country?: string | null;
          timezone?: string | null;
          locale?: string | null;
          currency?: string | null;
          registration_no?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          bank_name?: string | null;
          bank_account_name?: string | null;
          bank_account_number?: string | null;
          swift_code?: string | null;
          signature_url?: string | null;
          default_payment_terms?: string | null;
          default_terms_and_conditions?: string | null;
          default_document_footer?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          slug?: string;
          status?: string;
          type?: string | null;
          logo_url?: string | null;
          country?: string | null;
          timezone?: string | null;
          locale?: string | null;
          currency?: string | null;
          registration_no?: string | null;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          bank_name?: string | null;
          bank_account_name?: string | null;
          bank_account_number?: string | null;
          swift_code?: string | null;
          signature_url?: string | null;
          default_payment_terms?: string | null;
          default_terms_and_conditions?: string | null;
          default_document_footer?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          key: string;
          label: string;
          description: string | null;
          is_system: boolean;
          created_at: string;
        };
        Insert: {
          key: string;
          label: string;
          description?: string | null;
          is_system?: boolean;
          created_at?: string;
        };
        Update: {
          key?: string;
          label?: string;
          description?: string | null;
          is_system?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          key: string;
          description: string;
          created_at: string;
        };
        Insert: {
          key: string;
          description: string;
          created_at?: string;
        };
        Update: {
          key?: string;
          description?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          role_key: string;
          permission_key: string;
        };
        Insert: {
          role_key: string;
          permission_key: string;
        };
        Update: {
          role_key?: string;
          permission_key?: string;
        };
        Relationships: [];
      };
      people: {
        Row: {
          id: string;
          workspace_id: string;
          company_id: string | null;
          user_id: string | null;
          email: string;
          full_name: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          company_id?: string | null;
          user_id?: string | null;
          email: string;
          full_name: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          company_id?: string | null;
          user_id?: string | null;
          email?: string;
          full_name?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      memberships: {
        Row: {
          id: string;
          user_id: string | null;
          workspace_id: string;
          company_id: string;
          role_key: string;
          email: string;
          full_name: string;
          status: string;
          person_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          workspace_id: string;
          company_id: string;
          role_key: string;
          email: string;
          full_name: string;
          status?: string;
          person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          workspace_id?: string;
          company_id?: string;
          role_key?: string;
          email?: string;
          full_name?: string;
          status?: string;
          person_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      person_roles: {
        Row: {
          id: string;
          person_id: string;
          role_key: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          person_id: string;
          role_key: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          person_id?: string;
          role_key?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          workspace_id: string;
          company_id: string;
          client_id: string | null;
          name: string;
          project_code: string | null;
          description: string | null;
          project_type: string | null;
          status: string;
          owner_id: string | null;
          coordinator_id: string | null;
          sales_id: string | null;
          planner_id: string | null;
          start_date: string | null;
          end_date: string | null;
          wedding_date: string | null;
          event_date: string | null;
          venue: string | null;
          ballroom: string | null;
          session: string | null;
          package_name: string | null;
          expected_pax: number | null;
          client_budget: number | null;
          theme: string | null;
          dress_code: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          company_id: string;
          client_id?: string | null;
          name: string;
          project_code?: string | null;
          description?: string | null;
          project_type?: string | null;
          status?: string;
          owner_id?: string | null;
          coordinator_id?: string | null;
          sales_id?: string | null;
          planner_id?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          wedding_date?: string | null;
          event_date?: string | null;
          venue?: string | null;
          ballroom?: string | null;
          session?: string | null;
          package_name?: string | null;
          expected_pax?: number | null;
          client_budget?: number | null;
          theme?: string | null;
          dress_code?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          company_id?: string;
          client_id?: string | null;
          name?: string;
          project_code?: string | null;
          description?: string | null;
          project_type?: string | null;
          status?: string;
          owner_id?: string | null;
          coordinator_id?: string | null;
          sales_id?: string | null;
          planner_id?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          wedding_date?: string | null;
          event_date?: string | null;
          venue?: string | null;
          ballroom?: string | null;
          session?: string | null;
          package_name?: string | null;
          expected_pax?: number | null;
          client_budget?: number | null;
          theme?: string | null;
          dress_code?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      crm_clients: {
        Row: {
          id: string;
          workspace_id: string;
          company_id: string;
          project_id: string | null;
          owner_id: string | null;
          lead_owner_id: string | null;
          assigned_pic_id: string | null;
          client_code: string | null;
          name: string;
          company_name: string | null;
          bride_name: string | null;
          groom_name: string | null;
          display_name: string | null;
          contact_person: string | null;
          email: string | null;
          phone: string | null;
          whatsapp: string | null;
          instagram: string | null;
          facebook: string | null;
          home_address: string | null;
          city: string | null;
          state: string | null;
          country: string | null;
          birthday: string | null;
          anniversary: string | null;
          client_type: string | null;
          status: string;
          is_active: boolean;
          source: string | null;
          follow_up_at: string | null;
          wedding_date: string | null;
          wedding_type: string | null;
          session: string | null;
          include_rom: boolean;
          include_lunch: boolean;
          include_dinner: boolean;
          venue: string | null;
          ballroom: string | null;
          expected_pax: number | null;
          theme: string | null;
          dress_code: string | null;
          religion: string | null;
          language: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          company_id: string;
          project_id?: string | null;
          owner_id?: string | null;
          lead_owner_id?: string | null;
          assigned_pic_id?: string | null;
          client_code?: string | null;
          name: string;
          company_name?: string | null;
          bride_name?: string | null;
          groom_name?: string | null;
          display_name?: string | null;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          instagram?: string | null;
          facebook?: string | null;
          home_address?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string | null;
          birthday?: string | null;
          anniversary?: string | null;
          client_type?: string | null;
          status?: string;
          is_active?: boolean;
          source?: string | null;
          follow_up_at?: string | null;
          wedding_date?: string | null;
          wedding_type?: string | null;
          session?: string | null;
          include_rom?: boolean;
          include_lunch?: boolean;
          include_dinner?: boolean;
          venue?: string | null;
          ballroom?: string | null;
          expected_pax?: number | null;
          theme?: string | null;
          dress_code?: string | null;
          religion?: string | null;
          language?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          company_id?: string;
          project_id?: string | null;
          owner_id?: string | null;
          lead_owner_id?: string | null;
          assigned_pic_id?: string | null;
          client_code?: string | null;
          name?: string;
          company_name?: string | null;
          bride_name?: string | null;
          groom_name?: string | null;
          display_name?: string | null;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          whatsapp?: string | null;
          instagram?: string | null;
          facebook?: string | null;
          home_address?: string | null;
          city?: string | null;
          state?: string | null;
          country?: string | null;
          birthday?: string | null;
          anniversary?: string | null;
          client_type?: string | null;
          status?: string;
          is_active?: boolean;
          source?: string | null;
          follow_up_at?: string | null;
          wedding_date?: string | null;
          wedding_type?: string | null;
          session?: string | null;
          include_rom?: boolean;
          include_lunch?: boolean;
          include_dinner?: boolean;
          venue?: string | null;
          ballroom?: string | null;
          expected_pax?: number | null;
          theme?: string | null;
          dress_code?: string | null;
          religion?: string | null;
          language?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      wedding_timeline_items: {
        Row: {
          id: string;
          workspace_id: string;
          company_id: string;
          project_id: string;
          sequence: number;
          start_time: string | null;
          end_time: string | null;
          title: string;
          description: string | null;
          category: string | null;
          location: string | null;
          status: string;
          priority: string;
          reminder_minutes: number | null;
          pic_label: string | null;
          vendor_id: string | null;
          coordinator_label: string | null;
          crew: string | null;
          assignments: Json;
          checklist: Json;
          attachments: Json;
          internal_notes: string | null;
          depends_on_id: string | null;
          archived_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          company_id: string;
          project_id: string;
          sequence?: number;
          start_time?: string | null;
          end_time?: string | null;
          title: string;
          description?: string | null;
          category?: string | null;
          location?: string | null;
          status?: string;
          priority?: string;
          reminder_minutes?: number | null;
          pic_label?: string | null;
          vendor_id?: string | null;
          coordinator_label?: string | null;
          crew?: string | null;
          assignments?: Json;
          checklist?: Json;
          attachments?: Json;
          internal_notes?: string | null;
          depends_on_id?: string | null;
          archived_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          company_id?: string;
          project_id?: string;
          sequence?: number;
          start_time?: string | null;
          end_time?: string | null;
          title?: string;
          description?: string | null;
          category?: string | null;
          location?: string | null;
          status?: string;
          priority?: string;
          reminder_minutes?: number | null;
          pic_label?: string | null;
          vendor_id?: string | null;
          coordinator_label?: string | null;
          crew?: string | null;
          assignments?: Json;
          checklist?: Json;
          attachments?: Json;
          internal_notes?: string | null;
          depends_on_id?: string | null;
          archived_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      wedding_project_tasks: {
        Row: {
          id: string;
          workspace_id: string;
          company_id: string;
          project_id: string;
          sequence: number;
          title: string;
          description: string | null;
          status: string;
          priority: string;
          due_date: string | null;
          start_date: string | null;
          completed_at: string | null;
          reminder_minutes: number | null;
          assignee_label: string | null;
          assignee_person_id: string | null;
          client_id: string | null;
          vendor_id: string | null;
          coordinator_label: string | null;
          package_label: string | null;
          tags: Json;
          attachments: Json;
          comments: Json;
          activity_log: Json;
          internal_notes: string | null;
          archived_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          company_id: string;
          project_id: string;
          sequence?: number;
          title: string;
          description?: string | null;
          status?: string;
          priority?: string;
          due_date?: string | null;
          start_date?: string | null;
          completed_at?: string | null;
          reminder_minutes?: number | null;
          assignee_label?: string | null;
          assignee_person_id?: string | null;
          client_id?: string | null;
          vendor_id?: string | null;
          coordinator_label?: string | null;
          package_label?: string | null;
          tags?: Json;
          attachments?: Json;
          comments?: Json;
          activity_log?: Json;
          internal_notes?: string | null;
          archived_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          company_id?: string;
          project_id?: string;
          sequence?: number;
          title?: string;
          description?: string | null;
          status?: string;
          priority?: string;
          due_date?: string | null;
          start_date?: string | null;
          completed_at?: string | null;
          reminder_minutes?: number | null;
          assignee_label?: string | null;
          assignee_person_id?: string | null;
          client_id?: string | null;
          vendor_id?: string | null;
          coordinator_label?: string | null;
          package_label?: string | null;
          tags?: Json;
          attachments?: Json;
          comments?: Json;
          activity_log?: Json;
          internal_notes?: string | null;
          archived_at?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      wedding_project_packages: {
        Row: {
          id: string;
          workspace_id: string;
          company_id: string;
          project_id: string;
          source_finance_package_id: string | null;
          name: string;
          description: string | null;
          currency: string;
          status: string;
          sequence: number;
          notes: string | null;
          archived_at: string | null;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          company_id: string;
          project_id: string;
          source_finance_package_id?: string | null;
          name: string;
          description?: string | null;
          currency?: string;
          status?: string;
          sequence?: number;
          notes?: string | null;
          archived_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          company_id?: string;
          project_id?: string;
          source_finance_package_id?: string | null;
          name?: string;
          description?: string | null;
          currency?: string;
          status?: string;
          sequence?: number;
          notes?: string | null;
          archived_at?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      wedding_project_package_items: {
        Row: {
          id: string;
          package_id: string;
          workspace_id: string;
          company_id: string;
          project_id: string;
          position: number;
          title: string;
          description: string | null;
          quantity: number;
          unit_price: number;
          unit_of_measure: string | null;
          category: string | null;
          vendor_id: string | null;
          is_included: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          package_id: string;
          workspace_id: string;
          company_id: string;
          project_id: string;
          position?: number;
          title: string;
          description?: string | null;
          quantity?: number;
          unit_price?: number;
          unit_of_measure?: string | null;
          category?: string | null;
          vendor_id?: string | null;
          is_included?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          package_id?: string;
          workspace_id?: string;
          company_id?: string;
          project_id?: string;
          position?: number;
          title?: string;
          description?: string | null;
          quantity?: number;
          unit_price?: number;
          unit_of_measure?: string | null;
          category?: string | null;
          vendor_id?: string | null;
          is_included?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      crm_meetings: {
        Row: {
          id: string;
          workspace_id: string;
          company_id: string;
          project_id: string | null;
          client_id: string | null;
          owner_id: string | null;
          title: string;
          meeting_type: string;
          status: string;
          meeting_date: string;
          meeting_time: string;
          duration_minutes: number;
          starts_at: string;
          location: string | null;
          google_meet_link: string | null;
          notes: string | null;
          internal_notes: string | null;
          participants: Json;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          company_id: string;
          project_id?: string | null;
          client_id?: string | null;
          owner_id?: string | null;
          title: string;
          meeting_type?: string;
          status?: string;
          meeting_date: string;
          meeting_time: string;
          duration_minutes?: number;
          starts_at: string;
          location?: string | null;
          google_meet_link?: string | null;
          notes?: string | null;
          internal_notes?: string | null;
          participants?: Json;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          company_id?: string;
          project_id?: string | null;
          client_id?: string | null;
          owner_id?: string | null;
          title?: string;
          meeting_type?: string;
          status?: string;
          meeting_date?: string;
          meeting_time?: string;
          duration_minutes?: number;
          starts_at?: string;
          location?: string | null;
          google_meet_link?: string | null;
          notes?: string | null;
          internal_notes?: string | null;
          participants?: Json;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      crm_meeting_vendors: {
        Row: {
          meeting_id: string;
          vendor_id: string;
          created_at: string;
        };
        Insert: {
          meeting_id: string;
          vendor_id: string;
          created_at?: string;
        };
        Update: {
          meeting_id?: string;
          vendor_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      workspace_tasks: {
        Row: {
          id: string;
          workspace_id: string;
          company_id: string;
          title: string;
          description: string | null;
          status: string;
          priority: string;
          start_date: string | null;
          due_date: string | null;
          completed_date: string | null;
          owner_id: string | null;
          assignee_id: string | null;
          followers: string[];
          related_project_id: string | null;
          related_client_id: string | null;
          related_vendor_id: string | null;
          related_meeting_id: string | null;
          tags: string[];
          archived_at: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          company_id: string;
          title: string;
          description?: string | null;
          status?: string;
          priority?: string;
          start_date?: string | null;
          due_date?: string | null;
          completed_date?: string | null;
          owner_id?: string | null;
          assignee_id?: string | null;
          followers?: string[];
          related_project_id?: string | null;
          related_client_id?: string | null;
          related_vendor_id?: string | null;
          related_meeting_id?: string | null;
          tags?: string[];
          archived_at?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          company_id?: string;
          title?: string;
          description?: string | null;
          status?: string;
          priority?: string;
          start_date?: string | null;
          due_date?: string | null;
          completed_date?: string | null;
          owner_id?: string | null;
          assignee_id?: string | null;
          followers?: string[];
          related_project_id?: string | null;
          related_client_id?: string | null;
          related_vendor_id?: string | null;
          related_meeting_id?: string | null;
          tags?: string[];
          archived_at?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      task_activities: {
        Row: {
          id: string;
          task_id: string | null;
          workspace_id: string;
          company_id: string;
          actor_id: string;
          activity_type: string;
          message: string;
          metadata: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id?: string | null;
          workspace_id: string;
          company_id: string;
          actor_id: string;
          activity_type: string;
          message: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          task_id?: string | null;
          workspace_id?: string;
          company_id?: string;
          actor_id?: string;
          activity_type?: string;
          message?: string;
          metadata?: Record<string, unknown>;
          created_at?: string;
        };
        Relationships: [];
      };
      vendors: {
        Row: {
          id: string;
          workspace_id: string;
          company_id: string;
          project_id: string | null;
          owner_id: string | null;
          name: string;
          company_name: string | null;
          contact_person: string | null;
          email: string | null;
          phone: string | null;
          website: string | null;
          address: string | null;
          category: string | null;
          status: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          company_id: string;
          project_id?: string | null;
          owner_id?: string | null;
          name: string;
          company_name?: string | null;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          website?: string | null;
          address?: string | null;
          category?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          company_id?: string;
          project_id?: string | null;
          owner_id?: string | null;
          name?: string;
          company_name?: string | null;
          contact_person?: string | null;
          email?: string | null;
          phone?: string | null;
          website?: string | null;
          address?: string | null;
          category?: string | null;
          status?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      core_invitations: {
        Row: {
          id: string;
          workspace_id: string;
          company_id: string | null;
          email: string;
          full_name: string;
          role_key: string;
          token_hash: string;
          status: string;
          invited_by_user_id: string | null;
          invited_person_id: string | null;
          expires_at: string;
          accepted_at: string | null;
          accepted_user_id: string | null;
          rejected_at: string | null;
          rejected_by_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          company_id?: string | null;
          email: string;
          full_name: string;
          role_key: string;
          token_hash: string;
          status?: string;
          invited_by_user_id?: string | null;
          invited_person_id?: string | null;
          expires_at: string;
          accepted_at?: string | null;
          accepted_user_id?: string | null;
          rejected_at?: string | null;
          rejected_by_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          company_id?: string | null;
          email?: string;
          full_name?: string;
          role_key?: string;
          token_hash?: string;
          status?: string;
          invited_by_user_id?: string | null;
          invited_person_id?: string | null;
          expires_at?: string;
          accepted_at?: string | null;
          accepted_user_id?: string | null;
          rejected_at?: string | null;
          rejected_by_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      auth_user_exists_by_email: {
        Args: { p_email: string };
        Returns: boolean;
      };
      create_finance_quotation_with_items: {
        Args: { p_record: Json; p_items: Json };
        Returns: Json;
      };
      list_managed_users: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          email: string;
          full_name: string | null;
          display_name: string | null;
          company: string | null;
          role: string | null;
          created_at: string;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
