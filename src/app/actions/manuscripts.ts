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

export async function updateManuscriptCategories(manuscriptId: string, newCategoryIds: string[], currentCategorySlug: string) {
    try {
        // 1. Remove existing categories for this manuscript
        const { error: delError } = await supabaseAdmin
            .from('manuscript_categories')
            .delete()
            .eq('manuscript_id', manuscriptId);

        if (delError) throw new Error(delError.message);

        // 2. Insert new categories if there are any
        if (newCategoryIds.length > 0) {
            const insertData = newCategoryIds.map(categoryId => ({
                manuscript_id: manuscriptId,
                category_id: categoryId,
            }));

            const { error: insError } = await supabaseAdmin
                .from('manuscript_categories')
                .insert(insertData);

            if (insError) throw new Error(insError.message);
        }

        revalidatePath(`/categories/${currentCategorySlug}`);
        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
