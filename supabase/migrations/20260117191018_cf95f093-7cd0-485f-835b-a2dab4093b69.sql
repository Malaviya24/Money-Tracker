-- Update default currency for profiles table to INR
ALTER TABLE public.profiles ALTER COLUMN default_currency SET DEFAULT 'INR';

-- Update default currency for spaces table to INR
ALTER TABLE public.spaces ALTER COLUMN currency SET DEFAULT 'INR';