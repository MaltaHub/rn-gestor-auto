import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "./shared/utils/serviceWorker";

// Register Service Worker for PWA functionality
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  registerSW({
    onSuccess: (registration) => {
      console.log('SW registered: ', registration);
    },
    onUpdate: (registration) => {
      console.log('SW updated: ', registration);
      // Show update notification to user
      if (confirm('Nova versão disponível! Deseja atualizar?')) {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      }
    },
    onOffline: () => {
      console.log('App is offline');
    },
    onOnline: () => {
      console.log('App is online');
    }
  });
}

// Performance monitoring in development
if (import.meta.env.DEV) {
  // Enable React DevTools Profiler
  if (typeof window !== 'undefined') {
    const hook = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (hook) {
      hook.onCommitFiberRoot = (
        id: number,
        root: any,
        priorityLevel: number
      ) => {
        // Log only very slow renders in development (reduced threshold)
        const renderTime = performance.now();
        if (renderTime > 100) { // Only log renders > 100ms
          console.warn(`Very slow render detected: ${renderTime.toFixed(2)}ms`);
        }
      };
    }
  }
}

createRoot(document.getElementById("root")!).render(<App />);
