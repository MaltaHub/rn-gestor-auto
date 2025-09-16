import React from 'react';
import { RefreshCw, X, Download } from 'lucide-react';
import { usePWAUpdateNotification } from '../../hooks/usePWA';

interface PWAUpdateNotificationProps {
  className?: string;
  position?: 'top' | 'bottom';
  variant?: 'banner' | 'toast' | 'modal';
  showIcon?: boolean;
  customTitle?: string;
  customDescription?: string;
  autoUpdate?: boolean;
}

export const PWAUpdateNotification: React.FC<PWAUpdateNotificationProps> = ({
  className = '',
  position = 'top',
  variant = 'banner',
  showIcon = true,
  customTitle,
  customDescription,
  autoUpdate = false
}) => {
  const { showNotification, updateAvailable, update, dismiss } = usePWAUpdateNotification();

  // Auto update if enabled
  React.useEffect(() => {
    if (autoUpdate && updateAvailable) {
      update();
    }
  }, [autoUpdate, updateAvailable, update]);

  if (!showNotification || !updateAvailable) {
    return null;
  }

  const title = customTitle || 'Atualização Disponível';
  const description = customDescription || 'Uma nova versão do app está disponível. Atualize para obter as últimas funcionalidades.';

  const baseClasses = {
    banner: `fixed left-0 right-0 z-50 bg-blue-600 text-white shadow-lg transition-transform duration-300 ${position === 'top' ? 'top-0' : 'bottom-0'}`,
    toast: `fixed z-50 max-w-sm bg-white rounded-lg shadow-lg border transition-all duration-300 ${position === 'top' ? 'top-4 right-4' : 'bottom-4 right-4'}`,
    modal: 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'
  };

  const contentClasses = {
    banner: 'px-4 py-3 flex items-center justify-between',
    toast: 'p-4',
    modal: 'bg-white rounded-lg p-6 m-4 max-w-md w-full'
  };

  if (variant === 'modal') {
    return (
      <div className={`${baseClasses.modal} ${className}`}>
        <div className={contentClasses.modal}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {showIcon && (
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600 mt-1">{description}</p>
              </div>
            </div>
            <button
              onClick={dismiss}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={update}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Atualizar Agora</span>
            </button>
            <button
              onClick={dismiss}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Depois
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'toast') {
    return (
      <div className={`${baseClasses.toast} ${className}`}>
        <div className={contentClasses.toast}>
          <div className="flex items-start space-x-3">
            {showIcon && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
              <p className="text-xs text-gray-600 mt-1">{description}</p>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={update}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded font-medium hover:bg-blue-700 transition-colors flex items-center space-x-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Atualizar</span>
                </button>
                <button
                  onClick={dismiss}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Depois
                </button>
              </div>
            </div>
            <button
              onClick={dismiss}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Banner variant (default)
  return (
    <div className={`${baseClasses.banner} ${className}`}>
      <div className={contentClasses.banner}>
        <div className="flex items-center space-x-3 flex-1">
          {showIcon && (
            <div className="flex-shrink-0">
              <RefreshCw className="w-5 h-5 text-blue-200" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-white">{title}</h4>
            <p className="text-xs text-blue-100">{description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={update}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Atualizar</span>
          </button>
          <button
            onClick={dismiss}
            className="text-blue-200 hover:text-white transition-colors p-1"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Auto-update version that updates immediately
export const PWAAutoUpdate: React.FC<Omit<PWAUpdateNotificationProps, 'autoUpdate'>> = (props) => {
  return <PWAUpdateNotification {...props} autoUpdate={true} />;
};

// Silent update component (no UI, just updates in background)
export const PWASilentUpdate: React.FC = () => {
  const { updateAvailable, update } = usePWAUpdateNotification();

  React.useEffect(() => {
    if (updateAvailable) {
      // Wait a bit before updating to avoid interrupting user
      const timer = setTimeout(() => {
        update();
      }, 5000); // 5 seconds delay

      return () => clearTimeout(timer);
    }
  }, [updateAvailable, update]);

  return null;
};

// Update progress indicator
export const PWAUpdateProgress: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { updateAvailable } = usePWAUpdateNotification();
  const [progress, setProgress] = React.useState(0);
  const [isUpdating, setIsUpdating] = React.useState(false);

  React.useEffect(() => {
    if (updateAvailable && !isUpdating) {
      setIsUpdating(true);
      setProgress(0);

      // Simulate update progress
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUpdating(false);
            return 100;
          }
          return prev + Math.random() * 10;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [updateAvailable, isUpdating]);

  if (!isUpdating) {
    return null;
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      <div className="bg-blue-600 h-1">
        <div 
          className="bg-white h-full transition-all duration-200 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <div className="bg-blue-600 text-white text-center py-2 text-sm">
        Atualizando aplicação... {Math.round(progress)}%
      </div>
    </div>
  );
};