import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

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

  const nextPhoto = () => {
    if (selectedPhoto !== null && selectedPhoto < photos.length - 1) {
      setSelectedPhoto(selectedPhoto + 1);
    }
  };

  const prevPhoto = () => {
    if (selectedPhoto !== null && selectedPhoto > 0) {
      setSelectedPhoto(selectedPhoto - 1);
    }
  };

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

      <Dialog open={selectedPhoto !== null} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl p-0 bg-background/95 backdrop-blur">
          {selectedPhoto !== null && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-background/80 hover:bg-background"
                onClick={() => setSelectedPhoto(null)}
              >
                <X className="h-4 w-4" />
              </Button>

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

              <div className="aspect-video max-h-[80vh] flex items-center justify-center p-4">
                <img
                  src={photos[selectedPhoto].url}
                  alt={`Foto ${selectedPhoto + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
              </div>

              <div className="absolute bottom-4 left-4 bg-background/80 px-3 py-1 rounded-md">
                <span className="text-sm text-foreground">
                  {selectedPhoto + 1} de {photos.length}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}