-- Project 093 — Document Engine v1.0
-- Metadata for generated finance PDFs + private finance storage bucket.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'finance',
  'finance',
  false,
  52428800,
  array['application/pdf']::text[]
)
on conflict (id) do nothing;

create table if not exists public.finance_documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  finance_id uuid not null references public.finance_records (id) on delete cascade,
  document_kind text not null
    check (
      document_kind in (
        'quotation',
        'invoice',
        'receipt',
        'purchase_order',
        'contract'
      )
    ),
  version integer not null default 1
    check (version >= 1),
  status text not null default 'ready'
    check (status in ('ready', 'failed')),
  storage_bucket text not null default 'finance',
  storage_path text not null,
  filename text not null,
  mime_type text not null default 'application/pdf',
  size_bytes bigint not null default 0
    check (size_bytes >= 0),
  generated_by uuid not null references auth.users (id) on delete restrict,
  generated_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint finance_documents_storage_path_len
    check (char_length(storage_path) <= 1000),
  constraint finance_documents_filename_len
    check (char_length(filename) <= 500)
);

create unique index if not exists finance_documents_finance_kind_version_uidx
  on public.finance_documents (finance_id, document_kind, version);

create index if not exists finance_documents_company_workspace_idx
  on public.finance_documents (company_id, workspace_id);

create index if not exists finance_documents_finance_id_idx
  on public.finance_documents (finance_id);

create index if not exists finance_documents_kind_idx
  on public.finance_documents (document_kind);

drop trigger if exists finance_documents_set_updated_at on public.finance_documents;
create trigger finance_documents_set_updated_at
  before update on public.finance_documents
  for each row execute function public.set_updated_at();

alter table public.finance_documents enable row level security;
revoke all on table public.finance_documents from anon, authenticated;
grant all on table public.finance_documents to service_role;

comment on table public.finance_documents is
  'Project 093: generated finance document metadata (quotation/invoice/receipt/PO/contract PDFs).';
