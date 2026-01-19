-- Seed data for testing Supabase setup
-- This file contains sample data for development and testing

-- Insert sample souvenirs
INSERT INTO public.souvenirs (
  doc_id,
  code,
  name,
  price,
  last_buy_date,
  meeting_date,
  meeting_type,
  location,
  souvenir_item,
  odd_lot,
  source_url,
  data_hash,
  status
) VALUES
  (
    '2330_2025-06-15',
    '2330',
    '台積電',
    950.00,
    '2025-06-01',
    '2025-06-15',
    '股東常會',
    '新竹科學園區',
    '環保購物袋',
    true,
    'https://mops.twse.com.tw',
    'sample_hash_1',
    'active'
  ),
  (
    '2317_2025-05-20',
    '2317',
    '鴻海',
    105.50,
    '2025-05-10',
    '2025-05-20',
    '股東常會',
    '台北市',
    '無線充電盤',
    true,
    'https://mops.twse.com.tw',
    'sample_hash_2',
    'active'
  ),
  (
    '2454_2025-06-10',
    '2454',
    '聯發科',
    1200.00,
    '2025-05-25',
    '2025-06-10',
    '股東常會',
    '新竹科學園區',
    '藍牙耳機',
    false,
    'https://mops.twse.com.tw',
    'sample_hash_3',
    'active'
  ),
  (
    '2412_2025-06-08',
    '2412',
    '中華電',
    120.00,
    '2025-05-28',
    '2025-06-08',
    '股東常會',
    '台北市',
    '行動電源',
    true,
    'https://mops.twse.com.tw',
    'sample_hash_4',
    'active'
  ),
  (
    '2882_2025-06-25',
    '2882',
    '國泰金',
    65.50,
    '2025-06-15',
    '2025-06-25',
    '股東常會',
    '台北市',
    '保溫杯',
    true,
    'https://mops.twse.com.tw',
    'sample_hash_5',
    'active'
  )
ON CONFLICT (doc_id) DO NOTHING;

-- Note: User profiles and collections will be created automatically
-- when users sign up and interact with the app

-- Display inserted data
SELECT 
  code,
  name,
  souvenir_item,
  meeting_date,
  odd_lot
FROM public.souvenirs
ORDER BY meeting_date DESC;

-- Show table counts
SELECT 
  'souvenirs' as table_name,
  COUNT(*) as row_count
FROM public.souvenirs
UNION ALL
SELECT 
  'profiles' as table_name,
  COUNT(*) as row_count
FROM public.profiles
UNION ALL
SELECT 
  'user_collections' as table_name,
  COUNT(*) as row_count
FROM public.user_collections;
