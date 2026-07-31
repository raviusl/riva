-- RIVA Project 030 — Task Assignment
-- Extends workspace_tasks with ownership. assignee_id already exists (029).
-- followers is a future placeholder only.

alter table public.workspace_tasks
  add column if not exists owner_id uuid;

alter table public.workspace_tasks
  add column if not exists followers uuid[] not null default '{}';

-- Backfill owner from creator when missing.
update public.workspace_tasks
set owner_id = created_by
where owner_id is null;

create index if not exists workspace_tasks_owner_id_idx
  on public.workspace_tasks (owner_id);

comment on column public.workspace_tasks.owner_id is
  'Project 030: task owner (auth user id).';
comment on column public.workspace_tasks.assignee_id is
  'Project 029/030: task assignee (auth user id).';
comment on column public.workspace_tasks.followers is
  'Project 030: placeholder for future followers; not wired in UI.';
