-- Project 102 — Wedding Project Package Module
-- Project-scoped sold packages + line items for the Package workspace tab.
-- Does not modify finance_packages, timeline, or tasks tables.

create table if not exists public.wedding_project_packages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  source_finance_package_id uuid references public.finance_packages (id) on delete set null,
  name text not null,
  description text,
  currency text not null default 'MYR',
  status text not null default 'draft',
  sequence integer not null default 0,
  notes text,
  archived_at timestamptz,
  created_by uuid references auth.users (id) on delete set null,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wedding_project_packages_name_len
    check (char_length(name) >= 1 and char_length(name) <= 200),
  constraint wedding_project_packages_currency_len
    check (char_length(currency) = 3),
  constraint wedding_project_packages_status_check
    check (status in ('draft', 'confirmed', 'cancelled', 'archived'))
);

create table if not exists public.wedding_project_package_items (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.wedding_project_packages (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  position integer not null default 0,
  title text not null,
  description text,
  quantity numeric(14, 4) not null default 1,
  unit_price numeric(14, 2) not null default 0,
  unit_of_measure text,
  category text,
  vendor_id uuid references public.vendors (id) on delete set null,
  is_included boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wedding_project_package_items_title_len
    check (char_length(title) >= 1 and char_length(title) <= 300),
  constraint wedding_project_package_items_qty_check
    check (quantity > 0),
  constraint wedding_project_package_items_position_check
    check (position >= 0)
);

create index if not exists wedding_project_packages_project_seq_idx
  on public.wedding_project_packages (project_id, sequence)
  where archived_at is null;

create index if not exists wedding_project_packages_workspace_company_idx
  on public.wedding_project_packages (workspace_id, company_id);

create index if not exists wedding_project_package_items_package_pos_idx
  on public.wedding_project_package_items (package_id, position);

create index if not exists wedding_project_package_items_project_idx
  on public.wedding_project_package_items (project_id);

comment on table public.wedding_project_packages is
  'Project 102 — Wedding project operational packages (Package tab).';
comment on table public.wedding_project_package_items is
  'Project 102 — Line items / inclusions for wedding project packages.';
comment on column public.wedding_project_packages.source_finance_package_id is
  'Optional link to finance package library template.';

alter table public.wedding_project_packages enable row level security;
alter table public.wedding_project_package_items enable row level security;

revoke all on table public.wedding_project_packages from anon, authenticated;
revoke all on table public.wedding_project_package_items from anon, authenticated;
