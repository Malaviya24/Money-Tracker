-- Align legacy Supabase-auth schema with Clerk-based app auth.
-- This migration keeps existing data and makes user_id columns Clerk-compatible.

-- Drop RLS policies that depend on auth.uid() UUID checks.
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own spaces" ON public.spaces;
DROP POLICY IF EXISTS "Users can insert own spaces" ON public.spaces;
DROP POLICY IF EXISTS "Users can update own spaces" ON public.spaces;
DROP POLICY IF EXISTS "Users can delete own spaces" ON public.spaces;

DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;

-- Remove legacy FK links to auth.users so Clerk IDs can be stored.
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
ALTER TABLE public.spaces DROP CONSTRAINT IF EXISTS spaces_user_id_fkey;
ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_user_id_fkey;
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;

-- Convert all user_id columns to text for Clerk IDs (e.g., user_2abc...).
ALTER TABLE public.profiles ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE public.spaces ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE public.expenses ALTER COLUMN user_id TYPE TEXT USING user_id::text;
ALTER TABLE public.notifications ALTER COLUMN user_id TYPE TEXT USING user_id::text;

-- App currently handles user-level filtering in queries using Clerk userId.
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
