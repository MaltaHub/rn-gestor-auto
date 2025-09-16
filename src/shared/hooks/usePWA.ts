import { useState, useEffect, useCallback } from 'react';
import { swManager, serviceWorkerUtils, type ServiceWorkerConfig } from '../utils/serviceWorker';

interface PWAState {
  isInstalled: boolean;
  canInstall: boolean;
  isOnline: boolean;
  isStandalone: boolean;
  updateAvailable: boolean;
  installing: boolean;
  cacheUsage: {
    used: number;
    quota: number;
    percentage: number;
  };
  networkInfo: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
}

interface PWAActions {
  install: () => Promise<'accepted' | 'dismissed' | 'not-available'>;
  update: () => Promise<void>;
  skipWaiting: () => Promise<void>;
  clearCaches: () => Promise<void>;
  sendMessage: (message: any) => Promise<any>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  showUpdateNotification: (onUpdate: () => void) => void;
}

interface UsePWAOptions extends ServiceWorkerConfig {
  autoRegister?: boolean;
  checkForUpdates?: boolean;
  updateInterval?: number;
}

export const usePWA = (options: UsePWAOptions = {}) => {
  const {
    autoRegister = true,
    checkForUpdates = true,
    updateInterval = 60000, // 1 minute
    onSuccess,
    onUpdate,
    onOffline,
    onOnline
  } = options;

  const [state, setState] = useState<PWAState>({
    isInstalled: false,
    canInstall: false,
    isOnline: navigator.onLine,
    isStandalone: swManager.isStandalone(),
    updateAvailable: false,
    installing: false,
    cacheUsage: {
      used: 0,
      quota: 0,
      percentage: 0
    },
    networkInfo: {}
  });

  // Update cache usage
  const updateCacheUsage = useCallback(async () => {
    try {
      const usage = await swManager.getCacheUsage();
      setState(prev => ({ ...prev, cacheUsage: usage }));
    } catch (error) {
      console.error('Failed to get cache usage:', error);
    }
  }, []);

  // Update network info
  const updateNetworkInfo = useCallback(() => {
    const networkStatus = swManager.getNetworkStatus();
    setState(prev => ({
      ...prev,
      isOnline: networkStatus.online,
      networkInfo: {
        effectiveType: networkStatus.effectiveType,
        downlink: networkStatus.downlink,
        rtt: networkStatus.rtt
      }
    }));
  }, []);

  // Install PWA
  const install = useCallback(async (): Promise<'accepted' | 'dismissed' | 'not-available'> => {
    setState(prev => ({ ...prev, installing: true }));
    
    try {
      const result = await swManager.promptInstall();
      
      if (result === 'accepted') {
        setState(prev => ({
          ...prev,
          isInstalled: true,
          canInstall: false,
          installing: false
        }));
      } else {
        setState(prev => ({ ...prev, installing: false }));
      }
      
      return result;
    } catch (error) {
      console.error('PWA installation failed:', error);
      setState(prev => ({ ...prev, installing: false }));
      return 'dismissed';
    }
  }, []);

  // Update service worker
  const update = useCallback(async () => {
    try {
      await swManager.update();
      setState(prev => ({ ...prev, updateAvailable: false }));
    } catch (error) {
      console.error('Service worker update failed:', error);
    }
  }, []);

  // Skip waiting for new service worker
  const skipWaiting = useCallback(async () => {
    try {
      await swManager.skipWaiting();
      // Reload page to activate new service worker
      window.location.reload();
    } catch (error) {
      console.error('Skip waiting failed:', error);
    }
  }, []);

  // Clear all caches
  const clearCaches = useCallback(async () => {
    try {
      await swManager.clearCaches();
      await updateCacheUsage();
    } catch (error) {
      console.error('Clear caches failed:', error);
    }
  }, [updateCacheUsage]);

  // Send message to service worker
  const sendMessage = useCallback(async (message: any) => {
    try {
      return await swManager.sendMessage(message);
    } catch (error) {
      console.error('Send message to SW failed:', error);
      throw error;
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    return await serviceWorkerUtils.requestNotificationPermission();
  }, []);

  // Show update notification
  const showUpdateNotification = useCallback((onUpdateCallback: () => void) => {
    serviceWorkerUtils.showUpdateNotification(onUpdateCallback);
  }, []);

  // Setup service worker
  useEffect(() => {
    if (!autoRegister || !swManager.isSupported()) {
      return;
    }

    const config: ServiceWorkerConfig = {
      onSuccess: (registration) => {
        console.log('Service Worker registered successfully');
        setState(prev => ({ ...prev, isInstalled: true }));
        onSuccess?.(registration);
      },
      onUpdate: (registration) => {
        console.log('Service Worker update available');
        setState(prev => ({ ...prev, updateAvailable: true }));
        onUpdate?.(registration);
      },
      onOffline: () => {
        setState(prev => ({ ...prev, isOnline: false }));
        onOffline?.();
      },
      onOnline: () => {
        setState(prev => ({ ...prev, isOnline: true }));
        onOnline?.();
      }
    };

    // Register service worker
    swManager.register('/sw.js').then((registration) => {
      if (registration) {
        setState(prev => ({ ...prev, isInstalled: true }));
      }
    });

    // Setup event listeners
    const handleBeforeInstallPrompt = () => {
      setState(prev => ({ ...prev, canInstall: true }));
    };

    const handleAppInstalled = () => {
      setState(prev => ({
        ...prev,
        isInstalled: true,
        canInstall: false,
        installing: false
      }));
    };

    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      updateNetworkInfo();
      onOnline?.();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
      onOffline?.();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial network info update
    updateNetworkInfo();
    updateCacheUsage();

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [autoRegister, onSuccess, onUpdate, onOffline, onOnline, updateNetworkInfo, updateCacheUsage]);

  // Check for updates periodically
  useEffect(() => {
    if (!checkForUpdates || !state.isInstalled) {
      return;
    }

    const interval = setInterval(() => {
      swManager.update();
      updateCacheUsage();
      updateNetworkInfo();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [checkForUpdates, state.isInstalled, updateInterval, updateCacheUsage, updateNetworkInfo]);

  // Monitor network changes
  useEffect(() => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const handleConnectionChange = () => {
        updateNetworkInfo();
      };

      connection.addEventListener('change', handleConnectionChange);
      
      return () => {
        connection.removeEventListener('change', handleConnectionChange);
      };
    }
  }, [updateNetworkInfo]);

  const actions: PWAActions = {
    install,
    update,
    skipWaiting,
    clearCaches,
    sendMessage,
    requestNotificationPermission,
    showUpdateNotification
  };

  return {
    ...state,
    ...actions,
    // Computed properties
    isSupported: swManager.isSupported(),
    isLowEndDevice: state.networkInfo.effectiveType === '2g' || state.networkInfo.effectiveType === 'slow-2g',
    cacheUsageFormatted: {
      used: formatBytes(state.cacheUsage.used),
      quota: formatBytes(state.cacheUsage.quota),
      percentage: Math.round(state.cacheUsage.percentage * 100) / 100
    }
  };
};

// Utility function to format bytes
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Hook for PWA install banner
export const usePWAInstallBanner = () => {
  const { canInstall, isInstalled, installing, install } = usePWA({ autoRegister: false });
  const [dismissed, setDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Show banner if can install and not dismissed
    setShowBanner(canInstall && !isInstalled && !dismissed);
  }, [canInstall, isInstalled, dismissed]);

  const handleInstall = async () => {
    const result = await install();
    if (result === 'dismissed') {
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowBanner(false);
  };

  return {
    showBanner,
    installing,
    install: handleInstall,
    dismiss: handleDismiss
  };
};

// Hook for update notification
export const usePWAUpdateNotification = () => {
  const { updateAvailable, skipWaiting, showUpdateNotification } = usePWA();
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (updateAvailable) {
      setShowNotification(true);
      showUpdateNotification(() => {
        handleUpdate();
      });
    }
  }, [updateAvailable, showUpdateNotification]);

  const handleUpdate = async () => {
    await skipWaiting();
    setShowNotification(false);
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  return {
    showNotification,
    updateAvailable,
    update: handleUpdate,
    dismiss: handleDismiss
  };
};

export type { PWAState, PWAActions, UsePWAOptions };