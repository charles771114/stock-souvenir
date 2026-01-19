-- Create the storage bucket for stock data
insert into storage.buckets (id, name, public)
values ('stock-data', 'stock-data', true)
on conflict (id) do nothing;

-- Set up RLS for the storage bucket
-- Allow public read access to stock-data
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'stock-data' );

-- Allow authenticated users (e.g. scripts/functions with service role or admin users) to upload
-- For simplicity in this demo, we can allow Service Role (which bypasses RLS) or strict admin policies.
-- Here we allow insert if the user is authenticated (adjust as needed for security)
create policy "Authenticated users can upload"
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'stock-data' );
