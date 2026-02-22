import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/utils/supabase/server';
import { XMLParser } from 'fast-xml-parser';

export const dynamic = 'force-dynamic';
// For Vercel Cron Jobs, you can configure headers but here we just export a GET endpoint.
// A real production app might require an authorization header check.

const PUBMED_SEARCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const PUBMED_FETCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';

// Auto-categorization rules
const categoryKeywords: Record<string, string[]> = {
    'microbiology': ['mycobacterium', 'pseudomonas', 'staphylococcus', 'bacteria', 'infection', 'microbiome', 'pathogen', 'biofilm', 'microbiology'],
    'liver-issues': ['liver', 'hepatic', 'cirrhosis', 'gallbladder', 'biliary'],
    'pulmonary-issues': ['lung', 'pulmonary', 'respiratory', 'airway', 'bronchial', 'bronchiectasis'],
    'aging-with-cf': ['aging', 'older adult', 'geriatric', 'elderly', 'aging population'],
    'social-economics': ['cost', 'economic', 'social', 'burden', 'quality of life', 'financial', 'insurance', 'policy'],
    'research': ['model', 'vitro', 'vivo', 'assay', 'mechanism', 'pathway', 'novel', 'discovery'],
    'treatments-therapies': ['modulator', 'treatment', 'therapy', 'trikafta', 'ivacaftor', 'lumacaftor', 'drug', 'antibiotic'],
    'genetics-mutations': ['gene', 'mutation', 'genetics', 'allele', 'f508del', 'cftr', 'variant'],
    'diagnosis-screening': ['diagnosis', 'screening', 'newborn', 'sweat test', 'biomarker', 'detect'],
    'patient-care-quality-of-life': ['care', 'quality of life', 'qol', 'patient', 'nursing', 'mental health', 'psychological', 'adherence'],
    'cff-patient-registry': ['cffpr', 'cystic fibrosis patient registry', 'cystic fibrosis foundation patient registry'],
    'patient-registry': ['registry', 'database', 'cohort', 'epidemiology', 'population-based', 'registries']
};

interface ParsedManuscript {
    pubmed_id: string;
    title: string;
    abstract: string;
    authors: string;
    publication_date: Date | null;
    url: string;
    slugs: string[];
}

export async function GET(request: Request) {
    try {
        const currentYear = new Date().getFullYear();
        const startYear = currentYear - 5;

        // General search
        const searchParamsGeneral = new URLSearchParams({
            db: 'pubmed',
            term: `("Cystic Fibrosis"[Title] OR "CFTR"[Title]) AND ("${startYear}/01/01"[Date - Publication] : "3000"[Date - Publication])`,
            retmode: 'json',
            retmax: '300', // Fetch more records to populate history
            sort: 'pub_date'
        });

        // Registry specific search
        const searchParamsRegistry = new URLSearchParams({
            db: 'pubmed',
            term: `("Cystic Fibrosis Patient Registry"[Title/Abstract] OR "CFFPR"[Title/Abstract]) AND ("${startYear}/01/01"[Date - Publication] : "3000"[Date - Publication])`,
            retmode: 'json',
            retmax: '2000', // Fetch extensively
            sort: 'pub_date'
        });

        const [searchResponseGeneral, searchResponseRegistry] = await Promise.all([
            fetch(`${PUBMED_SEARCH_URL}?${searchParamsGeneral.toString()}`),
            fetch(`${PUBMED_SEARCH_URL}?${searchParamsRegistry.toString()}`)
        ]);

        if (!searchResponseGeneral.ok || !searchResponseRegistry.ok) {
            throw new Error('PubMed Search API failed');
        }

        const searchDataGeneral = await searchResponseGeneral.json();
        const searchDataRegistry = await searchResponseRegistry.json();

        // Combine
        const pmidsSet = new Set<string>();
        (searchDataGeneral.esearchresult?.idlist || []).forEach((id: string) => pmidsSet.add(id));
        (searchDataRegistry.esearchresult?.idlist || []).forEach((id: string) => pmidsSet.add(id));
        const pmids = Array.from(pmidsSet);

        if (pmids.length === 0) {
            return NextResponse.json({ message: 'No new manuscripts found.' });
        }

        // 2. Fetch full XML details for these PMIDs
        const xmlDataChunks: string[] = [];
        const chunkSize = 200;
        for (let i = 0; i < pmids.length; i += chunkSize) {
            const chunk = pmids.slice(i, i + chunkSize);
            const fetchParams = new URLSearchParams({
                db: 'pubmed',
                id: chunk.join(','),
                retmode: 'xml'
            });

            const fetchResponse = await fetch(`${PUBMED_FETCH_URL}?${fetchParams.toString()}`);
            if (!fetchResponse.ok) throw new Error('PubMed Fetch API failed');
            xmlDataChunks.push(await fetchResponse.text());
        }

        const parser = new XMLParser({
            ignoreAttributes: false,
            isArray: (name) => ['PubmedArticle', 'Author', 'AbstractText'].indexOf(name) !== -1
        });

        let articles: any[] = [];
        for (const xmlData of xmlDataChunks) {
            const parsedData = parser.parse(xmlData);
            const chunkArticles = parsedData.PubmedArticleSet?.PubmedArticle || [];
            articles = articles.concat(chunkArticles);
        }

        const manuscriptsToProcess: ParsedManuscript[] = [];

        // Helper to recursively extract text from mixed XML nodes (like <i>, <b> inside titles/abstracts)
        const extractText = (node: any): string => {
            if (!node) return '';
            if (typeof node === 'string' || typeof node === 'number') return String(node);
            if (Array.isArray(node)) return node.map(extractText).join(' ');
            if (typeof node === 'object') {
                return Object.values(node).map(extractText).join(' ').trim();
            }
            return '';
        };

        // 3. Parse articles and categorize
        for (const article of articles) {
            const medline = article.MedlineCitation;
            const pubmedData = article.PubmedData;
            if (!medline) continue;

            const pmid = medline.PMID?.['#text'] || medline.PMID;
            const title = extractText(medline.Article?.ArticleTitle) || 'No Title';

            let abstract = '';
            if (medline.Article?.Abstract?.AbstractText) {
                abstract = extractText(medline.Article.Abstract.AbstractText);
            }

            let authors = '';
            if (medline.Article?.AuthorList?.Author) {
                authors = medline.Article.AuthorList.Author
                    .map((a: any) => `${a.LastName || ''} ${a.Initials || ''}`.trim())
                    .filter(Boolean)
                    .join(', ');
            }

            // Try to parse publication date (PubDate)
            let pubDateObj = null;
            const pubDate = medline.Article?.Journal?.JournalIssue?.PubDate;
            if (pubDate) {
                const year = pubDate.Year;
                const monthStr = pubDate.Month || 'Jan';
                const day = pubDate.Day || '1';
                if (year) {
                    pubDateObj = new Date(`${monthStr} ${day}, ${year}`);
                }
            }

            // Fallback date from PubMedData ArticleIdList or History if needed, keeping it simple
            if (isNaN(pubDateObj?.getTime() || NaN)) pubDateObj = new Date();

            const url = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;

            // Auto-categorize
            const textToSearch = `${title} ${abstract}`.toLowerCase();
            const matchedSlugs = new Set<string>();

            for (const [slug, keywords] of Object.entries(categoryKeywords)) {
                if (keywords.some(kw => textToSearch.includes(kw))) {
                    matchedSlugs.add(slug);
                }
            }

            // If no categories matched, fallback to 'research' or another generic one, or leave empty
            if (matchedSlugs.size === 0) matchedSlugs.add('research');

            manuscriptsToProcess.push({
                pubmed_id: String(pmid),
                title,
                abstract,
                authors,
                publication_date: pubDateObj,
                url,
                slugs: Array.from(matchedSlugs)
            });
        }

        // 4. Upsert into Supabase
        const supabaseAdmin = getSupabaseAdmin();
        let stats = { added: 0, skipped: 0 };

        // Prefetch all valid category IDs from DB mapping slug -> id
        const { data: catData } = await supabaseAdmin.from('categories').select('id, slug');
        const slugToIdMap: Record<string, string> = {};
        catData?.forEach(c => slugToIdMap[c.slug] = c.id);

        for (const ms of manuscriptsToProcess) {
            // Check if URL/PMID already exists
            const { data: existing } = await supabaseAdmin
                .from('manuscripts')
                .select('id')
                .eq('url', ms.url)
                .single();

            if (existing) {
                stats.skipped++;
                continue;
            }

            // Insert manuscript
            const { data: newMs, error: msError } = await supabaseAdmin
                .from('manuscripts')
                .insert({
                    title: ms.title,
                    abstract: ms.abstract,
                    authors: ms.authors,
                    publication_date: ms.publication_date?.toISOString(),
                    url: ms.url
                })
                .select('id')
                .single();

            if (msError || !newMs) {
                console.error('Insert manuscript error:', msError);
                continue;
            }

            // Insert junction categories
            const junctionInserts = ms.slugs
                .map(slug => slugToIdMap[slug])
                .filter(Boolean)
                .map(catId => ({
                    manuscript_id: newMs.id,
                    category_id: catId
                }));

            if (junctionInserts.length > 0) {
                await supabaseAdmin.from('manuscript_categories').insert(junctionInserts);
            }

            stats.added++;
        }

        return NextResponse.json({
            success: true,
            message: `Sync completed. Added ${stats.added} new manuscripts, skipped ${stats.skipped} existing.`,
            stats
        });

    } catch (err: any) {
        console.error('PubMed Sync API Error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
