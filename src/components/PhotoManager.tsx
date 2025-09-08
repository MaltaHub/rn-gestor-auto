import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Upload, 
  Trash2, 
  Download, 
  ImageIcon,
  Loader2
} from 'lucide-react';
import { PhotoGallery } from './PhotoGallery';
import { useUploadVeiculoFoto, useDeleteVeiculoFoto } from '@/hooks/useVeiculo';
import { toast } from 'sonner';

interface Photo {
  name: string;
  url: string;
  size: number;
  lastModified: string;
}

interface PhotoManagerProps {
  veiculoId: string;
  photos: Photo[];
  isLoading?: boolean;
}

export function PhotoManager({ veiculoId, photos, isLoading }: PhotoManagerProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadVeiculoFoto();
  const deleteMutation = useDeleteVeiculoFoto();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} não é uma imagem válida`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name} é muito grande (máximo 5MB)`);
        return;
      }

      uploadMutation.mutate({ veiculoId, file });
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const togglePhotoSelection = (photoName: string) => {
    const newSelection = new Set(selectedPhotos);
    if (newSelection.has(photoName)) {
      newSelection.delete(photoName);
    } else {
      newSelection.add(photoName);
    }
    setSelectedPhotos(newSelection);
  };

  const deleteSelectedPhotos = () => {
    if (selectedPhotos.size === 0) return;

    const confirmMessage = `Tem certeza que deseja excluir ${selectedPhotos.size} foto(s)?`;
    if (!confirm(confirmMessage)) return;

    selectedPhotos.forEach(photoName => {
      deleteMutation.mutate({ veiculoId, fileName: photoName });
    });

    setSelectedPhotos(new Set());
  };

  const downloadPhoto = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Carregando fotos...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Gerenciar Fotos</h3>
            <span className="text-sm text-muted-foreground">
              ({photos.length} foto{photos.length !== 1 ? 's' : ''})
            </span>
          </div>

          <div className="flex gap-2">
            {selectedPhotos.size > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={deleteSelectedPhotos}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Excluir ({selectedPhotos.size})
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Adicionar Fotos
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />

        {photos.length === 0 ? (
          <div className="bg-muted/50 border-2 border-dashed border-border rounded-lg p-8 text-center">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Nenhuma foto adicionada ainda</p>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
            >
              <Upload className="h-4 w-4 mr-2" />
              Adicionar Primeira Foto
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
                key={photo.name}
                className={`relative group aspect-square bg-muted/50 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedPhotos.has(photo.name) 
                    ? 'border-primary shadow-lg' 
                    : 'border-transparent hover:border-border'
                }`}
                onClick={() => togglePhotoSelection(photo.name)}
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadPhoto(photo.url, photo.name);
                    }}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>

                {selectedPhotos.has(photo.name) && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                      ✓
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}