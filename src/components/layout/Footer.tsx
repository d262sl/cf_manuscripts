export default function Footer() {
    return (
        <footer className="w-full bg-brand-blue-dark py-12 text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <div className="flex items-center gap-2 mb-4 group">
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-yellow text-brand-blue-dark font-bold">
                                CF
                            </div>
                            <span className="text-xl font-bold tracking-tight text-brand-yellow">
                                Manuscripts
                            </span>
                        </div>
                        <p className="text-sm text-gray-300">
                            A comprehensive global database tracking the latest research and developments in Cystic Fibrosis.
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-brand-yellow">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><a href="/" className="hover:text-white transition-colors">Home Dashboard</a></li>
                            <li><a href="/categories" className="hover:text-white transition-colors">Browse Categories</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Submit Manuscript</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-brand-yellow">Resources</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><a href="#" className="hover:text-white transition-colors">Data Export</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">API Access</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Methodology</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="mb-4 text-lg font-semibold text-brand-yellow">Connect</h3>
                        <p className="text-sm text-gray-300 mb-4">
                            Stay updated with the latest research additions.
                        </p>
                        <button className="w-full rounded bg-brand-yellow px-4 py-2 text-sm font-bold text-brand-blue-dark transition-colors hover:bg-white hover:text-brand-blue-dark">
                            Subscribe for Updates
                        </button>
                    </div>
                </div>

                <div className="mt-12 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
                    <p>© {new Date().getFullYear()} CF Manuscripts Database. Built as a demonstration.</p>
                </div>
            </div>
        </footer>
    );
}
