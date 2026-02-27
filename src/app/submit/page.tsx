import Link from 'next/link';
import { getCategories } from '@/utils/supabase/api';
import SubmitManuscriptForm from '@/components/features/SubmitManuscriptForm';

export default async function SubmitManuscriptPage() {
    const categories = await getCategories();

    return (
        <div className="min-h-screen bg-background-light py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="mb-10 animate-fade-in">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-brand-blue hover:text-brand-blue-dark mb-4 group">
                        <svg className="w-5 h-5 mr-1 pr-1 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Home
                    </Link>
                    <div>
                        <h1 className="text-4xl font-extrabold text-brand-blue-dark tracking-tight mb-2">
                            Submit a Manuscript
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Help expand our database by submitting relevant Cystic Fibrosis research.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                    <SubmitManuscriptForm categories={categories} />
                </div>
            </div>
        </div>
    );
}
