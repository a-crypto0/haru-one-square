create type public.display_mode as enum ('easy', 'standard');
create type public.theme_preference as enum ('system', 'light', 'dark');
create type public.task_kind as enum ('standard', 'medication');
create type public.task_color_token as enum ('sage', 'lavender', 'sky', 'butter');
create type public.task_log_status as enum ('completed', 'missing', 'not_scheduled', 'delayed', 'help_requested');
create type public.medication_log_status as enum ('completed', 'delayed', 'help_requested');
create type public.change_target_type as enum ('task', 'task_recurrence', 'task_override', 'medication_detail', 'support_link');
create type public.change_action as enum ('created', 'updated', 'deleted');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  display_name text not null check (length(trim(display_name)) between 1 and 80),
  display_mode public.display_mode not null default 'easy',
  theme public.theme_preference not null default 'system',
  read_aloud_enabled boolean not null default false
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users(id),
  updated_at timestamptz not null default now(),
  kind public.task_kind not null default 'standard',
  title text not null check (length(trim(title)) between 1 and 120),
  icon text not null,
  color_token public.task_color_token not null,
  scheduled_time time,
  reminder_enabled boolean not null default false,
  position integer not null default 0 check (position >= 0),
  is_hidden boolean not null default false,
  unique (owner_id, id)
);

create table public.task_recurrences (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  task_id uuid not null,
  weekdays smallint[] not null check (weekdays <@ array[0,1,2,3,4,5,6]::smallint[]),
  starts_on date not null,
  ends_on date check (ends_on is null or ends_on >= starts_on),
  unique (owner_id, task_id),
  foreign key (owner_id, task_id) references public.tasks(owner_id, id) on delete cascade
);

create table public.task_overrides (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  task_id uuid not null,
  occurrence_date date not null,
  scheduled_time time,
  is_cancelled boolean not null default false,
  unique (owner_id, task_id, occurrence_date),
  foreign key (owner_id, task_id) references public.tasks(owner_id, id) on delete cascade
);

create table public.task_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  task_id uuid not null,
  occurrence_date date not null,
  status public.task_log_status not null,
  recorded_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (owner_id, id),
  unique (owner_id, task_id, occurrence_date),
  foreign key (owner_id, task_id) references public.tasks(owner_id, id) on delete cascade,
  check ((status = 'completed' and completed_at is not null) or (status <> 'completed' and completed_at is null))
);

create table public.weight_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  weight_kg numeric(5,2) not null check (weight_kg > 0 and weight_kg < 500),
  recorded_at timestamptz not null default now()
);

create table public.medication_details (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  task_id uuid not null,
  display_name text not null check (length(trim(display_name)) between 1 and 120),
  photo_path text,
  unique (owner_id, task_id),
  foreign key (owner_id, task_id) references public.tasks(owner_id, id) on delete cascade,
  check (photo_path is null or photo_path like owner_id::text || '/' || task_id::text || '/%')
);

create table public.medication_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  task_id uuid not null,
  task_log_id uuid not null,
  status public.medication_log_status not null,
  recorded_at timestamptz not null default now(),
  foreign key (owner_id, task_id) references public.tasks(owner_id, id) on delete cascade,
  foreign key (owner_id, task_log_id) references public.task_logs(owner_id, id) on delete cascade,
  unique (owner_id, task_log_id)
);

create table public.support_links (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  supporter_id uuid not null references auth.users(id) on delete cascade,
  can_view_schedule boolean not null default true,
  can_add_schedule boolean not null default true,
  can_update_schedule boolean not null default true,
  accepted_at timestamptz,
  revoked_at timestamptz,
  check (owner_id <> supporter_id)
);

create table public.change_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  actor_id uuid not null references auth.users(id),
  target_type public.change_target_type not null,
  target_id uuid not null,
  action public.change_action not null,
  before_value jsonb,
  after_value jsonb,
  check (before_value is not null or after_value is not null)
);

create index tasks_owner_position_idx on public.tasks(owner_id, position);
create index task_logs_owner_date_idx on public.task_logs(owner_id, occurrence_date);
create index weight_logs_owner_recorded_idx on public.weight_logs(owner_id, recorded_at desc);
create index change_logs_owner_created_idx on public.change_logs(owner_id, created_at desc);
create index support_links_supporter_idx on public.support_links(supporter_id) where revoked_at is null;

create function public.keep_task_identity()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.owner_id is distinct from old.owner_id or new.created_by is distinct from old.created_by then
    raise exception 'task owner_id and created_by cannot be changed';
  end if;
  return new;
end;
$$;

revoke all on function public.keep_task_identity() from public;

create trigger tasks_keep_identity
before update on public.tasks
for each row execute function public.keep_task_identity();

create function public.keep_owner_id()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.owner_id is distinct from old.owner_id then
    raise exception 'owner_id cannot be changed';
  end if;
  return new;
end;
$$;

revoke all on function public.keep_owner_id() from public;

create trigger task_recurrences_keep_owner
before update on public.task_recurrences
for each row execute function public.keep_owner_id();

create trigger task_overrides_keep_owner
before update on public.task_overrides
for each row execute function public.keep_owner_id();

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.task_recurrences enable row level security;
alter table public.task_overrides enable row level security;
alter table public.task_logs enable row level security;
alter table public.weight_logs enable row level security;
alter table public.medication_details enable row level security;
alter table public.medication_logs enable row level security;
alter table public.support_links enable row level security;
alter table public.change_logs enable row level security;

revoke all on table public.profiles, public.tasks, public.task_recurrences, public.task_overrides,
  public.task_logs, public.weight_logs, public.medication_details, public.medication_logs,
  public.support_links, public.change_logs from anon, authenticated;

grant select, insert, update, delete on table public.profiles, public.tasks, public.task_recurrences,
  public.task_overrides, public.task_logs, public.weight_logs, public.medication_details,
  public.medication_logs, public.support_links to authenticated;
grant select, insert on table public.change_logs to authenticated;

create policy profiles_owner_select on public.profiles for select to authenticated using ((select auth.uid()) = owner_id);
create policy profiles_owner_insert on public.profiles for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy profiles_owner_update on public.profiles for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy profiles_owner_delete on public.profiles for delete to authenticated using ((select auth.uid()) = owner_id);

create policy tasks_schedule_select on public.tasks for select to authenticated using (
  (select auth.uid()) = owner_id or exists (
    select 1 from public.support_links sl where sl.owner_id = tasks.owner_id and sl.supporter_id = (select auth.uid())
      and sl.revoked_at is null and sl.accepted_at is not null and sl.can_view_schedule
  )
);
create policy tasks_schedule_insert on public.tasks for insert to authenticated with check (
  ((select auth.uid()) = owner_id and created_by = (select auth.uid())) or
  (created_by = (select auth.uid()) and exists (
    select 1 from public.support_links sl where sl.owner_id = tasks.owner_id and sl.supporter_id = (select auth.uid())
      and sl.revoked_at is null and sl.accepted_at is not null and sl.can_add_schedule
  ))
);
create policy tasks_schedule_update on public.tasks for update to authenticated using (
  (select auth.uid()) = owner_id or exists (
    select 1 from public.support_links sl where sl.owner_id = tasks.owner_id and sl.supporter_id = (select auth.uid())
      and sl.revoked_at is null and sl.accepted_at is not null and sl.can_update_schedule
  )
) with check (
  (select auth.uid()) = owner_id or exists (
    select 1 from public.support_links sl where sl.owner_id = tasks.owner_id and sl.supporter_id = (select auth.uid())
      and sl.revoked_at is null and sl.accepted_at is not null and sl.can_update_schedule
  )
);
create policy tasks_owner_delete on public.tasks for delete to authenticated using ((select auth.uid()) = owner_id);

create policy task_recurrences_schedule_select on public.task_recurrences for select to authenticated using (
  (select auth.uid()) = owner_id or exists (select 1 from public.support_links sl where sl.owner_id = task_recurrences.owner_id and sl.supporter_id = (select auth.uid()) and sl.revoked_at is null and sl.accepted_at is not null and sl.can_view_schedule)
);
create policy task_recurrences_schedule_insert on public.task_recurrences for insert to authenticated with check (
  (select auth.uid()) = owner_id or exists (select 1 from public.support_links sl where sl.owner_id = task_recurrences.owner_id and sl.supporter_id = (select auth.uid()) and sl.revoked_at is null and sl.accepted_at is not null and sl.can_add_schedule)
);
create policy task_recurrences_schedule_update on public.task_recurrences for update to authenticated using (
  (select auth.uid()) = owner_id or exists (select 1 from public.support_links sl where sl.owner_id = task_recurrences.owner_id and sl.supporter_id = (select auth.uid()) and sl.revoked_at is null and sl.accepted_at is not null and sl.can_update_schedule)
) with check (
  (select auth.uid()) = owner_id or exists (select 1 from public.support_links sl where sl.owner_id = task_recurrences.owner_id and sl.supporter_id = (select auth.uid()) and sl.revoked_at is null and sl.accepted_at is not null and sl.can_update_schedule)
);
create policy task_recurrences_owner_delete on public.task_recurrences for delete to authenticated using ((select auth.uid()) = owner_id);

create policy task_overrides_schedule_select on public.task_overrides for select to authenticated using (
  (select auth.uid()) = owner_id or exists (select 1 from public.support_links sl where sl.owner_id = task_overrides.owner_id and sl.supporter_id = (select auth.uid()) and sl.revoked_at is null and sl.accepted_at is not null and sl.can_view_schedule)
);
create policy task_overrides_schedule_insert on public.task_overrides for insert to authenticated with check (
  (select auth.uid()) = owner_id or exists (select 1 from public.support_links sl where sl.owner_id = task_overrides.owner_id and sl.supporter_id = (select auth.uid()) and sl.revoked_at is null and sl.accepted_at is not null and sl.can_add_schedule)
);
create policy task_overrides_schedule_update on public.task_overrides for update to authenticated using (
  (select auth.uid()) = owner_id or exists (select 1 from public.support_links sl where sl.owner_id = task_overrides.owner_id and sl.supporter_id = (select auth.uid()) and sl.revoked_at is null and sl.accepted_at is not null and sl.can_update_schedule)
) with check (
  (select auth.uid()) = owner_id or exists (select 1 from public.support_links sl where sl.owner_id = task_overrides.owner_id and sl.supporter_id = (select auth.uid()) and sl.revoked_at is null and sl.accepted_at is not null and sl.can_update_schedule)
);
create policy task_overrides_owner_delete on public.task_overrides for delete to authenticated using ((select auth.uid()) = owner_id);

create policy task_logs_owner_select on public.task_logs for select to authenticated using ((select auth.uid()) = owner_id);
create policy task_logs_owner_insert on public.task_logs for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy task_logs_owner_update on public.task_logs for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy task_logs_owner_delete on public.task_logs for delete to authenticated using ((select auth.uid()) = owner_id);

create policy weight_logs_owner_select on public.weight_logs for select to authenticated using ((select auth.uid()) = owner_id);
create policy weight_logs_owner_insert on public.weight_logs for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy weight_logs_owner_update on public.weight_logs for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy weight_logs_owner_delete on public.weight_logs for delete to authenticated using ((select auth.uid()) = owner_id);

create policy medication_details_owner_select on public.medication_details for select to authenticated using ((select auth.uid()) = owner_id);
create policy medication_details_owner_insert on public.medication_details for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy medication_details_owner_update on public.medication_details for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy medication_details_owner_delete on public.medication_details for delete to authenticated using ((select auth.uid()) = owner_id);

create policy medication_logs_owner_select on public.medication_logs for select to authenticated using ((select auth.uid()) = owner_id);
create policy medication_logs_owner_insert on public.medication_logs for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy medication_logs_owner_update on public.medication_logs for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy medication_logs_owner_delete on public.medication_logs for delete to authenticated using ((select auth.uid()) = owner_id);

create policy support_links_participant_select on public.support_links for select to authenticated using ((select auth.uid()) in (owner_id, supporter_id));
create policy support_links_owner_insert on public.support_links for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy support_links_owner_update on public.support_links for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy support_links_owner_delete on public.support_links for delete to authenticated using ((select auth.uid()) = owner_id);

create policy change_logs_participant_select on public.change_logs for select to authenticated using (
  (select auth.uid()) = owner_id or exists (select 1 from public.support_links sl where sl.owner_id = change_logs.owner_id and sl.supporter_id = (select auth.uid()) and sl.revoked_at is null and sl.accepted_at is not null)
);
create policy change_logs_actor_insert on public.change_logs for insert to authenticated with check (
  actor_id = (select auth.uid()) and (
    owner_id = (select auth.uid()) or exists (select 1 from public.support_links sl where sl.owner_id = change_logs.owner_id and sl.supporter_id = (select auth.uid()) and sl.revoked_at is null and sl.accepted_at is not null)
  )
);

insert into storage.buckets (id, name, public)
values ('medication-photos', 'medication-photos', false)
on conflict (id) do update set public = false;

create policy medication_photos_owner_select on storage.objects for select to authenticated using (
  bucket_id = 'medication-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (select 1 from public.tasks t where t.owner_id = (select auth.uid()) and t.id::text = (storage.foldername(name))[2])
);
create policy medication_photos_owner_insert on storage.objects for insert to authenticated with check (
  bucket_id = 'medication-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (storage.foldername(name))[2] is not null
  and exists (select 1 from public.tasks t where t.owner_id = (select auth.uid()) and t.id::text = (storage.foldername(name))[2])
);
create policy medication_photos_owner_update on storage.objects for update to authenticated using (
  bucket_id = 'medication-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
) with check (
  bucket_id = 'medication-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (select 1 from public.tasks t where t.owner_id = (select auth.uid()) and t.id::text = (storage.foldername(name))[2])
);
create policy medication_photos_owner_delete on storage.objects for delete to authenticated using (
  bucket_id = 'medication-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
);
