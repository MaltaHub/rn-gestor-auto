import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

export type TenantRole = "owner" | "admin" | "manager" | "user";

export type TenantMember = {
  id: string;
  user_id: string;
  role: TenantRole;
  ativo: boolean;
  created_at: string;
  profiles?: {
    display_name?: string;
    email?: string;
  };
};

export function useTenantMembers() {
  const { currentTenant } = useTenant();
  const queryClient = useQueryClient();

  const { data: members, isLoading } = useQuery({
    queryKey: ["tenant-members", currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async () => {
      if (!currentTenant?.id) throw new Error("No tenant selected");
      
      const { data, error } = await supabase
        .from("tenant_members")
        .select(`
          id,
          user_id,
          role,
          ativo,
          created_at
        `)
        .eq("tenant_id", currentTenant.id)
        .eq("ativo", true)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return (data ?? []) as TenantMember[];
    },
  });

  const updateMemberRole = useMutation({
    mutationFn: async ({ memberId, newRole }: { memberId: string; newRole: TenantRole }) => {
      const { error } = await supabase
        .from("tenant_members")
        .update({ role: newRole })
        .eq("id", memberId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-members", currentTenant?.id] });
    },
  });

  const removeMember = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase
        .from("tenant_members")
        .update({ ativo: false })
        .eq("id", memberId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-members", currentTenant?.id] });
    },
  });

  return {
    members: members ?? [],
    isLoading,
    updateMemberRole,
    removeMember,
  };
}