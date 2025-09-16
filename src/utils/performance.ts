import { lazy, ComponentType } from 'react';

/**
 * Utilitários para otimização de performance
 */

// Lazy loading de componentes com retry
export const lazyWithRetry = <T extends ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) => {
  return lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // Refresh the page once to get the latest version
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        return window.location.reload();
      }
      // The page has already been reloaded
      // Probably still cannot load the chunk, let the error propagate
      throw error;
    }
  });
};

// Debounce function para otimizar chamadas frequentes
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function para limitar execuções
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Memoização simples para funções
export const memoize = <T extends (...args: any[]) => any>(
  fn: T
): T => {
  const cache = new Map();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Intersection Observer para lazy loading de imagens
export const createImageObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) => {
  if (!('IntersectionObserver' in window)) {
    // Fallback para navegadores que não suportam IntersectionObserver
    return null;
  }

  return new IntersectionObserver(callback, {
    rootMargin: '50px 0px',
    threshold: 0.01,
    ...options,
  });
};

// Preload de recursos críticos
export const preloadResource = (href: string, as: string) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
};

// Prefetch de recursos para navegação futura
export const prefetchResource = (href: string) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  document.head.appendChild(link);
};

// Otimização de imagens
export const optimizeImageUrl = (
  url: string,
  width?: number,
  height?: number,
  quality = 80
) => {
  if (!url) return '';
  
  // Se for uma URL do Supabase Storage, adicionar parâmetros de otimização
  if (url.includes('supabase')) {
    const params = new URLSearchParams();
    if (width) params.append('width', width.toString());
    if (height) params.append('height', height.toString());
    params.append('quality', quality.toString());
    
    return `${url}?${params.toString()}`;
  }
  
  return url;
};

// Verificar se o dispositivo tem conexão lenta
export const isSlowConnection = (): boolean => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    return connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g';
  }
  return false;
};

// Verificar se o dispositivo tem pouca memória
export const isLowMemoryDevice = (): boolean => {
  if ('deviceMemory' in navigator) {
    return (navigator as any).deviceMemory < 4; // Menos de 4GB
  }
  return false;
};

// Configurações adaptativas baseadas no dispositivo
export const getAdaptiveConfig = () => {
  const isSlowConn = isSlowConnection();
  const isLowMem = isLowMemoryDevice();
  
  return {
    // Reduzir qualidade de imagens em conexões lentas
    imageQuality: isSlowConn ? 60 : 80,
    // Reduzir número de itens por página em dispositivos com pouca memória
    itemsPerPage: isLowMem ? 10 : 20,
    // Desabilitar animações em dispositivos lentos
    enableAnimations: !isSlowConn && !isLowMem,
    // Reduzir frequência de atualizações
    updateInterval: isSlowConn ? 10000 : 5000,
  };
};

// Bundle splitting helpers
export const loadChunk = async (chunkName: string) => {
  try {
    switch (chunkName) {
      case 'dashboard':
        return await import('../shared/components/Dashboard');
      case 'vehicle':
        return await import('../shared/components/Vehicle');
      case 'customer':
        return await import('../shared/components/Customer');
      case 'ads':
        return await import('../shared/components/Ads');
      case 'analytics':
        return await import('../shared/components/Analytics');
      case 'reports':
        return await import('../shared/components/Reports');
      default:
        throw new Error(`Unknown chunk: ${chunkName}`);
    }
  } catch (error) {
    console.error(`Failed to load chunk ${chunkName}:`, error);
    throw error;
  }
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Web Vitals tracking
export const trackWebVitals = () => {
  if ('web-vitals' in window) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }
};

// Service Worker registration
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('SW registered: ', registration);
      return registration;
    } catch (registrationError) {
      console.log('SW registration failed: ', registrationError);
    }
  }
};

// Cache management
export const clearAppCache = async () => {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
  }
  
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Reload page
  window.location.reload();
};