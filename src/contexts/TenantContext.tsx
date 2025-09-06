import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type Tenant = { id: string; nome: string; dominio?: string };
export type Loja = { id: string; nome: string; tenant_id: string | null };

type TenantContextType = {
  currentTenant: Tenant | null;
  lojas: Loja[];
  selectedLojaId: string | null;
  setSelectedLojaId: (id: string | null) => void;
  loading: boolean;
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [selectedLojaId, setSelectedLojaId] = useState<string | null>(() =>
    localStorage.getItem("loja_id")
  );

  useEffect(() => {
    if (selectedLojaId) localStorage.setItem("loja_id", selectedLojaId);
    else localStorage.removeItem("loja_id");
  }, [selectedLojaId]);

  // Auth-aware setup for tenant queries
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      console.log("🔄 TenantContext: auth changed, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["user-tenant"] });
      queryClient.invalidateQueries({ queryKey: ["lojas"] });
    });
    return () => subscription.unsubscribe();
  }, [queryClient]);

  // Fetch user's tenant (only one tenant per user)
  const { data: currentTenant, isLoading: loadingTenant } = useQuery({
    queryKey: ["user-tenant", user?.id],
    enabled: !authLoading && !!user?.id,
    staleTime: 0,
    refetchOnMount: true,
    queryFn: async () => {
      console.log("🔍 TenantContext: Fetching user tenant...");
      // Get current user's tenant id via RPC, may return null
      const { data: tenantId, error: rpcError } = await supabase.rpc("get_current_user_tenant_id");
      console.log("🔍 TenantContext: RPC result:", { tenantId, rpcError });
      
      if (rpcError) {
        console.error("❌ TenantContext: RPC error:", rpcError);
        throw rpcError;
      }
      if (!tenantId) {
        console.log("⚠️ TenantContext: No tenant found for user");
        return null;
      }

      console.log("🔍 TenantContext: Fetching tenant details for ID:", tenantId);
      const { data, error } = await supabase
        .from("tenants")
        .select("id, nome, dominio")
        .eq("id", tenantId)
        .maybeSingle();
        
      if (error) {
        console.error("❌ TenantContext: Tenant fetch error:", error);
        throw error;
      }
      
      console.log("✅ TenantContext: Tenant found:", data);
      return (data ?? null) as Tenant | null;
    },
  });

  // Fetch lojas for the user's tenant
  const { data: lojasData, isLoading: loadingLojas } = useQuery({
    queryKey: ["lojas", currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lojas")
        .select("id, nome, tenant_id")
        .eq("tenant_id", currentTenant!.id)
        .order("nome", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Loja[];
    },
  });

  // Auto-select first loja when not set
  useEffect(() => {
    if (!selectedLojaId && lojasData && lojasData.length > 0) {
      setSelectedLojaId(lojasData[0].id);
    }
  }, [selectedLojaId, lojasData]);

  const value = useMemo(
    () => ({
      currentTenant: currentTenant ?? null,
      lojas: lojasData ?? [],
      selectedLojaId,
      setSelectedLojaId,
      loading: loadingTenant || loadingLojas,
    }),
    [currentTenant, lojasData, selectedLojaId, loadingTenant, loadingLojas]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}
