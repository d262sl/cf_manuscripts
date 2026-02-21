import { supabase } from '@/utils/supabase/client';

export type Category = {
    id: string;
    name: string;
    slug: string;
    created_at: string;
};

export type Manuscript = {
    id: string;
    title: string;
    authors: string;
    publication_date: string;
    abstract: string;
    url: string;
    clicks: number;
    created_at: string;
};

export async function getCategories() {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    if (error) {
        console.error('Error fetching categories:', error);
        return [];
    }

    return data as Category[];
}

export async function getCategoryBySlug(slug: string) {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error(`Error fetching category ${slug}:`, error);
        return null;
    }

    return data as Category;
}

export async function getManuscriptsByCategory(categoryId: string, sortBy: 'recent' | 'popular' = 'recent') {
    const { data, error } = await supabase
        .from('manuscript_categories')
        .select(`
            manuscripts (*)
        `)
        .eq('category_id', categoryId);

    if (error) {
        console.error(`Error fetching manuscripts for category ${categoryId}:`, error);
        return [];
    }

    // Supabase returns an array of objects where 'manuscripts' is the nested object. 
    // Filter out any nulls just in case, then sort in JS to avoid complex joined-table sorting errors.
    const manuscripts = data
        .map((item: any) => item.manuscripts)
        .filter((ms: any) => ms !== null) as Manuscript[];

    if (sortBy === 'popular') {
        manuscripts.sort((a, b) => (b.clicks || 0) - (a.clicks || 0));
    } else {
        manuscripts.sort((a, b) => new Date(b.publication_date).getTime() - new Date(a.publication_date).getTime());
    }

    return manuscripts;
}

export async function getManuscriptCountByCategory() {
    const { data, error } = await supabase
        .from('categories')
        .select(`
      id,
      name,
      slug,
      manuscript_categories (count)
    `);

    if (error) {
        console.error('Error fetching counts:', error);
        return [];
    }

    return data.map((cat: any) => ({
        name: cat.name,
        slug: cat.slug,
        count: cat.manuscript_categories[0].count
    }));
}

export async function searchManuscriptsByAuthor(authorQuery: string) {
    const { data, error } = await supabase
        .from('manuscripts')
        .select(`
            *,
            category_links:manuscript_categories (
                category:categories (
                    id, name, slug
                )
            )
        `)
        .ilike('authors', `%${authorQuery}%`)
        .order('publication_date', { ascending: false });

    if (error) {
        console.error('Error searching manuscripts by author:', error);
        return [];
    }

    return data.map((ms: any) => ({
        ...ms,
        categories: ms.category_links
            ? ms.category_links.map((link: any) => link.category).filter(Boolean)
            : []
    }));
}
