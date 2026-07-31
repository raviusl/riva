-- Project 055 — Task CRM: enum alignment + CRM fields
-- Align statuses/priorities; add start/completed dates, tags, archive.

-- ---------------------------------------------------------------------------
-- Data migration (old → new enums)
-- ---------------------------------------------------------------------------
update public.workspace_tasks set status = 'waiting' where status = 'blocked';
update public.workspace_tasks set status = 'completed' where status = 'done';
update public.workspace_tasks set priority = 'normal' where priority = 'medium';

-- ---------------------------------------------------------------------------
-- Drop old checks and add new ones
-- ---------------------------------------------------------------------------
alter table public.workspace_tasks
  drop constraint if exists workspace_tasks_status_check;

alter table public.workspace_tasks
  drop constraint if exists workspace_tasks_priority_check;

alter table public.workspace_tasks
  add constraint workspace_tasks_status_check
  check (
    status in (
      'todo',
      'in_progress',
      'waiting',
      'completed',
      'cancelled'
    )
  );

alter table public.workspace_tasks
  alter column status set default 'todo';

alter table public.workspace_tasks
  add constraint workspace_tasks_priority_check
  check (priority in ('low', 'normal', 'high', 'urgent'));

alter table public.workspace_tasks
  alter column priority set default 'normal';

-- ---------------------------------------------------------------------------
-- New CRM columns
-- ---------------------------------------------------------------------------
alter table public.workspace_tasks
  add column if not exists start_date date,
  add column if not exists completed_date date,
  add column if not exists tags text[] not null default '{}'::text[],
  add column if not exists archived_at timestamptz;

create index if not exists workspace_tasks_company_archived_at_idx
  on public.workspace_tasks (company_id, archived_at);

create index if not exists workspace_tasks_start_date_idx
  on public.workspace_tasks (start_date);

create index if not exists workspace_tasks_completed_date_idx
  on public.workspace_tasks (completed_date);

comment on column public.workspace_tasks.start_date is
  'Project 055: optional task start date (YYYY-MM-DD).';
comment on column public.workspace_tasks.completed_date is
  'Project 055: date the task was completed.';
comment on column public.workspace_tasks.tags is
  'Project 055: free-form tags for Task CRM.';
comment on column public.workspace_tasks.archived_at is
  'Project 055: soft-archive timestamp (null = active).';

-- Backfill completed_date for already-completed tasks
update public.workspace_tasks
set completed_date = coalesce(completed_date, (updated_at at time zone 'utc')::date)
where status = 'completed'
  and completed_date is null;
