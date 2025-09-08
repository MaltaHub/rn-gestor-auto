import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
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
  const [previousLojaId, setPreviousLojaId] = useState<string | null>(selectedLojaId);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedLojaId) localStorage.setItem("loja_id", selectedLojaId);
    else localStorage.removeItem("loja_id");
  }, [selectedLojaId]);

  // Reload page when loja changes on context-sensitive routes
  useEffect(() => {
    if (previousLojaId && selectedLojaId && previousLojaId !== selectedLojaId) {
      const contextSensitiveRoutes = [
        '/dashboard/vitrine',
        '/dashboard/veiculo/'
      ];
      
      const isContextSensitive = contextSensitiveRoutes.some(route => 
        location.pathname.startsWith(route)
      );
      
      if (isContextSensitive) {
        console.log("🔄 Loja changed, reloading context-sensitive page");
        window.location.reload();
      }
    }
    setPreviousLojaId(selectedLojaId);
  }, [selectedLojaId, previousLojaId, location.pathname]);

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

  // Fetch user's tenant using direct query (more reliable than RPC)
  const { data: currentTenant, isLoading: loadingTenant } = useQuery({
    queryKey: ["user-tenant", user?.id],
    enabled: !authLoading && !!user?.id,
    staleTime: 0,
    refetchOnMount: true,
    queryFn: async () => {
      console.log("🔍 TenantContext: Fetching user tenant for user:", user!.id);
      
      // Direct query to tenant_members with join to tenants table
      const { data: memberData, error: memberError } = await supabase
        .from("tenant_members")
        .select(`
          tenant_id,
          tenants!inner(
            id,
            nome,
            dominio
          )
        `)
        .eq("user_id", user!.id)
        .eq("ativo", true)
        .maybeSingle();
      
      if (memberError) {
        console.error("❌ TenantContext: Error fetching tenant membership:", memberError);
        throw memberError;
      }
      
      if (!memberData) {
        console.log("⚠️ TenantContext: No active tenant membership found for user");
        return null;
      }
      
      const tenant = memberData.tenants;
      console.log("✅ TenantContext: Tenant found:", tenant);
      return tenant;
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
