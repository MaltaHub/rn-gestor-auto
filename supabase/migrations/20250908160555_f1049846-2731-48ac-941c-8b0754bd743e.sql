-- Make veiculos.local nullable and update RLS policies
alter table public.veiculos alter column local drop not null;

-- Drop old policies that rely on local
do $$ begin
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'veiculos' and policyname = 'Managers can manage tenant vehicles') then
    drop policy "Managers can manage tenant vehicles" on public.veiculos;
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'veiculos' and policyname = 'Users can view tenant vehicles') then
    drop policy "Users can view tenant vehicles" on public.veiculos;
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'veiculos' and policyname = 'Users can view veiculos of their tenant') then
    drop policy "Users can view veiculos of their tenant" on public.veiculos;
  end if;
end $$;

-- Ensure RLS is enabled
alter table public.veiculos enable row level security;

-- New policies
create policy "Managers can manage tenant vehicles"
  on public.veiculos
  for all
  using (
    has_tenant_role(tenant_id, 'owner'::tenant_role)
    or has_tenant_role(tenant_id, 'admin'::tenant_role)
    or has_tenant_role(tenant_id, 'manager'::tenant_role)
  )
  with check (
    has_tenant_role(tenant_id, 'owner'::tenant_role)
    or has_tenant_role(tenant_id, 'admin'::tenant_role)
    or has_tenant_role(tenant_id, 'manager'::tenant_role)
  );

create policy "Users can view vehicles listed in their tenant stores"
  on public.veiculos
  for select
  using (
    exists (
      select 1
      from public.veiculos_loja vl
      join public.lojas l on l.id = vl.loja_id
      where vl.veiculo_id = veiculos.id
        and has_tenant_membership(l.tenant_id)
    )
  );

create policy "Managers can view all vehicles of their tenant"
  on public.veiculos
  for select
  using (
    has_tenant_role(tenant_id, 'owner'::tenant_role)
    or has_tenant_role(tenant_id, 'admin'::tenant_role)
    or has_tenant_role(tenant_id, 'manager'::tenant_role)
  );