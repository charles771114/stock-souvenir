-- Add foreign key constraint from user_inventory.stock_code to souvenirs.code
-- FK Removed: souvenirs.code is not unique (historical data), so standard FK cannot be applied.
-- We rely on application logic and indexes for joins.

-- Create index for better join performance
CREATE INDEX IF NOT EXISTS idx_user_inventory_stock_code 
  ON public.user_inventory(stock_code);

COMMIT;
