-- RIVA Project 031 — Task Activity Feed
-- Append-only activity history for workspace_tasks.

create table if not exists public.task_activities (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.workspace_tasks (id) on delete set null,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  actor_id uuid not null,
  activity_type text not null
    check (
      activity_type in (
        'task_created',
        'task_updated',
        'status_changed',
        'priority_changed',
        'assignee_changed',
        'owner_changed',
        'due_date_changed',
        'task_deleted'
      )
    ),
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists task_activities_workspace_company_created_idx
  on public.task_activities (workspace_id, company_id, created_at desc);
create index if not exists task_activities_task_id_created_idx
  on public.task_activities (task_id, created_at desc);
create index if not exists task_activities_actor_id_idx
  on public.task_activities (actor_id);

alter table public.task_activities enable row level security;
revoke all on table public.task_activities from anon, authenticated;
grant all on table public.task_activities to service_role;

comment on table public.task_activities is
  'Project 031: append-only Task Workspace activity feed.';
