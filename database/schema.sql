-- Examiner Finder SA - Database Schema
-- PostgreSQL 15+

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- for fuzzy text search

-- ============================================================
-- UNIVERSITIES TABLE
-- ============================================================
CREATE TABLE universities (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL UNIQUE,
    abbreviation VARCHAR(20),
    city        VARCHAR(100),
    province    VARCHAR(100),
    website     VARCHAR(255),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert all 15 South African universities
INSERT INTO universities (name, abbreviation, city, province, website) VALUES
    ('University of Cape Town',                  'UCT',   'Cape Town',     'Western Cape',  'https://www.uct.ac.za'),
    ('Stellenbosch University',                  'SU',    'Stellenbosch',  'Western Cape',  'https://www.sun.ac.za'),
    ('University of Pretoria',                   'UP',    'Pretoria',      'Gauteng',       'https://www.up.ac.za'),
    ('University of Johannesburg',               'UJ',    'Johannesburg',  'Gauteng',       'https://www.uj.ac.za'),
    ('University of the Witwatersrand',          'Wits',  'Johannesburg',  'Gauteng',       'https://www.wits.ac.za'),
    ('North-West University',                    'NWU',   'Potchefstroom', 'North West',    'https://www.nwu.ac.za'),
    ('University of KwaZulu-Natal',              'UKZN',  'Durban',        'KwaZulu-Natal', 'https://www.ukzn.ac.za'),
    ('Nelson Mandela University',                'NMU',   'Gqeberha',      'Eastern Cape',  'https://www.mandela.ac.za'),
    ('Rhodes University',                        'RU',    'Makhanda',      'Eastern Cape',  'https://www.ru.ac.za'),
    ('University of the Western Cape',           'UWC',   'Cape Town',     'Western Cape',  'https://www.uwc.ac.za'),
    ('Cape Peninsula University of Technology',  'CPUT',  'Cape Town',     'Western Cape',  'https://www.cput.ac.za'),
    ('Tshwane University of Technology',         'TUT',   'Pretoria',      'Gauteng',       'https://www.tut.ac.za'),
    ('Durban University of Technology',          'DUT',   'Durban',        'KwaZulu-Natal', 'https://www.dut.ac.za'),
    ('Central University of Technology',         'CUT',   'Bloemfontein',  'Free State',    'https://www.cut.ac.za'),
    ('Vaal University of Technology',            'VUT',   'Vanderbijlpark', 'Gauteng',      'https://www.vut.ac.za');

-- ============================================================
-- EXAMINERS TABLE
-- ============================================================
CREATE TABLE examiners (
    id                      SERIAL PRIMARY KEY,
    name                    VARCHAR(255) NOT NULL,
    university_id           INTEGER REFERENCES universities(id),
    university              VARCHAR(255) NOT NULL,
    department              VARCHAR(255),
    email                   VARCHAR(255),
    orcid                   VARCHAR(50) UNIQUE,
    openalex_id             VARCHAR(100) UNIQUE,
    crossref_id             VARCHAR(100),
    research_interests      TEXT[],
    keywords                TEXT[],
    h_index                 INTEGER DEFAULT 0,
    citation_count          INTEGER DEFAULT 0,
    publication_count       INTEGER DEFAULT 0,
    recent_publication_count INTEGER DEFAULT 0,  -- publications in last 5 years
    academic_rank           VARCHAR(100),        -- Professor, Associate Professor, etc.
    embedding               FLOAT8[],            -- semantic embedding vector
    profile_url             VARCHAR(500),
    last_updated            TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active               BOOLEAN DEFAULT TRUE
);

-- Indexes for performance
CREATE INDEX idx_examiners_university ON examiners(university);
CREATE INDEX idx_examiners_h_index ON examiners(h_index DESC);
CREATE INDEX idx_examiners_citation_count ON examiners(citation_count DESC);
CREATE INDEX idx_examiners_name_trgm ON examiners USING gin(name gin_trgm_ops);
CREATE INDEX idx_examiners_research_interests ON examiners USING gin(research_interests);

-- ============================================================
-- PUBLICATIONS TABLE
-- ============================================================
CREATE TABLE publications (
    id              SERIAL PRIMARY KEY,
    examiner_id     INTEGER REFERENCES examiners(id) ON DELETE CASCADE,
    title           VARCHAR(1000) NOT NULL,
    abstract        TEXT,
    year            INTEGER,
    journal         VARCHAR(500),
    doi             VARCHAR(255) UNIQUE,
    openalex_id     VARCHAR(100),
    citation_count  INTEGER DEFAULT 0,
    url             VARCHAR(500),
    embedding       FLOAT8[],   -- semantic embedding for this publication
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_publications_examiner_id ON publications(examiner_id);
CREATE INDEX idx_publications_year ON publications(year DESC);
CREATE INDEX idx_publications_citation_count ON publications(citation_count DESC);
CREATE INDEX idx_publications_doi ON publications(doi);

-- ============================================================
-- SEARCH HISTORY TABLE
-- ============================================================
CREATE TABLE search_history (
    id              SERIAL PRIMARY KEY,
    session_id      UUID DEFAULT uuid_generate_v4(),
    thesis_title    VARCHAR(1000) NOT NULL,
    thesis_abstract TEXT NOT NULL,
    degree_type     VARCHAR(20) CHECK (degree_type IN ('masters', 'phd')),
    keywords        TEXT[],
    supervisor_university VARCHAR(255),
    supervisor_name VARCHAR(255),
    extracted_keywords TEXT[],
    research_domains TEXT[],
    results_count   INTEGER DEFAULT 0,
    search_duration_ms INTEGER,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_search_history_created_at ON search_history(created_at DESC);
CREATE INDEX idx_search_history_degree_type ON search_history(degree_type);

-- ============================================================
-- SEARCH RESULTS TABLE (cache results)
-- ============================================================
CREATE TABLE search_results (
    id              SERIAL PRIMARY KEY,
    search_id       INTEGER REFERENCES search_history(id) ON DELETE CASCADE,
    examiner_id     INTEGER REFERENCES examiners(id),
    rank_position   INTEGER,
    final_score     FLOAT,
    similarity_score FLOAT,
    h_index_score   FLOAT,
    citation_score  FLOAT,
    recent_pubs_score FLOAT,
    rank_score      FLOAT,
    conflict_flags  JSONB DEFAULT '[]',
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_search_results_search_id ON search_results(search_id);
CREATE INDEX idx_search_results_rank ON search_results(search_id, rank_position);

-- ============================================================
-- CONFLICT DEFINITIONS TABLE
-- ============================================================
CREATE TABLE conflict_types (
    id          SERIAL PRIMARY KEY,
    code        VARCHAR(50) UNIQUE NOT NULL,
    name        VARCHAR(200) NOT NULL,
    description TEXT,
    severity    VARCHAR(10) CHECK (severity IN ('low', 'medium', 'high'))
);

INSERT INTO conflict_types (code, name, description, severity) VALUES
    ('SAME_UNIVERSITY',    'Same University',       'Examiner is from the same university as the supervisor', 'high'),
    ('SAME_DEPARTMENT',    'Same Department',        'Examiner is from the same department as the supervisor', 'high'),
    ('CO_AUTHORSHIP',      'Co-authorship',          'Examiner has co-authored with the supervisor in the last 5 years', 'high'),
    ('COLLABORATION',      'Existing Collaboration', 'Examiner has an existing collaboration with the supervisor', 'medium'),
    ('RECENT_CO_AUTHOR',   'Recent Co-author',       'Examiner co-authored with supervisor within last 2 years', 'high');

-- ============================================================
-- SAMPLE DATA - EXAMINERS
-- ============================================================
-- Sample researchers (anonymized/fictional for testing)
INSERT INTO examiners (name, university, department, h_index, citation_count, publication_count, recent_publication_count, academic_rank, research_interests, keywords) VALUES
    ('Prof. Sarah Johnson',      'University of Cape Town',          'Computer Science',         45, 8200,  120, 18, 'Full Professor',         ARRAY['machine learning', 'natural language processing', 'AI'], ARRAY['deep learning', 'transformer', 'NLP']),
    ('Prof. Michael van der Berg','Stellenbosch University',         'Electrical Engineering',   38, 6100,   98, 14, 'Full Professor',         ARRAY['signal processing', 'computer vision', 'robotics'], ARRAY['image processing', 'neural networks']),
    ('Dr. Amina Ndlovu',          'University of the Witwatersrand', 'Bioinformatics',           28, 4200,   74, 22, 'Associate Professor',    ARRAY['genomics', 'computational biology', 'bioinformatics'], ARRAY['gene expression', 'proteomics']),
    ('Prof. David Mokoena',       'University of Pretoria',          'Mathematics',              52, 9800,  145, 12, 'Distinguished Professor', ARRAY['numerical analysis', 'optimization', 'applied mathematics'], ARRAY['finite element', 'optimization']),
    ('Dr. Fatima Patel',          'University of Johannesburg',      'Data Science',             21, 3100,   62, 28, 'Senior Lecturer',        ARRAY['data mining', 'predictive analytics', 'machine learning'], ARRAY['classification', 'regression', 'clustering']),
    ('Prof. Themba Dlamini',      'University of KwaZulu-Natal',     'Physics',                  41, 7300,  112, 16, 'Full Professor',         ARRAY['quantum physics', 'condensed matter', 'materials science'], ARRAY['quantum computing', 'semiconductors']),
    ('Dr. Claire Botha',          'Rhodes University',               'Environmental Science',    19, 2800,   58, 20, 'Senior Lecturer',        ARRAY['ecology', 'climate change', 'biodiversity'], ARRAY['carbon sequestration', 'ecosystem']),
    ('Prof. Emmanuel Osei',       'North-West University',           'Chemistry',                35, 5600,   89, 10, 'Associate Professor',    ARRAY['organic chemistry', 'drug synthesis', 'medicinal chemistry'], ARRAY['synthesis', 'pharmacology']),
    ('Dr. Zanele Khumalo',        'Nelson Mandela University',       'Engineering',              16, 2200,   47, 24, 'Lecturer',               ARRAY['civil engineering', 'structural analysis', 'geotechnics'], ARRAY['foundation', 'soil mechanics']),
    ('Prof. Pieter Joubert',      'University of the Western Cape',  'Public Health',            29, 4500,   78, 15, 'Full Professor',         ARRAY['epidemiology', 'health systems', 'infectious disease'], ARRAY['TB', 'HIV', 'mortality']);

-- ============================================================
-- VIEWS
-- ============================================================

-- View: top examiners by university
CREATE VIEW top_examiners_by_university AS
SELECT 
    university,
    COUNT(*) AS examiner_count,
    ROUND(AVG(h_index)::numeric, 1) AS avg_h_index,
    SUM(citation_count) AS total_citations,
    SUM(publication_count) AS total_publications
FROM examiners
WHERE is_active = TRUE
GROUP BY university
ORDER BY avg_h_index DESC;

-- View: examiner summary
CREATE VIEW examiner_summary AS
SELECT
    e.id,
    e.name,
    e.university,
    e.department,
    e.email,
    e.orcid,
    e.h_index,
    e.citation_count,
    e.publication_count,
    e.recent_publication_count,
    e.academic_rank,
    e.research_interests,
    COUNT(p.id) AS stored_publications,
    MAX(p.year) AS latest_publication_year
FROM examiners e
LEFT JOIN publications p ON e.id = p.examiner_id
WHERE e.is_active = TRUE
GROUP BY e.id, e.name, e.university, e.department, e.email, e.orcid,
         e.h_index, e.citation_count, e.publication_count, 
         e.recent_publication_count, e.academic_rank, e.research_interests;

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Function: update examiner last_updated on publication insert
CREATE OR REPLACE FUNCTION update_examiner_last_updated()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE examiners SET last_updated = NOW() WHERE id = NEW.examiner_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_examiner_on_publication
    AFTER INSERT OR UPDATE ON publications
    FOR EACH ROW EXECUTE FUNCTION update_examiner_last_updated();

-- ============================================================
-- GRANTS (for application user)
-- ============================================================
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO examiner_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO examiner_app;
