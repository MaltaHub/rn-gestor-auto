import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

export type PapelEmpresa = "proprietario" | "administrador" | "gerente" | "usuario";

export type MembroEmpresa = {
  id: string;
  usuario_id: string;
  papel: PapelEmpresa;
  ativo: boolean;
  criado_em: string;
  profiles?: {
    display_name?: string;
    email?: string;
  };
};

// Manter compatibilidade temporária
export type TenantRole = PapelEmpresa;
export type TenantMember = MembroEmpresa;

export function useTenantMembers() {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ["membros-empresa", currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async () => {
      if (!currentTenant?.id) throw new Error("No tenant selected");
      
      const { data, error } = await supabase
        .from("membros_empresa")
        .select(`
          id,
          usuario_id,
          papel,
          ativo,
          criado_em
        `)
        .eq("empresa_id", currentTenant.id)
        .eq("ativo", true)
        .order("criado_em", { ascending: true });
      
      if (error) throw error;
      return (data ?? []) as MembroEmpresa[];
    },
  });

  const updateMemberRole = useMutation({
    mutationFn: async ({ memberId, newRole }: { memberId: string; newRole: PapelEmpresa }) => {
      const { error } = await supabase
        .from("membros_empresa")
        .update({ papel: newRole })
        .eq("id", memberId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membros-empresa", currentTenant?.id] });
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("membros_empresa")
        .update({ ativo: false })
        .eq("id", memberId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membros-empresa", currentTenant?.id] });
    },
  });

  return {
    members: members ?? [],
    isLoading,
    updateMemberRole,
    removeMember,
  };
}