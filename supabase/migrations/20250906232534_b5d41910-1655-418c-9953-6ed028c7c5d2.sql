-- Fix search path for the function
CREATE OR REPLACE FUNCTION get_current_user_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result_tenant_id UUID;
    current_user_id UUID;
BEGIN
    -- Get the current authenticated user ID
    current_user_id := auth.uid();
    
    -- Log the current user ID for debugging
    RAISE LOG 'get_current_user_tenant_id: current_user_id = %', current_user_id;
    
    -- Check if user is authenticated
    IF current_user_id IS NULL THEN
        RAISE LOG 'get_current_user_tenant_id: No authenticated user';
        RETURN NULL;
    END IF;
    
    -- Get the tenant_id for the current user from tenant_members
    SELECT tenant_id INTO result_tenant_id
    FROM tenant_members 
    WHERE user_id = current_user_id 
    AND status = 'active'
    LIMIT 1;
    
    -- Log the result for debugging
    RAISE LOG 'get_current_user_tenant_id: result = % for user %', result_tenant_id, current_user_id;
    
    RETURN result_tenant_id;
END;
$$;