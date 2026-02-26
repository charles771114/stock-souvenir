-- Add allow_keywords column to line_groups table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='line_groups' AND COLUMN_NAME='allow_keywords') THEN
        ALTER TABLE public.line_groups ADD COLUMN allow_keywords BOOLEAN DEFAULT TRUE;
    END IF;
END $$;
