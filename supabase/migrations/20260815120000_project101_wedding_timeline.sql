-- Project 101 — Wedding Timeline (M1)
-- Schedule state, timestamptz scheduling, sort_order, deps + assignments tables,
-- actuals, and RBAC keys (replace legacy timeline.write).
-- Does not modify CRM / Finance / Documents tables beyond permission catalog.

-- ---------------------------------------------------------------------------
-- Permissions: replace timeline.write with structure / execute / comment /
-- archive / restore / state.change (and seed timeline.read if missing)
-- ---------------------------------------------------------------------------
insert into public.permissions (key, description) values
  ('timeline.read', 'View wedding timeline surfaces'),
  ('timeline.structure.write', 'Create/edit/reorder timeline structure, times, deps, assignments'),
  ('timeline.execute', 'Update timeline execution status, delay, actuals, checklist'),
  ('timeline.comment', 'Create client-visible timeline comments'),
  ('timeline.archive', 'Archive timeline items'),
  ('timeline.restore', 'Restore archived timeline items'),
  ('timeline.state.change', 'Change timeline schedule workflow state')
on conflict (key) do nothing;

-- Remove legacy coarse write key if present
delete from public.role_permissions where permission_key = 'timeline.write';
delete from public.permissions where key = 'timeline.write';

-- Founder / owner / admin: full timeline
insert into public.role_permissions (role_key, permission_key)
select r.key, p.key
from public.roles r
cross join public.permissions p
where r.key in ('founder', 'owner', 'admin')
  and p.key in (
    'timeline.read',
    'timeline.structure.write',
    'timeline.execute',
    'timeline.comment',
    'timeline.archive',
    'timeline.restore',
    'timeline.state.change'
  )
on conflict do nothing;

-- Planner: structure + state (no execute) per Project 101
insert into public.role_permissions (role_key, permission_key) values
  ('planner', 'timeline.read'),
  ('planner', 'timeline.structure.write'),
  ('planner', 'timeline.comment'),
  ('planner', 'timeline.archive'),
  ('planner', 'timeline.restore'),
  ('planner', 'timeline.state.change')
on conflict do nothing;

-- Coordinator: execute + comment (no structure)
insert into public.role_permissions (role_key, permission_key) values
  ('coordinator', 'timeline.read'),
  ('coordinator', 'timeline.execute'),
  ('coordinator', 'timeline.comment')
on conflict do nothing;

-- Sales / viewer: read only
insert into public.role_permissions (role_key, permission_key) values
  ('sales', 'timeline.read'),
  ('viewer', 'timeline.read')
on conflict do nothing;

-- Finance: no timeline grants by default (explicit deny via absence)

-- ---------------------------------------------------------------------------
-- Schedule state (1:1 with project)
-- ---------------------------------------------------------------------------
create table if not exists public.wedding_timeline_schedules (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  project_id uuid not null unique references public.projects (id) on delete cascade,
  timeline_state text not null default 'draft',
  previous_execution_state text,
  emergency_unlock_until timestamptz,
  emergency_unlock_by uuid references auth.users (id) on delete set null,
  confirmed_at timestamptz,
  ready_at timestamptz,
  live_at timestamptz,
  completed_at timestamptz,
  archived_at timestamptz,
  cancelled_at timestamptz,
  paused_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint wedding_timeline_schedules_state_check
    check (
      timeline_state in (
        'draft',
        'planning',
        'confirmed',
        'ready',
        'live',
        'completed',
        'archived',
        'cancelled',
        'paused'
      )
    ),
  constraint wedding_timeline_schedules_prev_state_check
    check (
      previous_execution_state is null
      or previous_execution_state in (
        'draft',
        'planning',
        'confirmed',
        'ready',
        'live',
        'completed',
        'archived',
        'cancelled',
        'paused'
      )
    )
);

create index if not exists wedding_timeline_schedules_workspace_company_idx
  on public.wedding_timeline_schedules (workspace_id, company_id)
  where deleted_at is null;

create index if not exists wedding_timeline_schedules_state_idx
  on public.wedding_timeline_schedules (timeline_state)
  where deleted_at is null;

comment on table public.wedding_timeline_schedules is
  'Project 101 — 1:1 wedding timeline schedule / workflow state per project.';

alter table public.wedding_timeline_schedules enable row level security;
revoke all on table public.wedding_timeline_schedules from anon, authenticated;

-- ---------------------------------------------------------------------------
-- Evolve wedding_timeline_items
-- ---------------------------------------------------------------------------
alter table public.wedding_timeline_items
  add column if not exists sort_order integer,
  add column if not exists scheduled_start timestamptz,
  add column if not exists duration_minutes integer,
  add column if not exists scheduled_end timestamptz,
  add column if not exists phase text,
  add column if not exists item_type text,
  add column if not exists buffer_before_minutes integer,
  add column if not exists buffer_after_minutes integer,
  add column if not exists package_item_id uuid,
  add column if not exists source text,
  add column if not exists actual_start_at timestamptz,
  add column if not exists actual_end_at timestamptz,
  add column if not exists delay_minutes integer,
  add column if not exists updated_by uuid references auth.users (id) on delete set null;

-- Backfill sort_order from legacy sequence
update public.wedding_timeline_items
set sort_order = sequence
where sort_order is null;

alter table public.wedding_timeline_items
  alter column sort_order set default 0;

update public.wedding_timeline_items
set sort_order = 0
where sort_order is null;

alter table public.wedding_timeline_items
  alter column sort_order set not null;

-- Defaults for new required-ish columns
update public.wedding_timeline_items
set item_type = 'activity'
where item_type is null;

alter table public.wedding_timeline_items
  alter column item_type set default 'activity';

alter table public.wedding_timeline_items
  alter column item_type set not null;

update public.wedding_timeline_items
set source = 'manual'
where source is null;

alter table public.wedding_timeline_items
  alter column source set default 'manual';

alter table public.wedding_timeline_items
  alter column source set not null;

-- Duration from legacy start/end (overnight wraps +24h)
update public.wedding_timeline_items
set duration_minutes = case
  when start_time is null or end_time is null then null
  when end_time >= start_time then
    (extract(epoch from (end_time - start_time)) / 60)::integer
  else
    (extract(epoch from (end_time - start_time)) / 60)::integer + 24 * 60
end
where duration_minutes is null
  and start_time is not null
  and end_time is not null;

-- scheduled_start from wedding_date + start_time in company/workspace TZ
update public.wedding_timeline_items i
set scheduled_start = (
  (p.wedding_date::timestamp + i.start_time)
  at time zone coalesce(nullif(c.timezone, ''), nullif(w.timezone, ''), 'UTC')
)
from public.projects p
join public.companies c on c.id = p.company_id
join public.workspaces w on w.id = p.workspace_id
where i.project_id = p.id
  and i.scheduled_start is null
  and i.start_time is not null
  and p.wedding_date is not null;

-- scheduled_end from start + duration when both present
update public.wedding_timeline_items
set scheduled_end = scheduled_start + make_interval(mins => duration_minutes)
where scheduled_start is not null
  and duration_minutes is not null
  and scheduled_end is null;

-- Drop legacy CHECKs if we need to re-add expanded ones (idempotent via names)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'wedding_timeline_items_phase_check'
  ) then
    alter table public.wedding_timeline_items
      add constraint wedding_timeline_items_phase_check
      check (
        phase is null
        or phase in ('prep', 'ceremony', 'reception', 'post', 'custom')
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'wedding_timeline_items_item_type_check'
  ) then
    alter table public.wedding_timeline_items
      add constraint wedding_timeline_items_item_type_check
      check (
        item_type in (
          'activity',
          'milestone',
          'call_time',
          'break',
          'buffer',
          'note'
        )
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'wedding_timeline_items_source_check'
  ) then
    alter table public.wedding_timeline_items
      add constraint wedding_timeline_items_source_check
      check (
        source in (
          'manual',
          'package_seed',
          'template',
          'ai',
          'orphaned_package'
        )
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'wedding_timeline_items_duration_check'
  ) then
    alter table public.wedding_timeline_items
      add constraint wedding_timeline_items_duration_check
      check (duration_minutes is null or duration_minutes >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'wedding_timeline_items_buffer_before_check'
  ) then
    alter table public.wedding_timeline_items
      add constraint wedding_timeline_items_buffer_before_check
      check (buffer_before_minutes is null or buffer_before_minutes >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'wedding_timeline_items_buffer_after_check'
  ) then
    alter table public.wedding_timeline_items
      add constraint wedding_timeline_items_buffer_after_check
      check (buffer_after_minutes is null or buffer_after_minutes >= 0);
  end if;
end $$;

create index if not exists wedding_timeline_items_project_sort_idx
  on public.wedding_timeline_items (project_id, sort_order)
  where archived_at is null;

create index if not exists wedding_timeline_items_project_scheduled_start_idx
  on public.wedding_timeline_items (project_id, scheduled_start);

create index if not exists wedding_timeline_items_project_phase_idx
  on public.wedding_timeline_items (project_id, phase);

create index if not exists wedding_timeline_items_project_item_type_idx
  on public.wedding_timeline_items (project_id, item_type);

comment on column public.wedding_timeline_items.sort_order is
  'Project 101 — manual UI order; display sort is scheduled_start → sort_order → created_at.';
comment on column public.wedding_timeline_items.scheduled_start is
  'Project 101 — absolute start instant (project/venue TZ for display).';
comment on column public.wedding_timeline_items.duration_minutes is
  'Project 101 — stored duration SoT; milestone may be 0/null.';
comment on column public.wedding_timeline_items.scheduled_end is
  'Project 101 — optional persisted end maintained on write from start+duration.';
comment on column public.wedding_timeline_items.sequence is
  'Legacy Project 099 order — stop writing; use sort_order.';
comment on column public.wedding_timeline_items.start_time is
  'Legacy Project 099 time-of-day — stop writing; use scheduled_start.';
comment on column public.wedding_timeline_items.end_time is
  'Legacy Project 099 time-of-day — stop writing; use duration_minutes.';
comment on column public.wedding_timeline_items.depends_on_id is
  'Legacy single dependency — stop writing; use wedding_timeline_item_dependencies.';
comment on column public.wedding_timeline_items.assignments is
  'Legacy JSON assignments — stop writing; use timeline_assignments.';

-- ---------------------------------------------------------------------------
-- Dependencies (M:N soft-delete)
-- ---------------------------------------------------------------------------
create table if not exists public.wedding_timeline_item_dependencies (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  predecessor_item_id uuid not null references public.wedding_timeline_items (id) on delete cascade,
  successor_item_id uuid not null references public.wedding_timeline_items (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint wedding_timeline_item_dependencies_not_self
    check (predecessor_item_id <> successor_item_id)
);

create unique index if not exists wedding_timeline_item_dependencies_pair_uidx
  on public.wedding_timeline_item_dependencies (predecessor_item_id, successor_item_id)
  where deleted_at is null;

create index if not exists wedding_timeline_item_dependencies_project_idx
  on public.wedding_timeline_item_dependencies (project_id)
  where deleted_at is null;

create index if not exists wedding_timeline_item_dependencies_successor_idx
  on public.wedding_timeline_item_dependencies (successor_item_id)
  where deleted_at is null;

comment on table public.wedding_timeline_item_dependencies is
  'Project 101 — soft-deleted M:N timeline item dependencies (cycles forbidden in app).';

alter table public.wedding_timeline_item_dependencies enable row level security;
revoke all on table public.wedding_timeline_item_dependencies from anon, authenticated;

-- Backfill single depends_on_id → relationship rows
insert into public.wedding_timeline_item_dependencies (
  workspace_id,
  company_id,
  project_id,
  predecessor_item_id,
  successor_item_id
)
select
  i.workspace_id,
  i.company_id,
  i.project_id,
  i.depends_on_id,
  i.id
from public.wedding_timeline_items i
where i.depends_on_id is not null
  and not exists (
    select 1
    from public.wedding_timeline_item_dependencies d
    where d.predecessor_item_id = i.depends_on_id
      and d.successor_item_id = i.id
      and d.deleted_at is null
  );

-- ---------------------------------------------------------------------------
-- Assignments (normalize; soft-delete)
-- ---------------------------------------------------------------------------
create table if not exists public.timeline_assignments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  timeline_item_id uuid not null references public.wedding_timeline_items (id) on delete cascade,
  assignment_type text not null,
  person_id uuid,
  display_name text,
  vendor_id uuid references public.vendors (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint timeline_assignments_type_check
    check (
      assignment_type in (
        'Owner',
        'Staff',
        'Vendor',
        'Couple',
        'Family',
        'Photographer',
        'Videographer',
        'MC',
        'Musician'
      )
    ),
  constraint timeline_assignments_identity_check
    check (person_id is not null or display_name is not null)
);

create index if not exists timeline_assignments_item_idx
  on public.timeline_assignments (timeline_item_id)
  where deleted_at is null;

create index if not exists timeline_assignments_project_idx
  on public.timeline_assignments (project_id)
  where deleted_at is null;

comment on table public.timeline_assignments is
  'Project 101 — run-of-show staffing assignments (not login auth).';

alter table public.timeline_assignments enable row level security;
revoke all on table public.timeline_assignments from anon, authenticated;

-- Backfill legacy assignments jsonb → timeline_assignments
insert into public.timeline_assignments (
  id,
  workspace_id,
  company_id,
  project_id,
  timeline_item_id,
  assignment_type,
  person_id,
  display_name,
  vendor_id
)
select
  case
    when (elem->>'id') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then (elem->>'id')::uuid
    else gen_random_uuid()
  end,
  i.workspace_id,
  i.company_id,
  i.project_id,
  i.id,
  case lower(coalesce(elem->>'role', 'custom'))
    when 'photographer' then 'Photographer'
    when 'videographer' then 'Videographer'
    when 'mc' then 'MC'
    when 'singer' then 'Musician'
    when 'band' then 'Musician'
    when 'bride' then 'Couple'
    when 'groom' then 'Couple'
    when 'family' then 'Family'
    when 'parents' then 'Family'
    when 'venue' then 'Vendor'
    when 'hotel' then 'Vendor'
    when 'makeup_artist' then 'Vendor'
    when 'decorator' then 'Vendor'
    when 'coordinator' then 'Staff'
    when 'vip' then 'Staff'
    else 'Staff'
  end,
  case
    when (elem->>'personId') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      then (elem->>'personId')::uuid
    else null
  end,
  coalesce(nullif(elem->>'label', ''), 'Assignee'),
  case
    when lower(coalesce(elem->>'role', '')) in (
      'venue', 'hotel', 'makeup_artist', 'decorator'
    ) then i.vendor_id
    else null
  end
from public.wedding_timeline_items i
cross join lateral jsonb_array_elements(
  case
    when jsonb_typeof(i.assignments) = 'array' then i.assignments
    else '[]'::jsonb
  end
) as elem
where coalesce(elem->>'label', '') <> ''
   or (elem->>'personId') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- ---------------------------------------------------------------------------
-- Seed schedules for projects that already have timeline items
-- ---------------------------------------------------------------------------
insert into public.wedding_timeline_schedules (
  workspace_id,
  company_id,
  project_id,
  timeline_state
)
select distinct
  i.workspace_id,
  i.company_id,
  i.project_id,
  'draft'
from public.wedding_timeline_items i
where not exists (
  select 1
  from public.wedding_timeline_schedules s
  where s.project_id = i.project_id
    and s.deleted_at is null
)
on conflict (project_id) do nothing;
