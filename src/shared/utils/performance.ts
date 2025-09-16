/**
 * Utilitários para otimização de performance
 */

/**
 * Debounce function para otimizar chamadas frequentes
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

/**
 * Throttle function para limitar execuções
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Memoização simples para funções
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
}

/**
 * Cache com TTL (Time To Live)
 */
class TTLCache<K, V> {
  private cache = new Map<K, { value: V; expiry: number }>();
  private ttl: number;

  constructor(ttlMs: number = 5 * 60 * 1000) { // 5 minutos por padrão
    this.ttl = ttlMs;
  }

  set(key: K, value: V): void {
    const expiry = Date.now() + this.ttl;
    this.cache.set(key, { value, expiry });
  }

  get(key: K): V | undefined {
    const item = this.cache.get(key);
    
    if (!item) {
      return undefined;
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    return item.value;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    // Limpar itens expirados antes de retornar o tamanho
    this.cleanup();
    return this.cache.size;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Instância global do cache TTL
 */
export const globalCache = new TTLCache<string, any>(10 * 60 * 1000); // 10 minutos

/**
 * Função para criar cache com TTL personalizado
 */
export function createTTLCache<K, V>(ttlMs: number): TTLCache<K, V> {
  return new TTLCache<K, V>(ttlMs);
}

/**
 * Intersection Observer para lazy loading de imagens
 */
export function createImageLazyLoader(options: IntersectionObserverInit = {}) {
  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      }
    });
  }, defaultOptions);

  return {
    observe: (element: Element) => observer.observe(element),
    unobserve: (element: Element) => observer.unobserve(element),
    disconnect: () => observer.disconnect()
  };
}

/**
 * Virtual scrolling para listas grandes
 */
interface VirtualScrollOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export function calculateVirtualScrollItems(
  scrollTop: number,
  totalItems: number,
  options: VirtualScrollOptions
) {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  
  const visibleItemsCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    startIndex + visibleItemsCount + overscan * 2
  );

  return {
    startIndex,
    endIndex,
    visibleItems: endIndex - startIndex + 1,
    offsetY: startIndex * itemHeight
  };
}

/**
 * Otimização de re-renders com shallow comparison
 */
export function shallowEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) {
    return true;
  }

  if (
    typeof obj1 !== 'object' ||
    obj1 === null ||
    typeof obj2 !== 'object' ||
    obj2 === null
  ) {
    return false;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key) || obj1[key] !== obj2[key]) {
      return false;
    }
  }

  return true;
}

/**
 * Batch de atualizações para evitar re-renders desnecessários
 */
class BatchUpdater {
  private updates: (() => void)[] = [];
  private isScheduled = false;

  add(update: () => void): void {
    this.updates.push(update);
    this.schedule();
  }

  private schedule(): void {
    if (!this.isScheduled) {
      this.isScheduled = true;
      
      // Usar requestAnimationFrame para otimizar performance
      requestAnimationFrame(() => {
        this.flush();
      });
    }
  }

  private flush(): void {
    const updates = [...this.updates];
    this.updates = [];
    this.isScheduled = false;
    
    updates.forEach(update => {
      try {
        update();
      } catch (error) {
        console.error('Erro ao executar update em batch:', error);
      }
    });
  }
}

export const batchUpdater = new BatchUpdater();

/**
 * Medição de performance
 */
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startMeasure(name: string): void {
    performance.mark(`${name}-start`);
  }

  endMeasure(name: string): number {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name, 'measure')[0];
    const duration = measure.duration;
    
    // Armazenar métrica
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);
    
    // Limpar marcas
    performance.clearMarks(`${name}-start`);
    performance.clearMarks(`${name}-end`);
    performance.clearMeasures(name);
    
    return duration;
  }

  getMetrics(name: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) {
      return null;
    }
    
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return { avg, min, max, count: values.length };
  }

  clearMetrics(name?: string): void {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }

  getAllMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, any> = {};
    
    for (const [name] of this.metrics) {
      const metrics = this.getMetrics(name);
      if (metrics) {
        result[name] = metrics;
      }
    }
    
    return result;
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

/**
 * Decorator para medir performance de funções
 */
export function measurePerformance(name?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const measureName = name || `${target.constructor.name}.${propertyKey}`;
    
    descriptor.value = function (...args: any[]) {
      performanceMonitor.startMeasure(measureName);
      
      try {
        const result = originalMethod.apply(this, args);
        
        // Se for uma Promise, medir quando resolver
        if (result && typeof result.then === 'function') {
          return result.finally(() => {
            performanceMonitor.endMeasure(measureName);
          });
        }
        
        performanceMonitor.endMeasure(measureName);
        return result;
      } catch (error) {
        performanceMonitor.endMeasure(measureName);
        throw error;
      }
    };
    
    return descriptor;
  };
}

/**
 * Utilitário para detectar dispositivos com baixa performance
 */
export function isLowEndDevice(): boolean {
  // Verificar número de cores do processador
  const cores = navigator.hardwareConcurrency || 1;
  
  // Verificar memória disponível (se suportado)
  const memory = (navigator as any).deviceMemory || 4;
  
  // Verificar se é um dispositivo móvel
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  // Considerar baixa performance se:
  // - Menos de 4 cores
  // - Menos de 4GB de RAM
  // - Dispositivo móvel com menos de 2 cores
  return cores < 4 || memory < 4 || (isMobile && cores < 2);
}

/**
 * Configuração adaptativa baseada na performance do dispositivo
 */
export function getPerformanceConfig() {
  const isLowEnd = isLowEndDevice();
  
  return {
    // Reduzir animações em dispositivos lentos
    enableAnimations: !isLowEnd,
    
    // Reduzir qualidade de imagens
    imageQuality: isLowEnd ? 'low' : 'high',
    
    // Ajustar tamanho de páginas
    pageSize: isLowEnd ? 10 : 20,
    
    // Reduzir overscan em virtual scrolling
    virtualScrollOverscan: isLowEnd ? 2 : 5,
    
    // Aumentar debounce em dispositivos lentos
    debounceDelay: isLowEnd ? 500 : 300,
    
    // Reduzir cache TTL
    cacheTTL: isLowEnd ? 2 * 60 * 1000 : 10 * 60 * 1000, // 2min vs 10min
    
    // Desabilitar preload em dispositivos lentos
    enablePreload: !isLowEnd
  };
}