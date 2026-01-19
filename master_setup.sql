-- ==================================================================================
-- MASTER SETUP SCRIPT FOR TRACURA (Optimized for Clerk Auth)
-- Run this in the Supabase SQL Editor to set up your database from scratch.
-- ==================================================================================

-- 1. Create Tables (Using TEXT for user_id to match Clerk)
-- ----------------------------------------------------------------------------------

-- Profiles
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE, -- Changed to TEXT for Clerk
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  default_currency TEXT NOT NULL DEFAULT 'INR',
  two_factor_enabled boolean NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Spaces
CREATE TABLE public.spaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Changed to TEXT for Clerk
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  budget NUMERIC NOT NULL DEFAULT 0,
  spent NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  icon TEXT,
  color TEXT,
  archived boolean NOT NULL DEFAULT false,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT check_budget_non_negative CHECK (budget >= 0),
  CONSTRAINT check_budget_reasonable CHECK (budget < 1000000000),
  CONSTRAINT check_name_length CHECK (char_length(name) <= 100)
);

-- Expenses
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Changed to TEXT for Clerk
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT check_amount_positive CHECK (amount > 0),
  CONSTRAINT check_amount_reasonable CHECK (amount < 1000000000),
  CONSTRAINT check_description_length CHECK (char_length(description) <= 500)
);

-- Notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- Changed to TEXT for Clerk
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT false,
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Indexes for Performance
-- ----------------------------------------------------------------------------------
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_spaces_archived ON public.spaces(archived);


-- 3. Automatic Timestamp Updates (Triggers)
-- ----------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_spaces_updated_at BEFORE UPDATE ON public.spaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 4. Budget Logic (Triggers)
-- ----------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_budget_threshold()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  space_record RECORD;
  new_spent NUMERIC;
  budget_percentage NUMERIC;
  existing_notification UUID;
BEGIN
  -- Get the space details
  SELECT * INTO space_record FROM public.spaces WHERE id = NEW.space_id;
  
  IF space_record IS NULL THEN RETURN NEW; END IF;
  
  -- Calculate new total spent
  SELECT COALESCE(SUM(amount), 0) INTO new_spent FROM public.expenses WHERE space_id = NEW.space_id;
  
  -- Update the spent amount on the space
  UPDATE public.spaces SET spent = new_spent WHERE id = NEW.space_id;
  
  -- Calculate budget percentage
  IF space_record.budget > 0 THEN
    budget_percentage := (new_spent / space_record.budget) * 100;
    
    -- Check for 80% threshold
    IF budget_percentage >= 80 AND budget_percentage < 100 THEN
      SELECT id INTO existing_notification FROM public.notifications 
      WHERE space_id = NEW.space_id AND title = 'Budget Warning' AND created_at > NOW() - INTERVAL '24 hours';
      
      IF existing_notification IS NULL THEN
        INSERT INTO public.notifications (user_id, title, message, type, space_id)
        VALUES (NEW.user_id, 'Budget Warning', space_record.name || ' is at ' || ROUND(budget_percentage) || '% of budget', 'warning', NEW.space_id);
      END IF;
    END IF;
    
    -- Check for 100% threshold
    IF budget_percentage >= 100 THEN
      SELECT id INTO existing_notification FROM public.notifications 
      WHERE space_id = NEW.space_id AND title = 'Over Budget!' AND created_at > NOW() - INTERVAL '24 hours';
      
      IF existing_notification IS NULL THEN
        INSERT INTO public.notifications (user_id, title, message, type, space_id)
        VALUES (NEW.user_id, 'Over Budget!', space_record.name || ' has exceeded its budget by ' || ROUND(budget_percentage - 100) || '%', 'error', NEW.space_id);
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER check_budget_on_expense AFTER INSERT OR UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.check_budget_threshold();


-- 5. Storage (Avatars)
-- ----------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Note: Complex storage policies removed for simplicity since RLS is disabled. 
-- Any authenticated user can technically upload/read avatars.
-- If you need strict file protection, you should implement that with your app logic or Supabase Edge Functions.

-- 6. Important: Disable RLS (Since we use Clerk)
-- ----------------------------------------------------------------------------------
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;
