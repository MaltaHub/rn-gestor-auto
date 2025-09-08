-- Add cover photo functionality to vehicle listings
-- This allows one photo to be set as cover for the showcase

-- Add cover photo tracking in vehicles table  
ALTER TABLE public.veiculos_loja 
ADD COLUMN IF NOT EXISTS foto_capa TEXT;

-- Create photos metadata table to track order and other metadata
CREATE TABLE IF NOT EXISTS public.veiculos_fotos_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  veiculo_loja_id uuid REFERENCES public.veiculos_loja(id) ON DELETE CASCADE,
  foto_nome text NOT NULL,
  ordem integer DEFAULT 0,
  is_capa boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(veiculo_loja_id, foto_nome)
);

-- Enable RLS for the new table
ALTER TABLE public.veiculos_fotos_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies for the metadata table
CREATE POLICY "Users can view photos metadata of their tenant vehicles"
ON public.veiculos_fotos_metadata
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.veiculos_loja vl
    JOIN public.lojas l ON l.id = vl.loja_id
    WHERE vl.id = veiculo_loja_id 
    AND has_tenant_membership(l.tenant_id)
  )
);

CREATE POLICY "Managers can manage photos metadata of their tenant vehicles"
ON public.veiculos_fotos_metadata
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.veiculos_loja vl
    JOIN public.lojas l ON l.id = vl.loja_id
    WHERE vl.id = veiculo_loja_id 
    AND (has_tenant_role(l.tenant_id, 'owner'::tenant_role) 
         OR has_tenant_role(l.tenant_id, 'admin'::tenant_role) 
         OR has_tenant_role(l.tenant_id, 'manager'::tenant_role))
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.veiculos_loja vl
    JOIN public.lojas l ON l.id = vl.loja_id
    WHERE vl.id = veiculo_loja_id 
    AND (has_tenant_role(l.tenant_id, 'owner'::tenant_role) 
         OR has_tenant_role(l.tenant_id, 'admin'::tenant_role) 
         OR has_tenant_role(l.tenant_id, 'manager'::tenant_role))
  )
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_fotos_metadata()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_veiculos_fotos_metadata_updated_at
  BEFORE UPDATE ON public.veiculos_fotos_metadata
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_fotos_metadata();