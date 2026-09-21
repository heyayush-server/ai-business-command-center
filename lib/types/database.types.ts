export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type MemberRole = "owner" | "admin" | "member" | "viewer"
export type LeadStatus = "new" | "contacted" | "qualifying" | "qualified" | "lost"
export type CustomerStatus = "active" | "inactive" | "churned"
export type DealStage = "discovery" | "proposal" | "negotiation" | "closed_won" | "closed_lost"
export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled"
export type TaskPriority = "low" | "medium" | "high" | "urgent"
export type PendingActionStatus = "pending" | "approved" | "rejected" | "expired"
export type ActorType = "user" | "ai"
export type MessageRole = "user" | "assistant" | "system" | "tool"

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: MemberRole
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: MemberRole
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: MemberRole
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      leads: {
        Row: {
          id: string
          organization_id: string
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          company: string | null
          status: LeadStatus
          source: string | null
          assigned_to: string | null
          notes: string | null
          metadata: Json | null
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          status?: LeadStatus
          source?: string | null
          assigned_to?: string | null
          notes?: string | null
          metadata?: Json | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          status?: LeadStatus
          source?: string | null
          assigned_to?: string | null
          notes?: string | null
          metadata?: Json | null
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      customers: {
        Row: {
          id: string
          organization_id: string
          name: string
          industry: string | null
          status: CustomerStatus
          primary_contact_name: string | null
          primary_contact_email: string | null
          primary_contact_phone: string | null
          website: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          industry?: string | null
          status?: CustomerStatus
          primary_contact_name?: string | null
          primary_contact_email?: string | null
          primary_contact_phone?: string | null
          website?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          industry?: string | null
          status?: CustomerStatus
          primary_contact_name?: string | null
          primary_contact_email?: string | null
          primary_contact_phone?: string | null
          website?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      deals: {
        Row: {
          id: string
          organization_id: string
          customer_id: string | null
          name: string
          value: number
          stage: DealStage
          probability: number
          expected_close_date: string | null
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          customer_id?: string | null
          name: string
          value?: number
          stage?: DealStage
          probability?: number
          expected_close_date?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          customer_id?: string | null
          name?: string
          value?: number
          stage?: DealStage
          probability?: number
          expected_close_date?: string | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          id: string
          organization_id: string
          title: string
          description: string | null
          status: TaskStatus
          priority: TaskPriority
          due_date: string | null
          assigned_to: string | null
          lead_id: string | null
          customer_id: string | null
          deal_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          title: string
          description?: string | null
          status?: TaskStatus
          priority?: TaskPriority
          due_date?: string | null
          assigned_to?: string | null
          lead_id?: string | null
          customer_id?: string | null
          deal_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          title?: string
          description?: string | null
          status?: TaskStatus
          priority?: TaskPriority
          due_date?: string | null
          assigned_to?: string | null
          lead_id?: string | null
          customer_id?: string | null
          deal_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      activities: {
        Row: {
          id: string
          organization_id: string
          actor_type: ActorType
          user_id: string | null
          entity_type: string
          entity_id: string
          action: string
          details: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          actor_type?: ActorType
          user_id?: string | null
          entity_type: string
          entity_id: string
          action: string
          details?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          actor_type?: ActorType
          user_id?: string | null
          entity_type?: string
          entity_id?: string
          action?: string
          details?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_conversations: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          title?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_messages: {
        Row: {
          id: string
          conversation_id: string
          role: MessageRole
          content: string | null
          parts: Json | null
          model: string | null
          token_count: number | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          role: MessageRole
          content?: string | null
          parts?: Json | null
          model?: string | null
          token_count?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          role?: MessageRole
          content?: string | null
          parts?: Json | null
          model?: string | null
          token_count?: number | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_pending_actions: {
        Row: {
          id: string
          organization_id: string
          conversation_id: string | null
          tool_name: string
          tool_input: Json
          status: PendingActionStatus
          created_by: string
          approved_by: string | null
          created_at: string
          approved_at: string | null
          executed_at: string | null
          execution_result: Json | null
        }
        Insert: {
          id?: string
          organization_id: string
          conversation_id?: string | null
          tool_name: string
          tool_input?: Json
          status?: PendingActionStatus
          created_by: string
          approved_by?: string | null
          created_at?: string
          approved_at?: string | null
          executed_at?: string | null
          execution_result?: Json | null
        }
        Update: {
          id?: string
          organization_id?: string
          conversation_id?: string | null
          tool_name?: string
          tool_input?: Json
          status?: PendingActionStatus
          created_by?: string
          approved_by?: string | null
          created_at?: string
          approved_at?: string | null
          executed_at?: string | null
          execution_result?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_pending_actions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
      ai_usage: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          model: string
          provider: string
          prompt_tokens: number
          completion_tokens: number
          total_tokens: number
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          model: string
          provider: string
          prompt_tokens?: number
          completion_tokens?: number
          total_tokens?: number
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          model?: string
          provider?: string
          prompt_tokens?: number
          completion_tokens?: number
          total_tokens?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      member_role: MemberRole
      lead_status: LeadStatus
      customer_status: CustomerStatus
      deal_stage: DealStage
      task_status: TaskStatus
      task_priority: TaskPriority
      pending_action_status: PendingActionStatus
      actor_type: ActorType
      message_role: MessageRole
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
