'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createManuscript } from '@/app/actions/manuscripts';

interface Category {
    id: string;
    name: string;
}

export default function SubmitManuscriptForm({ categories }: { categories: Category[] }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        authors: '',
        publication_date: '',
        abstract: '',
        url: '',
        categoryIds: [] as string[]
    });

    const handleCheckboxChange = (categoryId: string) => {
        setFormData(prev => {
            const isSelected = prev.categoryIds.includes(categoryId);
            if (isSelected) {
                return { ...prev, categoryIds: prev.categoryIds.filter(id => id !== categoryId) };
            } else {
                return { ...prev, categoryIds: [...prev.categoryIds, categoryId] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);

        // Basic validation
        if (!formData.title || !formData.authors || !formData.publication_date || !formData.abstract) {
            setError('Please fill in all required fields.');
            setIsSubmitting(false);
            return;
        }

        try {
            const result = await createManuscript(formData);

            if (!result.success) {
                setError(result.error || 'Failed to submit manuscript. Please try again.');
            } else {
                setSuccess(true);
                // Reset form
                setFormData({
                    title: '',
                    authors: '',
                    publication_date: '',
                    abstract: '',
                    url: '',
                    categoryIds: []
                });
                // Redirect home after a short delay
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            }
        } catch (err: any) {
            setError('An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                    <p className="text-green-700 text-sm font-medium">Successfully submitted! Redirecting to home...</p>
                </div>
            )}

            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue outline-none transition-colors"
                    placeholder="Enter manuscript title"
                />
            </div>

            <div>
                <label htmlFor="authors" className="block text-sm font-medium text-gray-700 mb-1">Authors <span className="text-red-500">*</span></label>
                <input
                    type="text"
                    id="authors"
                    required
                    value={formData.authors}
                    onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue outline-none transition-colors"
                    placeholder="e.g. Doe J, Smith A, Johnson B"
                />
                <p className="text-xs text-gray-500 mt-1">Separate authors with commas. Use Last Name Initial format if possible.</p>
            </div>

            <div>
                <label htmlFor="publication_date" className="block text-sm font-medium text-gray-700 mb-1">Publication Date <span className="text-red-500">*</span></label>
                <input
                    type="date"
                    id="publication_date"
                    required
                    value={formData.publication_date}
                    onChange={(e) => setFormData({ ...formData, publication_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue outline-none transition-colors"
                />
            </div>

            <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">URL / Link to Paper</label>
                <input
                    type="url"
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue outline-none transition-colors"
                    placeholder="https://pubmed.ncbi.nlm.nih.gov/..."
                />
                <p className="text-xs text-gray-500 mt-1">Optional. Providing a URL helps prevent duplicate submissions from automatic syncing.</p>
            </div>

            <div>
                <label htmlFor="abstract" className="block text-sm font-medium text-gray-700 mb-1">Abstract <span className="text-red-500">*</span></label>
                <textarea
                    id="abstract"
                    required
                    rows={6}
                    value={formData.abstract}
                    onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-brand-blue focus:border-brand-blue outline-none transition-colors"
                    placeholder="Paste the abstract text here..."
                ></textarea>
            </div>

            <div>
                <span className="block text-sm font-medium text-gray-700 mb-2">Categories (Optional)</span>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                    {categories.map((cat) => (
                        <label key={cat.id} className="flex items-center space-x-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={formData.categoryIds.includes(cat.id)}
                                onChange={() => handleCheckboxChange(cat.id)}
                                className="w-4 h-4 text-brand-blue rounded border-gray-300 focus:ring-brand-blue focus:ring-offset-0 transition-colors"
                            />
                            <span className="text-sm text-gray-700 group-hover:text-gray-900">{cat.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-brand-blue text-white font-medium rounded-lg hover:bg-brand-blue-dark transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                        </>
                    ) : (
                        'Submit Manuscript'
                    )}
                </button>
            </div>
        </form>
    );
}
