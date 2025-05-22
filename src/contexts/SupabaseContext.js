import { createContext } from "react";

/**
 * SupabaseContext provides a global React context to access
 * an authenticated Supabase client, injected after Clerk JWT login.
 */
const SupabaseContext = createContext(null);

export default SupabaseContext;
