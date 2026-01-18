-- Add archived_at timestamp column to track when a space was archived
ALTER TABLE public.spaces 
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Update existing archived spaces to have an archived_at timestamp
UPDATE public.spaces 
SET archived_at = updated_at 
WHERE archived = true AND archived_at IS NULL;