-- Project 089 — Quotation Engine
-- CRM finance persistence for quotations (and shared finance_records).
-- Distinct from legacy V0 public.financial_records (user-scoped).
-- RLS posture unchanged (see docs/SECURITY.md).

insert into public.permissions (key, description) values
  ('finance.read', 'View finance records including quotations'),
  ('finance.write', 'Create and update finance records and quotations'),
  ('finance.delete', 'Void or delete finance records'),
  ('finance.export', 'Export finance data'),
  ('finance.approve', 'Approve commercial finance transitions')
on conflict (key) do nothing;

insert into public.role_permissions (role_key, permission_key)
select r.key, p.key
from public.roles r
cross join public.permissions p
where r.key in ('founder', 'owner', 'admin')
  and p.key in (
    'finance.read',
    'finance.write',
    'finance.delete',
    'finance.export',
    'finance.approve'
  )
on conflict do nothing;

insert into public.role_permissions (role_key, permission_key) values
  ('planner', 'finance.read'),
  ('planner', 'finance.write'),
  ('planner', 'finance.delete'),
  ('planner', 'finance.export'),
  ('planner', 'finance.approve'),
  ('coordinator', 'finance.read'),
  ('coordinator', 'finance.write'),
  ('sales', 'finance.read'),
  ('sales', 'finance.write'),
  ('finance', 'finance.read'),
  ('finance', 'finance.write'),
  ('finance', 'finance.export'),
  ('finance', 'finance.approve'),
  ('viewer', 'finance.read')
on conflict do nothing;

create table if not exists public.finance_records (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  client_id uuid references public.crm_clients (id) on delete set null,
  vendor_id uuid references public.vendors (id) on delete set null,
  type text not null
    check (
      type in (
        'income',
        'expense',
        'invoice',
        'quotation',
        'payment',
        'refund',
        'budget',
        'transaction'
      )
    ),
  category text not null default 'general'
    check (
      category in (
        'general',
        'services',
        'products',
        'labor',
        'materials',
        'travel',
        'venue',
        'marketing',
        'fees',
        'other'
      )
    ),
  currency text not null default 'USD'
    check (char_length(currency) = 3),
  amount numeric(14, 2) not null default 0
    check (amount >= 0),
  tax numeric(14, 2) not null default 0
    check (tax >= 0),
  discount numeric(14, 2) not null default 0
    check (discount >= 0),
  status text not null default 'draft'
    check (
      status in (
        'draft',
        'open',
        'sent',
        'accepted',
        'rejected',
        'expired',
        'paid',
        'overdue',
        'void',
        'cancelled'
      )
    ),
  reference_number text,
  issued_at timestamptz,
  due_at timestamptz,
  paid_at timestamptz,
  converted_invoice_id uuid references public.finance_records (id) on delete set null,
  notes text,
  internal_notes text,
  created_by uuid not null references auth.users (id) on delete restrict,
  updated_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finance_records_reference_number_len
    check (reference_number is null or char_length(reference_number) <= 100)
);

create index if not exists finance_records_workspace_id_idx
  on public.finance_records (workspace_id);
create index if not exists finance_records_company_workspace_idx
  on public.finance_records (company_id, workspace_id);
create index if not exists finance_records_company_workspace_type_idx
  on public.finance_records (company_id, workspace_id, type);
create index if not exists finance_records_company_workspace_status_idx
  on public.finance_records (company_id, workspace_id, status);
create index if not exists finance_records_client_id_idx
  on public.finance_records (client_id)
  where client_id is not null;
create index if not exists finance_records_project_id_idx
  on public.finance_records (project_id)
  where project_id is not null;
create index if not exists finance_records_reference_number_idx
  on public.finance_records (reference_number)
  where reference_number is not null;

drop trigger if exists finance_records_set_updated_at on public.finance_records;
create trigger finance_records_set_updated_at
  before update on public.finance_records
  for each row execute function public.set_updated_at();

alter table public.finance_records enable row level security;
revoke all on table public.finance_records from anon, authenticated;
grant all on table public.finance_records to service_role;

comment on table public.finance_records is
  'Project 089: company/workspace CRM finance records (quotations and shared finance types). Distinct from V0 public.financial_records.';

create table if not exists public.finance_line_items (
  id uuid primary key default gen_random_uuid(),
  finance_id uuid not null references public.finance_records (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  position integer not null default 0
    check (position >= 0),
  description text not null,
  quantity numeric(14, 4) not null default 1
    check (quantity > 0),
  unit_price numeric(14, 2) not null default 0
    check (unit_price >= 0),
  tax numeric(14, 2) not null default 0
    check (tax >= 0),
  discount numeric(14, 2) not null default 0
    check (discount >= 0),
  amount numeric(14, 2) not null default 0
    check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists finance_line_items_finance_id_idx
  on public.finance_line_items (finance_id);
create index if not exists finance_line_items_finance_position_idx
  on public.finance_line_items (finance_id, position);

drop trigger if exists finance_line_items_set_updated_at on public.finance_line_items;
create trigger finance_line_items_set_updated_at
  before update on public.finance_line_items
  for each row execute function public.set_updated_at();

alter table public.finance_line_items enable row level security;
revoke all on table public.finance_line_items from anon, authenticated;
grant all on table public.finance_line_items to service_role;

comment on table public.finance_line_items is
  'Project 089: line items for finance_records (quotations/invoices).';

create table if not exists public.finance_activities (
  id uuid primary key default gen_random_uuid(),
  finance_id uuid not null references public.finance_records (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  actor_id uuid references auth.users (id) on delete set null,
  activity_type text not null
    check (
      activity_type in (
        'quotation_created',
        'quotation_updated',
        'quotation_sent',
        'quotation_accepted',
        'quotation_rejected',
        'quotation_expired',
        'quotation_voided',
        'quotation_converted',
        'quotation_line_items_replaced'
      )
    ),
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists finance_activities_finance_created_idx
  on public.finance_activities (finance_id, created_at desc);
create index if not exists finance_activities_workspace_created_idx
  on public.finance_activities (workspace_id, created_at desc);

alter table public.finance_activities enable row level security;
revoke all on table public.finance_activities from anon, authenticated;
grant all on table public.finance_activities to service_role;

comment on table public.finance_activities is
  'Project 089: append-only finance/quotation activity feed.';
