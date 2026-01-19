-- Insert MOPS source
insert into public.scraper_sources (source_name, source_url, method, target_rules)
values (
  '公開資訊觀測站 (MOPS) - 股東會紀念品', 
  'https://mops.twse.com.tw/mops/web/ajax_t51sb01', 
  'POST',
  '{"form_data": {"encodeURIComponent": "1", "step": "1", "firstin": "1", "off": "1", "TYPEK": "sii"}}'::jsonb
)
on conflict do nothing;
