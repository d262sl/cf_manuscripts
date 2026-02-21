import Link from 'next/link';
import SyncButton from '@/components/features/SyncButton';
import SearchAuthor from '@/components/features/SearchAuthor';

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    {/* Mock Logo / Typography based on CF vibe */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-blue text-white font-bold transition-transform group-hover:scale-105">
                            CF
                        </div>
                        <span className="text-xl font-bold tracking-tight text-brand-blue hidden sm:block">
                            Manuscripts Data
                        </span>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/" className="text-sm font-medium text-gray-700 hover:text-brand-blue transition-colors">
                        Dashboard
                    </Link>
                    <Link href="/categories" className="text-sm font-medium text-gray-700 hover:text-brand-blue transition-colors">
                        All Categories
                    </Link>
                </nav>

                <div className="flex items-center gap-4">
                    <SearchAuthor />
                    <SyncButton />
                </div>
            </div>
        </header>
    );
}
