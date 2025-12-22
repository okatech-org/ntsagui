-- Add tax_exempt field to billing_clients table
ALTER TABLE public.billing_clients 
ADD COLUMN tax_exempt boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.billing_clients.tax_exempt IS 'If true, TVA is not applied to this client';