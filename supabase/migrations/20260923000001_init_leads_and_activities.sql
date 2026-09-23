create extension if not exists "pgcrypto";

create type lead_status as enum ('new', 'contacted', 'qualified', 'disqualified', 'converted');

create table leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  campaign_name text,
  ad_id text,
  form_id text,
  status lead_status not null default 'new',
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type activity_type as enum ('lead_created', 'lead_updated', 'status_changed');

create table activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  type activity_type not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_activities_lead_id on activities(lead_id);
create index idx_leads_created_at on leads(created_at desc);

alter table leads enable row level security;
alter table activities enable row level security;
