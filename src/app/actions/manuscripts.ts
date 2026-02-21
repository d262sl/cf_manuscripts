'use server';

import { supabaseAdmin } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteManuscript(manuscriptId: string, currentCategorySlug: string) {
    try {
        // We only delete from manuscript_categories, creating an "orphan" manuscript.
        // This removes it from the UI but keeps it in the `manuscripts` table, 
        // ensuring the sync-pubmed script still sees its URL and skips re-downloading it.
        const { error } = await supabaseAdmin
            .from('manuscript_categories')
            .delete()
            .eq('manuscript_id', manuscriptId);

        if (error) throw new Error(error.message);

        revalidatePath(`/categories/${currentCategorySlug}`);
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function recategorizeManuscript(manuscriptId: string, newCategoryId: string, currentCategorySlug: string) {
    try {
        // 1. Remove existing category
        const { error: delError } = await supabaseAdmin
            .from('manuscript_categories')
            .delete()
            .eq('manuscript_id', manuscriptId);

        if (delError) throw new Error(delError.message);

        // 2. Insert new category 
        const { error: insError } = await supabaseAdmin
            .from('manuscript_categories')
            .insert({ manuscript_id: manuscriptId, category_id: newCategoryId });

        if (insError) throw new Error(insError.message);

        revalidatePath(`/categories/${currentCategorySlug}`);
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
