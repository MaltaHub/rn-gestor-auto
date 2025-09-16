import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

/**
 * Interface para o estado da UI
 */
interface UiState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  
  // Modals
  modals: {
    [key: string]: {
      open: boolean;
      data?: any;
    };
  };
  
  // Loading states
  loading: {
    [key: string]: boolean;
  };
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    timestamp: number;
  }>;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Layout
  layout: {
    isMobile: boolean;
    screenSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  };
}

/**
 * Interface para as ações da UI
 */
interface UiActions {
  // Sidebar actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  
  // Modal actions
  openModal: (modalId: string, data?: any) => void;
  closeModal: (modalId: string) => void;
  toggleModal: (modalId: string, data?: any) => void;
  
  // Loading actions
  setLoading: (key: string, loading: boolean) => void;
  
  // Notification actions
  addNotification: (notification: Omit<UiState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Theme actions
  setTheme: (theme: UiState['theme']) => void;
  
  // Layout actions
  setLayout: (layout: Partial<UiState['layout']>) => void;
  
  // Reset
  reset: () => void;
}

type UiStore = UiState & UiActions;

/**
 * Estado inicial da UI
 */
const initialState: UiState = {
  sidebarOpen: true,
  sidebarCollapsed: false,
  modals: {},
  loading: {},
  notifications: [],
  theme: 'system',
  layout: {
    isMobile: false,
    screenSize: 'lg'
  }
};

/**
 * Store Zustand para gerenciamento de estado da UI
 */
export const useUiStore = create<UiStore>()()
  (devtools(
    persist(
      immer((set, get) => ({
        ...initialState,
        
        // Sidebar actions
        toggleSidebar: () => {
          set((state) => {
            state.sidebarOpen = !state.sidebarOpen;
          });
        },
        
        setSidebarOpen: (open: boolean) => {
          set((state) => {
            state.sidebarOpen = open;
          });
        },
        
        toggleSidebarCollapsed: () => {
          set((state) => {
            state.sidebarCollapsed = !state.sidebarCollapsed;
          });
        },
        
        setSidebarCollapsed: (collapsed: boolean) => {
          set((state) => {
            state.sidebarCollapsed = collapsed;
          });
        },
        
        // Modal actions
        openModal: (modalId: string, data?: any) => {
          set((state) => {
            state.modals[modalId] = { open: true, data };
          });
        },
        
        closeModal: (modalId: string) => {
          set((state) => {
            if (state.modals[modalId]) {
              state.modals[modalId].open = false;
              state.modals[modalId].data = undefined;
            }
          });
        },
        
        toggleModal: (modalId: string, data?: any) => {
          set((state) => {
            const modal = state.modals[modalId];
            if (modal?.open) {
              state.modals[modalId] = { open: false, data: undefined };
            } else {
              state.modals[modalId] = { open: true, data };
            }
          });
        },
        
        // Loading actions
        setLoading: (key: string, loading: boolean) => {
          set((state) => {
            if (loading) {
              state.loading[key] = true;
            } else {
              delete state.loading[key];
            }
          });
        },
        
        // Notification actions
        addNotification: (notification) => {
          const id = Math.random().toString(36).substr(2, 9);
          const timestamp = Date.now();
          
          set((state) => {
            state.notifications.push({
              ...notification,
              id,
              timestamp
            });
          });
          
          // Auto remove notification after duration
          const duration = notification.duration || 5000;
          if (duration > 0) {
            setTimeout(() => {
              get().removeNotification(id);
            }, duration);
          }
        },
        
        removeNotification: (id: string) => {
          set((state) => {
            state.notifications = state.notifications.filter(n => n.id !== id);
          });
        },
        
        clearNotifications: () => {
          set((state) => {
            state.notifications = [];
          });
        },
        
        // Theme actions
        setTheme: (theme: UiState['theme']) => {
          set((state) => {
            state.theme = theme;
          });
        },
        
        // Layout actions
        setLayout: (layout: Partial<UiState['layout']>) => {
          set((state) => {
            Object.assign(state.layout, layout);
          });
        },
        
        // Reset
        reset: () => {
          set(initialState);
        }
      })),
      {
        name: 'ui-store',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          theme: state.theme
        })
      }
    ),
    {
      name: 'UI Store'
    }
  ));

/**
 * Hooks específicos para partes do estado da UI
 */
export const useSidebar = () => {
  const sidebarOpen = useUiStore(state => state.sidebarOpen);
  const sidebarCollapsed = useUiStore(state => state.sidebarCollapsed);
  const toggleSidebar = useUiStore(state => state.toggleSidebar);
  const setSidebarOpen = useUiStore(state => state.setSidebarOpen);
  const toggleSidebarCollapsed = useUiStore(state => state.toggleSidebarCollapsed);
  const setSidebarCollapsed = useUiStore(state => state.setSidebarCollapsed);
  
  return {
    sidebarOpen,
    sidebarCollapsed,
    toggleSidebar,
    setSidebarOpen,
    toggleSidebarCollapsed,
    setSidebarCollapsed
  };
};

export const useModals = () => {
  const modals = useUiStore(state => state.modals);
  const openModal = useUiStore(state => state.openModal);
  const closeModal = useUiStore(state => state.closeModal);
  const toggleModal = useUiStore(state => state.toggleModal);
  
  return {
    modals,
    openModal,
    closeModal,
    toggleModal,
    isModalOpen: (modalId: string) => modals[modalId]?.open || false,
    getModalData: (modalId: string) => modals[modalId]?.data
  };
};

export const useNotifications = () => {
  const notifications = useUiStore(state => state.notifications);
  const addNotification = useUiStore(state => state.addNotification);
  const removeNotification = useUiStore(state => state.removeNotification);
  const clearNotifications = useUiStore(state => state.clearNotifications);
  
  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications
  };
};

export const useTheme = () => {
  const theme = useUiStore(state => state.theme);
  const setTheme = useUiStore(state => state.setTheme);
  
  return {
    theme,
    setTheme
  };
};

export const useLayout = () => {
  const layout = useUiStore(state => state.layout);
  const setLayout = useUiStore(state => state.setLayout);
  
  return {
    ...layout,
    setLayout
  };
};