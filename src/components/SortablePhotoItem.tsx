import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Star, 
  StarOff, 
  GripVertical,
  Crown
} from 'lucide-react';

interface Photo {
  name: string;
  url: string;
  size: number;
  lastModified: string;
  ordem: number;
  isCapa: boolean;
}

interface SortablePhotoItemProps {
  photo: Photo;
  isSelected: boolean;
  onToggleSelection: (photoName: string) => void;
  onDownload: (url: string, name: string) => void;
  onSetCover: (fileName: string) => void;
  disabled?: boolean;
}

export function SortablePhotoItem({ 
  photo, 
  isSelected, 
  onToggleSelection, 
  onDownload, 
  onSetCover,
  disabled 
}: SortablePhotoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.name, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group aspect-square bg-muted/50 rounded-lg overflow-hidden border-2 transition-all ${
        isSelected 
          ? 'border-primary shadow-lg' 
          : 'border-transparent hover:border-border'
      } ${isDragging ? 'z-50' : ''}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <div className="bg-background/80 p-1 rounded">
          <GripVertical className="h-3 w-3" />
        </div>
      </div>

      {/* Cover Photo Indicator */}
      {photo.isCapa && (
        <div className="absolute top-2 left-8 z-10 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
          <Crown className="h-3 w-3" />
          Capa
        </div>
      )}

      {/* Photo */}
      <img
        src={photo.url}
        alt={photo.name}
        className="w-full h-full object-cover cursor-pointer"
        loading="lazy"
        onClick={() => onToggleSelection(photo.name)}
        draggable={false}
      />
      
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
      
      {/* Action Buttons */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <Button
          variant="secondary"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onSetCover(photo.name);
          }}
          title={photo.isCapa ? "Remover como capa" : "Definir como capa"}
        >
          {photo.isCapa ? (
            <StarOff className="h-3 w-3" />
          ) : (
            <Star className="h-3 w-3" />
          )}
        </Button>
        
        <Button
          variant="secondary"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onDownload(photo.url, photo.name);
          }}
        >
          <Download className="h-3 w-3" />
        </Button>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
          <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
            ✓
          </div>
        </div>
      )}

      {/* Order Number */}
      <div className="absolute bottom-2 left-2 bg-background/80 px-2 py-1 rounded text-xs">
        #{photo.ordem + 1}
      </div>
    </div>
  );
}