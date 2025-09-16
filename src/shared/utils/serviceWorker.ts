// Service Worker registration and management utilities

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

interface PWAInstallPrompt {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private installPrompt: PWAInstallPrompt | null = null;
  private config: ServiceWorkerConfig = {};

  constructor(config: ServiceWorkerConfig = {}) {
    this.config = config;
    this.setupEventListeners();
  }

  // Register service worker
  async register(swUrl: string = '/sw.js'): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) {
      console.warn('Service Worker not supported in this browser');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register(swUrl, {
        scope: '/'
      });

      this.registration = registration;

      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content available
              console.log('New content is available; please refresh.');
              this.config.onUpdate?.(registration);
            } else {
              // Content cached for offline use
              console.log('Content is cached for offline use.');
              this.config.onSuccess?.(registration);
            }
          }
        });
      });

      // Check for updates every 60 seconds
      setInterval(() => {
        registration.update();
      }, 60000);

      console.log('Service Worker registered successfully');
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  // Unregister service worker
  async unregister(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const result = await registration.unregister();
        this.registration = null;
        console.log('Service Worker unregistered successfully');
        return result;
      }
      return false;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  // Update service worker
  async update(): Promise<void> {
    if (this.registration) {
      try {
        await this.registration.update();
        console.log('Service Worker update check completed');
      } catch (error) {
        console.error('Service Worker update failed:', error);
      }
    }
  }

  // Skip waiting and activate new service worker
  async skipWaiting(): Promise<void> {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  // Send message to service worker
  async sendMessage(message: any): Promise<any> {
    if (!navigator.serviceWorker.controller) {
      throw new Error('No active service worker');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
      };

      navigator.serviceWorker.controller.postMessage(message, [messageChannel.port2]);
    });
  }

  // Get cache usage
  async getCacheUsage(): Promise<{ used: number; quota: number; percentage: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? (used / quota) * 100 : 0;
      
      return { used, quota, percentage };
    }
    
    return { used: 0, quota: 0, percentage: 0 };
  }

  // Clear all caches
  async clearCaches(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
    }
  }

  // PWA Installation
  canInstall(): boolean {
    return this.installPrompt !== null;
  }

  async promptInstall(): Promise<'accepted' | 'dismissed' | 'not-available'> {
    if (!this.installPrompt) {
      return 'not-available';
    }

    try {
      await this.installPrompt.prompt();
      const choiceResult = await this.installPrompt.userChoice;
      this.installPrompt = null;
      return choiceResult.outcome;
    } catch (error) {
      console.error('PWA install prompt failed:', error);
      return 'dismissed';
    }
  }

  // Check if service worker is supported
  isSupported(): boolean {
    return 'serviceWorker' in navigator;
  }

  // Check if app is running in standalone mode (PWA)
  isStandalone(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    );
  }

  // Get network status
  getNetworkStatus(): {
    online: boolean;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  } {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    return {
      online: navigator.onLine,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt
    };
  }

  // Setup event listeners
  private setupEventListeners(): void {
    // PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e as any;
      console.log('PWA install prompt available');
    });

    // App installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully');
      this.installPrompt = null;
    });

    // Online/Offline events
    window.addEventListener('online', () => {
      console.log('App is online');
      this.config.onOnline?.();
    });

    window.addEventListener('offline', () => {
      console.log('App is offline');
      this.config.onOffline?.();
    });

    // Service worker messages
    navigator.serviceWorker?.addEventListener('message', (event) => {
      const { type, payload } = event.data;
      
      switch (type) {
        case 'SW_UPDATE_AVAILABLE':
          console.log('Service Worker update available');
          this.config.onUpdate?.(this.registration!);
          break;
        case 'SW_OFFLINE_READY':
          console.log('App ready for offline use');
          break;
        case 'SW_CACHE_UPDATED':
          console.log('Cache updated:', payload);
          break;
        default:
          console.log('Service Worker message:', event.data);
      }
    });
  }
}

// Utility functions
export const serviceWorkerUtils = {
  // Check if running in development
  isDevelopment: () => {
    return process.env.NODE_ENV === 'development';
  },

  // Check if running on localhost
  isLocalhost: () => {
    return Boolean(
      window.location.hostname === 'localhost' ||
      window.location.hostname === '[::1]' ||
      window.location.hostname.match(
        /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
      )
    );
  },

  // Get service worker URL based on environment
  getServiceWorkerUrl: () => {
    return serviceWorkerUtils.isDevelopment() ? '/sw.js' : '/sw.js';
  },

  // Show update notification
  showUpdateNotification: (onUpdate: () => void) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification('Atualização Disponível', {
        body: 'Uma nova versão do app está disponível. Clique para atualizar.',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        tag: 'app-update',
        requireInteraction: true,
        actions: [
          {
            action: 'update',
            title: 'Atualizar'
          },
          {
            action: 'dismiss',
            title: 'Depois'
          }
        ]
      });

      notification.onclick = () => {
        onUpdate();
        notification.close();
      };
    }
  },

  // Request notification permission
  requestNotificationPermission: async (): Promise<NotificationPermission> => {
    if ('Notification' in window) {
      return await Notification.requestPermission();
    }
    return 'denied';
  }
};

// Create singleton instance
export const swManager = new ServiceWorkerManager();

// Export types
export type { ServiceWorkerConfig, PWAInstallPrompt };
export { ServiceWorkerManager };

// Default registration function
export const registerSW = async (config: ServiceWorkerConfig = {}) => {
  const manager = new ServiceWorkerManager(config);
  return await manager.register(serviceWorkerUtils.getServiceWorkerUrl());
};

// Unregister function
export const unregisterSW = async () => {
  return await swManager.unregister();
};