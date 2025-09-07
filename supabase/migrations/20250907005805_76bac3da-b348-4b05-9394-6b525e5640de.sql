-- =====================================================
-- COMPREHENSIVE TENANT ISOLATION MIGRATION
-- Adds tenant_id to all eligible tables (except usuario/caracteristicas)
-- Creates anuncios table, RLS policies, validation triggers, and RPCs
-- =====================================================

-- Step 1: Add tenant_id columns to existing tables
-- =====================================================

-- Add tenant_id to modelo (nullable first for backfill)
ALTER TABLE public.modelo ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);

-- Add tenant_id to plataforma (nullable first for backfill)
ALTER TABLE public.plataforma ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);

-- Add tenant_id to locais (nullable first for backfill)
ALTER TABLE public.locais ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);

-- Add tenant_id to repetidos (nullable first for backfill)
ALTER TABLE public.repetidos ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);

-- Add tenant_id to veiculos (nullable first for backfill)
ALTER TABLE public.veiculos ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);

-- Add tenant_id to veiculos_loja (nullable first for backfill)
ALTER TABLE public.veiculos_loja ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);

-- Add tenant_id to caracteristicas_veiculos (nullable first for backfill)
ALTER TABLE public.caracteristicas_veiculos ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);

-- Add tenant_id to caracteristicas_repetidos (nullable first for backfill)
ALTER TABLE public.caracteristicas_repetidos ADD COLUMN tenant_id UUID REFERENCES public.tenants(id);

-- Step 2: Backfill tenant_id data
-- =====================================================

-- Backfill veiculos.tenant_id from lojas.tenant_id via local
UPDATE public.veiculos 
SET tenant_id = l.tenant_id
FROM public.lojas l
WHERE veiculos.local = l.id;

-- Backfill veiculos_loja.tenant_id from lojas.tenant_id
UPDATE public.veiculos_loja 
SET tenant_id = l.tenant_id
FROM public.lojas l
WHERE veiculos_loja.loja_id = l.id;

-- Backfill caracteristicas_veiculos.tenant_id from veiculos.tenant_id
UPDATE public.caracteristicas_veiculos 
SET tenant_id = v.tenant_id
FROM public.veiculos v
WHERE caracteristicas_veiculos.veiculo_id = v.id;

-- Backfill repetidos.tenant_id from veiculos.tenant_id (first occurrence)
UPDATE public.repetidos 
SET tenant_id = (
  SELECT v.tenant_id 
  FROM public.veiculos v 
  WHERE v.repetido_id = repetidos.id 
  LIMIT 1
);

-- Backfill caracteristicas_repetidos.tenant_id from repetidos.tenant_id
UPDATE public.caracteristicas_repetidos 
SET tenant_id = r.tenant_id
FROM public.repetidos r
WHERE caracteristicas_repetidos.repetido_id = r.id;

-- For global tables, set tenant_id to first available tenant for now
-- These can be managed per-tenant later via admin interface
UPDATE public.modelo 
SET tenant_id = (SELECT id FROM public.tenants WHERE ativo = true LIMIT 1)
WHERE tenant_id IS NULL;

UPDATE public.plataforma 
SET tenant_id = (SELECT id FROM public.tenants WHERE ativo = true LIMIT 1)
WHERE tenant_id IS NULL;

UPDATE public.locais 
SET tenant_id = (SELECT id FROM public.tenants WHERE ativo = true LIMIT 1)
WHERE tenant_id IS NULL;

-- Step 3: Make tenant_id NOT NULL and add constraints
-- =====================================================

-- Core isolation tables - tenant_id NOT NULL
ALTER TABLE public.veiculos ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.veiculos_loja ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.caracteristicas_veiculos ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.repetidos ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.caracteristicas_repetidos ALTER COLUMN tenant_id SET NOT NULL;

-- Reference tables - tenant_id NOT NULL
ALTER TABLE public.modelo ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.plataforma ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE public.locais ALTER COLUMN tenant_id SET NOT NULL;

-- Step 4: Create performance indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_modelo_tenant_id ON public.modelo(tenant_id);
CREATE INDEX IF NOT EXISTS idx_plataforma_tenant_id ON public.plataforma(tenant_id);
CREATE INDEX IF NOT EXISTS idx_locais_tenant_id ON public.locais(tenant_id);
CREATE INDEX IF NOT EXISTS idx_repetidos_tenant_id ON public.repetidos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_veiculos_tenant_id ON public.veiculos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_veiculos_loja_tenant_id ON public.veiculos_loja(tenant_id);
CREATE INDEX IF NOT EXISTS idx_caracteristicas_veiculos_tenant_id ON public.caracteristicas_veiculos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_caracteristicas_repetidos_tenant_id ON public.caracteristicas_repetidos(tenant_id);

-- Compound indexes for common queries
CREATE INDEX IF NOT EXISTS idx_veiculos_tenant_estado ON public.veiculos(tenant_id, estado_venda);
CREATE INDEX IF NOT EXISTS idx_veiculos_loja_tenant_loja ON public.veiculos_loja(tenant_id, loja_id);

-- Step 5: Create validation triggers for tenant consistency
-- =====================================================

-- Function to validate same tenant between entities
CREATE OR REPLACE FUNCTION public.validate_same_tenant()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate veiculos.local (loja) has same tenant_id
  IF TG_TABLE_NAME = 'veiculos' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.lojas l 
      WHERE l.id = NEW.local AND l.tenant_id = NEW.tenant_id
    ) THEN
      RAISE EXCEPTION 'Veículo deve pertencer à mesma loja do tenant (tenant_id: %, local: %)', NEW.tenant_id, NEW.local;
    END IF;
  END IF;

  -- Validate veiculos_loja relationships
  IF TG_TABLE_NAME = 'veiculos_loja' THEN
    -- Check loja_id has same tenant
    IF NOT EXISTS (
      SELECT 1 FROM public.lojas l 
      WHERE l.id = NEW.loja_id AND l.tenant_id = NEW.tenant_id
    ) THEN
      RAISE EXCEPTION 'Loja deve pertencer ao mesmo tenant (tenant_id: %, loja_id: %)', NEW.tenant_id, NEW.loja_id;
    END IF;
    
    -- Check veiculo_id has same tenant
    IF NOT EXISTS (
      SELECT 1 FROM public.veiculos v 
      WHERE v.id = NEW.veiculo_id AND v.tenant_id = NEW.tenant_id
    ) THEN
      RAISE EXCEPTION 'Veículo deve pertencer ao mesmo tenant (tenant_id: %, veiculo_id: %)', NEW.tenant_id, NEW.veiculo_id;
    END IF;
  END IF;

  -- Validate caracteristicas_veiculos
  IF TG_TABLE_NAME = 'caracteristicas_veiculos' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.veiculos v 
      WHERE v.id = NEW.veiculo_id AND v.tenant_id = NEW.tenant_id
    ) THEN
      RAISE EXCEPTION 'Veículo deve pertencer ao mesmo tenant (tenant_id: %, veiculo_id: %)', NEW.tenant_id, NEW.veiculo_id;
    END IF;
  END IF;

  -- Validate caracteristicas_repetidos
  IF TG_TABLE_NAME = 'caracteristicas_repetidos' THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.repetidos r 
      WHERE r.id = NEW.repetido_id AND r.tenant_id = NEW.tenant_id
    ) THEN
      RAISE EXCEPTION 'Repetido deve pertencer ao mesmo tenant (tenant_id: %, repetido_id: %)', NEW.tenant_id, NEW.repetido_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for validation
DROP TRIGGER IF EXISTS trigger_validate_veiculos_tenant ON public.veiculos;
CREATE TRIGGER trigger_validate_veiculos_tenant
  BEFORE INSERT OR UPDATE ON public.veiculos
  FOR EACH ROW EXECUTE FUNCTION public.validate_same_tenant();

DROP TRIGGER IF EXISTS trigger_validate_veiculos_loja_tenant ON public.veiculos_loja;
CREATE TRIGGER trigger_validate_veiculos_loja_tenant
  BEFORE INSERT OR UPDATE ON public.veiculos_loja
  FOR EACH ROW EXECUTE FUNCTION public.validate_same_tenant();

DROP TRIGGER IF EXISTS trigger_validate_caracteristicas_veiculos_tenant ON public.caracteristicas_veiculos;
CREATE TRIGGER trigger_validate_caracteristicas_veiculos_tenant
  BEFORE INSERT OR UPDATE ON public.caracteristicas_veiculos
  FOR EACH ROW EXECUTE FUNCTION public.validate_same_tenant();

DROP TRIGGER IF EXISTS trigger_validate_caracteristicas_repetidos_tenant ON public.caracteristicas_repetidos;
CREATE TRIGGER trigger_validate_caracteristicas_repetidos_tenant
  BEFORE INSERT OR UPDATE ON public.caracteristicas_repetidos
  FOR EACH ROW EXECUTE FUNCTION public.validate_same_tenant();

-- Step 6: Create anuncios table
-- =====================================================

CREATE TABLE public.anuncios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id),
  veiculo_loja_id UUID NOT NULL REFERENCES public.veiculos_loja(id),
  plataforma_id UUID NOT NULL REFERENCES public.plataforma(id),
  titulo TEXT NOT NULL,
  descricao TEXT,
  preco NUMERIC,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'inativo')),
  url_anuncio TEXT,
  visualizacoes INTEGER DEFAULT 0,
  favoritos INTEGER DEFAULT 0,
  mensagens INTEGER DEFAULT 0,
  data_publicacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_expiracao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on anuncios
ALTER TABLE public.anuncios ENABLE ROW LEVEL SECURITY;

-- Indexes for anuncios
CREATE INDEX idx_anuncios_tenant_id ON public.anuncios(tenant_id);
CREATE INDEX idx_anuncios_veiculo_loja_id ON public.anuncios(veiculo_loja_id);
CREATE INDEX idx_anuncios_plataforma_id ON public.anuncios(plataforma_id);
CREATE INDEX idx_anuncios_status ON public.anuncios(status);
CREATE INDEX idx_anuncios_data_publicacao ON public.anuncios(data_publicacao DESC);

-- Unique constraint: one active ad per vehicle per platform
CREATE UNIQUE INDEX idx_anuncios_unique_active 
ON public.anuncios(tenant_id, veiculo_loja_id, plataforma_id) 
WHERE status = 'ativo';

-- Validation trigger for anuncios
CREATE OR REPLACE FUNCTION public.validate_anuncios_tenant()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate veiculo_loja belongs to same tenant
  IF NOT EXISTS (
    SELECT 1 FROM public.veiculos_loja vl 
    WHERE vl.id = NEW.veiculo_loja_id AND vl.tenant_id = NEW.tenant_id
  ) THEN
    RAISE EXCEPTION 'Veículo loja deve pertencer ao mesmo tenant (tenant_id: %, veiculo_loja_id: %)', NEW.tenant_id, NEW.veiculo_loja_id;
  END IF;
  
  -- Validate plataforma belongs to same tenant
  IF NOT EXISTS (
    SELECT 1 FROM public.plataforma p 
    WHERE p.id = NEW.plataforma_id AND p.tenant_id = NEW.tenant_id
  ) THEN
    RAISE EXCEPTION 'Plataforma deve pertencer ao mesmo tenant (tenant_id: %, plataforma_id: %)', NEW.tenant_id, NEW.plataforma_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_validate_anuncios_tenant ON public.anuncios;
CREATE TRIGGER trigger_validate_anuncios_tenant
  BEFORE INSERT OR UPDATE ON public.anuncios
  FOR EACH ROW EXECUTE FUNCTION public.validate_anuncios_tenant();

-- Step 7: Update RLS policies to use tenant_id
-- =====================================================

-- Update veiculos RLS policies
DROP POLICY IF EXISTS "Users can view tenant vehicles" ON public.veiculos;
CREATE POLICY "Users can view tenant vehicles by tenant_id" 
ON public.veiculos FOR SELECT 
USING (has_tenant_membership(tenant_id));

DROP POLICY IF EXISTS "Managers can manage tenant vehicles" ON public.veiculos;
CREATE POLICY "Managers can manage tenant vehicles by tenant_id" 
ON public.veiculos FOR ALL 
USING (has_tenant_role(tenant_id, 'owner'::tenant_role) OR has_tenant_role(tenant_id, 'admin'::tenant_role) OR has_tenant_role(tenant_id, 'manager'::tenant_role))
WITH CHECK (has_tenant_role(tenant_id, 'owner'::tenant_role) OR has_tenant_role(tenant_id, 'admin'::tenant_role) OR has_tenant_role(tenant_id, 'manager'::tenant_role));

-- Update veiculos_loja RLS policies  
DROP POLICY IF EXISTS "Users can view tenant vehicle listings" ON public.veiculos_loja;
CREATE POLICY "Users can view tenant vehicle listings by tenant_id" 
ON public.veiculos_loja FOR SELECT 
USING (has_tenant_membership(tenant_id));

DROP POLICY IF EXISTS "Managers can manage tenant vehicle listings" ON public.veiculos_loja;
CREATE POLICY "Managers can manage tenant vehicle listings by tenant_id" 
ON public.veiculos_loja FOR ALL 
USING (has_tenant_role(tenant_id, 'owner'::tenant_role) OR has_tenant_role(tenant_id, 'admin'::tenant_role) OR has_tenant_role(tenant_id, 'manager'::tenant_role))
WITH CHECK (has_tenant_role(tenant_id, 'owner'::tenant_role) OR has_tenant_role(tenant_id, 'admin'::tenant_role) OR has_tenant_role(tenant_id, 'manager'::tenant_role));

-- RLS policies for anuncios
CREATE POLICY "Users can view tenant anuncios" 
ON public.anuncios FOR SELECT 
USING (has_tenant_membership(tenant_id));

CREATE POLICY "Managers can manage tenant anuncios" 
ON public.anuncios FOR ALL 
USING (has_tenant_role(tenant_id, 'owner'::tenant_role) OR has_tenant_role(tenant_id, 'admin'::tenant_role) OR has_tenant_role(tenant_id, 'manager'::tenant_role))
WITH CHECK (has_tenant_role(tenant_id, 'owner'::tenant_role) OR has_tenant_role(tenant_id, 'admin'::tenant_role) OR has_tenant_role(tenant_id, 'manager'::tenant_role));

-- RLS policies for reference tables (read for members, manage for admins)
CREATE POLICY "Users can view tenant modelo" 
ON public.modelo FOR SELECT 
USING (has_tenant_membership(tenant_id));

CREATE POLICY "Admins can manage tenant modelo" 
ON public.modelo FOR ALL 
USING (has_tenant_role(tenant_id, 'owner'::tenant_role) OR has_tenant_role(tenant_id, 'admin'::tenant_role))
WITH CHECK (has_tenant_role(tenant_id, 'owner'::tenant_role) OR has_tenant_role(tenant_id, 'admin'::tenant_role));

CREATE POLICY "Users can view tenant plataforma" 
ON public.plataforma FOR SELECT 
USING (has_tenant_membership(tenant_id));

CREATE POLICY "Admins can manage tenant plataforma" 
ON public.plataforma FOR ALL 
USING (has_tenant_role(tenant_id, 'owner'::tenant_role) OR has_tenant_role(tenant_id, 'admin'::tenant_role))
WITH CHECK (has_tenant_role(tenant_id, 'owner'::tenant_role) OR has_tenant_role(tenant_id, 'admin'::tenant_role));

CREATE POLICY "Users can view tenant locais" 
ON public.locais FOR SELECT 
USING (has_tenant_membership(tenant_id));

CREATE POLICY "Admins can manage tenant locais" 
ON public.locais FOR ALL 
USING (has_tenant_role(tenant_id, 'owner'::tenant_role) OR has_tenant_role(tenant_id, 'admin'::tenant_role))
WITH CHECK (has_tenant_role(tenant_id, 'owner'::tenant_role) OR has_tenant_role(tenant_id, 'admin'::tenant_role));

-- Step 8: Create RPCs for repetidos management
-- =====================================================

-- Function to recompute repetidos for a tenant
CREATE OR REPLACE FUNCTION public.recompute_repetidos_for_tenant(p_tenant_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_group RECORD;
  v_repetido_id UUID;
BEGIN
  -- Validate tenant membership
  IF NOT has_tenant_membership(p_tenant_id) THEN
    RAISE EXCEPTION 'Access denied to tenant %', p_tenant_id;
  END IF;

  -- Clear existing repetidos for this tenant
  DELETE FROM public.repetidos WHERE tenant_id = p_tenant_id;

  -- Group vehicles by modelo, cor, and similar characteristics
  FOR v_group IN
    SELECT 
      v.modelo_id,
      v.cor,
      CASE 
        WHEN v.ano_modelo BETWEEN 2020 AND 2024 THEN '2020-2024'
        WHEN v.ano_modelo BETWEEN 2015 AND 2019 THEN '2015-2019'
        ELSE 'outros'
      END as ano_grupo,
      COUNT(*) as vehicle_count,
      AVG(vl.preco)::NUMERIC as preco_medio,
      MIN(v.hodometro) as min_hodometro,
      MAX(v.hodometro) as max_hodometro,
      MODE() WITHIN GROUP (ORDER BY v.ano_modelo) as ano_modelo_comum,
      MODE() WITHIN GROUP (ORDER BY v.ano_fabricacao) as ano_fabricacao_comum
    FROM public.veiculos v
    JOIN public.veiculos_loja vl ON v.id = vl.veiculo_id
    WHERE v.tenant_id = p_tenant_id 
      AND v.estado_venda IN ('disponivel', 'reservado')
    GROUP BY v.modelo_id, v.cor, ano_grupo
    HAVING COUNT(*) >= 2  -- Only group if 2+ similar vehicles
  LOOP
    -- Create repetido entry
    INSERT INTO public.repetidos (
      tenant_id,
      modelo_id,
      preco_padrao,
      min_hodometro,
      max_hodometro,
      ano_modelo_padrao,
      ano_fabricacao_padrao,
      cor_padrao
    ) VALUES (
      p_tenant_id,
      v_group.modelo_id,
      v_group.preco_medio,
      v_group.min_hodometro,
      v_group.max_hodometro,
      v_group.ano_modelo_comum,
      v_group.ano_fabricacao_comum,
      v_group.cor
    ) RETURNING id INTO v_repetido_id;

    -- Link vehicles to this repetido
    UPDATE public.veiculos 
    SET repetido_id = v_repetido_id
    WHERE tenant_id = p_tenant_id 
      AND modelo_id = v_group.modelo_id 
      AND cor = v_group.cor;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to recompute repetidos when a vehicle changes
CREATE OR REPLACE FUNCTION public.recompute_repetidos_for_vehicle(p_veiculo_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- Get tenant_id from vehicle
  SELECT tenant_id INTO v_tenant_id 
  FROM public.veiculos 
  WHERE id = p_veiculo_id;

  IF v_tenant_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Recompute for entire tenant (simplified approach)
  PERFORM public.recompute_repetidos_for_tenant(v_tenant_id);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;