-- ==========================================
-- FASE 1: CORREÇÕES CRÍTICAS (VERSÃO FINAL)
-- ==========================================

-- 1. Criar enum para roles
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'gerente', 'usuario', 'proprietario');
  END IF;
END $$;

-- 2. Criar tabela user_roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  empresa_id uuid NOT NULL,
  criado_em timestamp with time zone DEFAULT now(),
  criado_por uuid,
  UNIQUE(user_id, empresa_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Funções SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.user_has_role(_user_id uuid, _role app_role, _empresa_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role AND empresa_id = _empresa_id
  );
$$;

CREATE OR REPLACE FUNCTION public.user_is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'proprietario')
  );
$$;

-- 4. Migrar dados
INSERT INTO public.user_roles (user_id, empresa_id, role, criado_em)
SELECT usuario_id, empresa_id, papel::text::app_role, criado_em
FROM public.membros_empresa
WHERE ativo = true
ON CONFLICT (user_id, empresa_id, role) DO NOTHING;

-- 5. Remover política hardcoded
DROP POLICY IF EXISTS "libera tudo para owner" ON public.membros_empresa;

-- 6. Políticas membros_empresa
CREATE POLICY "users_can_view_their_memberships"
ON public.membros_empresa FOR SELECT TO authenticated
USING (usuario_id = auth.uid());

CREATE POLICY "admins_can_manage_memberships"
ON public.membros_empresa FOR ALL TO authenticated
USING (public.user_is_admin(auth.uid()))
WITH CHECK (public.user_is_admin(auth.uid()));

-- 7. Políticas user_roles
CREATE POLICY "users_can_view_their_roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "admins_can_manage_roles"
ON public.user_roles FOR ALL TO authenticated
USING (public.user_is_admin(auth.uid()))
WITH CHECK (public.user_is_admin(auth.uid()));

-- 8. CORRIGIR veiculos_loja
DROP POLICY IF EXISTS "libera tudo para a empresa" ON public.veiculos_loja;

CREATE POLICY "veiculos_loja_select_policy"
ON public.veiculos_loja FOR SELECT TO authenticated
USING (empresa_do_usuario(empresa_id));

CREATE POLICY "veiculos_loja_insert_policy"
ON public.veiculos_loja FOR INSERT TO authenticated
WITH CHECK (empresa_do_usuario(empresa_id));

CREATE POLICY "veiculos_loja_update_policy"
ON public.veiculos_loja FOR UPDATE TO authenticated
USING (empresa_do_usuario(empresa_id))
WITH CHECK (empresa_do_usuario(empresa_id));

CREATE POLICY "veiculos_loja_delete_policy"
ON public.veiculos_loja FOR DELETE TO authenticated
USING (empresa_do_usuario(empresa_id));

-- 9. Políticas empresas
CREATE POLICY "empresas_insert_policy"
ON public.empresas FOR INSERT TO authenticated
WITH CHECK (public.user_is_admin(auth.uid()));

CREATE POLICY "empresas_update_policy"
ON public.empresas FOR UPDATE TO authenticated
USING (public.user_has_role(auth.uid(), 'admin', id) OR public.user_has_role(auth.uid(), 'proprietario', id))
WITH CHECK (public.user_has_role(auth.uid(), 'admin', id) OR public.user_has_role(auth.uid(), 'proprietario', id));

-- 10. Políticas lojas
CREATE POLICY "lojas_insert_policy"
ON public.lojas FOR INSERT TO authenticated
WITH CHECK (empresa_do_usuario(empresa_id) AND 
  (public.user_has_role(auth.uid(), 'admin', empresa_id) OR 
   public.user_has_role(auth.uid(), 'proprietario', empresa_id) OR
   public.user_has_role(auth.uid(), 'gerente', empresa_id)));

CREATE POLICY "lojas_update_policy"
ON public.lojas FOR UPDATE TO authenticated
USING (empresa_do_usuario(empresa_id))
WITH CHECK (empresa_do_usuario(empresa_id) AND 
  (public.user_has_role(auth.uid(), 'admin', empresa_id) OR 
   public.user_has_role(auth.uid(), 'proprietario', empresa_id) OR
   public.user_has_role(auth.uid(), 'gerente', empresa_id)));

CREATE POLICY "lojas_delete_policy"
ON public.lojas FOR DELETE TO authenticated
USING (empresa_do_usuario(empresa_id) AND 
  (public.user_has_role(auth.uid(), 'admin', empresa_id) OR
   public.user_has_role(auth.uid(), 'proprietario', empresa_id)));

-- 11. Políticas veículos
CREATE POLICY "veiculos_insert_policy"
ON public.veiculos FOR INSERT TO authenticated
WITH CHECK (empresa_do_usuario(empresa_id));

CREATE POLICY "veiculos_update_policy"
ON public.veiculos FOR UPDATE TO authenticated
USING (empresa_do_usuario(empresa_id))
WITH CHECK (empresa_do_usuario(empresa_id));

CREATE POLICY "veiculos_delete_policy"
ON public.veiculos FOR DELETE TO authenticated
USING (empresa_do_usuario(empresa_id) AND 
  (public.user_has_role(auth.uid(), 'admin', empresa_id) OR 
   public.user_has_role(auth.uid(), 'proprietario', empresa_id) OR
   public.user_has_role(auth.uid(), 'gerente', empresa_id)));

-- 12. Recriar listar_usuarios (DROP primeiro)
DROP FUNCTION IF EXISTS public.listar_usuarios();

CREATE FUNCTION public.listar_usuarios()
RETURNS TABLE (
  id uuid,
  email text,
  name text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.user_is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores';
  END IF;

  RETURN QUERY
  SELECT 
    au.id,
    au.email::text,
    au.raw_user_meta_data->>'name' as name,
    au.created_at
  FROM auth.users au
  ORDER BY au.created_at DESC;
END;
$$;