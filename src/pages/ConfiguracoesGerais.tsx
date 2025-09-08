import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

type Plataforma = {
  id: string;
  nome: string;
  tenant_id: string;
};

type Local = {
  id: string;
  nome: string;
  tenant_id: string;
};

type Caracteristica = {
  id: string;
  nome: string;
};

type TabState = {
  editingItem: any;
  newItemName: string;
  dialogOpen: boolean;
};

type TabStates = {
  plataforma: TabState;
  locais: TabState;
  caracteristicas: TabState;
};

export default function ConfiguracoesGerais() {
  const { currentTenant } = useTenant();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Separate state for each tab to prevent conflicts with unique keys
  const [tabStates, setTabStates] = useState<TabStates>({
    plataforma: { editingItem: null, newItemName: "", dialogOpen: false },
    locais: { editingItem: null, newItemName: "", dialogOpen: false },
    caracteristicas: { editingItem: null, newItemName: "", dialogOpen: false },
  });

  const updateTabState = (table: keyof TabStates, updates: Partial<TabState>) => {
    setTabStates(prev => ({
      ...prev,
      [table]: { ...prev[table], ...updates }
    }));
  };

  // Queries
  const { data: plataformas } = useQuery({
    queryKey: ["plataformas", currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plataforma")
        .select("*")
        .eq("tenant_id", currentTenant!.id);
      if (error) throw error;
      return data as Plataforma[];
    },
  });

  const { data: locais } = useQuery({
    queryKey: ["locais", currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locais")
        .select("*")
        .eq("tenant_id", currentTenant!.id);
      if (error) throw error;
      return data as Local[];
    },
  });

  const { data: caracteristicas } = useQuery({
    queryKey: ["caracteristicas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("caracteristicas")
        .select("*");
      if (error) throw error;
      return data as Caracteristica[];
    },
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async ({ table, name }: { table: string; name: string }) => {
      if (!name.trim()) throw new Error("Nome é obrigatório");
      
      const data = table === "caracteristicas" 
        ? { nome: name.trim() }
        : { nome: name.trim(), tenant_id: currentTenant!.id };
      
      const { error } = await (supabase as any).from(table).insert(data);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      const tableKey = variables.table as keyof TabStates;
      queryClient.invalidateQueries({ queryKey: [variables.table, currentTenant?.id] });
      toast({ title: "Sucesso", description: "Item criado com sucesso!" });
      updateTabState(tableKey, { newItemName: "", dialogOpen: false });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro", 
        description: error.message || "Erro ao criar item",
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ table, id, name }: { table: string; id: string; name: string }) => {
      if (!name.trim()) throw new Error("Nome é obrigatório");
      
      const { error } = await (supabase as any)
        .from(table)
        .update({ nome: name.trim() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      const tableKey = variables.table as keyof TabStates;
      queryClient.invalidateQueries({ queryKey: [variables.table, currentTenant?.id] });
      toast({ title: "Sucesso", description: "Item atualizado com sucesso!" });
      updateTabState(tableKey, { editingItem: null });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro", 
        description: error.message || "Erro ao atualizar item",
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ table, id }: { table: string; id: string }) => {
      const { error } = await (supabase as any).from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [variables.table, currentTenant?.id] });
      toast({ title: "Sucesso", description: "Item excluído com sucesso!" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Erro", 
        description: error.message || "Erro ao excluir item",
        variant: "destructive" 
      });
    },
  });

  const handleCreate = (table: keyof TabStates) => {
    const state = tabStates[table];
    if (!state.newItemName.trim()) {
      toast({ 
        title: "Erro", 
        description: "Nome é obrigatório",
        variant: "destructive" 
      });
      return;
    }
    createMutation.mutate({ table, name: state.newItemName });
  };

  const handleUpdate = (table: keyof TabStates, id: string, name: string) => {
    if (!name.trim()) {
      toast({ 
        title: "Erro", 
        description: "Nome é obrigatório",
        variant: "destructive" 
      });
      return;
    }
    updateMutation.mutate({ table, id, name });
  };

  const handleDelete = (table: string, id: string) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      deleteMutation.mutate({ table, id });
    }
  };

  const ItemList = ({ 
    items, 
    table, 
    title 
  }: { 
    items: any[], 
    table: keyof TabStates, 
    title: string 
  }) => {
    const currentState = tabStates[table];
    
    return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Dialog open={currentState.dialogOpen} onOpenChange={(open) => updateTabState(table, { dialogOpen: open })}>
            <DialogTrigger asChild>
              <Button 
                size="sm" 
                onClick={() => updateTabState(table, { dialogOpen: true })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar {title.slice(0, -1)}</DialogTitle>
                <DialogDescription>
                  Digite o nome do novo item.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={currentState.newItemName}
                    onChange={(e) => updateTabState(table, { newItemName: e.target.value })}
                    placeholder="Digite o nome..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreate(table);
                      }
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={() => handleCreate(table)}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Criando..." : "Criar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
            {items?.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-2 border rounded">
              {currentState.editingItem?.id === item.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <Input
                    value={currentState.editingItem.nome}
                    onChange={(e) => updateTabState(table, { 
                      editingItem: { ...currentState.editingItem, nome: e.target.value }
                    })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleUpdate(table, item.id, currentState.editingItem.nome);
                      }
                      if (e.key === "Escape") {
                        updateTabState(table, { editingItem: null });
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={() => handleUpdate(table, item.id, currentState.editingItem.nome)}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? "Salvando..." : "Salvar"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateTabState(table, { editingItem: null })}
                  >
                    Cancelar
                  </Button>
                </div>
              ) : (
                <>
                  <span>{item.nome}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTabState(table, { editingItem: item })}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(table, item.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          )) || []}
          {(!items || items.length === 0) && (
            <p className="text-muted-foreground text-center py-4">
              Nenhum item encontrado.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
    );
  };

  if (!currentTenant) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Selecione um tenant para gerenciar configurações
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Configurações Gerais</h1>
        <p className="text-muted-foreground">
          Gerencie plataformas, locais, modelos e características
        </p>
      </div>

      <Tabs defaultValue="plataformas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="plataformas">Plataformas</TabsTrigger>
          <TabsTrigger value="locais">Locais</TabsTrigger>
          <TabsTrigger value="caracteristicas">Características</TabsTrigger>
        </TabsList>

        <TabsContent value="plataformas">
          <ItemList 
            items={plataformas || []} 
            table="plataforma" 
            title="Plataformas" 
          />
        </TabsContent>

        <TabsContent value="locais">
          <ItemList 
            items={locais || []} 
            table="locais" 
            title="Locais" 
          />
        </TabsContent>

        <TabsContent value="caracteristicas">
          <ItemList 
            items={caracteristicas || []} 
            table="caracteristicas" 
            title="Características" 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}