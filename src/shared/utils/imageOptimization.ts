/**
 * Utilitários para otimização de imagens e assets
 */

// Tipos para configuração de imagens
interface ImageConfig {
  quality: 'low' | 'medium' | 'high';
  format: 'webp' | 'jpeg' | 'png' | 'auto';
  lazy: boolean;
  placeholder: boolean;
  sizes?: string;
}

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  config?: Partial<ImageConfig>;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// Configuração padrão baseada na performance do dispositivo
const getDefaultImageConfig = (): ImageConfig => {
  const isLowEnd = isLowEndDevice();
  
  return {
    quality: isLowEnd ? 'low' : 'high',
    format: 'auto',
    lazy: true,
    placeholder: true
  };
};

// Função para detectar dispositivos com baixa performance
function isLowEndDevice(): boolean {
  const cores = navigator.hardwareConcurrency || 1;
  const memory = (navigator as any).deviceMemory || 4;
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  return cores < 4 || memory < 4 || (isMobile && cores < 2);
}

// Função para gerar URLs otimizadas de imagem
export function generateOptimizedImageUrl(
  src: string,
  width?: number,
  height?: number,
  config: Partial<ImageConfig> = {}
): string {
  const finalConfig = { ...getDefaultImageConfig(), ...config };
  
  // Se a imagem já é uma URL completa, retornar como está
  if (src.startsWith('http') || src.startsWith('data:')) {
    return src;
  }
  
  // Para imagens locais, aplicar otimizações
  const params = new URLSearchParams();
  
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  
  // Configurar qualidade
  const qualityMap = {
    low: '60',
    medium: '80',
    high: '95'
  };
  params.set('q', qualityMap[finalConfig.quality]);
  
  // Configurar formato
  if (finalConfig.format !== 'auto') {
    params.set('f', finalConfig.format);
  }
  
  const queryString = params.toString();
  return queryString ? `${src}?${queryString}` : src;
}

// Função para gerar srcSet responsivo
export function generateSrcSet(
  src: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1920],
  config: Partial<ImageConfig> = {}
): string {
  return widths
    .map(width => {
      const optimizedUrl = generateOptimizedImageUrl(src, width, undefined, config);
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
}

// Função para gerar sizes attribute
export function generateSizes(
  breakpoints: Array<{ minWidth?: number; maxWidth?: number; size: string }>
): string {
  return breakpoints
    .map(bp => {
      if (bp.minWidth && bp.maxWidth) {
        return `(min-width: ${bp.minWidth}px) and (max-width: ${bp.maxWidth}px) ${bp.size}`;
      } else if (bp.minWidth) {
        return `(min-width: ${bp.minWidth}px) ${bp.size}`;
      } else if (bp.maxWidth) {
        return `(max-width: ${bp.maxWidth}px) ${bp.size}`;
      }
      return bp.size;
    })
    .join(', ');
}

// Cache para imagens pré-carregadas
const imageCache = new Map<string, HTMLImageElement>();

// Função para pré-carregar imagens
export function preloadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    
    img.onerror = reject;
    img.src = src;
  });
}

// Função para pré-carregar múltiplas imagens
export function preloadImages(sources: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(sources.map(preloadImage));
}

// Função para gerar placeholder blur
export function generateBlurPlaceholder(
  width: number = 40,
  height: number = 40,
  color: string = '#f3f4f6'
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Criar gradiente simples
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, adjustBrightness(color, -10));
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
}

// Função auxiliar para ajustar brilho da cor
function adjustBrightness(color: string, amount: number): string {
  const usePound = color[0] === '#';
  const col = usePound ? color.slice(1) : color;
  
  const num = parseInt(col, 16);
  let r = (num >> 16) + amount;
  let g = (num >> 8 & 0x00FF) + amount;
  let b = (num & 0x0000FF) + amount;
  
  r = r > 255 ? 255 : r < 0 ? 0 : r;
  g = g > 255 ? 255 : g < 0 ? 0 : g;
  b = b > 255 ? 255 : b < 0 ? 0 : b;
  
  return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
}

// Intersection Observer para lazy loading
let imageObserver: IntersectionObserver | null = null;

function getImageObserver(): IntersectionObserver {
  if (!imageObserver) {
    imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              imageObserver?.unobserve(img);
              
              // Remover placeholder quando a imagem carregar
              img.onload = () => {
                img.classList.remove('blur-sm');
                img.classList.add('transition-all', 'duration-300');
              };
            }
          }
        });
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
      }
    );
  }
  
  return imageObserver;
}

// Função para aplicar lazy loading a uma imagem
export function applyLazyLoading(img: HTMLImageElement, src: string): void {
  img.dataset.src = src;
  img.src = generateBlurPlaceholder();
  img.classList.add('blur-sm', 'transition-all', 'duration-300');
  
  getImageObserver().observe(img);
}

// Função para otimizar imagens de fundo
export function optimizeBackgroundImage(
  element: HTMLElement,
  src: string,
  config: Partial<ImageConfig> = {}
): void {
  const finalConfig = { ...getDefaultImageConfig(), ...config };
  
  if (finalConfig.lazy) {
    // Aplicar lazy loading para background images
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const optimizedSrc = generateOptimizedImageUrl(src, undefined, undefined, config);
            element.style.backgroundImage = `url(${optimizedSrc})`;
            observer.unobserve(element);
          }
        });
      },
      { rootMargin: '50px' }
    );
    
    observer.observe(element);
  } else {
    const optimizedSrc = generateOptimizedImageUrl(src, undefined, undefined, config);
    element.style.backgroundImage = `url(${optimizedSrc})`;
  }
}

// Função para detectar suporte a WebP
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
}

// Função para detectar suporte a AVIF
export function supportsAVIF(): Promise<boolean> {
  return new Promise((resolve) => {
    const avif = new Image();
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2);
    };
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
}

// Função para escolher o melhor formato de imagem
export async function getBestImageFormat(): Promise<'avif' | 'webp' | 'jpeg'> {
  if (await supportsAVIF()) return 'avif';
  if (await supportsWebP()) return 'webp';
  return 'jpeg';
}

// Função para comprimir imagem no cliente (para uploads)
export function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    if (!ctx) {
      reject(new Error('Canvas context not available'));
      return;
    }
    
    img.onload = () => {
      // Calcular dimensões mantendo aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Desenhar imagem redimensionada
      ctx.drawImage(img, 0, 0, width, height);
      
      // Converter para blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

// Função para calcular o tamanho ideal da imagem baseado no container
export function calculateOptimalImageSize(
  containerWidth: number,
  containerHeight: number,
  devicePixelRatio: number = window.devicePixelRatio || 1
): { width: number; height: number } {
  const width = Math.ceil(containerWidth * devicePixelRatio);
  const height = Math.ceil(containerHeight * devicePixelRatio);
  
  return { width, height };
}

// Função para monitorar performance de carregamento de imagens
interface ImageLoadMetrics {
  src: string;
  loadTime: number;
  fileSize?: number;
  fromCache: boolean;
}

const imageMetrics: ImageLoadMetrics[] = [];

export function trackImageLoad(
  src: string,
  startTime: number,
  fromCache: boolean = false
): void {
  const loadTime = performance.now() - startTime;
  
  imageMetrics.push({
    src,
    loadTime,
    fromCache
  });
  
  // Manter apenas as últimas 100 métricas
  if (imageMetrics.length > 100) {
    imageMetrics.shift();
  }
}

export function getImageLoadMetrics(): {
  averageLoadTime: number;
  cacheHitRate: number;
  totalImages: number;
} {
  if (imageMetrics.length === 0) {
    return {
      averageLoadTime: 0,
      cacheHitRate: 0,
      totalImages: 0
    };
  }
  
  const totalLoadTime = imageMetrics.reduce((sum, metric) => sum + metric.loadTime, 0);
  const cacheHits = imageMetrics.filter(metric => metric.fromCache).length;
  
  return {
    averageLoadTime: totalLoadTime / imageMetrics.length,
    cacheHitRate: (cacheHits / imageMetrics.length) * 100,
    totalImages: imageMetrics.length
  };
}

// Limpar cache de imagens quando necessário
export function clearImageCache(): void {
  imageCache.clear();
  imageMetrics.length = 0;
}

// Função para estimar o tamanho do arquivo baseado nas dimensões
export function estimateImageFileSize(
  width: number,
  height: number,
  format: 'jpeg' | 'png' | 'webp' = 'jpeg',
  quality: number = 0.8
): number {
  const pixels = width * height;
  
  // Estimativas baseadas em dados empíricos
  const bytesPerPixel = {
    jpeg: 0.5 * quality + 0.1,
    png: 3,
    webp: 0.4 * quality + 0.05
  };
  
  return Math.round(pixels * bytesPerPixel[format]);
}