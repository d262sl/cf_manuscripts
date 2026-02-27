
import { createClient } from '@supabase/supabase-js';
const supabase = createClient('https://offojexfpnnyuukakxzn.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZm9qZXhmcG5ueXV1a2FreHpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2ODc5ODMsImV4cCI6MjA4NzI2Mzk4M30.6WzDSaolo80XEI2a7nSLD8puMzZlOMXLwbvgsIcLA9M');

async function check() {
    const { data, error } = await supabase.from('categories').select('id, name, slug, manuscript_categories(count)');
    console.log(JSON.stringify(data, null, 2));
}
check();

