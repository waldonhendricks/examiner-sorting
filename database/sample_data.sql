-- Examiner Finder SA - Sample Dataset
-- Fictional researcher profiles for testing and demonstration purposes
-- All email addresses and ORCID IDs are fictional

-- ============================================================
-- SAMPLE EXAMINERS - Computer Science / AI / ML
-- ============================================================
INSERT INTO examiners (name, university, department, email, orcid, h_index, citation_count, publication_count, recent_publication_count, academic_rank, research_interests, keywords, profile_url) VALUES
(
    'Prof. Nomvula Mahlangu',
    'University of the Witwatersrand',
    'School of Computer Science and Applied Mathematics',
    'n.mahlangu@wits.ac.za',
    '0000-0001-2345-6789',
    42, 7800, 115, 20,
    'Full Professor',
    ARRAY['artificial intelligence', 'machine learning', 'computer vision', 'deep learning'],
    ARRAY['CNN', 'object detection', 'image classification', 'neural architecture search'],
    'https://www.wits.ac.za/staff/n-mahlangu'
),
(
    'Prof. Dirk van der Merwe',
    'Stellenbosch University',
    'Department of Computer Science',
    'd.vandermerwe@sun.ac.za',
    '0000-0002-3456-7890',
    38, 6200, 98, 16,
    'Full Professor',
    ARRAY['natural language processing', 'computational linguistics', 'transformer models', 'multilingual NLP'],
    ARRAY['BERT', 'GPT', 'text classification', 'sentiment analysis', 'Afrikaans NLP'],
    'https://www.sun.ac.za/staff/d-vandermerwe'
),
(
    'Dr. Ayasha Naidoo',
    'University of KwaZulu-Natal',
    'Discipline of Computer Science',
    'a.naidoo@ukzn.ac.za',
    '0000-0003-4567-8901',
    24, 3400, 67, 25,
    'Associate Professor',
    ARRAY['data science', 'big data analytics', 'cloud computing', 'distributed systems'],
    ARRAY['Apache Spark', 'Hadoop', 'stream processing', 'data pipelines'],
    NULL
),
(
    'Prof. Tebogo Sithole',
    'University of Pretoria',
    'Department of Computer Science',
    't.sithole@up.ac.za',
    '0000-0004-5678-9012',
    51, 9100, 138, 14,
    'Distinguished Professor',
    ARRAY['algorithms', 'graph theory', 'combinatorial optimisation', 'operations research'],
    ARRAY['network flow', 'traveling salesman', 'approximation algorithms', 'NP-hard'],
    'https://www.up.ac.za/staff/t-sithole'
),
(
    'Dr. Zanele Dlamini',
    'University of Cape Town',
    'Department of Computer Science',
    'z.dlamini@uct.ac.za',
    '0000-0005-6789-0123',
    19, 2600, 52, 22,
    'Senior Lecturer',
    ARRAY['cybersecurity', 'network security', 'cryptography', 'privacy'],
    ARRAY['intrusion detection', 'blockchain', 'zero-knowledge proofs', 'secure multiparty computation'],
    NULL
);

-- ============================================================
-- SAMPLE EXAMINERS - Engineering
-- ============================================================
INSERT INTO examiners (name, university, department, email, h_index, citation_count, publication_count, recent_publication_count, academic_rank, research_interests, keywords) VALUES
(
    'Prof. Francois Joubert',
    'University of Pretoria',
    'Department of Electrical, Electronic and Computer Engineering',
    'f.joubert@up.ac.za',
    44, 8100, 122, 18,
    'Full Professor',
    ARRAY['power electronics', 'renewable energy', 'smart grids', 'electric vehicles'],
    ARRAY['inverter design', 'solar PV', 'battery storage', 'grid integration']
),
(
    'Dr. Siphokazi Mthembu',
    'Tshwane University of Technology',
    'Department of Electrical Engineering',
    's.mthembu@tut.ac.za',
    16, 2100, 44, 18,
    'Senior Lecturer',
    ARRAY['signal processing', 'embedded systems', 'IoT', 'wireless sensor networks'],
    ARRAY['FPGA', 'microcontroller', 'edge computing', 'MQTT']
),
(
    'Prof. Heinrich Badenhorst',
    'North-West University',
    'School of Chemical and Minerals Engineering',
    'h.badenhorst@nwu.ac.za',
    36, 5800, 94, 12,
    'Full Professor',
    ARRAY['chemical engineering', 'process optimization', 'carbon materials', 'electrochemistry'],
    ARRAY['graphene', 'carbon nanotubes', 'electrode materials', 'fuel cells']
),
(
    'Prof. Lindiwe Khumalo',
    'University of Johannesburg',
    'Faculty of Engineering and the Built Environment',
    'l.khumalo@uj.ac.za',
    29, 4200, 78, 19,
    'Associate Professor',
    ARRAY['structural engineering', 'concrete technology', 'sustainable construction', 'geopolymers'],
    ARRAY['fly ash', 'slag', 'durability', 'compressive strength']
);

-- ============================================================
-- SAMPLE EXAMINERS - Life Sciences / Biomedical
-- ============================================================
INSERT INTO examiners (name, university, department, email, h_index, citation_count, publication_count, recent_publication_count, academic_rank, research_interests, keywords) VALUES
(
    'Prof. Nolwazi Ntuli',
    'University of the Witwatersrand',
    'Faculty of Health Sciences',
    'n.ntuli@wits.ac.za',
    48, 9200, 130, 17,
    'Full Professor',
    ARRAY['infectious diseases', 'HIV/AIDS', 'tuberculosis', 'antimicrobial resistance'],
    ARRAY['drug resistance', 'treatment outcomes', 'co-infection', 'epidemiology']
),
(
    'Dr. Pieter Botha',
    'Stellenbosch University',
    'Division of Molecular Biology and Human Genetics',
    'p.botha@sun.ac.za',
    27, 4000, 72, 23,
    'Associate Professor',
    ARRAY['genomics', 'bioinformatics', 'population genetics', 'GWAS'],
    ARRAY['SNP', 'whole genome sequencing', 'variant calling', 'African genomics']
),
(
    'Prof. Funmilayo Okonkwo',
    'University of Cape Town',
    'Department of Integrative Biomedical Sciences',
    'f.okonkwo@uct.ac.za',
    40, 7100, 108, 21,
    'Full Professor',
    ARRAY['cancer biology', 'oncology', 'drug discovery', 'medicinal chemistry'],
    ARRAY['tumor microenvironment', 'apoptosis', 'drug resistance', 'clinical trials']
),
(
    'Dr. Sibusiso Nxele',
    'University of KwaZulu-Natal',
    'School of Life Sciences',
    's.nxele@ukzn.ac.za',
    18, 2400, 56, 24,
    'Senior Lecturer',
    ARRAY['plant biology', 'ethnobotany', 'biodiversity', 'conservation ecology'],
    ARRAY['medicinal plants', 'phytochemistry', 'species richness', 'vegetation surveys']
);

-- ============================================================
-- SAMPLE EXAMINERS - Social Sciences / Education
-- ============================================================
INSERT INTO examiners (name, university, department, email, h_index, citation_count, publication_count, recent_publication_count, academic_rank, research_interests, keywords) VALUES
(
    'Prof. Miriam van Rooyen',
    'University of the Western Cape',
    'Faculty of Education',
    'm.vanrooyen@uwc.ac.za',
    22, 3200, 68, 19,
    'Full Professor',
    ARRAY['educational technology', 'blended learning', 'higher education', 'decolonisation'],
    ARRAY['e-learning', 'curriculum development', 'student engagement', 'Ubuntu pedagogy']
),
(
    'Dr. Lethiwe Zungu',
    'University of Johannesburg',
    'Department of Sociology',
    'l.zungu@uj.ac.za',
    14, 1800, 42, 20,
    'Senior Lecturer',
    ARRAY['social inequality', 'poverty', 'labour economics', 'youth unemployment'],
    ARRAY['Gini coefficient', 'social mobility', 'informal economy', 'youth NEET']
),
(
    'Prof. Abraham Swanepoel',
    'North-West University',
    'Faculty of Law',
    'a.swanepoel@nwu.ac.za',
    20, 2900, 65, 15,
    'Full Professor',
    ARRAY['constitutional law', 'human rights', 'administrative law', 'environmental law'],
    ARRAY['Bill of Rights', 'judicial review', 'socioeconomic rights', 'climate litigation']
);

-- ============================================================
-- SAMPLE EXAMINERS - Health Sciences / Public Health
-- ============================================================
INSERT INTO examiners (name, university, department, email, h_index, citation_count, publication_count, recent_publication_count, academic_rank, research_interests, keywords) VALUES
(
    'Prof. Adaeze Obi',
    'University of Pretoria',
    'School of Health Systems and Public Health',
    'a.obi@up.ac.za',
    33, 5100, 88, 22,
    'Full Professor',
    ARRAY['public health', 'health policy', 'maternal health', 'child nutrition'],
    ARRAY['stunting', 'wasting', 'antenatal care', 'community health workers']
),
(
    'Dr. Thandi Molefe',
    'Nelson Mandela University',
    'Faculty of Health Sciences',
    't.molefe@mandela.ac.za',
    15, 1900, 48, 21,
    'Associate Professor',
    ARRAY['occupational health', 'physiotherapy', 'rehabilitation', 'sports medicine'],
    ARRAY['ergonomics', 'musculoskeletal disorders', 'work-related injuries', 'disability']
);

-- ============================================================
-- SAMPLE PUBLICATIONS
-- ============================================================
INSERT INTO publications (examiner_id, title, abstract, year, journal, doi, citation_count) 
SELECT 
    e.id,
    'Deep Learning for Medical Image Segmentation: A Comprehensive Review',
    'This paper provides a systematic review of deep learning methods applied to medical image segmentation across multiple modalities including MRI, CT, and histopathology.',
    2023,
    'Medical Image Analysis',
    '10.1016/j.media.2023.001',
    312
FROM examiners e WHERE e.name = 'Prof. Nomvula Mahlangu';

INSERT INTO publications (examiner_id, title, abstract, year, journal, doi, citation_count)
SELECT
    e.id,
    'Convolutional Neural Networks for Retinal Disease Detection',
    'We present a novel CNN architecture for automated detection of diabetic retinopathy from fundus images, achieving 96.2% sensitivity on the MESSIDOR-2 dataset.',
    2022,
    'IEEE Transactions on Medical Imaging',
    '10.1109/TMI.2022.001',
    189
FROM examiners e WHERE e.name = 'Prof. Nomvula Mahlangu';

INSERT INTO publications (examiner_id, title, abstract, year, journal, doi, citation_count)
SELECT
    e.id,
    'AfriNLP: A Benchmark for African Language NLP',
    'We introduce a comprehensive benchmark for evaluating natural language processing models on 15 African languages including Zulu, Xhosa, and Afrikaans.',
    2023,
    'ACL Anthology',
    '10.18653/v1/2023.001',
    245
FROM examiners e WHERE e.name = 'Prof. Dirk van der Merwe';

INSERT INTO publications (examiner_id, title, abstract, year, journal, doi, citation_count)
SELECT
    e.id,
    'Transformer-based Sentiment Analysis for Code-Switched Text',
    'We fine-tune multilingual BERT for sentiment classification on English-Zulu and English-Afrikaans code-switched social media text from South Africa.',
    2022,
    'Natural Language Engineering',
    '10.1017/S1351324922000456',
    134
FROM examiners e WHERE e.name = 'Prof. Dirk van der Merwe';

INSERT INTO publications (examiner_id, title, abstract, year, journal, doi, citation_count)
SELECT
    e.id,
    'HIV Drug Resistance Patterns in Sub-Saharan Africa: A Meta-Analysis',
    'A systematic meta-analysis of antiretroviral drug resistance mutations across 45 cohort studies in sub-Saharan Africa between 2015 and 2022.',
    2023,
    'The Lancet HIV',
    '10.1016/S2352-3018(23)00012-3',
    428
FROM examiners e WHERE e.name = 'Prof. Nolwazi Ntuli';

INSERT INTO publications (examiner_id, title, abstract, year, journal, doi, citation_count)
SELECT
    e.id,
    'Whole-Genome Sequencing Reveals Population Structure in Southern African Populations',
    'Analysis of 2,400 whole-genome sequences from eight Southern African populations reveals novel variants with implications for precision medicine.',
    2022,
    'Nature Communications',
    '10.1038/s41467-022-01234-5',
    312
FROM examiners e WHERE e.name = 'Dr. Pieter Botha';
