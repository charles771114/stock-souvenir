-- Migration: Backfill classification for existing souvenirs
-- Description: Iterates through categories and updates unclassified souvenirs based on keywords.

do $$
declare
  cat record;
  kw text;
  count_updated int;
begin
  -- Loop through all categories
  for cat in select * from public.souvenir_categories loop
    if cat.keywords is not null then
      -- Loop through each keyword in the category
      foreach kw in array cat.keywords loop
        
        -- Update souvenirs that match the keyword and are currently unclassified
        update public.souvenirs
        set 
          category_id = cat.id,
          classification_status = 'system_matched'
        where 
          souvenir_item ilike '%' || kw || '%'  -- Case-insensitive match
          and (classification_status = 'unclassified' or classification_status is null)
          and category_id is null;  -- Avoid re-classifying if already set
          
      end loop;
    end if;
  end loop;
end $$;
