import React from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { usePWAInstallBanner } from '../../hooks/usePWA';

interface PWAInstallBannerProps {
  className?: string;
  position?: 'top' | 'bottom';
  variant?: 'banner' | 'modal' | 'toast';
  showIcon?: boolean;
  customTitle?: string;
  customDescription?: string;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({
  className = '',
  position = 'bottom',
  variant = 'banner',
  showIcon = true,
  customTitle,
  customDescription
}) => {
  const { showBanner, installing, install, dismiss } = usePWAInstallBanner();

  if (!showBanner) {
    return null;
  }

  const title = customTitle || 'Instalar RN Gestor Auto';
  const description = customDescription || 'Instale nosso app para uma experiência mais rápida e acesso offline.';

  const baseClasses = {
    banner: `fixed left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg transition-transform duration-300 ${position === 'top' ? 'top-0 border-b border-t-0' : 'bottom-0'}`,
    modal: 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50',
    toast: `fixed z-50 max-w-sm bg-white rounded-lg shadow-lg border transition-all duration-300 ${position === 'top' ? 'top-4 right-4' : 'bottom-4 right-4'}`
  };

  const contentClasses = {
    banner: 'px-4 py-3 flex items-center justify-between',
    modal: 'bg-white rounded-lg p-6 m-4 max-w-md w-full',
    toast: 'p-4'
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
                    <Smartphone className="w-6 h-6 text-blue-600" />
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
              onClick={install}
              disabled={installing}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {installing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Instalando...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Instalar</span>
                </>
              )}
            </button>
            <button
              onClick={dismiss}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Agora não
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
                  <Smartphone className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
              <p className="text-xs text-gray-600 mt-1">{description}</p>
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={install}
                  disabled={installing}
                  className="text-xs bg-blue-600 text-white px-3 py-1 rounded font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-1"
                >
                  {installing ? (
                    <>
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      <span>Instalando...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3" />
                      <span>Instalar</span>
                    </>
                  )}
                </button>
                <button
                  onClick={dismiss}
                  className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Dispensar
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
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
            <p className="text-xs text-gray-600">{description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={install}
            disabled={installing}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {installing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Instalando...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Instalar</span>
              </>
            )}
          </button>
          <button
            onClick={dismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Compact version for mobile
export const PWAInstallBannerCompact: React.FC<Omit<PWAInstallBannerProps, 'variant'>> = (props) => {
  return <PWAInstallBanner {...props} variant="toast" />;
};

// Modal version
export const PWAInstallModal: React.FC<Omit<PWAInstallBannerProps, 'variant'>> = (props) => {
  return <PWAInstallBanner {...props} variant="modal" />;
};