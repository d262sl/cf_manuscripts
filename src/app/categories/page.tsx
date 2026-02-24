import { getCategories, getManuscriptCountByCategory } from '@/utils/supabase/api';
import Link from 'next/link';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export const metadata: Metadata = {
    title: 'All Categories | CF Manuscripts',
    description: 'Browse all research categories related to Cystic Fibrosis.',
};

export default async function CategoriesRoute() {
    const categories = await getCategories();
    const counts = await getManuscriptCountByCategory();

    return (
        <div className="min-h-screen bg-background-light py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-extrabold text-brand-blue-dark tracking-tight mb-4">
                        Research Categories
                    </h1>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Browse our comprehensive list of Cystic Fibrosis research categories. Select a topic to view its specific publications and historical trends.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map((category) => {
                        const countData = counts.find((c) => c.slug === category.slug);
                        const totalManuscripts = countData?.count || 0;

                        return (
                            <Link
                                key={category.id}
                                href={`/categories/${category.slug}`}
                                className="group flex flex-col justify-between rounded-2xl bg-white p-8 shadow-sm border border-gray-100 transition-all hover:shadow-xl hover:-translate-y-1 relative overflow-hidden h-full"
                            >
                                {/* Decorative accent top line */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-brand-yellow scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></div>

                                <div>
                                    <h3 className="text-2xl font-bold text-brand-blue-dark mb-2 group-hover:text-brand-blue transition-colors">
                                        {category.name}
                                    </h3>
                                    <p className="text-gray-500 mb-6 line-clamp-2">
                                        Explore the latest studies and findings related to {category.name.toLowerCase()} in Cystic Fibrosis patients.
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                    <div className="flex items-center text-sm font-medium text-gray-500">
                                        <svg className="w-5 h-5 mr-2 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        {totalManuscripts} {totalManuscripts === 1 ? 'Publication' : 'Publications'}
                                    </div>
                                    <div className="text-brand-blue font-semibold group-hover:translate-x-1 transition-transform flex items-center">
                                        View <span className="ml-1 text-lg">→</span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
