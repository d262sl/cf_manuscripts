'use server';

import { supabaseAdmin } from '@/utils/supabase/server';

export async function trackReadClick(manuscriptId: string) {
    try {
        const { error } = await supabaseAdmin.rpc('increment_clicks', {
            ms_id: manuscriptId
        });

        // If RPC isn't available, fallback to a two-step query
        if (error) {
            const { data } = await supabaseAdmin.from('manuscripts').select('clicks').eq('id', manuscriptId).single();
            if (data) {
                await supabaseAdmin.from('manuscripts').update({ clicks: (data.clicks || 0) + 1 }).eq('id', manuscriptId);
            }
        }

        return { success: true };
    } catch (e) {
        return { success: false };
    }
}
