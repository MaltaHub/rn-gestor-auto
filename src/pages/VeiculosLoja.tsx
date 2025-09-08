import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTenant } from "@/contexts/TenantContext";
import { 
  useVeiculosLoja, 
  useUpdateVeiculoLoja, 
  useAddVeiculoToLoja, 
  useRemoveVeiculoFromLoja 
} from "@/hooks/useVeiculosLoja";
import { useVeiculos } from "@/hooks/useVeiculos";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type EditingVeiculo = {
  id: string;
  preco: string;
  pasta_fotos: string;
};

export default function VeiculosLoja() {
  const { currentTenant } = useTenant();
  const [editingVeiculo, setEditingVeiculo] = useState<EditingVeiculo | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVeiculo, setSelectedVeiculo] = useState("");
  const [selectedLojas, setSelectedLojas] = useState<string[]>([]);
  const [preco, setPreco] = useState("");

  const { data: veiculosLoja, isLoading } = useVeiculosLoja();
  const { data: todosVeiculos } = useVeiculos();
  const updateMutation = useUpdateVeiculoLoja();
  const addMutation = useAddVeiculoToLoja();
  const removeMutation = useRemoveVeiculoFromLoja();

  // Buscar lojas do tenant
  const { data: lojas } = useQuery({
    queryKey: ["lojas", currentTenant?.id],
    enabled: !!currentTenant?.id,
    queryFn: async () => {
      if (!currentTenant?.id) return [];
      const { data, error } = await supabase
        .from("lojas")
        .select("*")
        .eq("tenant_id", currentTenant.id);
      if (error) throw error;
      return data;
    },
  });

  const handleEdit = (veiculo: any) => {
    setEditingVeiculo({
      id: veiculo.id,
      preco: veiculo.preco?.toString() || "",
      pasta_fotos: veiculo.pasta_fotos || "",
    });
  };

  const handleSave = () => {
    if (!editingVeiculo) return;
    
    updateMutation.mutate({
      id: editingVeiculo.id,
      preco: editingVeiculo.preco ? parseFloat(editingVeiculo.preco) : null,
      pasta_fotos: editingVeiculo.pasta_fotos || null,
    });
    
    setEditingVeiculo(null);
  };

  const handleAddVeiculoToLojas = () => {
    if (!selectedVeiculo || selectedLojas.length === 0) return;

    selectedLojas.forEach(lojaId => {
      addMutation.mutate({
        veiculo_id: selectedVeiculo,
        loja_id: lojaId,
        preco: preco ? parseFloat(preco) : null,
      });
    });

    setSelectedVeiculo("");
    setSelectedLojas([]);
    setPreco("");
    setDialogOpen(false);
  };

  const handleLojaToggle = (lojaId: string, checked: boolean) => {
    if (checked) {
      setSelectedLojas([...selectedLojas, lojaId]);
    } else {
      setSelectedLojas(selectedLojas.filter(id => id !== lojaId));
    }
  };

  // Agrupar veículos por veiculo_id
  const veiculosGrouped = veiculosLoja?.reduce((acc, vl) => {
    if (!acc[vl.veiculo_id]) {
      acc[vl.veiculo_id] = {
        veiculo: vl.veiculo,
        lojas: []
      };
    }
    acc[vl.veiculo_id].lojas.push(vl);
    return acc;
  }, {} as Record<string, { veiculo: any; lojas: any[] }>);

  if (!currentTenant) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Selecione um tenant para gerenciar veículos em lojas
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Carregando...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Veículos nas Lojas</h1>
          <p className="text-muted-foreground">
            Gerencie quais veículos estão disponíveis em cada loja e seus preços
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Veículo à Loja
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Veículo às Lojas</DialogTitle>
              <DialogDescription>
                Selecione um veículo e as lojas onde ele estará disponível.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="veiculo">Veículo</Label>
                <Select value={selectedVeiculo} onValueChange={setSelectedVeiculo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um veículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {todosVeiculos?.map((veiculo) => (
                      <SelectItem key={veiculo.id} value={veiculo.id}>
                        {veiculo.placa} - {veiculo.modelo?.marca} {veiculo.modelo?.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Lojas</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {lojas?.map((loja) => (
                    <div key={loja.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={loja.id}
                        checked={selectedLojas.includes(loja.id)}
                        onCheckedChange={(checked) => handleLojaToggle(loja.id, !!checked)}
                      />
                      <Label htmlFor={loja.id} className="text-sm">
                        {loja.nome}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="preco">Preço (opcional)</Label>
                <Input
                  id="preco"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button 
                onClick={handleAddVeiculoToLojas}
                disabled={!selectedVeiculo || selectedLojas.length === 0 || addMutation.isPending}
              >
                {addMutation.isPending ? "Adicionando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        {Object.entries(veiculosGrouped || {}).map(([veiculoId, { veiculo, lojas }]) => (
          <Card key={veiculoId}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>{veiculo.placa}</span>
                <Badge variant="secondary">
                  {veiculo.modelo?.marca} {veiculo.modelo?.nome}
                </Badge>
                <Badge variant="outline">
                  {veiculo.cor} - {veiculo.ano_modelo}
                </Badge>
              </CardTitle>
              <CardDescription>
                Disponível em {lojas.length} loja{lojas.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lojas.map((vl) => (
                  <div key={vl.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-4">
                      <Badge>{vl.loja.nome}</Badge>
                      {editingVeiculo?.id === vl.id ? (
                        <div className="flex items-center gap-2">
                          <div>
                            <Label className="text-xs">Preço</Label>
                            <Input
                              type="number"
                              step="0.01"
                              className="w-32"
                              value={editingVeiculo.preco}
                              onChange={(e) => setEditingVeiculo({
                                ...editingVeiculo,
                                preco: e.target.value
                              })}
                              placeholder="0.00"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Pasta Fotos</Label>
                            <Input
                              className="w-40"
                              value={editingVeiculo.pasta_fotos}
                              onChange={(e) => setEditingVeiculo({
                                ...editingVeiculo,
                                pasta_fotos: e.target.value
                              })}
                              placeholder="pasta/fotos"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Preço: {vl.preco ? `R$ ${vl.preco.toFixed(2)}` : "Não definido"}</span>
                          {vl.pasta_fotos && <span>Pasta: {vl.pasta_fotos}</span>}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {editingVeiculo?.id === vl.id ? (
                        <>
                          <Button 
                            size="sm" 
                            onClick={handleSave}
                            disabled={updateMutation.isPending}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setEditingVeiculo(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleEdit(vl)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => {
                              if (confirm("Tem certeza que deseja remover este veículo da loja?")) {
                                removeMutation.mutate(vl.id);
                              }
                            }}
                            disabled={removeMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {(!veiculosGrouped || Object.keys(veiculosGrouped).length === 0) && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Nenhum veículo encontrado nas lojas. Use o botão "Adicionar Veículo à Loja" para começar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}