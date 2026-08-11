-- Project 097 schema completion / repair
-- Fixes constraint migration order (drop BEFORE data rewrite) and
-- completes Wedding Project columns required by the product.
-- Idempotent. Safe on partially-migrated environments.

-- =========================================================
-- CLIENT CRM — constraint-safe type / status migration
-- =========================================================

alter table public.crm_clients
  add column if not exists client_code text,
  add column if not exists is_active boolean not null default true,
  add column if not exists source text,
  add column if not exists lead_owner_id uuid references auth.users (id) on delete set null,
  add column if not exists assigned_pic_id uuid references auth.users (id) on delete set null,
  add column if not exists company_name text,
  add column if not exists bride_name text,
  add column if not exists groom_name text,
  add column if not exists display_name text,
  add column if not exists contact_person text,
  add column if not exists whatsapp text,
  add column if not exists instagram text,
  add column if not exists facebook text,
  add column if not exists home_address text,
  add column if not exists city text,
  add column if not exists state text,
  add column if not exists country text,
  add column if not exists birthday date,
  add column if not exists anniversary date,
  add column if not exists wedding_date date,
  add column if not exists wedding_type text,
  add column if not exists session text,
  add column if not exists include_rom boolean not null default false,
  add column if not exists include_lunch boolean not null default false,
  add column if not exists include_dinner boolean not null default false,
  add column if not exists venue text,
  add column if not exists ballroom text,
  add column if not exists expected_pax integer,
  add column if not exists theme text,
  add column if not exists dress_code text,
  add column if not exists religion text,
  add column if not exists language text;

-- DROP old checks BEFORE rewriting values (root cause of prior 097 failure)
alter table public.crm_clients
  drop constraint if exists crm_clients_client_type_check;

alter table public.crm_clients
  drop constraint if exists crm_clients_status_check;

alter table public.crm_clients
  drop constraint if exists crm_clients_source_check;

update public.crm_clients
set client_type = case client_type
  when 'bride' then 'wedding'
  when 'groom' then 'wedding'
  when 'individual' then 'private'
  when 'corporate' then 'corporate'
  else client_type
end
where client_type in ('bride', 'groom', 'individual');

update public.crm_clients
set
  status = case status
    when 'active' then 'inquiry'
    when 'follow_up' then 'follow_up'
    when 'archived' then 'archived'
    else status
  end,
  is_active = case
    when status = 'archived' then false
    else coalesce(is_active, true)
  end
where status in ('active', 'follow_up', 'archived');

alter table public.crm_clients
  add constraint crm_clients_client_type_check
  check (
    client_type is null
    or client_type in ('wedding', 'corporate', 'private', 'others')
  );

alter table public.crm_clients
  add constraint crm_clients_status_check
  check (
    status in (
      'inquiry',
      'follow_up',
      'confirmed',
      'completed',
      'cancelled',
      'archived'
    )
  );

alter table public.crm_clients
  alter column status set default 'inquiry';

alter table public.crm_clients
  add constraint crm_clients_source_check
  check (
    source is null
    or source in (
      'facebook',
      'instagram',
      'tiktok',
      'xiaohongshu',
      'google',
      'referral',
      'walk_in',
      'existing_client',
      'others'
    )
  );

create unique index if not exists crm_clients_workspace_client_code_uidx
  on public.crm_clients (workspace_id, client_code)
  where client_code is not null;

create index if not exists crm_clients_company_status_idx
  on public.crm_clients (company_id, status);

create index if not exists crm_clients_company_is_active_idx
  on public.crm_clients (company_id, is_active);

create index if not exists crm_clients_wedding_date_idx
  on public.crm_clients (wedding_date)
  where wedding_date is not null;

update public.crm_clients
set client_code = 'CL-' || upper(substr(replace(id::text, '-', ''), 1, 8))
where client_code is null;

-- =========================================================
-- PROJECTS — Wedding Project foundation + required fields
-- =========================================================

alter table public.projects
  add column if not exists project_code text,
  add column if not exists client_id uuid references public.crm_clients (id) on delete set null,
  add column if not exists wedding_date date,
  add column if not exists event_date date,
  add column if not exists venue text,
  add column if not exists ballroom text,
  add column if not exists session text,
  add column if not exists coordinator_id uuid references auth.users (id) on delete set null,
  add column if not exists sales_id uuid references auth.users (id) on delete set null,
  add column if not exists planner_id uuid references auth.users (id) on delete set null,
  add column if not exists package_name text,
  add column if not exists expected_pax integer,
  add column if not exists client_budget numeric(14, 2),
  add column if not exists theme text,
  add column if not exists dress_code text,
  add column if not exists notes text;

-- Backfill client_id from crm_clients.project_id
update public.projects p
set client_id = c.id
from public.crm_clients c
where c.project_id = p.id
  and p.client_id is null;

alter table public.projects
  drop constraint if exists projects_status_check;

update public.projects
set status = case status
  when 'planning' then 'planning'
  when 'active' then 'execution'
  when 'completed' then 'completed'
  when 'archived' then 'archived'
  when 'draft' then 'inquiry'
  else status
end
where status in ('planning', 'active', 'completed', 'archived', 'draft');

alter table public.projects
  add constraint projects_status_check
  check (
    status in (
      'inquiry',
      'proposal',
      'confirmed',
      'planning',
      'execution',
      'completed',
      'cancelled',
      'archived'
    )
  );

alter table public.projects
  alter column status set default 'inquiry';

create unique index if not exists projects_workspace_project_code_uidx
  on public.projects (workspace_id, project_code)
  where project_code is not null;

create index if not exists projects_client_id_idx
  on public.projects (client_id)
  where client_id is not null;

create index if not exists projects_company_status_idx
  on public.projects (company_id, status);

create index if not exists projects_wedding_date_idx
  on public.projects (wedding_date)
  where wedding_date is not null;

update public.projects
set project_code = 'PRJ-' || upper(substr(replace(id::text, '-', ''), 1, 8))
where project_code is null;

comment on column public.projects.client_id is
  'Primary Client reference. Projects belong to a Client.';
comment on column public.projects.wedding_date is
  'Wedding / ceremony date for wedding projects.';
comment on column public.projects.venue is
  'Wedding venue name.';
comment on column public.projects.ballroom is
  'Ballroom / hall within the venue.';
comment on column public.projects.expected_pax is
  'Estimated guest count (estimated_pax).';
comment on column public.projects.client_budget is
  'Client expected budget for the wedding project. Not Finance revenue/cost.';
comment on column public.projects.planner_id is
  'Assigned planner (auth user).';
comment on column public.projects.coordinator_id is
  'Assigned coordinator (auth user).';
comment on column public.projects.sales_id is
  'Assigned sales person (auth user).';
comment on column public.projects.notes is
  'Internal project notes.';
