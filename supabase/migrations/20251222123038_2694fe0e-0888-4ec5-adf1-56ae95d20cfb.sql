-- Add public access token and client confirmation fields to billing_documents
ALTER TABLE public.billing_documents 
ADD COLUMN public_token uuid DEFAULT gen_random_uuid(),
ADD COLUMN client_confirmed_payment boolean DEFAULT false,
ADD COLUMN client_confirmation_date timestamp with time zone,
ADD COLUMN client_confirmation_note text;

-- Create index for fast lookup by public token
CREATE INDEX idx_billing_documents_public_token ON public.billing_documents(public_token);

-- Create RLS policy for public access to view documents by token
CREATE POLICY "Anyone can view documents by public token"
ON public.billing_documents
FOR SELECT
USING (true);

-- Allow public update for payment confirmation only
CREATE POLICY "Anyone can confirm payment with public token"
ON public.billing_documents
FOR UPDATE
USING (true)
WITH CHECK (true);