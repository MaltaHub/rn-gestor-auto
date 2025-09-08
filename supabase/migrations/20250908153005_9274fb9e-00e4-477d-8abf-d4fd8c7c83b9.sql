-- Remove preco_padrao from repetidos table
ALTER TABLE public.repetidos DROP COLUMN IF EXISTS preco_padrao;

-- Create view for suggesting repetidos groups
CREATE OR REPLACE VIEW public.view_sugestoes_repetidos AS
WITH veiculo_caracteristicas AS (
  SELECT 
    v.id as veiculo_id,
    v.tenant_id,
    v.modelo_id,
    v.cor,
    v.ano_modelo,
    v.ano_fabricacao,
    v.hodometro,
    ARRAY_AGG(cv.caracteristica_id ORDER BY cv.caracteristica_id) as caracteristicas_ids
  FROM veiculos v
  LEFT JOIN caracteristicas_veiculos cv ON v.id = cv.veiculo_id AND v.tenant_id = cv.tenant_id
  WHERE v.repetido_id IS NULL
  GROUP BY v.id, v.tenant_id, v.modelo_id, v.cor, v.ano_modelo, v.ano_fabricacao, v.hodometro
),
grupos AS (
  SELECT 
    tenant_id,
    modelo_id,
    cor,
    ano_modelo,
    ano_fabricacao,
    caracteristicas_ids,
    ARRAY_AGG(veiculo_id ORDER BY veiculo_id) as veiculo_ids,
    MIN(hodometro) as min_hodometro,
    MAX(hodometro) as max_hodometro,
    COUNT(*) as qtd_veiculos
  FROM veiculo_caracteristicas
  GROUP BY tenant_id, modelo_id, cor, ano_modelo, ano_fabricacao, caracteristicas_ids
)
SELECT *
FROM grupos
WHERE qtd_veiculos > 1;

-- Create anuncios table with compliance fields
CREATE TABLE IF NOT EXISTS public.anuncios (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL,
  plataforma_id uuid NOT NULL REFERENCES public.plataforma(id),
  tipo_anuncio text NOT NULL CHECK (tipo_anuncio IN ('individual', 'repetido')),
  veiculo_loja_id uuid REFERENCES public.veiculos_loja(id),
  repetido_id uuid REFERENCES public.repetidos(id),
  titulo text NOT NULL,
  descricao text,
  link_anuncio text,
  id_fisico text,
  tipo_id_fisico text,
  titulo_original text,
  descricao_original text,
  preco_original numeric(10,2),
  preco numeric(10,2),
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'vendido', 'removido')),
  visualizacoes integer DEFAULT 0,
  favoritos integer DEFAULT 0,
  mensagens integer DEFAULT 0,
  data_publicacao timestamp with time zone DEFAULT now(),
  data_vencimento timestamp with time zone,
  autor_id uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  
  -- Constraint to ensure only one of veiculo_loja_id or repetido_id is filled
  CONSTRAINT check_anuncio_target CHECK (
    (veiculo_loja_id IS NOT NULL AND repetido_id IS NULL) OR
    (veiculo_loja_id IS NULL AND repetido_id IS NOT NULL)
  )
);

-- Create indexes for anuncios
CREATE INDEX IF NOT EXISTS idx_anuncios_tenant_id ON public.anuncios(tenant_id);
CREATE INDEX IF NOT EXISTS idx_anuncios_plataforma_id ON public.anuncios(plataforma_id);
CREATE INDEX IF NOT EXISTS idx_anuncios_status ON public.anuncios(status);
CREATE INDEX IF NOT EXISTS idx_anuncios_veiculo_loja_id ON public.anuncios(veiculo_loja_id);
CREATE INDEX IF NOT EXISTS idx_anuncios_repetido_id ON public.anuncios(repetido_id);

-- Enable RLS on anuncios
ALTER TABLE public.anuncios ENABLE ROW LEVEL SECURITY;

-- RLS policies for anuncios
CREATE POLICY "Users can view anuncios of their tenant" 
ON public.anuncios 
FOR SELECT 
USING (has_tenant_membership(tenant_id));

CREATE POLICY "Managers can manage anuncios" 
ON public.anuncios 
FOR ALL 
USING (
  has_tenant_role(tenant_id, 'owner'::tenant_role) OR 
  has_tenant_role(tenant_id, 'admin'::tenant_role) OR 
  has_tenant_role(tenant_id, 'manager'::tenant_role)
)
WITH CHECK (
  has_tenant_role(tenant_id, 'owner'::tenant_role) OR 
  has_tenant_role(tenant_id, 'admin'::tenant_role) OR 
  has_tenant_role(tenant_id, 'manager'::tenant_role)
);

-- Create RPC function to validate repetido groups
CREATE OR REPLACE FUNCTION public.validate_repetido(p_repetido_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_repetido public.repetidos;
  v_result jsonb;
  v_vehicle_count integer;
  v_min_km numeric;
  v_max_km numeric;
  v_char_mismatch boolean := false;
  v_model_mismatch boolean := false;
  v_color_mismatch boolean := false;
  v_year_mismatch boolean := false;
  v_message text := '';
BEGIN
  -- Get repetido info
  SELECT * INTO v_repetido
  FROM public.repetidos
  WHERE id = p_repetido_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valid', false,
      'message', 'Repetido not found'
    );
  END IF;
  
  -- Check if user has access to this tenant
  IF NOT has_tenant_membership(v_repetido.tenant_id) THEN
    RAISE EXCEPTION 'Access denied to this tenant';
  END IF;
  
  -- Count vehicles in this repetido group
  SELECT COUNT(*) INTO v_vehicle_count
  FROM public.veiculos
  WHERE repetido_id = p_repetido_id;
  
  -- Calculate min/max hodometro from actual vehicles
  SELECT MIN(hodometro), MAX(hodometro)
  INTO v_min_km, v_max_km
  FROM public.veiculos
  WHERE repetido_id = p_repetido_id;
  
  -- Check if all vehicles have same modelo_id, cor, ano_modelo, ano_fabricacao
  SELECT EXISTS(
    SELECT 1 FROM public.veiculos v
    WHERE v.repetido_id = p_repetido_id
    AND (
      v.modelo_id != v_repetido.modelo_id OR
      v.cor != v_repetido.cor_padrao OR
      v.ano_modelo != v_repetido.ano_modelo_padrao OR
      v.ano_fabricacao != v_repetido.ano_fabricacao_padrao
    )
  ) INTO v_model_mismatch;
  
  -- Check characteristics consistency
  SELECT EXISTS(
    SELECT veiculo_id FROM (
      SELECT 
        v.id as veiculo_id,
        ARRAY_AGG(cv.caracteristica_id ORDER BY cv.caracteristica_id) as char_ids
      FROM public.veiculos v
      LEFT JOIN public.caracteristicas_veiculos cv ON v.id = cv.veiculo_id
      WHERE v.repetido_id = p_repetido_id
      GROUP BY v.id
    ) vehicle_chars
    GROUP BY char_ids
    HAVING COUNT(*) != v_vehicle_count
  ) INTO v_char_mismatch;
  
  -- Build validation message
  IF v_model_mismatch THEN
    v_message := v_message || 'Vehicle attributes mismatch. ';
  END IF;
  
  IF v_char_mismatch THEN
    v_message := v_message || 'Characteristics mismatch between vehicles. ';
  END IF;
  
  -- Update min/max if values changed
  IF v_min_km != v_repetido.min_hodometro OR v_max_km != v_repetido.max_hodometro THEN
    UPDATE public.repetidos
    SET min_hodometro = v_min_km, max_hodometro = v_max_km
    WHERE id = p_repetido_id;
  END IF;
  
  -- Build result
  v_result := jsonb_build_object(
    'valid', NOT (v_model_mismatch OR v_char_mismatch),
    'message', CASE WHEN v_message = '' THEN 'Validation successful' ELSE TRIM(v_message) END,
    'updated_min', v_min_km,
    'updated_max', v_max_km,
    'char_mismatch', v_char_mismatch,
    'model_mismatch', v_model_mismatch,
    'vehicle_count', v_vehicle_count
  );
  
  RETURN v_result;
END;
$$;