import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Admin Client — uses the SERVICE_ROLE_KEY to bypass RLS.
 *
 * ⚠️  NEVER import this file from any Client Component or browser-side code.
 *     It must only be used inside Server Actions, Server Components,
 *     and API Route handlers that run exclusively on the server.
 */
export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);
