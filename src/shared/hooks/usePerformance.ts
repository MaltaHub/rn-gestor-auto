import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { debounce, throttle, performanceMonitor, getPerformanceConfig } from '../utils/performance';

/**
 * Hook para debounce de valores
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook para throttle de callbacks
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const throttledCallback = useMemo(
    () => throttle(callback, delay),
    [callback, delay]
  );

  return throttledCallback;
}

/**
 * Hook para debounce de callbacks
 */
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  immediate = false
): T {
  const debouncedCallback = useMemo(
    () => debounce(callback, delay, immediate),
    [callback, delay, immediate]
  );

  return debouncedCallback;
}

/**
 * Hook para memoização com dependências customizadas
 */
export function useDeepMemo<T>(
  factory: () => T,
  deps: any[]
): T {
  const ref = useRef<{ deps: any[]; value: T }>();

  if (!ref.current || !shallowEqual(ref.current.deps, deps)) {
    ref.current = {
      deps,
      value: factory()
    };
  }

  return ref.current.value;
}

function shallowEqual(a: any[], b: any[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, index) => val === b[index]);
}

/**
 * Hook para intersection observer (lazy loading)
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);
  const elementRef = useRef<Element | null>(null);

  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
    ...options
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
      },
      defaultOptions
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [defaultOptions.root, defaultOptions.rootMargin, defaultOptions.threshold]);

  return { elementRef, isIntersecting, entry };
}

/**
 * Hook para virtual scrolling
 */
interface UseVirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  totalItems: number;
}

export function useVirtualScroll({
  itemHeight,
  containerHeight,
  overscan = 5,
  totalItems
}: UseVirtualScrollOptions) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLElement | null>(null);

  const handleScroll = useThrottle(
    useCallback((e: Event) => {
      const target = e.target as HTMLElement;
      setScrollTop(target.scrollTop);
    }, []),
    16 // ~60fps
  );

  useEffect(() => {
    const element = scrollElementRef.current;
    if (!element) return;

    element.addEventListener('scroll', handleScroll, { passive: true });
    return () => element.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const virtualItems = useMemo(() => {
    const visibleItemsCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      totalItems - 1,
      startIndex + visibleItemsCount + overscan * 2
    );

    const items = [];
    for (let i = startIndex; i <= endIndex; i++) {
      items.push({
        index: i,
        offsetTop: i * itemHeight
      });
    }

    return {
      items,
      startIndex,
      endIndex,
      totalHeight: totalItems * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, totalItems]);

  return {
    scrollElementRef,
    virtualItems,
    scrollTop
  };
}

/**
 * Hook para medição de performance de componentes
 */
export function usePerformanceMeasure(name: string, enabled = true) {
  const renderCount = useRef(0);
  const mountTime = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    mountTime.current = performance.now();
    performanceMonitor.startMeasure(`${name}-mount`);

    return () => {
      performanceMonitor.endMeasure(`${name}-mount`);
    };
  }, [name, enabled]);

  useEffect(() => {
    if (!enabled) return;

    renderCount.current++;
    performanceMonitor.startMeasure(`${name}-render-${renderCount.current}`);

    const timeoutId = setTimeout(() => {
      performanceMonitor.endMeasure(`${name}-render-${renderCount.current}`);
    }, 0);

    return () => clearTimeout(timeoutId);
  });

  return {
    renderCount: renderCount.current,
    getMountDuration: () => {
      return mountTime.current ? performance.now() - mountTime.current : 0;
    },
    getMetrics: () => performanceMonitor.getMetrics(name)
  };
}

/**
 * Hook para configuração adaptativa de performance
 */
export function usePerformanceConfig() {
  const [config] = useState(() => getPerformanceConfig());
  return config;
}

/**
 * Hook para preload de recursos
 */
export function usePreload() {
  const preloadedResources = useRef(new Set<string>());
  const config = usePerformanceConfig();

  const preloadImage = useCallback(
    (src: string): Promise<void> => {
      if (!config.enablePreload || preloadedResources.current.has(src)) {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          preloadedResources.current.add(src);
          resolve();
        };
        img.onerror = reject;
        img.src = src;
      });
    },
    [config.enablePreload]
  );

  const preloadScript = useCallback(
    (src: string): Promise<void> => {
      if (!config.enablePreload || preloadedResources.current.has(src)) {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'script';
        link.href = src;
        link.onload = () => {
          preloadedResources.current.add(src);
          resolve();
        };
        link.onerror = reject;
        document.head.appendChild(link);
      });
    },
    [config.enablePreload]
  );

  const preloadStyle = useCallback(
    (href: string): Promise<void> => {
      if (!config.enablePreload || preloadedResources.current.has(href)) {
        return Promise.resolve();
      }

      return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = href;
        link.onload = () => {
          preloadedResources.current.add(href);
          resolve();
        };
        link.onerror = reject;
        document.head.appendChild(link);
      });
    },
    [config.enablePreload]
  );

  return {
    preloadImage,
    preloadScript,
    preloadStyle,
    isPreloaded: (src: string) => preloadedResources.current.has(src)
  };
}

/**
 * Hook para otimização de re-renders com shallow comparison
 */
export function useShallowMemo<T extends Record<string, any>>(
  obj: T
): T {
  const ref = useRef<T>(obj);

  const isEqual = useMemo(() => {
    const current = ref.current;
    const keys1 = Object.keys(current);
    const keys2 = Object.keys(obj);

    if (keys1.length !== keys2.length) {
      return false;
    }

    for (const key of keys1) {
      if (current[key] !== obj[key]) {
        return false;
      }
    }

    return true;
  }, [obj]);

  if (!isEqual) {
    ref.current = obj;
  }

  return ref.current;
}

/**
 * Hook para batch de atualizações
 */
export function useBatchUpdates() {
  const updates = useRef<(() => void)[]>([]);
  const isScheduled = useRef(false);

  const addUpdate = useCallback((update: () => void) => {
    updates.current.push(update);

    if (!isScheduled.current) {
      isScheduled.current = true;
      requestAnimationFrame(() => {
        const currentUpdates = [...updates.current];
        updates.current = [];
        isScheduled.current = false;

        currentUpdates.forEach(update => {
          try {
            update();
          } catch (error) {
            console.error('Erro ao executar update em batch:', error);
          }
        });
      });
    }
  }, []);

  return { addUpdate };
}

/**
 * Hook para detectar mudanças de tamanho de elemento
 */
export function useResizeObserver<T extends Element>(
  callback: (entry: ResizeObserverEntry) => void
) {
  const elementRef = useRef<T | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        callback(entry);
      }
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [callback]);

  return elementRef;
}

/**
 * Hook para idle callback (execução em tempo ocioso)
 */
export function useIdleCallback(
  callback: () => void,
  deps: any[] = []
) {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(callback);
      return () => cancelIdleCallback(id);
    } else {
      // Fallback para navegadores que não suportam requestIdleCallback
      const id = setTimeout(callback, 0);
      return () => clearTimeout(id);
    }
  }, deps);
}

/**
 * Hook para controle de FPS
 */
export function useFPS() {
  const [fps, setFPS] = useState(0);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animationId: number;

    const updateFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime.current;

      if (deltaTime >= 1000) {
        const currentFPS = Math.round((frameCount.current * 1000) / deltaTime);
        setFPS(currentFPS);
        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      animationId = requestAnimationFrame(updateFPS);
    };

    animationId = requestAnimationFrame(updateFPS);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return fps;
}

/**
 * Hook para monitoramento de memória (se suportado)
 */
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);

  useEffect(() => {
    const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryInfo({
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000); // Atualizar a cada 5 segundos

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}