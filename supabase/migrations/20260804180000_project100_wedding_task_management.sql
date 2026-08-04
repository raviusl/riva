-- Project 100 — Task Management Module (Wedding Project)
-- Operational tasks scoped to a Wedding Project.
-- Does not modify CRM, Finance, Documents, Timeline, or workspace_tasks.

create table if not exists public.wedding_project_tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  sequence integer not null default 0,
  title text not null,
  description text,
  status text not null default 'todo',
  priority text not null default 'normal',
  due_date date,
  start_date date,
  completed_at timestamptz,
  reminder_minutes integer,
  assignee_label text,
  assignee_person_id uuid,
  client_id uuid references public.crm_clients (id) on delete set null,
  vendor_id uuid references public.vendors (id) on delete set null,
  coordinator_label text,
  package_label text,
  tags jsonb not null default '[]'::jsonb,
  attachments jsonb not null default '[]'::jsonb,
  comments jsonb not null default '[]'::jsonb,
  activity_log jsonb not null default '[]'::jsonb,
  internal_notes text,
  archived_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wedding_project_tasks_status_check
    check (
      status in (
        'todo',
        'in_progress',
        'waiting',
        'completed',
        'cancelled'
      )
    ),
  constraint wedding_project_tasks_priority_check
    check (priority in ('low', 'normal', 'high', 'urgent'))
);

create index if not exists wedding_project_tasks_project_seq_idx
  on public.wedding_project_tasks (project_id, sequence)
  where archived_at is null;

create index if not exists wedding_project_tasks_project_status_idx
  on public.wedding_project_tasks (project_id, status);

create index if not exists wedding_project_tasks_project_due_idx
  on public.wedding_project_tasks (project_id, due_date)
  where archived_at is null;

create index if not exists wedding_project_tasks_workspace_company_idx
  on public.wedding_project_tasks (workspace_id, company_id);

comment on table public.wedding_project_tasks is
  'Project 100 — Wedding Project operational tasks (Task Management Module).';
comment on column public.wedding_project_tasks.internal_notes is
  'Private planner notes — never shown to clients.';
comment on column public.wedding_project_tasks.attachments is
  'JSON array of {id, name, url, mimeType} — storage future-ready.';
comment on column public.wedding_project_tasks.comments is
  'JSON array of {id, body, authorLabel, createdAt, authorId?} comments.';
comment on column public.wedding_project_tasks.activity_log is
  'JSON array of {id, action, message, createdAt, actorId?, actorLabel?} activity rows.';
comment on column public.wedding_project_tasks.package_label is
  'Optional free-text package reference linked to the wedding project package.';

alter table public.wedding_project_tasks enable row level security;

revoke all on table public.wedding_project_tasks from anon, authenticated;
