-- Project 097 — Client CRM + Wedding Project Foundation
-- Extends crm_clients + projects. Does not touch finance tables.

-- =========================================================
-- CLIENT CRM
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

-- Migrate legacy client_type values.
-- DROP old check FIRST — updating to 'wedding'/'private' while the legacy
-- check (bride/groom/individual/corporate) remains will fail.
alter table public.crm_clients
  drop constraint if exists crm_clients_client_type_check;

update public.crm_clients
set client_type = case client_type
  when 'bride' then 'wedding'
  when 'groom' then 'wedding'
  when 'individual' then 'private'
  when 'corporate' then 'corporate'
  else client_type
end
where client_type in ('bride', 'groom', 'individual');

alter table public.crm_clients
  add constraint crm_clients_client_type_check
  check (
    client_type is null
    or client_type in ('wedding', 'corporate', 'private', 'others')
  );

-- Migrate legacy status → inquiry / follow_up / archived
alter table public.crm_clients
  drop constraint if exists crm_clients_status_check;

update public.crm_clients
set
  status = case status
    when 'active' then 'inquiry'
    when 'follow_up' then 'follow_up'
    when 'archived' then 'archived'
    else status
  end,
  is_active = case when status = 'archived' then false else coalesce(is_active, true) end
where status in ('active', 'follow_up', 'archived');

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
  drop constraint if exists crm_clients_source_check;

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

-- Backfill client_code for existing rows
update public.crm_clients
set client_code = 'CL-' || upper(substr(replace(id::text, '-', ''), 1, 8))
where client_code is null;

-- =========================================================
-- PROJECTS (Wedding Project Foundation)
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

-- Backfill client_id from crm_clients.project_id (primary link direction: Project → Client)
update public.projects p
set client_id = c.id
from public.crm_clients c
where c.project_id = p.id
  and p.client_id is null;

-- Migrate legacy project statuses (drop check before rewrite)
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

-- Backfill project_code
update public.projects
set project_code = 'PRJ-' || upper(substr(replace(id::text, '-', ''), 1, 8))
where project_code is null;

comment on column public.crm_clients.client_code is
  'Human-readable client code (CL-XXXXXXXX).';
comment on column public.crm_clients.is_active is
  'Active / inactive flag independent of pipeline status.';
comment on column public.crm_clients.source is
  'Lead source (Facebook, Instagram, Referral, …).';
comment on column public.projects.client_id is
  'Primary Client reference. Projects belong to a Client; do not duplicate client data.';
comment on column public.projects.project_code is
  'Human-readable project code (PRJ-XXXXXXXX).';
comment on column public.projects.wedding_date is
  'Wedding / ceremony date for wedding projects.';
comment on column public.projects.event_date is
  'Primary event date (may equal wedding_date).';
