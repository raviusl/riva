-- Project 052 — Client CRM: assigned owner
-- Extends crm_clients with owner_id (auth user). No other schema changes.

alter table public.crm_clients
  add column if not exists owner_id uuid references auth.users (id) on delete set null;

create index if not exists crm_clients_owner_id_idx
  on public.crm_clients (owner_id);

comment on column public.crm_clients.owner_id is
  'Project 052: assigned owner (auth user id) for Client CRM.';
