'use server';

import { getSupabaseAdmin } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function deleteManuscript(manuscriptId: string, currentCategorySlug: string) {
    try {
        const supabaseAdmin = getSupabaseAdmin();

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
        const supabaseAdmin = getSupabaseAdmin();

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

export async function createManuscript(formData: {
    title: string;
    authors: string;
    publication_date: string;
    abstract: string;
    url: string;
    categoryIds: string[];
}) {
    try {
        const supabaseAdmin = getSupabaseAdmin();

        // 1. Check for duplicates if a URL is provided
        if (formData.url) {
            const { data: existing } = await supabaseAdmin
                .from('manuscripts')
                .select('id')
                .eq('url', formData.url)
                .single();

            if (existing) {
                return { success: false, error: 'A manuscript with this URL already exists.' };
            }
        }

        // 2. Insert the new manuscript
        const { data: manuscript, error: insertError } = await supabaseAdmin
            .from('manuscripts')
            .insert({
                title: formData.title,
                authors: formData.authors,
                publication_date: formData.publication_date,
                abstract: formData.abstract,
                url: formData.url,
            })
            .select('id')
            .single();

        if (insertError) throw new Error(insertError.message);

        // 3. Link specified categories
        if (formData.categoryIds.length > 0) {
            const insertData = formData.categoryIds.map(categoryId => ({
                manuscript_id: manuscript.id,
                category_id: categoryId,
            }));

            const { error: linkError } = await supabaseAdmin
                .from('manuscript_categories')
                .insert(insertData);

            if (linkError) throw new Error(linkError.message);
        }

        revalidatePath('/');
        revalidatePath('/categories');
        return { success: true };
    } catch (error: any) {
        console.error('Error creating manuscript:', error);
        return { success: false, error: error.message };
    }
}
