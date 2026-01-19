-- Allow anonymous inserts for seeding data (TEMPORARY DEV POLICY)
-- WARNING: This allows ANYONE to insert into the souvenirs table.
-- Should be disabled in production or replaced with SERVICE_ROLE_KEY usage.

create policy "Allow anon insert for seeding"
  on public.souvenirs for insert
  with check (true);
