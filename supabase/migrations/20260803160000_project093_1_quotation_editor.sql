-- Project 093.1 — Quotation Editor commercial document model
-- Company letterhead + per-record document_content + package library.

-- ---------------------------------------------------------------------------
-- Company letterhead / banking (shared by quotation, invoice, etc.)
-- ---------------------------------------------------------------------------
alter table public.companies
  add column if not exists registration_no text,
  add column if not exists address text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists bank_name text,
  add column if not exists bank_account_name text,
  add column if not exists bank_account_number text,
  add column if not exists default_payment_terms text,
  add column if not exists default_terms_and_conditions text,
  add column if not exists default_document_footer text;

alter table public.companies
  drop constraint if exists companies_registration_no_len;
alter table public.companies
  add constraint companies_registration_no_len
  check (registration_no is null or char_length(registration_no) <= 120);

alter table public.companies
  drop constraint if exists companies_address_len;
alter table public.companies
  add constraint companies_address_len
  check (address is null or char_length(address) <= 2000);

alter table public.companies
  drop constraint if exists companies_phone_len;
alter table public.companies
  add constraint companies_phone_len
  check (phone is null or char_length(phone) <= 60);

alter table public.companies
  drop constraint if exists companies_email_len;
alter table public.companies
  add constraint companies_email_len
  check (email is null or char_length(email) <= 320);

-- ---------------------------------------------------------------------------
-- Per finance-record commercial document payload (reusable across kinds)
-- ---------------------------------------------------------------------------
alter table public.finance_records
  add column if not exists document_content jsonb not null default '{}'::jsonb;

comment on column public.finance_records.document_content is
  'Project 093.1: structured commercial fields for document generation (bill-to, event, terms, bank, footer, etc.).';

alter table public.finance_line_items
  add column if not exists item_kind text not null default 'line';

alter table public.finance_line_items
  drop constraint if exists finance_line_items_item_kind_check;
alter table public.finance_line_items
  add constraint finance_line_items_item_kind_check
  check (item_kind in ('line', 'package', 'charge', 'discount'));

-- ---------------------------------------------------------------------------
-- Package library
-- ---------------------------------------------------------------------------
create table if not exists public.finance_packages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  name text not null,
  description text,
  currency text not null default 'USD'
    check (char_length(currency) = 3),
  is_active boolean not null default true,
  created_by uuid not null references auth.users (id) on delete restrict,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finance_packages_name_len check (char_length(name) <= 200),
  constraint finance_packages_description_len
    check (description is null or char_length(description) <= 4000)
);

create index if not exists finance_packages_company_workspace_idx
  on public.finance_packages (company_id, workspace_id);

create index if not exists finance_packages_active_idx
  on public.finance_packages (company_id, workspace_id, is_active);

drop trigger if exists finance_packages_set_updated_at on public.finance_packages;
create trigger finance_packages_set_updated_at
  before update on public.finance_packages
  for each row execute function public.set_updated_at();

alter table public.finance_packages enable row level security;
revoke all on table public.finance_packages from anon, authenticated;
grant all on table public.finance_packages to service_role;

create table if not exists public.finance_package_items (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references public.finance_packages (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  position integer not null default 0 check (position >= 0),
  description text not null,
  quantity numeric(14, 4) not null default 1 check (quantity > 0),
  unit_price numeric(14, 2) not null default 0 check (unit_price >= 0),
  unit_of_measure text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finance_package_items_description_len
    check (char_length(description) <= 500),
  constraint finance_package_items_uom_len
    check (unit_of_measure is null or char_length(unit_of_measure) <= 40)
);

create index if not exists finance_package_items_package_id_idx
  on public.finance_package_items (package_id, position);

drop trigger if exists finance_package_items_set_updated_at on public.finance_package_items;
create trigger finance_package_items_set_updated_at
  before update on public.finance_package_items
  for each row execute function public.set_updated_at();

alter table public.finance_package_items enable row level security;
revoke all on table public.finance_package_items from anon, authenticated;
grant all on table public.finance_package_items to service_role;

comment on table public.finance_packages is
  'Project 093.1: reusable package library for quotation/invoice line expansion.';
comment on table public.finance_package_items is
  'Project 093.1: line templates belonging to a finance package.';
