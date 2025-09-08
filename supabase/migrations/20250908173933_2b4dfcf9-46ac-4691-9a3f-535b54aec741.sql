-- 1) Permitir SELECT de veiculos para todos os membros do tenant
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'veiculos' 
      AND policyname = 'Users can view all vehicles of their tenant'
  ) THEN
    CREATE POLICY "Users can view all vehicles of their tenant"
    ON public.veiculos
    FOR SELECT
    USING (has_tenant_membership(tenant_id));
  END IF;
END$$;

-- 2) Função on-demand que substitui a view view_pariedade_veiculos por tenant
CREATE OR REPLACE FUNCTION public.get_pariedade_veiculos(p_tenant_id uuid)
RETURNS TABLE (
  veiculo_id uuid,
  repetido_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_tenant_membership(p_tenant_id) THEN
    RAISE EXCEPTION 'Access denied to this tenant';
  END IF;

  RETURN QUERY
  SELECT v.id AS veiculo_id, v.repetido_id
  FROM public.veiculos v
  WHERE v.tenant_id = p_tenant_id
    AND v.repetido_id IS NOT NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_pariedade_veiculos(uuid) TO authenticated;