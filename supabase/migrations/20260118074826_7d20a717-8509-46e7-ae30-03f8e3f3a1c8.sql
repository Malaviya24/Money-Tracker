-- Add 2FA preference column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN two_factor_enabled boolean NOT NULL DEFAULT false;