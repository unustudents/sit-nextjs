begin;

create extension if not exists pgtap with schema extensions;

select plan(47);

-- Fixtures. IDs: admin a0, user A a1, user B b1, inactive user D d1.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a0', 'admin@example.test'),
  ('00000000-0000-0000-0000-0000000000a1', 'a@example.test'),
  ('00000000-0000-0000-0000-0000000000b1', 'b@example.test'),
  ('00000000-0000-0000-0000-0000000000d1', 'd@example.test');

insert into public.profiles (id, email, display_name, role, is_active) values
  ('00000000-0000-0000-0000-0000000000a0', 'admin@example.test', 'Admin', 'admin', true),
  ('00000000-0000-0000-0000-0000000000a1', 'a@example.test', 'A', 'user', true),
  ('00000000-0000-0000-0000-0000000000b1', 'b@example.test', 'B', 'user', true),
  ('00000000-0000-0000-0000-0000000000d1', 'd@example.test', 'D', 'user', false);

insert into public.pages (owner_id, slug, title, status, admin_disabled) values
  ('00000000-0000-0000-0000-0000000000a1', 'a-one', 'A One', 'published', false),
  ('00000000-0000-0000-0000-0000000000a1', 'a-two', 'A Two', 'draft', false),
  ('00000000-0000-0000-0000-0000000000a1', 'a-blocked', 'A Blocked', 'published', true),
  ('00000000-0000-0000-0000-0000000000b1', 'b-one', 'B One', 'published', false),
  ('00000000-0000-0000-0000-0000000000d1', 'd-one', 'D One', 'draft', false);

insert into public.links (id, page_id, title, url) values
  ('00000000-0000-0000-0000-000000001a01', (select id from public.pages where slug = 'a-one'), 'A link', 'https://a.example.test'),
  ('00000000-0000-0000-0000-000000001b01', (select id from public.pages where slug = 'b-one'), 'B link', 'https://b.example.test');

-- anon: deny by default
set local request.jwt.claims = '{"role":"anon"}';
set local role anon;

select throws_ok($$select 1 from public.pages$$, '42501', null, 'anon cannot read pages');
select throws_ok($$select 1 from public.profiles$$, '42501', null, 'anon cannot read profiles');
select throws_ok($$select 1 from public.links$$, '42501', null, 'anon cannot read links');
select throws_ok($$select 1 from public.analytics_events$$, '42501', null, 'anon cannot read analytics_events');
select throws_ok($$select public.is_admin()$$, '42501', null, 'anon cannot execute is_admin');

reset role;

-- user A: owner isolation
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a1","role":"authenticated"}';
set local role authenticated;

select is((select count(*) from public.pages)::int, 3, 'A sees only own pages');
select is_empty($$select 1 from public.pages where slug = 'b-one'$$, 'A cannot see B page');
select is((select count(*) from public.profiles)::int, 1, 'A sees only own profile');
select is((select count(*) from public.links)::int, 1, 'A sees only links of own pages');

select lives_ok(
  $$insert into public.pages (owner_id, slug, title) values ('00000000-0000-0000-0000-0000000000a1', 'a-three', 'A Three')$$,
  'A can create a page for self');
select throws_ok(
  $$insert into public.pages (owner_id, slug, title) values ('00000000-0000-0000-0000-0000000000b1', 'a-spoof', 'Spoof')$$,
  '42501', null, 'A cannot create a page owned by B');
select throws_ok(
  $$insert into public.pages (owner_id, slug, title, admin_disabled) values ('00000000-0000-0000-0000-0000000000a1', 'a-nodisable', 'X', true)$$,
  '42501', null, 'A cannot create a page with admin_disabled = true');
select throws_ok(
  $$insert into public.pages (owner_id, slug, title) values ('00000000-0000-0000-0000-0000000000a1', 'admin', 'X')$$,
  '23514', null, 'reserved slug is rejected');
select throws_ok(
  $$insert into public.pages (owner_id, slug, title) values ('00000000-0000-0000-0000-0000000000a1', 'Bad_Slug', 'X')$$,
  '23514', null, 'malformed slug is rejected');
select throws_ok(
  $$insert into public.pages (owner_id, slug, title) values ('00000000-0000-0000-0000-0000000000a1', 'b-one', 'X')$$,
  '23505', null, 'slug is globally unique');

select lives_ok($$update public.pages set title = 'Hijacked' where slug = 'b-one'$$, 'A update on B page runs');
select lives_ok($$delete from public.pages where slug = 'b-one'$$, 'A delete on B page runs');
select lives_ok($$update public.pages set title = 'Hijacked' where slug = 'a-blocked'$$, 'A update on admin-disabled page runs');

select throws_ok($$update public.pages set owner_id = '00000000-0000-0000-0000-0000000000b1' where slug = 'a-one'$$,
  '42501', null, 'A cannot change owner_id');
select throws_ok($$update public.pages set admin_disabled = false where slug = 'a-blocked'$$,
  '42501', null, 'A cannot change admin_disabled');
select throws_ok($$update public.profiles set role = 'admin' where id = '00000000-0000-0000-0000-0000000000a1'$$,
  '42501', null, 'A cannot change own role');
select throws_ok($$update public.profiles set is_active = true where id = '00000000-0000-0000-0000-0000000000a1'$$,
  '42501', null, 'A cannot change is_active');

select lives_ok($$update public.profiles set display_name = 'A Renamed' where id = '00000000-0000-0000-0000-0000000000a1'$$,
  'A can rename self');
select throws_ok(
  $$insert into public.links (page_id, title, url) values ((select id from public.pages where slug = 'b-one'), 'x', 'https://x.example.test')$$,
  '42501', null, 'A cannot add a link to B page');
select throws_ok($$select 1 from public.analytics_events$$, '42501', null, 'A cannot read analytics_events');
select lives_ok(
  $$insert into public.links (page_id, title, url) values ((select id from public.pages where slug = 'a-one'), 'Second', 'https://a2.example.test')$$,
  'A can add a link to own page');

reset role;

select is((select title from public.pages where slug = 'b-one'), 'B One', 'B page was neither edited nor deleted by A');
select is((select title from public.pages where slug = 'a-blocked'), 'A Blocked', 'admin-disabled page is frozen for its owner');
select is((select role::text from public.profiles where id = '00000000-0000-0000-0000-0000000000a1'), 'user', 'A role is unchanged');
select is((select display_name from public.profiles where id = '00000000-0000-0000-0000-0000000000a1'), 'A Renamed', 'A rename was persisted');

-- inactive user D: JWT still valid, writes denied
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000d1","role":"authenticated"}';
set local role authenticated;

select throws_ok(
  $$insert into public.pages (owner_id, slug, title) values ('00000000-0000-0000-0000-0000000000d1', 'd-two', 'D Two')$$,
  '42501', null, 'inactive user cannot create pages');
select lives_ok($$update public.pages set title = 'D Edited' where slug = 'd-one'$$, 'inactive user update runs');

reset role;

select is((select title from public.pages where slug = 'd-one'), 'D One', 'inactive user update changed nothing');

-- admin: read all, edit content, but not admin_disabled or analytics via user client
set local request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000000a0","role":"authenticated"}';
set local role authenticated;

select is((select count(*) from public.pages where slug in ('a-one', 'a-two', 'a-blocked', 'b-one', 'd-one'))::int, 5, 'admin sees all pages');
select is((select count(*) from public.profiles where id in (
  '00000000-0000-0000-0000-0000000000a0', '00000000-0000-0000-0000-0000000000a1',
  '00000000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-0000000000d1'))::int, 4, 'admin sees all profiles');
select is((select count(*) from public.links where id in (
  '00000000-0000-0000-0000-000000001a01', '00000000-0000-0000-0000-000000001b01'))::int, 2, 'admin sees links of all pages');
select lives_ok($$update public.pages set title = 'Admin Edited' where slug = 'b-one'$$, 'admin can edit another user page');
select throws_ok($$update public.pages set admin_disabled = true where slug = 'b-one'$$,
  '42501', null, 'admin_disabled needs the privileged server client');
select throws_ok($$select 1 from public.analytics_events$$, '42501', null, 'admin cannot read analytics_events via user client');

reset role;

select is((select title from public.pages where slug = 'b-one'), 'Admin Edited', 'admin edit was persisted');

-- analytics trigger (privileged path)
select lives_ok(
  $$insert into public.analytics_events (page_id, link_id, event_type) values ((select id from public.pages where slug = 'a-one'), '00000000-0000-0000-0000-000000001a01', 'link_click')$$,
  'click on a link of the same page is accepted');
select throws_ok(
  $$insert into public.analytics_events (page_id, link_id, event_type) values ((select id from public.pages where slug = 'a-one'), '00000000-0000-0000-0000-000000001b01', 'link_click')$$,
  'P0001', 'link_id does not belong to page_id', 'click on a link of another page is rejected');
select throws_ok(
  $$insert into public.analytics_events (page_id, link_id, event_type) values ((select id from public.pages where slug = 'a-one'), '00000000-0000-0000-0000-000000001a01', 'page_view')$$,
  'P0001', 'page_view must not carry link_id', 'page_view with link_id is rejected');
select lives_ok(
  $$insert into public.analytics_events (page_id, event_type) values ((select id from public.pages where slug = 'a-one'), 'page_view')$$,
  'plain page_view is accepted');

-- schema level guarantees
select ok(not has_function_privilege('authenticated', 'public.validate_analytics_event()', 'execute'),
  'trigger function validate_analytics_event is not callable by authenticated');
select ok(not has_function_privilege('authenticated', 'public.set_updated_at()', 'execute'),
  'trigger function set_updated_at is not callable by authenticated');
select ok((select bool_and(c.relrowsecurity) from pg_class c
  where c.oid = any (array['public.profiles'::regclass, 'public.pages'::regclass,
                           'public.links'::regclass, 'public.analytics_events'::regclass])),
  'RLS is enabled on every table');

select * from finish();

rollback;
