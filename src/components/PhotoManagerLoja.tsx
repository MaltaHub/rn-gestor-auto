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
import { 
  useVeiculoLojaFotos,
  useUploadVeiculoLojaFoto, 
  useDeleteVeiculoLojaFoto, 
  useUpdateVeiculoLojaPhotosOrder, 
  useSetVeiculoLojaCoverPhoto 
} from '@/hooks/useVeiculoLojaFotos';
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

interface PhotoManagerLojaProps {
  veiculoLojaId: string;
  pasta_fotos?: string;
  className?: string;
}

interface SortablePhotoItemProps {
  photo: any;
  onDelete: (id: string, fotoNome: string) => void;
  onSetCover: (id: string) => void;
  isDeleting: boolean;
  isSettingCover: boolean;
}

function SortablePhotoItem({ 
  photo, 
  onDelete, 
  onSetCover, 
  isDeleting, 
  isSettingCover 
}: SortablePhotoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [showFullSize, setShowFullSize] = useState(false);

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="group relative border rounded-lg overflow-hidden bg-card"
      >
        <div className="aspect-video relative">
          <img
            src={photo.url}
            alt={`Foto ${photo.ordem}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          
          {/* Overlay com controles */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowFullSize(true)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onSetCover(photo.id)}
              disabled={isSettingCover}
            >
              {photo.is_capa ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
            </Button>
            
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(photo.id, photo.foto_nome)}
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Badge de capa */}
          {photo.is_capa && (
            <div className="absolute top-2 left-2">
              <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                Capa
              </div>
            </div>
          )}

          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="absolute top-2 right-2 p-1 bg-black/50 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <GripVertical className="h-4 w-4 text-white" />
          </div>
        </div>

        <div className="p-2">
          <p className="text-xs text-muted-foreground truncate">
            {photo.foto_nome.split('/').pop()}
          </p>
          <p className="text-xs text-muted-foreground">
            Ordem: {photo.ordem}
          </p>
        </div>
      </div>

      {/* Modal de visualização */}
      {showFullSize && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowFullSize(false)}>
          <div className="relative max-w-full max-h-full">
            <img
              src={photo.url}
              alt={`Foto ${photo.ordem}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-4 right-4"
              onClick={() => setShowFullSize(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}

export function PhotoManagerLoja({ veiculoLojaId, pasta_fotos, className }: PhotoManagerLojaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const { data: photos = [], isLoading } = useVeiculoLojaFotos(veiculoLojaId);
  const uploadMutation = useUploadVeiculoLojaFoto();
  const deleteMutation = useDeleteVeiculoLojaFoto();
  const updateOrderMutation = useUpdateVeiculoLojaPhotosOrder();
  const setCoverMutation = useSetVeiculoLojaCoverPhoto();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} não é uma imagem válida`);
        return;
      }

      if (file.size > 10 * 1024 * 1024) { // 10MB
        toast.error(`${file.name} é muito grande (máx: 10MB)`);
        return;
      }

      uploadMutation.mutate({
        veiculoLojaId,
        file,
        folder: pasta_fotos
      });
    });
  }, [veiculoLojaId, pasta_fotos, uploadMutation]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDelete = useCallback((id: string, fotoNome: string) => {
    deleteMutation.mutate({ id, fotoNome, veiculoLojaId });
  }, [deleteMutation, veiculoLojaId]);

  const handleSetCover = useCallback((photoId: string) => {
    setCoverMutation.mutate({ veiculoLojaId, photoId });
  }, [setCoverMutation, veiculoLojaId]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = photos.findIndex((photo) => photo.id === active.id);
      const newIndex = photos.findIndex((photo) => photo.id === over.id);

      const newPhotos = arrayMove(photos, oldIndex, newIndex);
      const photoOrders = newPhotos.map((photo, index) => ({
        id: photo.id,
        ordem: index + 1
      }));

      updateOrderMutation.mutate({ veiculoLojaId, photoOrders });
    }
  }, [photos, updateOrderMutation, veiculoLojaId]);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              <h3 className="font-semibold">Fotos da Loja</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-video rounded-lg" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              <h3 className="font-semibold">Fotos da Loja</h3>
              <span className="text-sm text-muted-foreground">
                ({photos.length})
              </span>
            </div>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadMutation.isPending}
              size="sm"
            >
              {uploadMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Upload
            </Button>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-muted-foreground/50'
            }`}
          >
            <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Arraste fotos aqui ou clique no botão Upload
            </p>
            <p className="text-xs text-muted-foreground">
              Máximo 10MB por foto • JPG, PNG, WebP
            </p>
          </div>

          {/* Photos Grid */}
          {photos.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={photos.map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="grid grid-cols-2 gap-4">
                  {photos.map((photo) => (
                    <SortablePhotoItem
                      key={photo.id}
                      photo={photo}
                      onDelete={handleDelete}
                      onSetCover={handleSetCover}
                      isDeleting={deleteMutation.isPending}
                      isSettingCover={setCoverMutation.isPending}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}

          {photos.length === 0 && (
            <div className="text-center py-8">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Nenhuma foto específica da loja
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {pasta_fotos ? 
                  'Faça upload de fotos para esta loja' :
                  'Configure uma pasta de fotos para esta loja'
                }
              </p>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
      </CardContent>
    </Card>
  );
}