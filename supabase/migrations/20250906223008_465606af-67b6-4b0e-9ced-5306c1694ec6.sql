-- Fix Multi-Tenant Data Structure

-- 1. First, create default tenant for existing lojas
INSERT INTO tenants (nome, dominio, ativo) 
VALUES ('Empresa Principal', 'example.com', true);

-- 2. Get the tenant ID and update lojas
DO $$
DECLARE
    default_tenant_id uuid;
BEGIN
    -- Get the default tenant ID
    SELECT id INTO default_tenant_id FROM tenants WHERE nome = 'Empresa Principal';
    
    -- Update all existing lojas to use this tenant
    UPDATE lojas SET tenant_id = default_tenant_id WHERE tenant_id IS NULL;
END $$;

-- 3. Now make tenant_id NOT NULL and add foreign key
ALTER TABLE lojas ALTER COLUMN tenant_id SET NOT NULL;
ALTER TABLE lojas ADD CONSTRAINT fk_lojas_tenant 
FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;

-- 4. Create sample tenant members (assuming first user should be owner)
DO $$
DECLARE
    default_tenant_id uuid;
    first_user_id uuid;
BEGIN
    SELECT id INTO default_tenant_id FROM tenants WHERE nome = 'Empresa Principal';
    
    -- Get first user from auth.users if exists
    SELECT id INTO first_user_id FROM auth.users LIMIT 1;
    
    -- If user exists, make them owner of default tenant
    IF first_user_id IS NOT NULL THEN
        INSERT INTO tenant_members (tenant_id, user_id, role, ativo)
        VALUES (default_tenant_id, first_user_id, 'owner', true)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;