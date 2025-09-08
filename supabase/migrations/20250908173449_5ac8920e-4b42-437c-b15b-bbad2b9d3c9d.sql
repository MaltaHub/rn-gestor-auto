-- RPC: Veículos ociosos por tenant, calculado sob demanda
CREATE OR REPLACE FUNCTION public.get_veiculos_ociosos(p_tenant_id uuid)
RETURNS TABLE (
  id uuid,
  placa text,
  cor text,
  ano_modelo integer,
  ano_fabricacao integer,
  hodometro numeric,
  preco numeric,
  modelo jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Autorização: qualquer membro do tenant pode consultar
  IF NOT has_tenant_membership(p_tenant_id) THEN
    RAISE EXCEPTION 'Access denied to this tenant';
  END IF;

  RETURN QUERY
  WITH anuncios_tenant AS (
    SELECT a.id, a.veiculo_loja_id, a.repetido_id
    FROM public.anuncios a
    WHERE a.tenant_id = p_tenant_id
      AND a.status IN ('ativo','pausado')
  ),
  veiculos_anunciados_por_loja AS (
    SELECT vl.veiculo_id
    FROM public.veiculos_loja vl
    JOIN anuncios_tenant a ON a.veiculo_loja_id = vl.id
    WHERE vl.tenant_id = p_tenant_id
  ),
  repetidos_anunciados AS (
    SELECT DISTINCT a.repetido_id
    FROM anuncios_tenant a
    WHERE a.repetido_id IS NOT NULL
  ),
  preco_por_veiculo AS (
    SELECT vl.veiculo_id, MIN(vl.preco) AS preco
    FROM public.veiculos_loja vl
    WHERE vl.tenant_id = p_tenant_id
    GROUP BY vl.veiculo_id
  )
  SELECT
    v.id,
    v.placa,
    v.cor,
    v.ano_modelo,
    v.ano_fabricacao,
    v.hodometro,
    ppv.preco,
    jsonb_build_object(
      'id', m.id,
      'marca', m.marca,
      'nome', m.nome
    ) AS modelo
  FROM public.veiculos v
  LEFT JOIN preco_por_veiculo ppv ON ppv.veiculo_id = v.id
  LEFT JOIN public.modelo m ON m.id = v.modelo_id
  WHERE v.tenant_id = p_tenant_id
    AND NOT EXISTS (
      SELECT 1 FROM veiculos_anunciados_por_loja al WHERE al.veiculo_id = v.id
    )
    AND NOT EXISTS (
      SELECT 1 FROM repetidos_anunciados ra
      WHERE v.repetido_id IS NOT NULL AND ra.repetido_id = v.repetido_id
    );
END;
$$;

-- Permissões de execução para usuários autenticados
GRANT EXECUTE ON FUNCTION public.get_veiculos_ociosos(uuid) TO authenticated;