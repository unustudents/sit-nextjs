-- Seed an initial administrator account for SIT development / testing.
-- Default credentials:
-- Email: admin@email.com
-- Password: password

do $$
declare
  v_admin_id uuid := '00000000-0000-0000-0000-0000000000a0';
begin
  if not exists (select 1 from auth.users where id = v_admin_id) then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000',
      v_admin_id,
      'authenticated',
      'authenticated',
      'admin@email.com',
      crypt('password', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"display_name":"Administrator"}',
      now(),
      now()
    );
  end if;

  insert into public.profiles (id, email, display_name, role, is_active)
  values (v_admin_id, 'admin@email.com', 'Administrator', 'admin', true)
  on conflict (id) do update set
    role = 'admin',
    is_active = true,
    display_name = 'Administrator';
end;
$$;
