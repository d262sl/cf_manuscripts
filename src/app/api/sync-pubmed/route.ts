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
    'patient-registry': ['registry', 'database', 'cohort', 'epidemiology', 'population-based', 'registries'],
    'lung-transplants': ['transplant', 'transplantation', 'graft']
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
        // Look back 6 months for daily syncs to prevent NCBI XML fetch from taking >10 seconds on Netlify Free Tier.
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        const startString = `${sixMonthsAgo.getFullYear()}/${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}/${String(sixMonthsAgo.getDate()).padStart(2, '0')}`;

        // General search
        const searchParamsGeneral = new URLSearchParams({
            db: 'pubmed',
            term: `("Cystic Fibrosis"[Title] OR "CFTR"[Title]) AND ("${startString}"[Date - Publication] : "3000"[Date - Publication])`,
            retmode: 'json',
            retmax: '300', // Fetch more records to populate history
            sort: 'pub_date'
        });

        // Registry specific search
        const searchParamsRegistry = new URLSearchParams({
            db: 'pubmed',
            term: `("Cystic Fibrosis Patient Registry"[Title/Abstract] OR "CFFPR"[Title/Abstract]) AND ("${startString}"[Date - Publication] : "3000"[Date - Publication])`,
            retmode: 'json',
            retmax: '2000', // Fetch extensively
            sort: 'pub_date'
        });

        // Lung Transplants (CF & COPD)
        const searchParamsTransplants = new URLSearchParams({
            db: 'pubmed',
            term: `("Lung Transplantation"[Title/Abstract] OR "Lung Transplant"[Title/Abstract]) AND ("Cystic Fibrosis"[Title/Abstract] OR "COPD"[Title/Abstract] OR "Chronic Obstructive Pulmonary Disease"[Title/Abstract]) AND ("${startString}"[Date - Publication] : "3000"[Date - Publication])`,
            retmode: 'json',
            retmax: '1000',
            sort: 'pub_date'
        });

        // Fetch sequentially to avoid NCBI 3-requests-per-second rate limit without API key
        const searchResponseGeneral = await fetch(`${PUBMED_SEARCH_URL}?${searchParamsGeneral.toString()}`, { cache: "no-store" });
        if (!searchResponseGeneral.ok) throw new Error(`PubMed Search API failed for General: ${searchResponseGeneral.statusText}`);
        const searchDataGeneral = await searchResponseGeneral.json();

        await new Promise(resolve => setTimeout(resolve, 400));

        const searchResponseRegistry = await fetch(`${PUBMED_SEARCH_URL}?${searchParamsRegistry.toString()}`, { cache: "no-store" });
        if (!searchResponseRegistry.ok) throw new Error(`PubMed Search API failed for Registry: ${searchResponseRegistry.statusText}`);
        const searchDataRegistry = await searchResponseRegistry.json();

        await new Promise(resolve => setTimeout(resolve, 400));

        const searchResponseTransplants = await fetch(`${PUBMED_SEARCH_URL}?${searchParamsTransplants.toString()}`, { cache: "no-store" });
        if (!searchResponseTransplants.ok) throw new Error(`PubMed Search API failed for Transplants: ${searchResponseTransplants.statusText}`);
        const searchDataTransplants = await searchResponseTransplants.json();

        // Combine
        const pmidsSet = new Set<string>();
        (searchDataGeneral.esearchresult?.idlist || []).forEach((id: string) => pmidsSet.add(id));
        (searchDataRegistry.esearchresult?.idlist || []).forEach((id: string) => pmidsSet.add(id));
        (searchDataTransplants.esearchresult?.idlist || []).forEach((id: string) => pmidsSet.add(id));
        const pmids = Array.from(pmidsSet);

        if (pmids.length === 0) {
            return NextResponse.json({ message: 'No new manuscripts found.' });
        }

        // 2. Fetch full XML details for these PMIDs
        const xmlDataChunks: string[] = [];
        const chunkSize = 100; // Reduced from 200 to 100

        console.log(`Starting XML Fetch for ${pmids.length} PMIDs spread across ${Math.ceil(pmids.length / chunkSize)} chunks...`);

        for (let i = 0; i < pmids.length; i += chunkSize) {
            const chunk = pmids.slice(i, i + chunkSize);
            const fetchParams = new URLSearchParams({
                db: 'pubmed',
                id: chunk.join(','),
                retmode: 'xml'
            });

            // Add a 500ms delay between fetches to respect NCBI rate limits
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log(`Fetching chunk ${i / chunkSize + 1}...`);
            const fetchResponse = await fetch(`${PUBMED_FETCH_URL}?${fetchParams.toString()}`, { cache: "no-store", keepalive: true });
            if (!fetchResponse.ok) {
                console.error(`Failed Fetch URL: ${PUBMED_FETCH_URL}?${fetchParams.toString()}`);
                console.error(`Failed Fetch Status text: ${fetchResponse.statusText}`);
                throw new Error('PubMed Fetch API failed');
            }
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

            // CFF Employee Check
            const authorsLower = authors.toLowerCase();
            const cffAuthors = [
                'elbert', 'boyle', 'clancy', 'cromwell', 'faro',
                'ostrenga', 'petren', 'fink', 'rowe', 'marshall', 'sabadosa'
            ];

            if (cffAuthors.some(author => authorsLower.includes(author))) {
                matchedSlugs.add('cff-publications');
            }

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

        // 4. Upsert into Supabase (Bulk Operations)
        const supabaseAdmin = getSupabaseAdmin();

        // Prefetch all valid category IDs from DB mapping slug -> id
        const { data: catData } = await supabaseAdmin.from('categories').select('id, slug');
        const slugToIdMap: Record<string, string> = {};
        catData?.forEach(c => slugToIdMap[c.slug] = c.id);

        // Find existing manuscripts to skip insertion, but grab their IDs for tagging
        const allUrls = manuscriptsToProcess.map(m => m.url);

        let existingUrlMap = new Map<string, string>(); // url -> id
        // Process 'in' query in batches of 200 to avoid overly large URI length errors in Supabase HTTP calls
        for (let i = 0; i < allUrls.length; i += 200) {
            const urlChunk = allUrls.slice(i, i + 200);
            const { data: existingChunk } = await supabaseAdmin
                .from('manuscripts')
                .select('id, url')
                .in('url', urlChunk);

            existingChunk?.forEach(m => existingUrlMap.set(m.url, m.id));
        }

        const newManuscripts = manuscriptsToProcess.filter(m => !existingUrlMap.has(m.url));
        const skippedCount = manuscriptsToProcess.length - newManuscripts.length;

        let addedCount = 0;
        const allManuscriptIds: Record<string, string> = { ...Object.fromEntries(existingUrlMap) }; // Map of URL -> ID for all items

        if (newManuscripts.length > 0) {
            const manuscriptsToInsert = newManuscripts.map(ms => ({
                title: ms.title,
                abstract: ms.abstract,
                authors: ms.authors,
                publication_date: ms.publication_date?.toISOString(),
                url: ms.url
            }));

            // Insert new manuscripts and return their IDs
            const { data: insertedMs, error: msError } = await supabaseAdmin
                .from('manuscripts')
                .insert(manuscriptsToInsert)
                .select('id, url');

            if (msError) {
                console.error('Bulk Insert manuscript error:', msError);
                throw new Error('Database insert failed');
            }

            addedCount = insertedMs?.length || 0;

            insertedMs?.forEach(m => allManuscriptIds[m.url] = m.id);
        }

        // Generate junctions for ALL manuscripts to catch missing newly-mapped categories on existing papers
        const junctionInserts: any[] = [];
        for (const ms of manuscriptsToProcess) {
            const msId = allManuscriptIds[ms.url];
            if (!msId) continue;

            ms.slugs.forEach(slug => {
                const catId = slugToIdMap[slug];
                if (catId) {
                    junctionInserts.push({
                        manuscript_id: msId,
                        category_id: catId
                    });
                }
            });
        }

        // Bulk insert junctions in batches, ignoring duplicates if the tag previously existed
        for (let i = 0; i < junctionInserts.length; i += 500) {
            const junctionChunk = junctionInserts.slice(i, i + 500);
            if (junctionChunk.length > 0) {
                await supabaseAdmin.from('manuscript_categories').upsert(junctionChunk, { onConflict: 'manuscript_id, category_id', ignoreDuplicates: true });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Sync completed. Added ${addedCount} new manuscripts, skipped ${skippedCount} existing.`,
            stats: { added: addedCount, skipped: skippedCount }
        });

    } catch (err: any) {
        console.error('PubMed Sync API Error:', err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
