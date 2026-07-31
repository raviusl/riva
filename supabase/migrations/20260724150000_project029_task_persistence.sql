-- RIVA Project 029 — Task Persistence
-- Core workspace tasks (company-scoped). V0 public.tasks remains untouched.
-- RLS posture unchanged (see docs/SECURITY.md).

-- ---------------------------------------------------------------------------
-- Permissions
-- ---------------------------------------------------------------------------
insert into public.permissions (key, description) values
  ('task.read', 'View tasks'),
  ('task.write', 'Create, update, and delete tasks'),
  ('task.assign', 'Assign tasks to people'),
  ('task.complete', 'Complete or cancel tasks')
on conflict (key) do nothing;

insert into public.role_permissions (role_key, permission_key)
select r.key, p.key
from public.roles r
cross join public.permissions p
where r.key in ('founder', 'owner', 'admin')
  and p.key in ('task.read', 'task.write', 'task.assign', 'task.complete')
on conflict do nothing;

insert into public.role_permissions (role_key, permission_key) values
  ('planner', 'task.read'),
  ('planner', 'task.write'),
  ('planner', 'task.assign'),
  ('planner', 'task.complete'),
  ('coordinator', 'task.read'),
  ('coordinator', 'task.write'),
  ('coordinator', 'task.assign'),
  ('coordinator', 'task.complete'),
  ('sales', 'task.read'),
  ('sales', 'task.write'),
  ('viewer', 'task.read'),
  ('finance', 'task.read'),
  ('vendor', 'task.read'),
  ('client', 'task.read')
on conflict do nothing;

-- ---------------------------------------------------------------------------
-- workspace_tasks (core Task domain — distinct from V0 public.tasks)
-- ---------------------------------------------------------------------------
create table if not exists public.workspace_tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'blocked', 'done', 'cancelled')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date date,
  assignee_id uuid,
  related_project_id uuid references public.projects (id) on delete set null,
  related_client_id uuid references public.crm_clients (id) on delete set null,
  related_vendor_id uuid references public.vendors (id) on delete set null,
  related_meeting_id uuid,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workspace_tasks_workspace_id_idx
  on public.workspace_tasks (workspace_id);
create index if not exists workspace_tasks_company_id_idx
  on public.workspace_tasks (company_id);
create index if not exists workspace_tasks_company_status_idx
  on public.workspace_tasks (company_id, status);
create index if not exists workspace_tasks_related_project_id_idx
  on public.workspace_tasks (related_project_id);
create index if not exists workspace_tasks_related_client_id_idx
  on public.workspace_tasks (related_client_id);
create index if not exists workspace_tasks_related_vendor_id_idx
  on public.workspace_tasks (related_vendor_id);
create index if not exists workspace_tasks_related_meeting_id_idx
  on public.workspace_tasks (related_meeting_id);
create index if not exists workspace_tasks_assignee_id_idx
  on public.workspace_tasks (assignee_id);

drop trigger if exists workspace_tasks_set_updated_at on public.workspace_tasks;
create trigger workspace_tasks_set_updated_at
  before update on public.workspace_tasks
  for each row execute function public.set_updated_at();

alter table public.workspace_tasks enable row level security;
revoke all on table public.workspace_tasks from anon, authenticated;
grant all on table public.workspace_tasks to service_role;

comment on table public.workspace_tasks is
  'Project 029: core Task domain (Workspace + Company scoped). Distinct from V0 public.tasks.';
