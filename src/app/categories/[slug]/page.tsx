import { getCategoryBySlug, getManuscriptsByCategory, getCategories } from '@/utils/supabase/api';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CategoryChart from '@/components/features/CategoryChart';
import { Metadata } from 'next';
import ManuscriptControls from '@/components/features/ManuscriptControls';
import { ExternalLink } from 'lucide-react';

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);

    if (!category) {
        return { title: 'Category Not Found' };
    }

    return {
        title: `${category.name} Research | CF Manuscripts`,
        description: `Latest research and publications concerning ${category.name} in Cystic Fibrosis.`,
    };
}

export default async function CategoryPage({ params }: Props) {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);

    if (!category) {
        notFound();
    }

    const manuscripts = await getManuscriptsByCategory(category.id);
    const allCategories = await getCategories();

    return (
        <div className="min-h-screen bg-background-light py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header Navigation & Title */}
                <div className="mb-10 animate-fade-in">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-brand-blue hover:text-brand-blue-dark mb-4 group">
                        <svg className="w-5 h-5 mr-1 pr-1 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Dashboard
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200">
                        <div>
                            <h1 className="text-4xl font-extrabold text-brand-blue-dark tracking-tight mb-2">
                                {category.name}
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Showing {manuscripts.length} {manuscripts.length === 1 ? 'publication' : 'publications'} in this category.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content Area (Manuscripts List) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                            <h2 className="text-2xl font-bold text-gray-900">Publications</h2>
                        </div>

                        {manuscripts.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
                                No manuscripts found for this category yet.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {manuscripts.map((manuscript, idx) => (
                                    <article
                                        key={manuscript.id}
                                        className="group bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md hover:border-brand-blue/30 animate-slide-up"
                                        style={{ animationDelay: `${idx * 0.1}s` }}
                                    >
                                        <div className="flex flex-col h-full">
                                            {manuscript.publication_date && (
                                                <div className="text-xs font-semibold uppercase tracking-wider text-brand-blue mb-3">
                                                    {new Date(manuscript.publication_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </div>
                                            )}

                                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-blue transition-colors">
                                                {manuscript.url ? (
                                                    <a href={manuscript.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                        {manuscript.title}
                                                    </a>
                                                ) : (
                                                    manuscript.title
                                                )}
                                            </h3>

                                            <div className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                                {manuscript.authors || 'Unknown Authors'}
                                            </div>

                                            {manuscript.abstract && (
                                                <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed mb-4">
                                                    {manuscript.abstract}
                                                </p>
                                            )}

                                            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-brand-blue">
                                                    {category.name}
                                                </span>

                                                {manuscript.url && (
                                                    <a
                                                        href={manuscript.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm font-medium text-brand-blue hover:text-brand-blue-dark flex items-center"
                                                    >
                                                        Read Full Text
                                                        <ExternalLink className="w-4 h-4 ml-1" />
                                                    </a>
                                                )}
                                            </div>

                                            <ManuscriptControls
                                                manuscriptId={manuscript.id}
                                                currentCategoryId={category.id}
                                                currentCategorySlug={category.slug}
                                                allCategories={allCategories}
                                                assignedCategories={manuscript.categories || []}
                                            />
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar Area (Chart & Metadata) */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="sticky top-24">
                            <CategoryChart
                                manuscripts={manuscripts}
                                title="Publications by Year"
                            />

                            <div className="mt-6 bg-brand-blue text-white rounded-xl p-6 shadow-md">
                                <h3 className="font-bold text-lg mb-2 text-brand-yellow">Did you know?</h3>
                                <p className="text-sm text-blue-100 mb-4">
                                    Tracking publication trends helps us identify which areas of Cystic Fibrosis research are accelerating and where more resources might be needed.
                                </p>
                                <a href="mailto:info@cff.org?subject=Suggested%20Topic" className="block text-center w-full py-2 bg-white/10 hover:bg-white/20 transition-colors rounded text-sm font-semibold border border-white/20">
                                    Suggest a Topic
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
