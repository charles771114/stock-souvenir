-- Add Goodie (股代網) source
insert into public.scraper_sources (source_name, source_url, method, target_rules)
values (
  '股代網 (GoodID) - 股東會紀念品', 
  'https://www.gooddie.tw/stock/meeting', 
  'GET',
  '{"selector": ".section-meeting .list .card"}'::jsonb
)
on conflict do nothing;
