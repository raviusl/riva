-- Project 094 — Professional Quotation Workspace V2
-- Extend company letterhead, line-item commercial columns, package metadata.

-- ---------------------------------------------------------------------------
-- Company letterhead extensions
-- ---------------------------------------------------------------------------
alter table public.companies
  add column if not exists website text,
  add column if not exists swift_code text,
  add column if not exists signature_url text;

alter table public.companies
  drop constraint if exists companies_website_len;
alter table public.companies
  add constraint companies_website_len
  check (website is null or char_length(website) <= 500);

alter table public.companies
  drop constraint if exists companies_swift_code_len;
alter table public.companies
  add constraint companies_swift_code_len
  check (swift_code is null or char_length(swift_code) <= 32);

alter table public.companies
  drop constraint if exists companies_signature_url_len;
alter table public.companies
  add constraint companies_signature_url_len
  check (signature_url is null or char_length(signature_url) <= 1000);

-- ---------------------------------------------------------------------------
-- Line item commercial columns (UOM + per-line notes)
-- ---------------------------------------------------------------------------
alter table public.finance_line_items
  add column if not exists unit_of_measure text,
  add column if not exists notes text;

alter table public.finance_line_items
  drop constraint if exists finance_line_items_uom_len;
alter table public.finance_line_items
  add constraint finance_line_items_uom_len
  check (unit_of_measure is null or char_length(unit_of_measure) <= 40);

alter table public.finance_line_items
  drop constraint if exists finance_line_items_notes_len;
alter table public.finance_line_items
  add constraint finance_line_items_notes_len
  check (notes is null or char_length(notes) <= 4000);

-- ---------------------------------------------------------------------------
-- Package library metadata
-- ---------------------------------------------------------------------------
alter table public.finance_packages
  add column if not exists category text,
  add column if not exists default_tax numeric(14, 2) not null default 0;

alter table public.finance_packages
  drop constraint if exists finance_packages_category_len;
alter table public.finance_packages
  add constraint finance_packages_category_len
  check (category is null or char_length(category) <= 80);

comment on column public.companies.website is
  'Project 094: company website for document letterhead.';
comment on column public.finance_line_items.unit_of_measure is
  'Project 094: unit of measure (Lot, Set, Hour, Pax, etc.).';
comment on column public.finance_line_items.notes is
  'Project 094: per-line notes (printed under description when set).';
