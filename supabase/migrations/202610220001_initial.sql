-- SIT schema v1.0. PostgreSQL / Supabase. Apply in a fresh SIT project.
create extension if not exists pgcrypto;

create type public.app_role as enum ('admin', 'user');
create type public.page_status as enum ('draft', 'published', 'archived');
create type public.event_type as enum ('page_view', 'link_click');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default '',
  role public.app_role not null default 'user',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  slug text not null unique,
  title text not null check (length(trim(title)) between 1 and 120),
  description text not null default '' check (length(description) <= 500),
  avatar_path text,
  status public.page_status not null default 'draft',
  admin_disabled boolean not null default false,
  theme_config jsonb not null default '{}'::jsonb,
  social_links jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint pages_slug_format check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$'),
  constraint pages_slug_reserved check (slug not in (
    'admin','api','auth','dashboard','login','logout','settings','signup',
    'register','favicon','robots','sitemap','_next','public','static',
    'manifest','opengraph-image','icon','apple-icon','not-found'
  )),
  constraint pages_theme_object check (jsonb_typeof(theme_config) = 'object'),
  constraint pages_social_array check (jsonb_typeof(social_links) = 'array')
);

create table public.links (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  title text not null check (length(trim(title)) between 1 and 120),
  url text not null check (length(url) <= 2048 and url ~* '^https?://'),
  icon text,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  link_id uuid references public.links(id) on delete set null,
  event_type public.event_type not null,
  created_at timestamptz not null default now(),
  constraint analytics_click_has_link check (event_type <> 'link_click' or link_id is not null)
);

create index pages_owner_idx on public.pages(owner_id);
create index pages_public_idx on public.pages(slug) where status = 'published' and admin_disabled = false;
create index links_page_order_idx on public.links(page_id, sort_order, id);
create index analytics_page_time_idx on public.analytics_events(page_id, created_at desc);
create index analytics_link_time_idx on public.analytics_events(link_id, created_at desc);

create function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger pages_updated before update on public.pages for each row execute function public.set_updated_at();
create trigger links_updated before update on public.links for each row execute function public.set_updated_at();

-- Admin checks read directly from the database (not stale JWT metadata).
-- search_path empty reduces search-path injection in SECURITY DEFINER functions.
create function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin' and p.is_active = true);
$$;
create function public.is_active_user() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.is_active = true);
$$;
revoke all on function public.is_admin() from public;
revoke all on function public.is_active_user() from public;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_active_user() to authenticated;

-- Profiles are provisioned by a server-only Admin API using the service role.
-- No client may insert/delete profiles, change role, or modify is_active.
alter table public.profiles enable row level security;
alter table public.pages enable row level security;
alter table public.links enable row level security;
alter table public.analytics_events enable row level security;

revoke all on public.profiles, public.pages, public.links, public.analytics_events from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
grant select, insert, delete on public.pages to authenticated;
grant update (slug, title, description, avatar_path, status, theme_config, social_links, published_at) on public.pages to authenticated;
grant select, insert, update, delete on public.links to authenticated;
-- Analytics: never directly accessible to anon/authenticated; service-only aggregation.

create policy profiles_read on public.profiles for select to authenticated
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy profiles_update_name on public.profiles for update to authenticated
  using (id = (select auth.uid()) and (select public.is_active_user()))
  with check (id = (select auth.uid()) and (select public.is_active_user()));

create policy pages_read on public.pages for select to authenticated
  using (owner_id = (select auth.uid()) or (select public.is_admin()));
create policy pages_insert on public.pages for insert to authenticated
  with check (owner_id = (select auth.uid()) and (select public.is_active_user()) and admin_disabled = false);
create policy pages_update on public.pages for update to authenticated
  using ((owner_id = (select auth.uid()) and (select public.is_active_user()) and admin_disabled = false) or (select public.is_admin()))
  with check ((owner_id = (select auth.uid()) and (select public.is_active_user()) and admin_disabled = false) or (select public.is_admin()));
create policy pages_delete on public.pages for delete to authenticated
  using ((owner_id = (select auth.uid()) and (select public.is_active_user()) and admin_disabled = false) or (select public.is_admin()));

create policy links_read on public.links for select to authenticated
  using (exists (select 1 from public.pages p where p.id = page_id
    and (p.owner_id = (select auth.uid()) or (select public.is_admin()))));
create policy links_insert on public.links for insert to authenticated
  with check (exists (select 1 from public.pages p where p.id = page_id
    and p.owner_id = (select auth.uid()) and p.admin_disabled = false and (select public.is_active_user())));
create policy links_update on public.links for update to authenticated
  using (exists (select 1 from public.pages p where p.id = page_id
    and p.owner_id = (select auth.uid()) and p.admin_disabled = false and (select public.is_active_user())))
  with check (exists (select 1 from public.pages p where p.id = page_id
    and p.owner_id = (select auth.uid()) and p.admin_disabled = false and (select public.is_active_user())));
create policy links_delete on public.links for delete to authenticated
  using (exists (select 1 from public.pages p where p.id = page_id
    and p.owner_id = (select auth.uid()) and p.admin_disabled = false and (select public.is_active_user())));

-- Analytics_events: no policies intentionally (service-role only).
-- Admin disable/enable must use a server-only privileged client, since the
-- admin_disabled column is not granted for user-scoped updates.
-- For strict invite-only access: disable public signups in Supabase Auth settings.
-- Explicitly check that ADMIN-created accounts have profiles and active status.

-- Guard against events whose link belongs to a different page.
create function public.validate_analytics_event() returns trigger
language plpgsql set search_path = '' as $$
begin
 if new.event_type = 'page_view' and new.link_id is not null then
   raise exception 'page_view must not carry link_id';
 end if;
 if new.event_type = 'link_click' and not exists (
   select 1 from public.links l where l.id = new.link_id and l.page_id = new.page_id
 ) then
   raise exception 'link_id does not belong to page_id';
 end if;
 return new;
end;
$$;
create trigger analytics_validate before insert or update on public.analytics_events
for each row execute function public.validate_analytics_event();
