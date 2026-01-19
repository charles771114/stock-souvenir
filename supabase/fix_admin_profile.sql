
-- Insert missing profile for the existing user session if not present
INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  'c38adbfb-21d7-44a5-b4ae-0d080cc12989',
  'charles771114@gmail.com',
  'Admin User', 
  'admin'
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin';

-- Verify the update
select * from public.profiles where id = 'c38adbfb-21d7-44a5-b4ae-0d080cc12989';
