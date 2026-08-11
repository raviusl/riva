-- Project 097 follow-up: rename projects.budget -> client_budget
-- Preserves existing values. Idempotent. Does not touch Finance tables.

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'budget'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'client_budget'
  ) then
    alter table public.projects rename column budget to client_budget;
  elsif exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'budget'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'projects'
      and column_name = 'client_budget'
  ) then
    update public.projects
    set client_budget = budget
    where client_budget is null
      and budget is not null;
    alter table public.projects drop column budget;
  end if;
end $$;

alter table public.projects
  add column if not exists client_budget numeric(14, 2);

comment on column public.projects.client_budget is
  'Client expected budget for the wedding project. Not Finance revenue/cost.';
