-- Remove foreign keys que referenciam a tabela usuario
ALTER TABLE public.veiculos DROP CONSTRAINT IF EXISTS veiculos_registrado_por_fkey;
ALTER TABLE public.veiculos DROP CONSTRAINT IF EXISTS veiculos_editado_por_fkey;

-- Remove a tabela usuario (não está sendo utilizada)
DROP TABLE IF EXISTS public.usuario;