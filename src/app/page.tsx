import { getCategories, getManuscriptCountByCategory } from '@/utils/supabase/api';
import Link from 'next/link';

export default async function Home() {
  const categories = await getCategories();
  const counts = await getManuscriptCountByCategory();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-brand-blue-dark py-20 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/hero-bg-pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 leading-tight animate-slide-up">
              Advancing CF Research, <br />
              <span className="text-brand-yellow text-balance">One Manuscript at a Time.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Explore our comprehensive database of Cystic Fibrosis research publications, carefully organized to help you find the breakthroughs that matter.
            </p>
            <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <a href="#categories" className="rounded-full bg-brand-yellow px-8 py-4 text-lg font-bold text-brand-blue-dark transition-colors hover:bg-brand-yellow-hover shadow-lg">
                Browse Research
              </a>
              <a href="/about" className="rounded-full border-2 border-white/20 bg-white/5 backdrop-blur px-8 py-4 text-lg font-bold text-white transition-colors hover:bg-white/10">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section id="categories" className="py-20 bg-background-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-blue-dark mb-4">Research Categories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Select a category below to view trends, statistics, and a curated list of relevant publications from the CF research community.
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
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-brand-blue text-white mt-auto">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6 text-balance">Join the relentless pursuit of a cure</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto text-balance">
            Are you a researcher or clinician? Contribute your recent publications to our database to help accelerate CF research.
          </p>
          <button className="rounded-full bg-brand-yellow px-8 py-4 text-lg font-bold text-brand-blue-dark transition-colors hover:bg-white shadow-lg">
            Submit a Manuscript
          </button>
        </div>
      </section>
    </div>
  );
}
