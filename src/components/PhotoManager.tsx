import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Upload, 
  Trash2, 
  Download, 
  ImageIcon,
  Loader2,
  Eye,
  X,
  Star,
  StarOff,
  GripVertical
} from 'lucide-react';
import { PhotoGallery } from './PhotoGallery';
import { SortablePhotoItem } from './SortablePhotoItem';
import { useUploadVeiculoFoto, useDeleteVeiculoFoto, useUpdatePhotosOrder, useSetCoverPhoto } from '@/hooks/useVeiculo';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Photo {
  name: string;
  url: string;
  size: number;
  lastModified: string;
  ordem: number;
  isCapa: boolean;
}

interface PhotoManagerProps {
  veiculoId: string;
  photos: Photo[];
  isLoading?: boolean;
}

export function PhotoManager({ veiculoId, photos, isLoading }: PhotoManagerProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [previewPhotos, setPreviewPhotos] = useState<File[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadVeiculoFoto();
  const deleteMutation = useDeleteVeiculoFoto();
  const updateOrderMutation = useUpdatePhotosOrder();
  const setCoverMutation = useSetCoverPhoto();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const processFiles = useCallback((files: FileList | File[]) => {
    const validFiles: File[] = [];
    const newPreviews: File[] = [];

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} não é uma imagem válida`);
        return;
      }

      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`${file.name} é muito grande (máximo 5MB)`);
        return;
      }

      validFiles.push(file);
      newPreviews.push(file);
    });

    if (validFiles.length > 0) {
      setPreviewPhotos(prev => [...prev, ...newPreviews]);
      
      // Upload files sequentially to avoid overwhelming the server
      validFiles.forEach((file, index) => {
        setTimeout(() => {
          const currentMaxOrder = photos.length > 0 ? Math.max(...photos.map(p => p.ordem)) : -1;
          const nextOrder = currentMaxOrder + 1 + index;
          uploadMutation.mutate({ veiculoId, file }, {
            onSuccess: (fileName) => {
              setPreviewPhotos(prev => prev.filter(p => p !== file));
              // Create metadata entry with order
              updateOrderMutation.mutate({
                veiculoId,
                photos: [{ name: fileName, ordem: nextOrder }]
              });
            },
            onError: () => {
              setPreviewPhotos(prev => prev.filter(p => p !== file));
            }
          });
        }, index * 100); // Stagger uploads by 100ms
      });
    }
  }, [veiculoId, uploadMutation, updateOrderMutation]); // Removed photos dependency to prevent re-renders

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    processFiles(files);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [processFiles]);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex(photo => photo.name === active.id);
      const newIndex = photos.findIndex(photo => photo.name === over.id);

      const newPhotos = arrayMove(photos, oldIndex, newIndex);
      const updatedPhotos = newPhotos.map((photo, index) => ({
        name: photo.name,
        ordem: index
      }));

      updateOrderMutation.mutate({
        veiculoId,
        photos: updatedPhotos
      });
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

  const handleSetCover = (fileName: string) => {
    setCoverMutation.mutate({ veiculoId, fileName });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-9 w-32" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
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
            {photos.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGallery(true)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Galeria
              </Button>
            )}

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
              disabled={uploadMutation.isPending || previewPhotos.length > 0}
            >
              {(uploadMutation.isPending || previewPhotos.length > 0) ? (
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
          <div 
            className={`bg-muted/50 border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">
              {isDragOver ? 'Solte as fotos aqui' : 'Nenhuma foto adicionada ainda'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Arraste fotos para cá ou clique para selecionar
            </p>
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
          <div className="space-y-4">
            {/* Preview photos (being uploaded) */}
            {previewPhotos.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Enviando...</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {previewPhotos.map((file, index) => (
                    <div key={index} className="relative aspect-square bg-muted/50 rounded-lg overflow-hidden border border-dashed">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover opacity-50"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uploaded photos */}
            <div 
              className={`transition-colors rounded-lg ${
                isDragOver ? 'bg-primary/5 border-2 border-dashed border-primary p-4' : ''
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={photos.map(p => p.name)} strategy={verticalListSortingStrategy}>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                      <SortablePhotoItem
                        key={photo.name}
                        photo={photo}
                        isSelected={selectedPhotos.has(photo.name)}
                        onToggleSelection={togglePhotoSelection}
                        onDownload={downloadPhoto}
                        onSetCover={handleSetCover}
                        disabled={updateOrderMutation.isPending || setCoverMutation.isPending}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
              
              {isDragOver && (
                <div className="text-center py-8">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-primary font-medium">Solte as fotos para fazer upload</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Photo Gallery Modal */}
        {showGallery && (
          <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Galeria de Fotos</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowGallery(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(100vh-80px)]">
              <PhotoGallery photos={photos} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}