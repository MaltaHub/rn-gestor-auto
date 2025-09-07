-- FIXED COMPREHENSIVE TENANT ISOLATION MIGRATION
-- Handles NULL values properly during backfill
-- =====================================================

-- Step 1: Add tenant_id columns to existing tables (all nullable initially)
-- =====================================================

-- Add tenant_id to modelo (nullable first for backfill)
ALTER TABLE public.modelo ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Add tenant_id to plataforma (nullable first for backfill)
ALTER TABLE public.plataforma ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Add tenant_id to locais (nullable first for backfill)
ALTER TABLE public.locais ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Add tenant_id to repetidos (nullable first for backfill)
ALTER TABLE public.repetidos ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Add tenant_id to veiculos (nullable first for backfill)
ALTER TABLE public.veiculos ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Add tenant_id to veiculos_loja (nullable first for backfill)
ALTER TABLE public.veiculos_loja ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Add tenant_id to caracteristicas_veiculos (nullable first for backfill)
ALTER TABLE public.caracteristicas_veiculos ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Add tenant_id to caracteristicas_repetidos (nullable first for backfill)
ALTER TABLE public.caracteristicas_repetidos ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Step 2: Get the first available tenant for fallback
-- =====================================================

DO $$
DECLARE
    fallback_tenant_id UUID;
BEGIN
    -- Get first active tenant as fallback
    SELECT id INTO fallback_tenant_id 
    FROM public.tenants 
    WHERE ativo = true 
    LIMIT 1;

    -- If no tenant exists, create a default one
    IF fallback_tenant_id IS NULL THEN
        INSERT INTO public.tenants (nome, ativo) 
        VALUES ('Default Tenant', true) 
        RETURNING id INTO fallback_tenant_id;
    END IF;

    -- Step 3: Backfill tenant_id data safely
    -- =====================================================

    -- Backfill veiculos.tenant_id from lojas.tenant_id via local (where possible)
    UPDATE public.veiculos 
    SET tenant_id = l.tenant_id
    FROM public.lojas l
    WHERE veiculos.local = l.id 
      AND veiculos.tenant_id IS NULL;

    -- For vehicles without valid loja reference, use fallback tenant
    UPDATE public.veiculos 
    SET tenant_id = fallback_tenant_id
    WHERE tenant_id IS NULL;

    -- Backfill veiculos_loja.tenant_id from lojas.tenant_id
    UPDATE public.veiculos_loja 
    SET tenant_id = l.tenant_id
    FROM public.lojas l
    WHERE veiculos_loja.loja_id = l.id 
      AND veiculos_loja.tenant_id IS NULL;

    -- For veiculos_loja without valid loja reference, use fallback tenant
    UPDATE public.veiculos_loja 
    SET tenant_id = fallback_tenant_id
    WHERE tenant_id IS NULL;

    -- Backfill caracteristicas_veiculos.tenant_id from veiculos.tenant_id
    UPDATE public.caracteristicas_veiculos 
    SET tenant_id = v.tenant_id
    FROM public.veiculos v
    WHERE caracteristicas_veiculos.veiculo_id = v.id 
      AND caracteristicas_veiculos.tenant_id IS NULL;

    -- For caracteristicas_veiculos without valid vehicle reference, use fallback tenant
    UPDATE public.caracteristicas_veiculos 
    SET tenant_id = fallback_tenant_id
    WHERE tenant_id IS NULL;

    -- Backfill repetidos.tenant_id from veiculos.tenant_id (first occurrence)
    UPDATE public.repetidos 
    SET tenant_id = (
      SELECT v.tenant_id 
      FROM public.veiculos v 
      WHERE v.repetido_id = repetidos.id 
      LIMIT 1
    )
    WHERE tenant_id IS NULL;

    -- For repetidos without vehicle reference, use fallback tenant
    UPDATE public.repetidos 
    SET tenant_id = fallback_tenant_id
    WHERE tenant_id IS NULL;

    -- Backfill caracteristicas_repetidos.tenant_id from repetidos.tenant_id
    UPDATE public.caracteristicas_repetidos 
    SET tenant_id = r.tenant_id
    FROM public.repetidos r
    WHERE caracteristicas_repetidos.repetido_id = r.id 
      AND caracteristicas_repetidos.tenant_id IS NULL;

    -- For caracteristicas_repetidos without valid repetido reference, use fallback tenant
    UPDATE public.caracteristicas_repetidos 
    SET tenant_id = fallback_tenant_id
    WHERE tenant_id IS NULL;

    -- For global reference tables, set to fallback tenant
    UPDATE public.modelo 
    SET tenant_id = fallback_tenant_id
    WHERE tenant_id IS NULL;

    UPDATE public.plataforma 
    SET tenant_id = fallback_tenant_id
    WHERE tenant_id IS NULL;

    UPDATE public.locais 
    SET tenant_id = fallback_tenant_id
    WHERE tenant_id IS NULL;

END $$;

-- Step 4: Make tenant_id NOT NULL after backfill
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

-- Step 5: Create performance indexes
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