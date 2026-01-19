-- Insert HiStock source
insert into public.scraper_sources (source_name, source_url, method, target_rules)
values (
  'HiStock 嗨投資 - 股東會紀念品', 
  'https://histock.tw/stock/gift.aspx', 
  'GET',
  '{"selector": ".stock-gift table tr"}'::jsonb
)
on conflict do nothing;
