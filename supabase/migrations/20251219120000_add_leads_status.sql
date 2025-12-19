-- Add status column to leads table for lead qualification workflow
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'new' 
CHECK (status IN ('new', 'contacted', 'qualified', 'converted'));

-- Add index for filtering by status
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);

COMMENT ON COLUMN public.leads.status IS 'Lead qualification status: new, contacted, qualified, converted';
