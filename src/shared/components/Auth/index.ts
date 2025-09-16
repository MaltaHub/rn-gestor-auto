// Authentication Components
export { LoginForm } from './LoginForm';
export { ProtectedRoute, ConditionalRender, useAccessControl, withAuth } from './ProtectedRoute';

// Re-export context hooks for convenience
export { 
  useSupabaseContext, 
  useServices, 
  useAuthContext, 
  usePermissions 
} from '../../contexts/SupabaseContext';

// Re-export Supabase hooks
export {
  useAuth,
  useSupabaseQuery,
  useTenantServices,
  useRealtimeSubscription,
  useFileUpload,
  useSupabaseConnection
} from '../../hooks/useSupabase';

// Types
export type { User, Session } from '@supabase/supabase-js';
export type {
  Profile,
  Customer,
  Vehicle,
  Product,
  ServiceOrder
} from '../../types/database';