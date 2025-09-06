-- Complete Multi-Tenant Security Implementation

-- 1. Update view_veiculos_expandidos to include tenant information and filter properly
CREATE OR REPLACE VIEW view_veiculos_expandidos AS
SELECT 
    v.id,
    v.hodometro,
    v.estado_venda,
    v.estado_veiculo,
    v.preco_venda,
    v.ano_modelo,
    v.ano_fabricacao,
    v.registrado_em,
    v.editado_em,
    v.placa,
    v.cor,
    v.observacao,
    v.chassi,
    -- Include modelo as JSON
    to_jsonb(m.*) as modelo,
    -- Include loja and tenant info as JSON
    jsonb_build_object(
        'id', l.id,
        'nome', l.nome,
        'tenant_id', l.tenant_id
    ) as local,
    -- Include caracteristicas as JSON array
    COALESCE(
        (SELECT jsonb_agg(jsonb_build_object('id', c.id, 'nome', c.nome))
         FROM caracteristicas_veiculos cv
         JOIN caracteristicas c ON cv.caracteristica_id = c.id
         WHERE cv.veiculo_id = v.id),
        '[]'::jsonb
    ) as caracteristicas
FROM veiculos v
LEFT JOIN modelo m ON v.modelo_id = m.id
LEFT JOIN lojas l ON v.local = l.id
-- Only show vehicles that are listed in stores (via veiculos_loja)
WHERE EXISTS (
    SELECT 1 FROM veiculos_loja vl 
    WHERE vl.veiculo_id = v.id AND vl.loja_id = l.id
);

-- 2. Create proper RLS policies for veiculos table
DROP POLICY IF EXISTS "Users can view tenant vehicles" ON veiculos;

-- Allow users to view vehicles from their tenant's stores
CREATE POLICY "Users can view tenant vehicles" ON veiculos
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM lojas l
        WHERE l.id = veiculos.local 
        AND has_tenant_membership(l.tenant_id)
    )
);

-- Allow users with manager+ roles to insert/update/delete vehicles
CREATE POLICY "Managers can manage tenant vehicles" ON veiculos
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM lojas l
        WHERE l.id = veiculos.local 
        AND (
            has_tenant_role(l.tenant_id, 'owner') OR 
            has_tenant_role(l.tenant_id, 'admin') OR 
            has_tenant_role(l.tenant_id, 'manager')
        )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM lojas l
        WHERE l.id = veiculos.local 
        AND (
            has_tenant_role(l.tenant_id, 'owner') OR 
            has_tenant_role(l.tenant_id, 'admin') OR 
            has_tenant_role(l.tenant_id, 'manager')
        )
    )
);

-- 3. Create RLS policies for veiculos_loja
ALTER TABLE veiculos_loja ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Select para usuários autenticados" ON veiculos_loja;
DROP POLICY IF EXISTS "allow_authenticated_veiculos_loja" ON veiculos_loja;

CREATE POLICY "Users can view tenant vehicle listings" ON veiculos_loja
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM lojas l
        WHERE l.id = veiculos_loja.loja_id 
        AND has_tenant_membership(l.tenant_id)
    )
);

CREATE POLICY "Managers can manage tenant vehicle listings" ON veiculos_loja
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM lojas l
        WHERE l.id = veiculos_loja.loja_id 
        AND (
            has_tenant_role(l.tenant_id, 'owner') OR 
            has_tenant_role(l.tenant_id, 'admin') OR 
            has_tenant_role(l.tenant_id, 'manager')
        )
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM lojas l
        WHERE l.id = veiculos_loja.loja_id 
        AND (
            has_tenant_role(l.tenant_id, 'owner') OR 
            has_tenant_role(l.tenant_id, 'admin') OR 
            has_tenant_role(l.tenant_id, 'manager')
        )
    )
);

-- 4. Create function to auto-assign users to tenants based on email domain
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_domain text;
    matching_tenant_id uuid;
BEGIN
    -- Extract domain from email
    user_domain := split_part(NEW.email, '@', 2);
    
    -- Find tenant with matching domain
    SELECT id INTO matching_tenant_id 
    FROM tenants 
    WHERE dominio = user_domain AND ativo = true
    LIMIT 1;
    
    -- If matching tenant found, add user as member
    IF matching_tenant_id IS NOT NULL THEN
        INSERT INTO tenant_members (tenant_id, user_id, role, ativo)
        VALUES (matching_tenant_id, NEW.id, 'user', true)
        ON CONFLICT (tenant_id, user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger for auto-assignment
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Add unique constraint to prevent duplicate memberships
ALTER TABLE tenant_members 
DROP CONSTRAINT IF EXISTS unique_tenant_user_membership;
ALTER TABLE tenant_members 
ADD CONSTRAINT unique_tenant_user_membership 
UNIQUE (tenant_id, user_id);