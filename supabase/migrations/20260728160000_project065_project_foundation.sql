-- Project 065 — Project Foundation fields + status model
-- planning | active | completed | archived

alter table public.projects
  add column if not exists description text,
  add column if not exists start_date date,
  add column if not exists end_date date;

update public.projects
set status = 'planning'
where status = 'draft';

alter table public.projects
  drop constraint if exists projects_status_check;

alter table public.projects
  add constraint projects_status_check
  check (status in ('planning', 'active', 'completed', 'archived'));

alter table public.projects
  alter column status set default 'planning';

comment on column public.projects.description is
  'Optional project summary for RIVA OS Project Foundation.';
comment on column public.projects.start_date is
  'Optional project start date (YYYY-MM-DD).';
comment on column public.projects.end_date is
  'Optional project end / due date (YYYY-MM-DD).';
