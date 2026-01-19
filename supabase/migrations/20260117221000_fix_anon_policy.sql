-- Update temp policy to be more permissive for anon seeding
-- Drop previous one to be safe (or rely on CREATE OR REPLACE if supported, but POLICY doesn't support REPLACE)

drop policy if exists "Allow anon insert for seeding" on public.souvenirs;

create policy "Allow anon insert for seeding"
  on public.souvenirs for insert
  to anon
  with check (true);

create policy "Allow anon select for seeding"
  on public.souvenirs for select
  to anon
  using (true);
