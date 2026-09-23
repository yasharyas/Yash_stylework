export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "disqualified"
  | "converted";

export type ActivityType = "lead_created" | "lead_updated" | "status_changed";

export interface Lead {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  campaign_name: string | null;
  ad_id: string | null;
  form_id: string | null;
  status: LeadStatus;
  raw_payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  lead_id: string;
  type: ActivityType;
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      leads: {
        Row: Lead;
        Insert: Partial<Lead>;
        Update: Partial<Lead>;
      };
      activities: {
        Row: Activity;
        Insert: Partial<Activity>;
        Update: Partial<Activity>;
      };
    };
    Functions: {
      create_lead_from_webhook: {
        Args: { payload: Record<string, unknown> };
        Returns: Lead;
      };
      update_lead_status: {
        Args: { p_lead_id: string; p_new_status: LeadStatus };
        Returns: Lead;
      };
    };
  };
}

export const LEAD_STATUSES: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "disqualified",
  "converted",
];
