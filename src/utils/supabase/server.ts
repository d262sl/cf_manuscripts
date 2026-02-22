import { createClient } from '@supabase/supabase-js';

// This client bypasses RLS, to be used ONLY in secure server environments like API routes
export function getSupabaseAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Missing Supabase environment variables for Admin Client.");
    }

    return createClient(supabaseUrl, supabaseServiceKey);
}
