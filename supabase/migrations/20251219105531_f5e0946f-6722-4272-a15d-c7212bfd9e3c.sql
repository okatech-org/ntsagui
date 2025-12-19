-- Create billing_clients table
CREATE TABLE public.billing_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Gabon',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create billing_products table
CREATE TABLE public.billing_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'service' CHECK (type IN ('product', 'service')),
  description TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'unité',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create billing_documents table
CREATE TABLE public.billing_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('devis', 'commande', 'facture')),
  number TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  client_id UUID REFERENCES public.billing_clients(id) ON DELETE RESTRICT,
  client_name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  validity_days INTEGER DEFAULT 30,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.billing_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_documents ENABLE ROW LEVEL SECURITY;

-- RLS policies for billing_clients (admin only)
CREATE POLICY "Admins can view all billing clients" 
ON public.billing_clients FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert billing clients" 
ON public.billing_clients FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update billing clients" 
ON public.billing_clients FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete billing clients" 
ON public.billing_clients FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for billing_products (admin only)
CREATE POLICY "Admins can view all billing products" 
ON public.billing_products FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert billing products" 
ON public.billing_products FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update billing products" 
ON public.billing_products FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete billing products" 
ON public.billing_products FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for billing_documents (admin only)
CREATE POLICY "Admins can view all billing documents" 
ON public.billing_documents FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert billing documents" 
ON public.billing_documents FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update billing documents" 
ON public.billing_documents FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete billing documents" 
ON public.billing_documents FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add triggers for updated_at
CREATE TRIGGER update_billing_clients_updated_at
BEFORE UPDATE ON public.billing_clients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_billing_products_updated_at
BEFORE UPDATE ON public.billing_products
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_billing_documents_updated_at
BEFORE UPDATE ON public.billing_documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();