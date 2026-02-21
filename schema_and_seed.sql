-- Schema for Cystic Fibrosis Manuscripts Database

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create manuscripts table
CREATE TABLE IF NOT EXISTS public.manuscripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    authors TEXT,
    publication_date DATE,
    abstract TEXT,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.manuscript_categories (
    manuscript_id UUID REFERENCES public.manuscripts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    PRIMARY KEY (manuscript_id, category_id)
);

-- 4. Enable RLS (Row Level Security) and Policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manuscripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manuscript_categories ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access to all tables
CREATE POLICY "Allow public read-only access to categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to manuscripts" ON public.manuscripts FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access to manuscript_categories" ON public.manuscript_categories FOR SELECT USING (true);

-- 5. Seed initial data
INSERT INTO public.categories (name, slug) VALUES 
('Organ Systems', 'organ-systems'),
('Social Economics', 'social-economics'),
('Research', 'research'),
('Treatments & Therapies', 'treatments-therapies'),
('Genetics & Mutations', 'genetics-mutations'),
('Diagnosis & Screening', 'diagnosis-screening'),
('Patient Care & Quality of Life', 'patient-care-quality-of-life')
ON CONFLICT (slug) DO NOTHING;

-- Seed some dummy manuscripts for visual testing
DO $$
DECLARE
  v_organ UUID;
  v_treatment UUID;
  v_genetics UUID;
  v_ms1 UUID;
  v_ms2 UUID;
  v_ms3 UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO v_organ FROM public.categories WHERE slug = 'organ-systems' LIMIT 1;
  SELECT id INTO v_treatment FROM public.categories WHERE slug = 'treatments-therapies' LIMIT 1;
  SELECT id INTO v_genetics FROM public.categories WHERE slug = 'genetics-mutations' LIMIT 1;

  -- Insert dummy manuscript 1
  INSERT INTO public.manuscripts (title, authors, publication_date, abstract, url)
  VALUES (
    'Effects of CFTR Modulators on Lung Function',
    'Smith J., Doe A.',
    '2023-05-12',
    'A comprehensive study on the effects of CFTR modulators on various organ systems.',
    'https://example.com/cf-study-1'
  ) RETURNING id INTO v_ms1;

  -- Insert dummy manuscript 2
  INSERT INTO public.manuscripts (title, authors, publication_date, abstract, url)
  VALUES (
    'Genetic Mutations in Early Onset Cystic Fibrosis',
    'Brown L., et al',
    '2022-11-04',
    'Analysis of specific genetic mutations and their correlation with early onset of symptoms.',
    'https://example.com/cf-study-2'
  ) RETURNING id INTO v_ms2;

  -- Insert dummy manuscript 3
  INSERT INTO public.manuscripts (title, authors, publication_date, abstract, url)
  VALUES (
    'Advancements in CF Treatments Over the Last Decade',
    'Williams R.',
    '2024-01-20',
    'A review of the latest treatments and their impact on patient outcomes.',
    'https://example.com/cf-study-3'
  ) RETURNING id INTO v_ms3;

  -- Link manuscripts to categories
  INSERT INTO public.manuscript_categories (manuscript_id, category_id) VALUES (v_ms1, v_organ), (v_ms1, v_treatment);
  INSERT INTO public.manuscript_categories (manuscript_id, category_id) VALUES (v_ms2, v_genetics), (v_ms2, v_organ);
  INSERT INTO public.manuscript_categories (manuscript_id, category_id) VALUES (v_ms3, v_treatment);

END $$;
