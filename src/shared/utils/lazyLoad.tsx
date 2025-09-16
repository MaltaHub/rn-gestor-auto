import React, { Suspense, ComponentType, LazyExoticComponent } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

/**
 * Props para o componente de loading
 */
interface LoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Componente de loading padrão
 */
const DefaultLoading: React.FC<LoadingProps> = ({ 
  message = 'Carregando...', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-blue-600 mx-auto mb-4 ${sizeClasses[size]}`}></div>
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  );
};

/**
 * Componente de erro padrão
 */
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Erro ao carregar componente
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          {error.message || 'Ocorreu um erro inesperado'}
        </p>
        <button
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
};

/**
 * Opções para lazy loading
 */
interface LazyLoadOptions {
  loading?: ComponentType<LoadingProps>;
  error?: ComponentType<ErrorFallbackProps>;
  loadingProps?: LoadingProps;
  retryDelay?: number;
  maxRetries?: number;
}

/**
 * Função para criar componentes lazy com error boundary e loading
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  options: LazyLoadOptions = {}
): LazyExoticComponent<T> {
  const {
    loading: LoadingComponent = DefaultLoading,
    error: ErrorComponent = DefaultErrorFallback,
    loadingProps = {},
    retryDelay = 1000,
    maxRetries = 3
  } = options;

  // Criar componente lazy com retry logic
  const LazyComponent = React.lazy(() => {
    let retries = 0;
    
    const loadWithRetry = async (): Promise<{ default: T }> => {
      try {
        return await importFunc();
      } catch (error) {
        if (retries < maxRetries) {
          retries++;
          console.warn(`Tentativa ${retries} de carregar componente falhou, tentando novamente em ${retryDelay}ms...`);
          
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return loadWithRetry();
        }
        
        throw error;
      }
    };
    
    return loadWithRetry();
  });

  // Wrapper com Suspense e ErrorBoundary
  const WrappedComponent: React.FC<any> = (props) => {
    return (
      <ErrorBoundary
        FallbackComponent={ErrorComponent}
        onReset={() => {
          // Limpar cache do componente lazy para forçar reload
          // @ts-ignore - Acessar propriedade interna do React
          if (LazyComponent._payload) {
            LazyComponent._payload._status = -1;
            LazyComponent._payload._result = null;
          }
        }}
      >
        <Suspense fallback={<LoadingComponent {...loadingProps} />}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };

  // Preservar displayName para debugging
  WrappedComponent.displayName = `LazyLoad(${LazyComponent.displayName || 'Component'})`;

  return WrappedComponent as LazyExoticComponent<T>;
}

/**
 * Hook para preload de componentes lazy
 */
export function usePreload<T extends ComponentType<any>>(
  lazyComponent: LazyExoticComponent<T>
) {
  const preload = React.useCallback(() => {
    // @ts-ignore - Acessar método interno do React
    if (lazyComponent._payload && lazyComponent._payload._status === -1) {
      // @ts-ignore
      lazyComponent._payload._result();
    }
  }, [lazyComponent]);

  return preload;
}

/**
 * Componente para preload de rotas
 */
interface RoutePreloaderProps {
  routes: LazyExoticComponent<any>[];
  delay?: number;
}

export const RoutePreloader: React.FC<RoutePreloaderProps> = ({ 
  routes, 
  delay = 2000 
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      routes.forEach(route => {
        try {
          // @ts-ignore - Preload da rota
          if (route._payload && route._payload._status === -1) {
            route._payload._result();
          }
        } catch (error) {
          console.warn('Erro ao fazer preload da rota:', error);
        }
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [routes, delay]);

  return null;
};

/**
 * Utilitários para lazy loading específicos do domínio
 */
export const lazyLoadPage = (importFunc: () => Promise<{ default: ComponentType<any> }>) => {
  return lazyLoad(importFunc, {
    loadingProps: {
      message: 'Carregando página...',
      size: 'lg'
    }
  });
};

export const lazyLoadModal = (importFunc: () => Promise<{ default: ComponentType<any> }>) => {
  return lazyLoad(importFunc, {
    loadingProps: {
      message: 'Carregando modal...',
      size: 'sm'
    }
  });
};

export const lazyLoadChart = (importFunc: () => Promise<{ default: ComponentType<any> }>) => {
  return lazyLoad(importFunc, {
    loadingProps: {
      message: 'Carregando gráfico...',
      size: 'md'
    },
    retryDelay: 2000,
    maxRetries: 5
  });
};

/**
 * HOC para componentes que precisam de lazy loading
 */
export function withLazyLoading<P extends object>(
  Component: ComponentType<P>,
  options: LazyLoadOptions = {}
) {
  const LazyComponent = lazyLoad(
    () => Promise.resolve({ default: Component }),
    options
  );

  return LazyComponent;
}