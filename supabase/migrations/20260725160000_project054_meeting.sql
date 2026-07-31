-- Project 054 — Meeting module (company-scoped CRM meetings)
-- Distinct from legacy V0 public.meetings (user-scoped).
-- RLS posture unchanged (see docs/SECURITY.md).

insert into public.permissions (key, description) values
  ('meeting.read', 'View meetings'),
  ('meeting.write', 'Create and update meetings'),
  ('meeting.delete', 'Delete meetings')
on conflict (key) do nothing;

insert into public.role_permissions (role_key, permission_key)
select r.key, p.key
from public.roles r
cross join public.permissions p
where r.key in ('founder', 'owner', 'admin')
  and p.key in ('meeting.read', 'meeting.write', 'meeting.delete')
on conflict do nothing;

insert into public.role_permissions (role_key, permission_key) values
  ('planner', 'meeting.read'),
  ('planner', 'meeting.write'),
  ('planner', 'meeting.delete'),
  ('coordinator', 'meeting.read'),
  ('coordinator', 'meeting.write'),
  ('sales', 'meeting.read'),
  ('sales', 'meeting.write'),
  ('viewer', 'meeting.read'),
  ('finance', 'meeting.read'),
  ('vendor', 'meeting.read'),
  ('client', 'meeting.read')
on conflict do nothing;

create table if not exists public.crm_meetings (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  client_id uuid references public.crm_clients (id) on delete set null,
  owner_id uuid references auth.users (id) on delete set null,
  title text not null,
  meeting_type text not null default 'other'
    check (
      meeting_type in (
        'consultation',
        'follow_up',
        'venue_visit',
        'vendor_discussion',
        'internal_meeting',
        'wedding_rehearsal',
        'other'
      )
    ),
  status text not null default 'scheduled'
    check (
      status in (
        'scheduled',
        'confirmed',
        'completed',
        'cancelled',
        'no_show'
      )
    ),
  meeting_date date not null,
  meeting_time text not null
    check (meeting_time ~ '^\d{2}:\d{2}$'),
  duration_minutes integer not null default 60
    check (duration_minutes > 0 and duration_minutes <= 24 * 60),
  starts_at timestamptz not null,
  location text,
  google_meet_link text,
  notes text,
  internal_notes text,
  participants jsonb not null default '[]'::jsonb,
  created_by uuid not null references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists crm_meetings_workspace_id_idx
  on public.crm_meetings (workspace_id);
create index if not exists crm_meetings_company_id_idx
  on public.crm_meetings (company_id);
create index if not exists crm_meetings_project_id_idx
  on public.crm_meetings (project_id);
create index if not exists crm_meetings_client_id_idx
  on public.crm_meetings (client_id);
create index if not exists crm_meetings_owner_id_idx
  on public.crm_meetings (owner_id);
create index if not exists crm_meetings_company_status_idx
  on public.crm_meetings (company_id, status);
create index if not exists crm_meetings_company_starts_at_idx
  on public.crm_meetings (company_id, starts_at);

drop trigger if exists crm_meetings_set_updated_at on public.crm_meetings;
create trigger crm_meetings_set_updated_at
  before update on public.crm_meetings
  for each row execute function public.set_updated_at();

alter table public.crm_meetings enable row level security;
revoke all on table public.crm_meetings from anon, authenticated;
grant all on table public.crm_meetings to service_role;

comment on table public.crm_meetings is
  'Project 054: Meeting CRM (Company + optional Project/Client). Distinct from V0 public.meetings.';

create table if not exists public.crm_meeting_vendors (
  meeting_id uuid not null references public.crm_meetings (id) on delete cascade,
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (meeting_id, vendor_id)
);

create index if not exists crm_meeting_vendors_vendor_id_idx
  on public.crm_meeting_vendors (vendor_id);

alter table public.crm_meeting_vendors enable row level security;
revoke all on table public.crm_meeting_vendors from anon, authenticated;
grant all on table public.crm_meeting_vendors to service_role;

comment on table public.crm_meeting_vendors is
  'Project 054: many-to-many Meeting ↔ Vendor links.';
