-- Project 099 — Wedding Timeline Builder
-- Operational run-of-show items for a Wedding Project.
-- Does not modify CRM, Finance, or Documents tables.

create table if not exists public.wedding_timeline_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  sequence integer not null default 0,
  start_time time,
  end_time time,
  title text not null,
  description text,
  category text,
  location text,
  status text not null default 'not_started',
  priority text not null default 'normal',
  reminder_minutes integer,
  pic_label text,
  vendor_id uuid references public.vendors (id) on delete set null,
  coordinator_label text,
  crew text,
  assignments jsonb not null default '[]'::jsonb,
  checklist jsonb not null default '[]'::jsonb,
  attachments jsonb not null default '[]'::jsonb,
  internal_notes text,
  depends_on_id uuid references public.wedding_timeline_items (id) on delete set null,
  archived_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wedding_timeline_items_status_check
    check (
      status in (
        'not_started',
        'ready',
        'in_progress',
        'completed',
        'delayed',
        'cancelled'
      )
    ),
  constraint wedding_timeline_items_priority_check
    check (priority in ('low', 'normal', 'high', 'critical'))
);

create index if not exists wedding_timeline_items_project_seq_idx
  on public.wedding_timeline_items (project_id, sequence)
  where archived_at is null;

create index if not exists wedding_timeline_items_project_status_idx
  on public.wedding_timeline_items (project_id, status);

create index if not exists wedding_timeline_items_workspace_company_idx
  on public.wedding_timeline_items (workspace_id, company_id);

comment on table public.wedding_timeline_items is
  'Project 099 — Wedding day / operational timeline items (run-of-show).';
comment on column public.wedding_timeline_items.internal_notes is
  'Private planner notes — never shown to clients.';
comment on column public.wedding_timeline_items.depends_on_id is
  'Future dependency link between timeline items.';
comment on column public.wedding_timeline_items.assignments is
  'JSON array of {role, label, personId?} assignment slots.';
comment on column public.wedding_timeline_items.checklist is
  'JSON array of {id, label, done} checklist rows.';
comment on column public.wedding_timeline_items.attachments is
  'JSON array of {id, name, url, mimeType} — storage future-ready.';

-- RLS aligned with other core tables (app uses service role; revoke public)
alter table public.wedding_timeline_items enable row level security;

revoke all on table public.wedding_timeline_items from anon, authenticated;
