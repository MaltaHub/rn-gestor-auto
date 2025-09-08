import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  Star, 
  Camera,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { useVeiculoLojaFotos, useUploadVeiculoLojaFoto, useDeleteVeiculoLojaFoto, useSetVeiculoLojaCoverPhoto } from '@/hooks/useVeiculoLojaFotos';
import { toast } from 'sonner';

interface PhotoManagerMobileProps {
  veiculoLojaId: string;
}

export function PhotoManagerMobile({ veiculoLojaId }: PhotoManagerMobileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: fotos = [], isLoading } = useVeiculoLojaFotos(veiculoLojaId);
  const uploadMutation = useUploadVeiculoLojaFoto();
  const deleteMutation = useDeleteVeiculoLojaFoto();
  const setCoverMutation = useSetVeiculoLojaCoverPhoto();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    
    // Upload uma foto por vez para mobile (melhor UX)
    const uploadPromises = files.slice(0, 5).map(file => 
      uploadMutation.mutateAsync({ 
        veiculoLojaId, 
        file 
      })
    );

    Promise.all(uploadPromises)
      .then(() => {
        toast.success(`${files.length} foto(s) enviada(s) com sucesso!`);
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      })
      .catch((error) => {
        console.error('Erro no upload:', error);
        toast.error('Erro ao enviar fotos');
        setIsUploading(false);
      });
  };

  const handleDelete = (foto: any) => {
    deleteMutation.mutate({
      id: foto.id,
      fotoNome: foto.nome_arquivo,
      veiculoLojaId
    }, {
      onSuccess: () => {
        toast.success('Foto removida com sucesso!');
      },
      onError: () => {
        toast.error('Erro ao remover foto');
      }
    });
  };

  const handleSetCover = (fotoId: string) => {
    setCoverMutation.mutate({ veiculoLojaId, photoId: fotoId }, {
      onSuccess: () => {
        toast.success('Foto de capa definida!');
      },
      onError: () => {
        toast.error('Erro ao definir foto de capa');
      }
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-muted-foreground">Carregando fotos...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center">
            <Button
              variant="outline"
              className="w-full h-24 border-dashed"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <div className="flex flex-col items-center gap-2">
                {isUploading ? (
                  <>
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span className="text-sm">Enviando...</span>
                  </>
                ) : (
                  <>
                    <Camera className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium">Adicionar Fotos</span>
                    <span className="text-xs text-muted-foreground">Toque para selecionar</span>
                  </>
                )}
              </div>
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </CardContent>
      </Card>

      {/* Photos Grid */}
      {fotos.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Nenhuma foto</h3>
            <p className="text-sm text-muted-foreground">
              Adicione fotos para destacar este veículo na loja
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {fotos.map((foto) => (
            <Card key={foto.id} className="relative overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-[4/3] relative">
                  <img
                    src={foto.url}
                    alt="Foto do veículo"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    {foto.is_capa && (
                      <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
                        <Star className="h-3 w-3 mr-1" />
                        Capa
                      </Badge>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
                      onClick={() => handleDelete(foto)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    
                    {!foto.is_capa && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 w-8 p-0 bg-background/80 hover:bg-background"
                        onClick={() => handleSetCover(foto.id)}
                        disabled={setCoverMutation.isPending}
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {/* Order indicator */}
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="bg-background/80 text-foreground">
                      {foto.ordem}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {fotos.length > 0 && (
        <div className="text-center text-xs text-muted-foreground">
          {fotos.length} foto(s) • Toque na estrela para definir como capa
        </div>
      )}
    </div>
  );
}