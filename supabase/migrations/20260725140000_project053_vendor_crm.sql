-- Project 053 — Vendor CRM: owner + contact fields
alter table public.vendors
  add column if not exists owner_id uuid references auth.users (id) on delete set null,
  add column if not exists contact_person text,
  add column if not exists company_name text,
  add column if not exists website text,
  add column if not exists address text;

create index if not exists vendors_owner_id_idx
  on public.vendors (owner_id);

comment on column public.vendors.owner_id is
  'Project 053: assigned owner (auth user id) for Vendor CRM.';
comment on column public.vendors.contact_person is
  'Project 053: primary contact person name.';
comment on column public.vendors.company_name is
  'Project 053: vendor business / company name (display).';
comment on column public.vendors.website is
  'Project 053: vendor website URL.';
comment on column public.vendors.address is
  'Project 053: vendor address.';
