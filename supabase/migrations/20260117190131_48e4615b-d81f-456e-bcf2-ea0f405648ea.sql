-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- 'info', 'warning', 'success', 'error'
  read BOOLEAN NOT NULL DEFAULT false,
  space_id UUID REFERENCES public.spaces(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications"
ON public.notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);

-- Function to check budget thresholds and create notifications
CREATE OR REPLACE FUNCTION public.check_budget_threshold()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  space_record RECORD;
  new_spent NUMERIC;
  budget_percentage NUMERIC;
  existing_notification UUID;
BEGIN
  -- Get the space details
  SELECT * INTO space_record FROM public.spaces WHERE id = NEW.space_id;
  
  IF space_record IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Calculate new total spent
  SELECT COALESCE(SUM(amount), 0) INTO new_spent 
  FROM public.expenses 
  WHERE space_id = NEW.space_id;
  
  -- Update the spent amount on the space
  UPDATE public.spaces SET spent = new_spent WHERE id = NEW.space_id;
  
  -- Calculate budget percentage
  IF space_record.budget > 0 THEN
    budget_percentage := (new_spent / space_record.budget) * 100;
    
    -- Check for 80% threshold
    IF budget_percentage >= 80 AND budget_percentage < 100 THEN
      -- Check if notification already exists for this threshold
      SELECT id INTO existing_notification 
      FROM public.notifications 
      WHERE space_id = NEW.space_id 
        AND user_id = NEW.user_id 
        AND title = 'Budget Warning'
        AND created_at > NOW() - INTERVAL '24 hours';
      
      IF existing_notification IS NULL THEN
        INSERT INTO public.notifications (user_id, title, message, type, space_id)
        VALUES (
          NEW.user_id,
          'Budget Warning',
          space_record.name || ' is at ' || ROUND(budget_percentage) || '% of budget',
          'warning',
          NEW.space_id
        );
      END IF;
    END IF;
    
    -- Check for 100% threshold (over budget)
    IF budget_percentage >= 100 THEN
      SELECT id INTO existing_notification 
      FROM public.notifications 
      WHERE space_id = NEW.space_id 
        AND user_id = NEW.user_id 
        AND title = 'Over Budget!'
        AND created_at > NOW() - INTERVAL '24 hours';
      
      IF existing_notification IS NULL THEN
        INSERT INTO public.notifications (user_id, title, message, type, space_id)
        VALUES (
          NEW.user_id,
          'Over Budget!',
          space_record.name || ' has exceeded its budget by ' || ROUND(budget_percentage - 100) || '%',
          'error',
          NEW.space_id
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to check budget on expense insert/update
CREATE TRIGGER check_budget_on_expense
AFTER INSERT OR UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.check_budget_threshold();