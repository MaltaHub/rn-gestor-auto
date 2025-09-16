// Bridge client to keep compatibility with legacy imports
// Re-exports the main Supabase client used across the app
export { supabase } from '../../lib/supabase';

// Optional: re-export common helpers if needed by some modules/tests
export * as supabaseHelpers from '../../lib/supabase';

