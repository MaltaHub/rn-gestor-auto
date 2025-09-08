-- Configure storage bucket as public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'fotos_veiculos_loja';

-- Create RLS policies for storage access
CREATE POLICY "Users can view vehicle photos of their tenant" 
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'fotos_veiculos_loja' 
  AND EXISTS (
    SELECT 1 FROM public.veiculos v 
    WHERE name LIKE 'veiculo_' || v.id::text || '/%'
    AND has_tenant_membership(v.tenant_id)
  )
);

CREATE POLICY "Managers can upload vehicle photos" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'fotos_veiculos_loja' 
  AND EXISTS (
    SELECT 1 FROM public.veiculos v 
    WHERE name LIKE 'veiculo_' || v.id::text || '/%'
    AND (
      has_tenant_role(v.tenant_id, 'owner'::tenant_role) OR 
      has_tenant_role(v.tenant_id, 'admin'::tenant_role) OR 
      has_tenant_role(v.tenant_id, 'manager'::tenant_role)
    )
  )
);

CREATE POLICY "Managers can delete vehicle photos" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'fotos_veiculos_loja' 
  AND EXISTS (
    SELECT 1 FROM public.veiculos v 
    WHERE name LIKE 'veiculo_' || v.id::text || '/%'
    AND (
      has_tenant_role(v.tenant_id, 'owner'::tenant_role) OR 
      has_tenant_role(v.tenant_id, 'admin'::tenant_role) OR 
      has_tenant_role(v.tenant_id, 'manager'::tenant_role)
    )
  )
);