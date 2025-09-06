-- Create multi-tenant structure with security
CREATE TYPE public.tenant_role AS ENUM ('owner', 'admin', 'manager', 'user');

-- Create tenants table
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  dominio TEXT UNIQUE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tenant members junction table
CREATE TABLE public.tenant_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.tenant_role NOT NULL DEFAULT 'user',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- Add tenant_id to lojas table
ALTER TABLE public.lojas 
ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Create security definer helper functions
CREATE OR REPLACE FUNCTION public.get_current_user_tenant_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT tenant_id 
  FROM public.tenant_members 
  WHERE user_id = auth.uid() 
    AND ativo = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_tenant_membership(p_tenant_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.tenant_members 
    WHERE user_id = auth.uid() 
      AND tenant_id = p_tenant_id 
      AND ativo = true
  );
$$;

CREATE OR REPLACE FUNCTION public.has_tenant_role(p_tenant_id UUID, p_role public.tenant_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.tenant_members 
    WHERE user_id = auth.uid() 
      AND tenant_id = p_tenant_id 
      AND role = p_role 
      AND ativo = true
  );
$$;

-- Enable RLS on new tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenants
CREATE POLICY "Users can view their tenants"
ON public.tenants
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_members 
    WHERE tenant_id = tenants.id 
      AND user_id = auth.uid() 
      AND ativo = true
  )
);

CREATE POLICY "Tenant owners can manage tenants"
ON public.tenants
FOR ALL
TO authenticated
USING (public.has_tenant_role(id, 'owner'))
WITH CHECK (public.has_tenant_role(id, 'owner'));

-- Create RLS policies for tenant_members
CREATE POLICY "Users can view members of their tenants"
ON public.tenant_members
FOR SELECT
TO authenticated
USING (public.has_tenant_membership(tenant_id));

CREATE POLICY "Tenant admins can manage members"
ON public.tenant_members
FOR ALL
TO authenticated
USING (
  public.has_tenant_role(tenant_id, 'owner') OR 
  public.has_tenant_role(tenant_id, 'admin')
)
WITH CHECK (
  public.has_tenant_role(tenant_id, 'owner') OR 
  public.has_tenant_role(tenant_id, 'admin')
);

-- Update RLS policies for existing tables to use tenant-based access
DROP POLICY IF EXISTS "allow_authenticated_lojas" ON public.lojas;
DROP POLICY IF EXISTS "Select para usuários autenticados" ON public.lojas;

CREATE POLICY "Users can view lojas of their tenant"
ON public.lojas
FOR SELECT
TO authenticated
USING (public.has_tenant_membership(tenant_id));

CREATE POLICY "Tenant managers can manage lojas"
ON public.lojas
FOR ALL
TO authenticated
USING (
  public.has_tenant_role(tenant_id, 'owner') OR 
  public.has_tenant_role(tenant_id, 'admin') OR
  public.has_tenant_role(tenant_id, 'manager')
)
WITH CHECK (
  public.has_tenant_role(tenant_id, 'owner') OR 
  public.has_tenant_role(tenant_id, 'admin') OR
  public.has_tenant_role(tenant_id, 'manager')
);

-- Update other tables RLS policies
DROP POLICY IF EXISTS "allow_authenticated_veiculos" ON public.veiculos;
DROP POLICY IF EXISTS "Select para usuários autenticados" ON public.veiculos;

-- For veiculos, we need to check through the local relationship
CREATE POLICY "Users can view veiculos of their tenant"
ON public.veiculos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.locais l
    JOIN public.lojas lj ON true  -- assuming locais belong to tenant via business logic
    WHERE l.id = veiculos.local 
      AND public.has_tenant_membership(lj.tenant_id)
    LIMIT 1
  )
);

-- Add constraints for data quality
ALTER TABLE public.veiculos 
ADD CONSTRAINT unique_placa UNIQUE (placa);

-- Add unique constraint for veiculo per loja
ALTER TABLE public.veiculos_loja 
ADD CONSTRAINT unique_veiculo_loja UNIQUE (veiculo_id, loja_id);

-- Create indices for performance
CREATE INDEX idx_tenant_members_user_tenant ON public.tenant_members(user_id, tenant_id);
CREATE INDEX idx_tenant_members_tenant ON public.tenant_members(tenant_id);
CREATE INDEX idx_lojas_tenant ON public.lojas(tenant_id);
CREATE INDEX idx_veiculos_placa ON public.veiculos(placa);
CREATE INDEX idx_veiculos_estado_venda ON public.veiculos(estado_venda);

-- Make storage bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'fotos_veiculos_loja';

-- Create storage policies for tenant-based access
CREATE POLICY "Users can view photos of their tenant vehicles"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'fotos_veiculos_loja' 
  AND EXISTS (
    SELECT 1 FROM public.veiculos_loja vl
    JOIN public.lojas l ON l.id = vl.loja_id
    WHERE public.has_tenant_membership(l.tenant_id)
      AND (storage.foldername(name))[1] = l.tenant_id::text
      AND (storage.foldername(name))[2] = vl.loja_id::text
  )
);

CREATE POLICY "Tenant managers can upload photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'fotos_veiculos_loja'
  AND EXISTS (
    SELECT 1 FROM public.lojas l
    WHERE l.tenant_id::text = (storage.foldername(name))[1]
      AND l.id::text = (storage.foldername(name))[2]
      AND (
        public.has_tenant_role(l.tenant_id, 'owner') OR 
        public.has_tenant_role(l.tenant_id, 'admin') OR
        public.has_tenant_role(l.tenant_id, 'manager')
      )
  )
);