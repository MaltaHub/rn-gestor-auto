import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Edit, Check, X, DollarSign } from 'lucide-react';
import { useUpdateVeiculoLojaPreco } from '@/hooks/useUpdateVeiculoLojaPreco';

interface PrecoVitrineProps {
  veiculoLojaId: string;
  precoAtual: number | null;
  className?: string;
}

export function PrecoVitrine({ veiculoLojaId, precoAtual, className }: PrecoVitrineProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [novoPreco, setNovoPreco] = useState(precoAtual?.toString() || "");
  
  const updateMutation = useUpdateVeiculoLojaPreco();

  const handleSave = async () => {
    const preco = novoPreco ? parseFloat(novoPreco) : null;
    
    try {
      await updateMutation.mutateAsync({
        id: veiculoLojaId,
        preco
      });
      setIsEditing(false);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleCancel = () => {
    setNovoPreco(precoAtual?.toString() || "");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Input
          type="number"
          step="0.01"
          value={novoPreco}
          onChange={(e) => setNovoPreco(e.target.value)}
          placeholder="0.00"
          className="w-32"
        />
        <Button
          size="sm"
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          <Check className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {precoAtual ? (
        <Badge variant="secondary" className="text-sm">
          <DollarSign className="h-3 w-3 mr-1" />
          R$ {Number(precoAtual).toLocaleString()}
        </Badge>
      ) : (
        <Badge variant="outline" className="text-sm text-muted-foreground">
          Sem preço
        </Badge>
      )}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
      >
        <Edit className="h-3 w-3" />
      </Button>
    </div>
  );
}