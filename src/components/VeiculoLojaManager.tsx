import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store, Plus, Edit, Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVeiculosLoja, useAddVeiculoToLoja, useUpdateVeiculoLoja, useRemoveVeiculoFromLoja } from "@/hooks/useVeiculosLoja";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";

interface VeiculoLojaManagerProps {
  veiculoId: string;
}

export function VeiculoLojaManager({ veiculoId }: VeiculoLojaManagerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLojaId, setSelectedLojaId] = useState("");
  const [preco, setPreco] = useState("");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editPreco, setEditPreco] = useState("");
  
  const { data: veiculosLoja = [], isLoading } = useVeiculosLoja();
  const { lojas } = useTenant();
  const { toast } = useToast();
  
  const addMutation = useAddVeiculoToLoja();
  const updateMutation = useUpdateVeiculoLoja();
  const removeMutation = useRemoveVeiculoFromLoja();
  
  // Filtrar veículos-loja para este veículo específico
  const veiculoLojas = veiculosLoja.filter(vl => vl.veiculo_id === veiculoId);
  
  // Lojas disponíveis (que ainda não têm este veículo)
  const lojasDisponiveis = lojas.filter(loja => 
    !veiculoLojas.some(vl => vl.loja_id === loja.id)
  );

  const handleAdd = async () => {
    if (!selectedLojaId) {
      toast({
        title: "Erro",
        description: "Selecione uma loja",
        variant: "destructive"
      });
      return;
    }

    try {
      await addMutation.mutateAsync({
        veiculo_id: veiculoId,
        loja_id: selectedLojaId,
        preco: preco ? parseFloat(preco) : null,
      });
      
      setIsDialogOpen(false);
      setSelectedLojaId("");
      setPreco("");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;

    try {
      await updateMutation.mutateAsync({
        id: editingItem.id,
        preco: editPreco ? parseFloat(editPreco) : null,
      });
      
      setEditingItem(null);
      setEditPreco("");
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleRemove = async (veiculoLojaId: string) => {
    if (confirm("Tem certeza que deseja remover este veículo da loja?")) {
      try {
        await removeMutation.mutateAsync(veiculoLojaId);
      } catch (error) {
        // Error handled by mutation
      }
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando lojas...</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Lojas</h4>
        {lojasDisponiveis.length > 0 && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-3 w-3 mr-1" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Veículo à Loja</DialogTitle>
                <DialogDescription>
                  Selecione uma loja e defina o preço (opcional).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="loja">Loja</Label>
                  <Select value={selectedLojaId} onValueChange={setSelectedLojaId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma loja" />
                    </SelectTrigger>
                    <SelectContent>
                      {lojasDisponiveis.map((loja) => (
                        <SelectItem key={loja.id} value={loja.id}>
                          {loja.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="preco">Preço (opcional)</Label>
                  <Input
                    id="preco"
                    type="number"
                    step="0.01"
                    value={preco}
                    onChange={(e) => setPreco(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAdd} disabled={addMutation.isPending}>
                  {addMutation.isPending ? "Adicionando..." : "Adicionar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-2">
        {veiculoLojas.map((vl) => (
          <div key={vl.id} className="flex items-center justify-between p-2 border rounded-md">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{vl.loja.nome}</span>
              {vl.preco && (
                <Badge variant="secondary">
                  R$ {Number(vl.preco).toLocaleString()}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {editingItem?.id === vl.id ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={editPreco}
                    onChange={(e) => setEditPreco(e.target.value)}
                    placeholder="Preço"
                    className="w-24 h-8"
                  />
                  <Button
                    size="sm"
                    onClick={handleUpdate}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? "..." : "✓"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingItem(null)}
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingItem(vl);
                      setEditPreco(vl.preco?.toString() || "");
                    }}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemove(vl.id)}
                    disabled={removeMutation.isPending}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
        
        {veiculoLojas.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-2">
            Veículo não está em nenhuma loja
          </p>
        )}
      </div>
    </div>
  );
}