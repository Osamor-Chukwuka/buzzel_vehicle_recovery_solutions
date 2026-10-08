-- Buzzel Vehicle Recovery Solutions - initial MVP schema
-- Generated for Supabase Postgres 17. All public tables use RLS.

create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;

create type public.app_role as enum ('customer', 'team', 'admin', 'super_admin');
create type public.account_type as enum ('individual', 'company');
create type public.vehicle_type as enum ('motorcycle', 'tricycle', 'car_suv', 'bus_van', 'lorry');
create type public.service_type as enum ('roadside_assistance', 'vehicle_recovery');
create type public.request_status as enum (
  'requested', 'awaiting_payment', 'ready_for_assignment', 'assigned', 'en_route', 'arrived',
  'in_progress', 'awaiting_customer_confirmation', 'completed', 'disputed', 'cancelled'
);
create type public.risk_level as enum ('normal', 'high');
create type public.security_source as enum ('system', 'team', 'admin');
create type public.coverage_status as enum ('pending', 'active', 'expired', 'cancelled');
create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
create type public.payment_kind as enum ('annual_coverage', 'one_off_request', 'security_surcharge');
create type public.dispute_status as enum ('open', 'under_review', 'resolved');
create type public.invitation_status as enum ('pending', 'accepted', 'expired', 'revoked');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role public.app_role not null default 'customer',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  account_type public.account_type not null,
  name text not null,
  owner_user_id uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.account_members (
  account_id uuid not null references public.accounts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  is_owner boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (account_id, user_id)
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete restrict,
  registration_number text not null,
  make text,
  model text,
  color text,
  year integer check (year is null or (year >= 1950 and year <= 2100)),
  vehicle_type public.vehicle_type not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (account_id, registration_number)
);

create table public.pricing_rules (
  id uuid primary key default gen_random_uuid(),
  vehicle_type public.vehicle_type not null unique,
  roadside_base_minor bigint not null check (roadside_base_minor >= 0),
  recovery_base_minor bigint not null check (recovery_base_minor >= 0),
  annual_base_minor bigint not null check (annual_base_minor >= 0),
  per_km_minor bigint not null check (per_km_minor >= 0),
  currency text not null default 'NGN',
  active boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.risk_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  center_lat double precision not null,
  center_lng double precision not null,
  radius_km numeric(8,2) not null check (radius_km > 0),
  risk_level public.risk_level not null default 'high',
  security_fee_minor bigint not null default 0 check (security_fee_minor >= 0),
  currency text not null default 'NGN',
  active boolean not null default true,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table public.coverage_policies (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  status public.coverage_status not null default 'pending',
  starts_at timestamptz,
  ends_at timestamptz,
  total_amount_minor bigint not null check (total_amount_minor >= 0),
  currency text not null default 'NGN',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status <> 'active') or (starts_at is not null and ends_at is not null and ends_at > starts_at))
);

create table public.coverage_vehicles (
  policy_id uuid not null references public.coverage_policies(id) on delete cascade,
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  annual_price_minor bigint not null check (annual_price_minor >= 0),
  primary key (policy_id, vehicle_id)
);

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null default ('BUZ-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))) unique,
  account_id uuid not null references public.accounts(id) on delete restrict,
  customer_user_id uuid not null references auth.users(id) on delete restrict,
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  service_type public.service_type not null,
  status public.request_status not null default 'requested',
  breakdown_address text not null,
  breakdown_lat double precision,
  breakdown_lng double precision,
  destination_address text,
  destination_lat double precision,
  destination_lng double precision,
  assistance_details text,
  distance_km numeric(10,2) not null default 0 check (distance_km >= 0),
  risk_level public.risk_level not null default 'normal',
  risk_area_id uuid references public.risk_areas(id) on delete set null,
  security_required boolean not null default false,
  security_source public.security_source,
  security_fee_minor bigint not null default 0 check (security_fee_minor >= 0),
  covered_at_request boolean not null default false,
  coverage_policy_id uuid references public.coverage_policies(id) on delete set null,
  quoted_amount_minor bigint not null default 0 check (quoted_amount_minor >= 0),
  amount_due_minor bigint not null default 0 check (amount_due_minor >= 0),
  currency text not null default 'NGN',
  assigned_team_member_id uuid references auth.users(id) on delete set null,
  team_completed_at timestamptz,
  customer_confirmed_at timestamptz,
  admin_closed_at timestamptz,
  admin_closed_by uuid references auth.users(id) on delete set null,
  admin_close_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (service_type <> 'vehicle_recovery' or destination_address is not null)
);

create table public.request_assignments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  team_member_id uuid not null references auth.users(id) on delete restrict,
  assigned_by uuid not null references auth.users(id) on delete restrict,
  unassigned_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.request_status_history (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.service_requests(id) on delete cascade,
  from_status public.request_status,
  to_status public.request_status not null,
  changed_by uuid references auth.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create table public.request_messages (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.service_requests(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id) on delete restrict,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);

create table public.security_requests (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete restrict,
  reason text,
  status text not null default 'requested' check (status in ('requested', 'approved', 'declined')),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.disputes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  raised_by uuid not null references auth.users(id) on delete restrict,
  reason text not null,
  description text,
  status public.dispute_status not null default 'open',
  resolution_notes text,
  resolved_by uuid references auth.users(id) on delete set null,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete restrict,
  request_id uuid references public.service_requests(id) on delete set null,
  coverage_policy_id uuid references public.coverage_policies(id) on delete set null,
  kind public.payment_kind not null,
  provider text not null default 'paystack',
  provider_reference text unique,
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null default 'NGN',
  status public.payment_status not null default 'pending',
  paid_at timestamptz,
  provider_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (request_id is not null or coverage_policy_id is not null)
);

create table public.team_invitations (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  invited_role public.app_role not null check (invited_role in ('team', 'admin')),
  token_hash text not null unique,
  status public.invitation_status not null default 'pending',
  invited_by uuid not null references auth.users(id) on delete restrict,
  expires_at timestamptz not null,
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.terms_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  declaration_version text not null,
  terms_version text not null,
  privacy_version text not null,
  accepted_at timestamptz not null default now(),
  ip_address inet
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role public.app_role,
  action text not null,
  entity_type text not null,
  entity_id text,
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_account_members_user on public.account_members(user_id);
create index idx_vehicles_account on public.vehicles(account_id);
create index idx_coverage_account_status on public.coverage_policies(account_id, status, starts_at, ends_at);
create index idx_coverage_vehicle on public.coverage_vehicles(vehicle_id, policy_id);
create index idx_requests_account_created on public.service_requests(account_id, created_at desc);
create index idx_requests_customer_created on public.service_requests(customer_user_id, created_at desc);
create index idx_requests_assignee_status on public.service_requests(assigned_team_member_id, status);
create index idx_status_history_request on public.request_status_history(request_id, created_at);
create index idx_messages_request on public.request_messages(request_id, created_at);
create index idx_disputes_request_status on public.disputes(request_id, status);
create index idx_payments_request on public.payments(request_id);
create index idx_payments_coverage on public.payments(coverage_policy_id);
create index idx_audit_entity on public.audit_logs(entity_type, entity_id, created_at desc);
create index idx_accounts_owner on public.accounts(owner_user_id);
create index idx_vehicles_created_by on public.vehicles(created_by);
create index idx_pricing_updated_by on public.pricing_rules(updated_by);
create index idx_risk_updated_by on public.risk_areas(updated_by);
create index idx_coverage_created_by on public.coverage_policies(created_by);
create index idx_requests_vehicle on public.service_requests(vehicle_id);
create index idx_requests_risk_area on public.service_requests(risk_area_id);
create index idx_requests_coverage_policy on public.service_requests(coverage_policy_id);
create index idx_requests_admin_closed_by on public.service_requests(admin_closed_by);
create index idx_assignments_request_active on public.request_assignments(request_id, unassigned_at);
create index idx_assignments_team on public.request_assignments(team_member_id, unassigned_at);
create index idx_assignments_assigned_by on public.request_assignments(assigned_by);
create index idx_status_history_changed_by on public.request_status_history(changed_by);
create index idx_messages_sender on public.request_messages(sender_user_id);
create index idx_security_request on public.security_requests(request_id, status);
create index idx_security_requested_by on public.security_requests(requested_by);
create index idx_security_reviewed_by on public.security_requests(reviewed_by);
create index idx_disputes_raised_by on public.disputes(raised_by);
create index idx_disputes_resolved_by on public.disputes(resolved_by);
create index idx_payments_account on public.payments(account_id, created_at desc);
create index idx_invitations_invited_by on public.team_invitations(invited_by);
create index idx_invitations_accepted_by on public.team_invitations(accepted_by);
create index idx_terms_user on public.terms_acceptances(user_id, accepted_at desc);
create index idx_audit_actor on public.audit_logs(actor_user_id, created_at desc);

-- Internal role helpers. Authorization never trusts user-editable auth metadata.
create or replace function private.current_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role from public.profiles p where p.id = (select auth.uid())
$$;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.current_role() in ('admin'::public.app_role, 'super_admin'::public.app_role), false)
$$;

create or replace function private.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.current_role() = 'super_admin'::public.app_role, false)
$$;

create or replace function private.is_account_member(target_account_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists(
    select 1 from public.account_members m
    where m.account_id = target_account_id and m.user_id = (select auth.uid())
  )
$$;

revoke all on schema private from public, anon;
grant usage on schema private to authenticated;
revoke all on function private.current_role() from public, anon;
revoke all on function private.is_admin() from public, anon;
revoke all on function private.is_super_admin() from public, anon;
revoke all on function private.is_account_member(uuid) from public, anon;
grant execute on function private.current_role() to authenticated;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.is_super_admin() to authenticated;
grant execute on function private.is_account_member(uuid) to authenticated;

-- New-user bootstrap: always creates a customer role. Metadata can shape profile/account data, never authorization.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_account_id uuid;
  requested_type public.account_type;
  account_name text;
  invitation public.team_invitations%rowtype;
  assigned_role public.app_role := 'customer';
  invite_token text;
begin
  invite_token := nullif(new.raw_user_meta_data->>'invite_token', '');
  if invite_token is not null then
    select * into invitation
    from public.team_invitations i
    where i.token_hash = encode(extensions.digest(invite_token, 'sha256'), 'hex')
      and lower(i.email) = lower(new.email)
      and i.status = 'pending'
      and i.expires_at > now()
    limit 1;
    if found then assigned_role := invitation.invited_role; end if;
  end if;

  insert into public.profiles(id, full_name, phone, role)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'phone', assigned_role);

  if assigned_role = 'customer' then
    requested_type := case when new.raw_user_meta_data->>'account_type' = 'company' then 'company'::public.account_type else 'individual'::public.account_type end;
    account_name := case
      when requested_type = 'company' then coalesce(nullif(new.raw_user_meta_data->>'company_name', ''), 'Company Account')
      else coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), split_part(new.email, '@', 1))
    end;

    insert into public.accounts(account_type, name, owner_user_id)
    values (requested_type, account_name, new.id)
    returning id into new_account_id;

    insert into public.account_members(account_id, user_id, is_owner)
    values (new_account_id, new.id, true);
  elsif invitation.id is not null then
    update public.team_invitations
    set status = 'accepted', accepted_by = new.id, accepted_at = now()
    where id = invitation.id;
  end if;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Updated-at helper.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger accounts_updated_at before update on public.accounts for each row execute procedure public.set_updated_at();
create trigger vehicles_updated_at before update on public.vehicles for each row execute procedure public.set_updated_at();
create trigger coverage_updated_at before update on public.coverage_policies for each row execute procedure public.set_updated_at();
create trigger requests_updated_at before update on public.service_requests for each row execute procedure public.set_updated_at();
create trigger disputes_updated_at before update on public.disputes for each row execute procedure public.set_updated_at();
create trigger payments_updated_at before update on public.payments for each row execute procedure public.set_updated_at();

-- RLS + least-privilege grants.
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','accounts','account_members','vehicles','pricing_rules','risk_areas','coverage_policies','coverage_vehicles',
    'service_requests','request_assignments','request_status_history','request_messages','security_requests','disputes',
    'payments','team_invitations','terms_acceptances','audit_logs'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
  end loop;
end $$;

-- Profiles
grant select, update on public.profiles to authenticated;
create policy profiles_select_self_or_admin on public.profiles for select to authenticated
using (id = (select auth.uid()) or (select private.is_admin()));
create policy profiles_update_self on public.profiles for update to authenticated
using (id = (select auth.uid())) with check (id = (select auth.uid()) and role = private.current_role());

-- Accounts and membership
grant select, update on public.accounts to authenticated;
grant select on public.account_members to authenticated;
create policy accounts_select_member_admin on public.accounts for select to authenticated
using ((select private.is_account_member(id)) or (select private.is_admin()));
create policy accounts_update_owner_admin on public.accounts for update to authenticated
using (owner_user_id = (select auth.uid()) or (select private.is_admin()))
with check (owner_user_id = (select auth.uid()) or (select private.is_admin()));
create policy account_members_select_related on public.account_members for select to authenticated
using (user_id = (select auth.uid()) or (select private.is_account_member(account_id)) or (select private.is_admin()));

-- Vehicles
grant select, insert, update on public.vehicles to authenticated;
create policy vehicles_select_member_admin on public.vehicles for select to authenticated
using ((select private.is_account_member(account_id)) or (select private.is_admin()));
create policy vehicles_insert_member_admin on public.vehicles for insert to authenticated
with check (((select private.is_account_member(account_id)) and created_by = (select auth.uid())) or (select private.is_admin()));
create policy vehicles_update_member_admin on public.vehicles for update to authenticated
using ((select private.is_account_member(account_id)) or (select private.is_admin()))
with check ((select private.is_account_member(account_id)) or (select private.is_admin()));

-- Pricing/risk config
grant select on public.pricing_rules, public.risk_areas to authenticated;
create policy pricing_select_authenticated on public.pricing_rules for select to authenticated using (true);
create policy risk_select_authenticated on public.risk_areas for select to authenticated using (true);

-- Coverage
grant select on public.coverage_policies to authenticated;
grant select on public.coverage_vehicles to authenticated;
create policy coverage_select_member_admin on public.coverage_policies for select to authenticated
using ((select private.is_account_member(account_id)) or (select private.is_admin()));
create policy coverage_vehicle_select_related on public.coverage_vehicles for select to authenticated
using (exists(select 1 from public.coverage_policies p where p.id = policy_id and ((select private.is_account_member(p.account_id)) or (select private.is_admin()))));

-- Requests
grant select on public.service_requests to authenticated;
create policy requests_select_participant_admin on public.service_requests for select to authenticated
using (customer_user_id = (select auth.uid()) or assigned_team_member_id = (select auth.uid()) or (select private.is_admin()));

-- Assignment/history
grant select on public.request_assignments, public.request_status_history to authenticated;
create policy assignments_select_related on public.request_assignments for select to authenticated
using (exists(select 1 from public.service_requests r where r.id = request_id and (r.customer_user_id = (select auth.uid()) or r.assigned_team_member_id = (select auth.uid()) or (select private.is_admin()))));
create policy history_select_related on public.request_status_history for select to authenticated
using (exists(select 1 from public.service_requests r where r.id = request_id and (r.customer_user_id = (select auth.uid()) or r.assigned_team_member_id = (select auth.uid()) or (select private.is_admin()))));

-- Chat
grant select, insert on public.request_messages to authenticated;
create policy messages_select_participant_admin on public.request_messages for select to authenticated
using (exists(select 1 from public.service_requests r where r.id = request_id and (r.customer_user_id = (select auth.uid()) or r.assigned_team_member_id = (select auth.uid()) or (select private.is_admin()))));
create policy messages_insert_participant_admin on public.request_messages for insert to authenticated
with check (sender_user_id = (select auth.uid()) and exists(select 1 from public.service_requests r where r.id = request_id and (r.customer_user_id = (select auth.uid()) or r.assigned_team_member_id = (select auth.uid()) or (select private.is_admin()))));

-- Security requests
grant select on public.security_requests to authenticated;
create policy security_select_related on public.security_requests for select to authenticated
using (exists(select 1 from public.service_requests r where r.id = request_id and (r.customer_user_id = (select auth.uid()) or r.assigned_team_member_id = (select auth.uid()) or (select private.is_admin()))));

-- Disputes
grant select on public.disputes to authenticated;
create policy disputes_select_related on public.disputes for select to authenticated
using (exists(select 1 from public.service_requests r where r.id = request_id and (r.customer_user_id = (select auth.uid()) or r.assigned_team_member_id = (select auth.uid()) or (select private.is_admin()))));

-- Payments: clients can read related rows. Creation/mutation is server-secret only.
grant select on public.payments to authenticated;
create policy payments_select_member_admin on public.payments for select to authenticated
using ((select private.is_account_member(account_id)) or (select private.is_admin()));

-- Team invitations
grant select on public.team_invitations to authenticated;
create policy invitations_select_admin on public.team_invitations for select to authenticated using ((select private.is_admin()));

-- Terms
grant select, insert on public.terms_acceptances to authenticated;
create policy terms_select_self_admin on public.terms_acceptances for select to authenticated
using (user_id = (select auth.uid()) or (select private.is_admin()));
create policy terms_insert_self on public.terms_acceptances for insert to authenticated
with check (user_id = (select auth.uid()));

-- Audit logs are server-written and admin-readable.
grant select on public.audit_logs to authenticated;
create policy audit_select_admin on public.audit_logs for select to authenticated using ((select private.is_admin()));

-- Allow sequence-backed table inserts for authenticated clients where policies permit.
grant usage, select on sequence public.request_messages_id_seq to authenticated;

-- Realtime request chat/status history.
do $$ begin
  alter publication supabase_realtime add table public.request_messages;
exception when duplicate_object then null;
end $$;
do $$ begin
  alter publication supabase_realtime add table public.request_status_history;
exception when duplicate_object then null;
end $$;

-- Demo pricing. Values are in kobo (NGN minor units) and are intentionally configurable.
insert into public.pricing_rules(vehicle_type, roadside_base_minor, recovery_base_minor, annual_base_minor, per_km_minor)
values
  ('motorcycle', 1000000, 1500000, 8000000, 30000),
  ('tricycle',   1500000, 2500000, 12000000, 40000),
  ('car_suv',    2000000, 3500000, 18000000, 70000),
  ('bus_van',    3000000, 5000000, 28000000, 100000),
  ('lorry',      5000000, 8500000, 45000000, 160000)
on conflict (vehicle_type) do nothing;

-- Generic demo zones near Abuja. These are synthetic MVP configuration, not claims about real-world crime levels.
insert into public.risk_areas(name, center_lat, center_lng, radius_km, risk_level, security_fee_minor)
values
  ('Demo High Risk Zone A', 9.1125, 7.3845, 2.50, 'high', 2500000),
  ('Demo High Risk Zone B', 8.9780, 7.4950, 2.00, 'high', 2500000);
