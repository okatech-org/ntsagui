-- Add status column to leads table for lead management
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'new';

-- Add index for faster status filtering
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);

-- Enable cascade delete for conversations when lead is deleted
ALTER TABLE public.conversations 
DROP CONSTRAINT IF EXISTS conversations_lead_id_fkey;

ALTER TABLE public.conversations 
ADD CONSTRAINT conversations_lead_id_fkey 
FOREIGN KEY (lead_id) 
REFERENCES public.leads(id) 
ON DELETE CASCADE;