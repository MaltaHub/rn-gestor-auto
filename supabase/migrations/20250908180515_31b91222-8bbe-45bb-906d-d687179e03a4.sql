-- Fix RLS policies for configuration tables
-- Update policies for plataforma table
DROP POLICY IF EXISTS "allow_authenticated_plataforma" ON public.plataforma;
DROP POLICY IF EXISTS "Select para usuários autenticados" ON public.plataforma;

CREATE POLICY "Users can view tenant platforms" 
ON public.plataforma 
FOR SELECT 
USING (has_tenant_membership(tenant_id));

CREATE POLICY "Managers can manage tenant platforms" 
ON public.plataforma 
FOR ALL 
USING (has_tenant_role(tenant_id, 'owner'::tenant_role) OR has_tenant_role(tenant_id, 'admin'::tenant_role) OR has_tenant_role(tenant_id, 'manager'::tenant_role))
WITH CHECK (has_tenant_role(tenant_id, 'owner'::tenant_role) OR has_tenant_role(tenant_id, 'admin'::tenant_role) OR has_tenant_role(tenant_id, 'manager'::tenant_role));

-- Update policies for locais table
DROP POLICY IF EXISTS "allow_authenticated_locais" ON public.locais;
DROP POLICY IF EXISTS "Select para usuários autenticados" ON public.locais;

CREATE POLICY "Users can view tenant locations" 
ON public.locais 
FOR SELECT 
USING (has_tenant_membership(tenant_id));

CREATE POLICY "Managers can manage tenant locations" 
ON public.locais 
FOR ALL 
USING (has_tenant_role(tenant_id, 'owner'::tenant_role) OR has_tenant_role(tenant_id, 'admin'::tenant_role) OR has_tenant_role(tenant_id, 'manager'::tenant_role))
WITH CHECK (has_tenant_role(tenant_id, 'owner'::tenant_role) OR has_tenant_role(tenant_id, 'admin'::tenant_role) OR has_tenant_role(tenant_id, 'manager'::tenant_role));

-- Update policies for caracteristicas table (global, tenant-independent)
DROP POLICY IF EXISTS "allow_authenticated_caracteristicas" ON public.caracteristicas;
DROP POLICY IF EXISTS "Select para usuários autenticados" ON public.caracteristicas;

CREATE POLICY "All authenticated users can view characteristics" 
ON public.caracteristicas 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "All authenticated users can manage characteristics" 
ON public.caracteristicas 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);