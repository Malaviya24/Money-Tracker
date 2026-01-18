-- Add archived column to spaces table
ALTER TABLE public.spaces ADD COLUMN archived boolean NOT NULL DEFAULT false;

-- Create index for faster filtering
CREATE INDEX idx_spaces_archived ON public.spaces(archived);