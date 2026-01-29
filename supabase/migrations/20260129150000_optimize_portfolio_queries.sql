-- Optimize lookups by portfolio_id for collections and inventory
CREATE INDEX IF NOT EXISTS idx_user_collections_portfolio_id ON public.user_collections(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_portfolio_id ON public.user_inventory(portfolio_id);

-- Optional: Index for user_id on portfolios to speed up user-specific portfolio fetching
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON public.portfolios(user_id);

-- Add comments for documentation
COMMENT ON INDEX idx_user_collections_portfolio_id IS 'Speeds up filtering user collections by specific portfolio or combined user view.';
COMMENT ON INDEX idx_user_inventory_portfolio_id IS 'Speeds up filtering user inventory by specific portfolio or combined user view.';
