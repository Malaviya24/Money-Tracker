-- Fix Anonymous Access Policies: Update RLS policies to only allow authenticated users

-- Drop existing policies and recreate with TO authenticated
DROP POLICY IF EXISTS "Users can view own spaces" ON public.spaces;
DROP POLICY IF EXISTS "Users can insert own spaces" ON public.spaces;
DROP POLICY IF EXISTS "Users can update own spaces" ON public.spaces;
DROP POLICY IF EXISTS "Users can delete own spaces" ON public.spaces;

CREATE POLICY "Users can view own spaces" ON public.spaces
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spaces" ON public.spaces
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spaces" ON public.spaces
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own spaces" ON public.spaces
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Same for expenses
DROP POLICY IF EXISTS "Users can view own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can update own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete own expenses" ON public.expenses;

CREATE POLICY "Users can view own expenses" ON public.expenses
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON public.expenses
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON public.expenses
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON public.expenses
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Same for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON public.profiles
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Same for notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications" ON public.notifications
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON public.notifications
FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- Add database constraints for input validation
ALTER TABLE public.expenses 
ADD CONSTRAINT check_amount_positive CHECK (amount > 0),
ADD CONSTRAINT check_amount_reasonable CHECK (amount < 1000000000),
ADD CONSTRAINT check_description_length CHECK (char_length(description) <= 500);

ALTER TABLE public.spaces
ADD CONSTRAINT check_budget_non_negative CHECK (budget >= 0),
ADD CONSTRAINT check_budget_reasonable CHECK (budget < 1000000000),
ADD CONSTRAINT check_name_length CHECK (char_length(name) <= 100);