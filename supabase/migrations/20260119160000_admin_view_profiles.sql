-- Safe Admin Check Function to avoid RLS recursion
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Enable Admin read access to all profiles using the safe function
create policy "Admins can view all profiles"
  on public.profiles for select
  using ( public.is_admin() );
