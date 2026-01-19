-- Fix missing profile for charles771114@gmail.com
-- This script ensures the user exists in profiles and has admin role

do $$
declare
  target_email text := 'charles771114@gmail.com';
  user_id uuid;
begin
  -- 1. Find the user ID from auth.users (Supabase internal table)
  select id into user_id from auth.users where email = target_email limit 1;

  if user_id is null then
    raise notice 'User % not found in auth.users. Please sign up first.', target_email;
  else
    -- 2. Upsert into public.profiles
    insert into public.profiles (id, email, role, created_at, updated_at)
    values (user_id, target_email, 'admin', now(), now())
    on conflict (id) do update
    set role = 'admin', updated_at = now();
    
    raise notice 'User % (%s) has been set to admin.', target_email, user_id;
  end if;
end $$;
