import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  // Fetch user's tenant (only one tenant per user)
  const { data: currentTenant, isLoading: loadingTenant } = useQuery({
    queryKey: ["user-tenant"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("id, nome, dominio")
        .limit(1)
        .single();
      if (error) throw error;
      return data as Tenant;
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
