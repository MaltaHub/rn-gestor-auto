
-- 1) Tabela de convites baseada em UUID do usuário
create table if not exists public.tenant_invites (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  invited_user_id uuid not null, -- UUID do usuário no auth (sem FK direta ao schema auth)
  invited_by_user_id uuid not null, -- quem criou o convite (auth.uid())
  token uuid not null default gen_random_uuid(), -- token do link
  status text not null default 'pending' check (status in ('pending','accepted','revoked','expired')),
  expires_at timestamptz not null default now() + interval '14 days',
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Índices e unicidade
create unique index if not exists tenant_invites_token_key
  on public.tenant_invites(token);

create unique index if not exists uq_pending_invite_per_user_tenant
  on public.tenant_invites(tenant_id, invited_user_id)
  where status = 'pending';

-- 2) RLS
alter table public.tenant_invites enable row level security;

-- Apenas owners/admins podem gerenciar convites do tenant
drop policy if exists "Tenant admins can manage invites" on public.tenant_invites;
create policy "Tenant admins can manage invites"
on public.tenant_invites
for all
using (
  has_tenant_role(tenant_id, 'owner'::tenant_role) or
  has_tenant_role(tenant_id, 'admin'::tenant_role)
)
with check (
  has_tenant_role(tenant_id, 'owner'::tenant_role) or
  has_tenant_role(tenant_id, 'admin'::tenant_role)
);

-- Convidado pode ver seus próprios convites
drop policy if exists "Invited user can view own invites" on public.tenant_invites;
create policy "Invited user can view own invites"
on public.tenant_invites
for select
using (
  invited_user_id = auth.uid()
  or has_tenant_role(tenant_id, 'owner'::tenant_role)
  or has_tenant_role(tenant_id, 'admin'::tenant_role)
);

-- 3) Trigger de validação de expiração (evita expires_at no passado quando status = pending)
create or replace function public.validate_tenant_invite_tg()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'pending' and new.expires_at is not null and new.expires_at <= now() then
    raise exception 'expires_at must be in the future for pending invites';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_validate_tenant_invite on public.tenant_invites;
create trigger trg_validate_tenant_invite
before insert or update on public.tenant_invites
for each row execute procedure public.validate_tenant_invite_tg();

-- 4) RPC: criar convite (somente owner/admin)
create or replace function public.create_tenant_invite(
  p_tenant_id uuid,
  p_invited_user_id uuid,
  p_expires_at timestamptz default null
)
returns public.tenant_invites
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.tenant_invites;
begin
  -- Autoriza: apenas owner/admin do tenant atual
  if not (has_tenant_role(p_tenant_id, 'owner'::tenant_role)
          or has_tenant_role(p_tenant_id, 'admin'::tenant_role)) then
    raise exception 'not authorized to create invites for this tenant';
  end if;

  insert into public.tenant_invites (tenant_id, invited_user_id, invited_by_user_id, expires_at)
  values (
    p_tenant_id,
    p_invited_user_id,
    auth.uid(),
    coalesce(p_expires_at, now() + interval '14 days')
  )
  returning * into v_invite;

  return v_invite;
end;
$$;

-- 5) RPC: aceitar convite (executado pelo usuário convidado)
create or replace function public.accept_tenant_invite(p_token uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.tenant_invites;
begin
  select *
  into v_invite
  from public.tenant_invites
  where token = p_token
    and status = 'pending'
    and (expires_at is null or expires_at > now())
    and invited_user_id = auth.uid()
  limit 1;

  if not found then
    return false;
  end if;

  -- Garante unicidade e ativa membro
  insert into public.tenant_members (tenant_id, user_id, role, ativo)
  values (v_invite.tenant_id, auth.uid(), 'user', true)
  on conflict (tenant_id, user_id)
  do update set ativo = true;

  update public.tenant_invites
     set status = 'accepted',
         consumed_at = now()
   where id = v_invite.id;

  return true;
end;
$$;

-- 6) Garantir unicidade de membership
create unique index if not exists tenant_members_unique_membership
  on public.tenant_members(tenant_id, user_id);

-- 7) Limpeza da tabela usuario: remover colunas inutilizáveis
alter table public.usuario
  drop column if exists cargo,
  drop column if exists aniversario,
  drop column if exists foto_perfil,
  drop column if exists biografia,
  drop column if exists ultima_conexao_em;
