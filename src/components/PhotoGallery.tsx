import { useState, useCallback, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface Photo {
  name: string;
  url: string;
  size: number;
  lastModified: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  className?: string;
}

export function PhotoGallery({ photos, className = "" }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);

  const nextPhoto = useCallback(() => {
    if (selectedPhoto !== null && selectedPhoto < photos.length - 1) {
      setSelectedPhoto(selectedPhoto + 1);
      setZoom(1);
    }
  }, [selectedPhoto, photos.length]);

  const prevPhoto = useCallback(() => {
    if (selectedPhoto !== null && selectedPhoto > 0) {
      setSelectedPhoto(selectedPhoto - 1);
      setZoom(1);
    }
  }, [selectedPhoto]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedPhoto === null) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          prevPhoto();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextPhoto();
          break;
        case 'Escape':
          e.preventDefault();
          setSelectedPhoto(null);
          setZoom(1);
          break;
        case '+':
        case '=':
          e.preventDefault();
          setZoom(prev => Math.min(prev + 0.25, 3));
          break;
        case '-':
          e.preventDefault();
          setZoom(prev => Math.max(prev - 0.25, 0.5));
          break;
      }
    };

    if (selectedPhoto !== null) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedPhoto, nextPhoto, prevPhoto]);

  const downloadPhoto = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (photos.length === 0) {
    return (
      <div className={`bg-muted/50 border-2 border-dashed border-border rounded-lg p-8 text-center ${className}`}>
        <p className="text-muted-foreground">Nenhuma foto disponível</p>
      </div>
    );
  }

  return (
    <>
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 ${className}`}>
        {photos.map((photo, index) => (
          <div
            key={photo.name}
            className="aspect-square bg-muted/50 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setSelectedPhoto(index)}
          >
            <img
              src={photo.url}
              alt={`Foto ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      <Dialog open={selectedPhoto !== null} onOpenChange={() => { setSelectedPhoto(null); setZoom(1); }}>
        <DialogContent className="max-w-6xl max-h-[95vh] p-0 bg-background/95 backdrop-blur overflow-hidden">
          {selectedPhoto !== null && (
            <div className="relative">
              <div className="absolute top-4 right-4 z-10 flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-background/80 hover:bg-background"
                  onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-background/80 hover:bg-background"
                  onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.5))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-background/80 hover:bg-background"
                  onClick={() => { setSelectedPhoto(null); setZoom(1); }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {photos.length > 1 && selectedPhoto > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
                  onClick={prevPhoto}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}

              {photos.length > 1 && selectedPhoto < photos.length - 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background"
                  onClick={nextPhoto}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="absolute bottom-4 right-4 z-10 bg-background/80 hover:bg-background"
                onClick={() => downloadPhoto(photos[selectedPhoto].url, photos[selectedPhoto].name)}
              >
                <Download className="h-4 w-4" />
              </Button>

              <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
                <img
                  src={photos[selectedPhoto].url}
                  alt={`Foto ${selectedPhoto + 1}`}
                  className="rounded-lg transition-transform duration-200 cursor-grab active:cursor-grabbing"
                  style={{ 
                    transform: `scale(${zoom})`,
                    maxWidth: zoom === 1 ? '100%' : 'none',
                    maxHeight: zoom === 1 ? '100%' : 'none'
                  }}
                  onClick={() => setZoom(prev => prev === 1 ? 2 : 1)}
                  draggable={false}
                />
              </div>

              <div className="absolute bottom-4 left-4 bg-background/80 px-3 py-1 rounded-md">
                <span className="text-sm text-foreground">
                  {selectedPhoto + 1} de {photos.length} • {Math.round(zoom * 100)}%
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}