import React, { useState, useRef, useEffect, forwardRef } from 'react';
import {
  generateOptimizedImageUrl,
  generateSrcSet,
  generateSizes,
  generateBlurPlaceholder,
  trackImageLoad,
  getBestImageFormat
} from '../../utils/imageOptimization';
import { useIntersectionObserver, usePerformanceConfig } from '../../hooks/usePerformance';
import { cn } from '../../utils/cn';

interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes'> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: 'low' | 'medium' | 'high';
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
  lazy?: boolean;
  placeholder?: boolean;
  placeholderColor?: string;
  responsive?: boolean;
  breakpoints?: Array<{ minWidth?: number; maxWidth?: number; size: string }>;
  widths?: number[];
  priority?: boolean;
  onLoadStart?: () => void;
  onLoadComplete?: () => void;
  onError?: (error: Event) => void;
  fallbackSrc?: string;
  className?: string;
}

const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>((
  {
    src,
    alt,
    width,
    height,
    quality,
    format = 'auto',
    lazy = true,
    placeholder = true,
    placeholderColor = '#f3f4f6',
    responsive = true,
    breakpoints,
    widths = [320, 640, 768, 1024, 1280, 1920],
    priority = false,
    onLoadStart,
    onLoadComplete,
    onError,
    fallbackSrc,
    className,
    ...props
  },
  ref
) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [bestFormat, setBestFormat] = useState<string>('jpeg');
  const loadStartTime = useRef<number>(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const config = usePerformanceConfig();
  
  // Usar intersection observer apenas se lazy loading estiver habilitado
  const { elementRef, isIntersecting } = useIntersectionObserver({
    rootMargin: '50px',
    threshold: 0.1
  });

  // Determinar se deve carregar a imagem
  const shouldLoad = !lazy || priority || isIntersecting;

  // Configuração final baseada na performance do dispositivo
  const finalQuality = quality || config.imageQuality;
  const finalFormat = format === 'auto' ? bestFormat : format;

  // Detectar melhor formato suportado
  useEffect(() => {
    if (format === 'auto') {
      getBestImageFormat().then(setBestFormat);
    }
  }, [format]);

  // Gerar URLs otimizadas
  useEffect(() => {
    if (!shouldLoad || !src) return;

    const imageConfig = {
      quality: finalQuality,
      format: finalFormat as 'webp' | 'jpeg' | 'png' | 'auto',
      lazy,
      placeholder
    };

    const optimizedSrc = generateOptimizedImageUrl(
      src,
      width,
      height,
      imageConfig
    );

    setCurrentSrc(optimizedSrc);
  }, [shouldLoad, src, width, height, finalQuality, finalFormat, lazy, placeholder]);

  // Gerar srcSet para imagens responsivas
  const srcSet = responsive && shouldLoad ? generateSrcSet(
    src,
    widths,
    {
      quality: finalQuality,
      format: finalFormat as 'webp' | 'jpeg' | 'png' | 'auto'
    }
  ) : undefined;

  // Gerar sizes attribute
  const sizes = responsive && breakpoints ? generateSizes(breakpoints) : undefined;

  // Placeholder blur
  const placeholderSrc = placeholder ? generateBlurPlaceholder(
    width || 40,
    height || 40,
    placeholderColor
  ) : undefined;

  // Handlers de carregamento
  const handleLoadStart = () => {
    loadStartTime.current = performance.now();
    onLoadStart?.();
  };

  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
    
    // Rastrear métricas de performance
    if (loadStartTime.current > 0) {
      trackImageLoad(currentSrc, loadStartTime.current);
    }
    
    onLoadComplete?.();
  };

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsError(true);
    
    // Tentar fallback se disponível
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setIsError(false);
      return;
    }
    
    onError?.(event.nativeEvent);
  };

  // Combinar refs
  const combinedRef = (node: HTMLImageElement | null) => {
    imgRef.current = node;
    elementRef.current = node;
    
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  // Classes CSS para transições e estados
  const imageClasses = cn(
    'transition-all duration-300 ease-in-out',
    {
      'blur-sm': placeholder && !isLoaded && !isError,
      'opacity-0': !isLoaded && !placeholder,
      'opacity-100': isLoaded || placeholder,
      'filter grayscale': isError
    },
    className
  );

  // Se não deve carregar ainda, mostrar apenas placeholder
  if (!shouldLoad) {
    return (
      <div
        ref={elementRef}
        className={cn(
          'bg-gray-200 animate-pulse',
          className
        )}
        style={{
          width: width ? `${width}px` : '100%',
          height: height ? `${height}px` : 'auto',
          aspectRatio: width && height ? `${width}/${height}` : undefined
        }}
        aria-label={`Loading ${alt}`}
      />
    );
  }

  return (
    <>
      {/* Preload para imagens prioritárias */}
      {priority && currentSrc && (
        <link
          rel="preload"
          as="image"
          href={currentSrc}
          {...(srcSet && { imageSrcSet: srcSet })}
          {...(sizes && { imageSizes: sizes })}
        />
      )}
      
      <img
        ref={combinedRef}
        src={isLoaded || !placeholder ? currentSrc : placeholderSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={lazy && !priority ? 'lazy' : 'eager'}
        decoding={priority ? 'sync' : 'async'}
        onLoadStart={handleLoadStart}
        onLoad={handleLoad}
        onError={handleError}
        className={imageClasses}
        {...props}
      />
    </>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;

// Hook para usar imagem otimizada
export function useOptimizedImage(
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'low' | 'medium' | 'high';
    format?: 'webp' | 'jpeg' | 'png' | 'auto';
  } = {}
) {
  const [optimizedSrc, setOptimizedSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const config = usePerformanceConfig();

  useEffect(() => {
    if (!src) {
      setOptimizedSrc('');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const imageConfig = {
      quality: options.quality || config.imageQuality,
      format: options.format || 'auto',
      lazy: false,
      placeholder: false
    };

    try {
      const optimized = generateOptimizedImageUrl(
        src,
        options.width,
        options.height,
        imageConfig
      );
      
      setOptimizedSrc(optimized);
      setIsLoading(false);
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
    }
  }, [src, options.width, options.height, options.quality, options.format, config.imageQuality]);

  return {
    src: optimizedSrc,
    isLoading,
    error
  };
}

// Componente para background image otimizada
interface OptimizedBackgroundProps {
  src: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  lazy?: boolean;
  quality?: 'low' | 'medium' | 'high';
  format?: 'webp' | 'jpeg' | 'png' | 'auto';
}

export const OptimizedBackground: React.FC<OptimizedBackgroundProps> = ({
  src,
  children,
  className,
  style,
  lazy = true,
  quality,
  format = 'auto'
}) => {
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const elementRef = useRef<HTMLDivElement>(null);
  const { isIntersecting } = useIntersectionObserver();
  const config = usePerformanceConfig();

  const shouldLoad = !lazy || isIntersecting;

  useEffect(() => {
    if (!shouldLoad || !src) return;

    const imageConfig = {
      quality: quality || config.imageQuality,
      format: format === 'auto' ? 'webp' : format,
      lazy: false,
      placeholder: false
    };

    const optimizedSrc = generateOptimizedImageUrl(src, undefined, undefined, imageConfig);
    setBackgroundImage(`url(${optimizedSrc})`);
  }, [shouldLoad, src, quality, format, config.imageQuality]);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        ...style,
        backgroundImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {children}
    </div>
  );
};