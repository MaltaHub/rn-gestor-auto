-- Create tenant via RPC and assign current user as owner
create or replace function public.create_tenant(
  p_nome text,
  p_dominio text default null
)
returns public.tenants
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant public.tenants;
begin
  if coalesce(trim(p_nome), '') = '' then
    raise exception 'nome is required';
  end if;

  insert into public.tenants (nome, dominio, ativo)
  values (trim(p_nome), nullif(trim(p_dominio), ''), true)
  returning * into v_tenant;

  -- Add creator as OWNER
  insert into public.tenant_members (tenant_id, user_id, role, ativo)
  values (v_tenant.id, auth.uid(), 'owner', true)
  on conflict (tenant_id, user_id)
  do update set ativo = true, role = 'owner';

  return v_tenant;
end;
$$;