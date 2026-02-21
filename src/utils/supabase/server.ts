import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// This client bypasses RLS, to be used ONLY in secure server environments like API routes
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
