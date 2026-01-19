-- 修復缺少 Profile 的用戶資料
-- 這會檢查 auth.users 中存在但在 public.profiles 中缺少的用戶，並補上資料
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'user'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
