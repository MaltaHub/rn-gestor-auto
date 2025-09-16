// PWA Components barrel exports

export { 
  PWAInstallBanner,
  PWAInstallBannerCompact,
  PWAInstallModal
} from './PWAInstallBanner';

export {
  PWAUpdateNotification,
  PWAAutoUpdate,
  PWASilentUpdate,
  PWAUpdateProgress
} from './PWAUpdateNotification';

// Re-export hooks for convenience
export {
  usePWA,
  usePWAInstallBanner,
  usePWAUpdateNotification,
  type PWAState,
  type PWAActions,
  type UsePWAOptions
} from '../../hooks/usePWA';

// Re-export service worker utilities
export {
  swManager,
  serviceWorkerUtils,
  registerSW,
  unregisterSW,
  ServiceWorkerManager,
  type ServiceWorkerConfig,
  type PWAInstallPrompt
} from '../../utils/serviceWorker';