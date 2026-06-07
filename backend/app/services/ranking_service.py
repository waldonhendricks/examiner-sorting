from typing import Dict, List

from app.services.nlp_service import NLPService
from app.services.researcher_service import ResearcherService


class RankingService:
    WEIGHTS = {
        "topic_similarity": 0.40,
        "h_index": 0.20,
        "citation_count": 0.15,
        "recent_publications": 0.15,
        "academic_rank": 0.10,
    }

    ACADEMIC_RANK_SCORES = {
        "distinguished professor": 1.0,
        "full professor": 0.9,
        "professor": 0.9,
        "associate professor": 0.75,
        "senior lecturer": 0.6,
        "lecturer": 0.4,
        "postdoctoral": 0.2,
        "researcher": 0.3,
    }

    def __init__(self) -> None:
        self.nlp_service = NLPService()
        self.researcher_service = ResearcherService()

    def compute_final_score(
        self,
        examiner: dict,
        similarity_score: float,
        max_h_index: int,
        max_citations: int,
        max_recent_pubs: int,
    ) -> float:
        h_index_score = (examiner.get("h_index", 0) / max(max_h_index, 1)) if max_h_index else 0.0
        citation_score = (examiner.get("citation_count", 0) / max(max_citations, 1)) if max_citations else 0.0
        recent_score = (examiner.get("recent_publication_count", 0) / max(max_recent_pubs, 1)) if max_recent_pubs else 0.0
        academic_rank_score = self._academic_rank_score(examiner.get("academic_rank"))

        total = (
            similarity_score * self.WEIGHTS["topic_similarity"]
            + h_index_score * self.WEIGHTS["h_index"]
            + citation_score * self.WEIGHTS["citation_count"]
            + recent_score * self.WEIGHTS["recent_publications"]
            + academic_rank_score * self.WEIGHTS["academic_rank"]
        )
        return round(total * 100, 2)

    def rank_examiners(self, examiners: List[dict], thesis_embedding: List[float]) -> List[dict]:
        if not examiners:
            return []

        max_h_index = max((examiner.get("h_index", 0) for examiner in examiners), default=0)
        max_citations = max((examiner.get("citation_count", 0) for examiner in examiners), default=0)
        max_recent_pubs = max((examiner.get("recent_publication_count", 0) for examiner in examiners), default=0)

        ranked = []
        for examiner in examiners:
            embedding = examiner.get("embedding") or []
            similarity_score = self.nlp_service.compute_similarity(thesis_embedding, embedding)
            final_score = self.compute_final_score(
                examiner=examiner,
                similarity_score=similarity_score,
                max_h_index=max_h_index,
                max_citations=max_citations,
                max_recent_pubs=max_recent_pubs,
            )
            ranked_examiner = dict(examiner)
            ranked_examiner["similarity_score"] = round(similarity_score, 4)
            ranked_examiner["final_score"] = final_score
            ranked_examiner["component_scores"] = {
                "topic_similarity": round(similarity_score * 100, 2),
                "h_index": round(((examiner.get("h_index", 0) / max(max_h_index, 1)) if max_h_index else 0.0) * 100, 2),
                "citation_count": round(((examiner.get("citation_count", 0) / max(max_citations, 1)) if max_citations else 0.0) * 100, 2),
                "recent_publications": round(((examiner.get("recent_publication_count", 0) / max(max_recent_pubs, 1)) if max_recent_pubs else 0.0) * 100, 2),
                "academic_rank": round(self._academic_rank_score(examiner.get("academic_rank")) * 100, 2),
            }
            ranked.append(ranked_examiner)

        ranked.sort(key=lambda item: (item["final_score"], item["similarity_score"], item.get("citation_count", 0)), reverse=True)
        return ranked

    def detect_conflicts(self, examiner: dict, supervisor_university: str, supervisor_name: str) -> List[dict]:
        conflicts: List[Dict[str, str]] = []
        examiner_university = self.researcher_service.normalize_university_name(examiner.get("university", ""))
        supervisor_university_normalized = self.researcher_service.normalize_university_name(supervisor_university or "")

        if examiner_university and supervisor_university_normalized and examiner_university == supervisor_university_normalized:
            conflicts.append(
                {
                    "type": "same_university",
                    "description": f"Examiner is affiliated with {examiner_university}, which matches the supervisor's university.",
                }
            )

        supervisor_department = (examiner.get("supervisor_department") or "").strip().lower()
        examiner_department = (examiner.get("department") or "").strip().lower()
        if supervisor_department and examiner_department and supervisor_department == examiner_department:
            conflicts.append(
                {
                    "type": "same_department",
                    "description": f"Examiner and supervisor are in the same department ({examiner.get('department')}).",
                }
            )

        normalized_supervisor = (supervisor_name or "").strip().lower()
        if normalized_supervisor:
            coauthors = [name.lower() for name in examiner.get("coauthors", []) if name]
            if any(normalized_supervisor in coauthor or coauthor in normalized_supervisor for coauthor in coauthors):
                conflicts.append(
                    {
                        "type": "co_authorship",
                        "description": f"Potential prior co-authorship detected with supervisor {supervisor_name}.",
                    }
                )

        return conflicts

    def _academic_rank_score(self, academic_rank: str | None) -> float:
        normalized = (academic_rank or "researcher").strip().lower()
        for rank, score in self.ACADEMIC_RANK_SCORES.items():
            if rank in normalized:
                return score
        return self.ACADEMIC_RANK_SCORES["researcher"]
