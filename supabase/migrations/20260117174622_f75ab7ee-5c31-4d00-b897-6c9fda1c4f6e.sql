-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  default_currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create spaces table
CREATE TABLE public.spaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  budget NUMERIC NOT NULL DEFAULT 0,
  spent NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  icon TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  space_id UUID NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" 
  ON public.profiles FOR DELETE 
  USING (auth.uid() = user_id);

-- Spaces RLS policies
CREATE POLICY "Users can view own spaces" 
  ON public.spaces FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own spaces" 
  ON public.spaces FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own spaces" 
  ON public.spaces FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own spaces" 
  ON public.spaces FOR DELETE 
  USING (auth.uid() = user_id);

-- Expenses RLS policies
CREATE POLICY "Users can view own expenses" 
  ON public.expenses FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" 
  ON public.expenses FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" 
  ON public.expenses FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" 
  ON public.expenses FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_spaces_updated_at
  BEFORE UPDATE ON public.spaces
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();