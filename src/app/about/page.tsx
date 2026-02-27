import Link from 'next/link';

export const metadata = {
    title: 'Learn More | CF Manuscripts',
    description: 'Learn more about the CF Manuscripts Research Database.',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background-light py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10 animate-fade-in">
                    <Link href="/" className="inline-flex items-center text-sm font-medium text-brand-blue hover:text-brand-blue-dark mb-4 group">
                        <svg className="w-5 h-5 mr-1 pr-1 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Home
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-200">
                        <div>
                            <h1 className="text-4xl font-extrabold text-brand-blue-dark tracking-tight mb-2">
                                About CF Manuscripts
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Discover the goals, technical details, and creators of this application.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <article className="group bg-white rounded-xl shadow-sm border border-gray-100 p-8 transition-all hover:shadow-md animate-slide-up">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">
                                Goal
                            </h3>
                            <p className="text-gray-700 leading-relaxed text-lg mb-8">
                                The primary purpose of this application is to ease access to research publications on Cystic Fibrosis matters. By aggregating studies and sorting them into intuitive categories, we aim to accelerate discovery for patients, clinicians, and researchers alike.
                            </p>

                            <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4 mt-8">
                                Managing Publications
                            </h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                To ensure our database remains accurate, users can actively manage their publications to the best of their knowledge:
                            </p>
                            <ul className="list-disc list-inside text-gray-700 space-y-3 ml-2">
                                <li>
                                    <strong>Updating Categories:</strong> Navigate to a publication and click the <span className="font-semibold text-gray-900">Categories</span> button. From the dropdown, you can select or unselect the relevant categories the manuscript belongs to, then click Save to apply your changes.
                                </li>
                                <li>
                                    <strong>Removing Manuscripts:</strong> If a publication needs to be completely removed from a category ranking, you can easily remove it by clicking the <span className="text-red-500 font-semibold">Remove</span> button.
                                </li>
                                <li>
                                    <strong>Syncing with PubMed:</strong> Clicking the <span className="font-semibold text-brand-blue">Sync PubMed</span> button in the header triggers a manual scan of the National Center for Biotechnology Information (NCBI) database. The system fetches any new manuscripts matching our criteria from the last 6 months, automatically categorizes them based on title and abstract keywords, and adds them to our database.
                                </li>
                            </ul>
                        </article>

                        <article className="group bg-white rounded-xl shadow-sm border border-gray-100 p-8 transition-all hover:shadow-md animate-slide-up" style={{ animationDelay: '0.1s' }}>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">
                                Technical Details
                            </h3>
                            <p className="text-gray-700 leading-relaxed mb-4">
                                This platform is built using modern, performant web technologies to ensure a quick and responsive user experience.
                            </p>
                            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-2">
                                <li><strong>Next.js 16</strong> (App Router)</li>
                                <li><strong>React 19</strong> (Concurrent rendering and hooks)</li>
                                <li><strong>Tailwind CSS 4</strong> (Utility-first styling)</li>
                                <li><strong>Supabase</strong> (Database, Authentication, and API)</li>
                                <li><strong>NCBI E-utilities API</strong> (For PubMed manuscript synchronization)</li>
                            </ul>
                        </article>

                        <article className="group bg-white rounded-xl shadow-sm border border-gray-100 p-8 transition-all hover:shadow-md animate-slide-up" style={{ animationDelay: '0.2s' }}>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">
                                Credits & Contact
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-blue mb-1">Created By</h4>
                                    <p className="text-gray-900 font-medium">Alexander Elbert (with the use of AI)</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-blue mb-1">Get in Touch</h4>
                                    <a href="mailto:ad262sl@yahoo.com" className="text-brand-blue hover:underline font-medium">
                                        ad262sl@yahoo.com
                                    </a>
                                </div>
                            </div>
                        </article>
                    </div>

                    <div className="lg:col-span-1 space-y-6">
                        <div className="sticky top-24 bg-brand-blue text-white rounded-xl p-6 shadow-md">
                            <h3 className="font-bold text-xl mb-4 text-brand-yellow">Contribute</h3>
                            <p className="text-blue-100 mb-6 leading-relaxed">
                                We are constantly expanding our database. If you know of any recent, impactful Cystic Fibrosis research that is missing, please reach out so we can include it.
                            </p>
                            <a href="mailto:ad262sl@yahoo.com" className="block text-center rounded-full bg-brand-yellow px-6 py-3 font-bold text-brand-blue-dark transition-colors hover:bg-white shadow">
                                Email Us
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
