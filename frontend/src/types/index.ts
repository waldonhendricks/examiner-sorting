export interface ThesisSearchRequest {
  thesis_title: string;
  thesis_abstract: string;
  degree_type: "masters" | "phd";
  keywords?: string[];
  supervisor_university?: string;
  supervisor_name?: string;
}

export interface ConflictFlag {
  type: string;
  description: string;
  severity: "low" | "medium" | "high";
}

export interface Publication {
  id: number;
  title: string;
  year: number;
  journal?: string;
  doi?: string;
  citation_count: number;
  url?: string;
}

export interface ScoreBreakdown {
  topic_similarity: number;
  h_index_score: number;
  citation_score: number;
  recent_pubs_score: number;
  academic_rank_score: number;
}

export interface Examiner {
  id: number;
  rank: number;
  name: string;
  university: string;
  department?: string;
  email?: string;
  orcid?: string;
  openalex_id?: string;
  research_interests: string[];
  h_index: number;
  citation_count: number;
  publication_count: number;
  recent_publication_count: number;
  academic_rank?: string;
  profile_url?: string;
  similarity_score: number;
  final_score: number;
  score_breakdown: ScoreBreakdown;
  conflict_flags: ConflictFlag[];
  top_publications?: Publication[];
}

export interface SearchResponse {
  thesis_title: string;
  thesis_abstract: string;
  degree_type: string;
  keywords: string[];
  extracted_keywords: string[];
  research_domains: string[];
  total_found: number;
  examiners: Examiner[];
}
