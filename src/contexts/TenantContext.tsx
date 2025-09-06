import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Tenant = { id: string; nome: string };
export type Loja = { id: string; nome: string; tenant_id: string | null };

type TenantContextType = {
  tenants: Tenant[];
  lojas: Loja[];
  selectedTenantId: string | null;
  setSelectedTenantId: (id: string | null) => void;
  selectedLojaId: string | null;
  setSelectedLojaId: (id: string | null) => void;
  loading: boolean;
};

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(() =>
    localStorage.getItem("tenant_id")
  );
  const [selectedLojaId, setSelectedLojaId] = useState<string | null>(() =>
    localStorage.getItem("loja_id")
  );

  useEffect(() => {
    if (selectedTenantId) localStorage.setItem("tenant_id", selectedTenantId);
    else localStorage.removeItem("tenant_id");
  }, [selectedTenantId]);

  useEffect(() => {
    if (selectedLojaId) localStorage.setItem("loja_id", selectedLojaId);
    else localStorage.removeItem("loja_id");
  }, [selectedLojaId]);

  const { data: tenantsData, isLoading: loadingTenants } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("id, nome")
        .order("nome", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Tenant[];
    },
  });

  const { data: lojasData, isLoading: loadingLojas } = useQuery({
    queryKey: ["lojas", selectedTenantId],
    enabled: !!selectedTenantId,
    queryFn: async () => {
      const query = supabase
        .from("lojas")
        .select("id, nome, tenant_id")
        .order("nome", { ascending: true });
      if (selectedTenantId) query.eq("tenant_id", selectedTenantId);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Loja[];
    },
  });

  // Auto-select first tenant/loja when not set
  useEffect(() => {
    if (!selectedTenantId && tenantsData && tenantsData.length > 0) {
      setSelectedTenantId(tenantsData[0].id);
    }
  }, [selectedTenantId, tenantsData]);

  useEffect(() => {
    if (!selectedLojaId && lojasData && lojasData.length > 0) {
      setSelectedLojaId(lojasData[0].id);
    }
  }, [selectedLojaId, lojasData]);

  const value = useMemo(
    () => ({
      tenants: tenantsData ?? [],
      lojas: lojasData ?? [],
      selectedTenantId,
      setSelectedTenantId: (id: string | null) => {
        setSelectedTenantId(id);
        setSelectedLojaId(null); // reset loja when tenant changes
      },
      selectedLojaId,
      setSelectedLojaId,
      loading: loadingTenants || loadingLojas,
    }),
    [tenantsData, lojasData, selectedTenantId, selectedLojaId, loadingTenants, loadingLojas]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}
