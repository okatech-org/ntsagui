-- Add RCCM, NIF, and contact_name columns to billing_clients table
-- This enables proper B2B invoicing with legal information

ALTER TABLE public.billing_clients 
ADD COLUMN IF NOT EXISTS rccm TEXT,
ADD COLUMN IF NOT EXISTS nif TEXT,
ADD COLUMN IF NOT EXISTS contact_name TEXT;

-- Add comments to the columns
COMMENT ON COLUMN public.billing_clients.rccm IS 'Registre du Commerce et du Crédit Mobilier (e.g. GA-LBV-01-2024-B17-00045)';
COMMENT ON COLUMN public.billing_clients.nif IS 'Numéro d''Identification Fiscale (e.g. 2024 0101 4129 E)';
COMMENT ON COLUMN public.billing_clients.contact_name IS 'Nom de la personne de contact chez le client';
