'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SearchAuthor() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative flex items-center">
            <input
                type="text"
                placeholder="Search by author..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-48 sm:w-64 rounded-full border border-gray-300 bg-gray-50 px-4 py-1.5 pl-10 text-sm focus:border-brand-blue focus:outline-none focus:ring-1 focus:ring-brand-blue transition-all"
            />
            <Search className="absolute left-3 text-gray-400 h-4 w-4" />
            <button type="submit" className="sr-only">Search</button>
        </form>
    );
}
