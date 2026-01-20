-- 將指定 Email 的用戶升級為 Admin
-- 請將 'your_email@gmail.com' 替換為實際註冊的 Email

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your_email@gmail.com';

-- 驗證是否成功
SELECT * FROM public.profiles WHERE role = 'admin';
