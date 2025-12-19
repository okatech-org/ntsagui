-- Add payment tracking columns to billing_documents
ALTER TABLE public.billing_documents 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue')),
ADD COLUMN IF NOT EXISTS payment_due_date DATE,
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(12,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_date DATE,
ADD COLUMN IF NOT EXISTS source_document_id UUID REFERENCES public.billing_documents(id),
ADD COLUMN IF NOT EXISTS payment_notes TEXT;

-- Create index for faster queries on payment status
CREATE INDEX IF NOT EXISTS idx_billing_documents_payment_status ON public.billing_documents(payment_status);
CREATE INDEX IF NOT EXISTS idx_billing_documents_type ON public.billing_documents(type);