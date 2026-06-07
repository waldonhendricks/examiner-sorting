import asyncio
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.examiner import Examiner, Publication, SearchHistory
from app.schemas.examiner import SearchHistoryResponse, SearchResponse, ThesisSearchRequest
from app.services.nlp_service import NLPService
from app.services.ranking_service import RankingService
from app.services.researcher_service import ResearcherService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["search"])
nlp_service = NLPService()
researcher_service = ResearcherService()
ranking_service = RankingService()


@router.post("/api/search", response_model=SearchResponse)
async def search_examiners(request: ThesisSearchRequest, db: Session = Depends(get_db)) -> SearchResponse:
    try:
        search_text = " ".join(filter(None, [request.thesis_title, request.thesis_abstract, " ".join(request.keywords or [])]))
        keywords = request.keywords or nlp_service.extract_keywords(search_text)
        research_domains = nlp_service.identify_research_domains(search_text)
        thesis_embedding = nlp_service.generate_embedding(search_text)

        openalex_results, crossref_results = await asyncio.gather(
            researcher_service.search_openalex(search_text, keywords),
            researcher_service.search_crossref(search_text),
        )
        crossref_terms = []
        for item in crossref_results[:10]:
            crossref_terms.extend(item.get("subjects", []))
        combined_keywords = list(dict.fromkeys(keywords + [term.lower() for term in crossref_terms if isinstance(term, str)]))[:15]

        enriched_examiners = []
        for researcher in openalex_results:
            profile_text = " ".join(
                filter(
                    None,
                    [
                        researcher.get("name"),
                        researcher.get("university"),
                        " ".join(researcher.get("research_interests", [])),
                        " ".join(pub.get("title", "") for pub in researcher.get("publications", [])[:10]),
                        " ".join(combined_keywords),
                    ],
                )
            )
            researcher["embedding"] = nlp_service.generate_embedding(profile_text)
            if researcher.get("orcid"):
                orcid_profile = await researcher_service.enrich_with_orcid(researcher["orcid"].rsplit("/", 1)[-1])
                if orcid_profile.get("keywords"):
                    researcher["research_interests"] = list(
                        dict.fromkeys(researcher.get("research_interests", []) + orcid_profile["keywords"])
                    )[:15]
                if orcid_profile.get("email") and not researcher.get("email"):
                    researcher["email"] = orcid_profile["email"]
            enriched_examiners.append(researcher)

        ranked_examiners = ranking_service.rank_examiners(enriched_examiners, thesis_embedding)
        for examiner in ranked_examiners:
            examiner["conflict_flags"] = ranking_service.detect_conflicts(
                examiner,
                supervisor_university=request.supervisor_university or "",
                supervisor_name=request.supervisor_name or "",
            )

        for researcher in ranked_examiners:
            examiner = None
            if researcher.get("openalex_id"):
                examiner = db.query(Examiner).filter(Examiner.openalex_id == researcher["openalex_id"]).first()
            elif researcher.get("orcid"):
                examiner = db.query(Examiner).filter(Examiner.orcid == researcher["orcid"]).first()

            examiner_payload = {
                "name": researcher.get("name"),
                "university": researcher.get("university"),
                "department": researcher.get("department"),
                "email": researcher.get("email"),
                "orcid": researcher.get("orcid"),
                "openalex_id": researcher.get("openalex_id"),
                "research_interests": researcher.get("research_interests", []),
                "h_index": researcher.get("h_index", 0),
                "citation_count": researcher.get("citation_count", 0),
                "publication_count": researcher.get("publication_count", 0),
                "recent_publication_count": researcher.get("recent_publication_count", 0),
                "academic_rank": researcher.get("academic_rank"),
                "embedding": researcher.get("embedding"),
            }

            if examiner is None:
                examiner = Examiner(**examiner_payload)
                db.add(examiner)
                db.flush()
            else:
                for field, value in examiner_payload.items():
                    setattr(examiner, field, value)
                db.query(Publication).filter(Publication.examiner_id == examiner.id).delete()

            for publication in researcher.get("publications", []):
                db.add(Publication(examiner_id=examiner.id, **publication))

        history = SearchHistory(
            thesis_title=request.thesis_title,
            thesis_abstract=request.thesis_abstract,
            degree_type=request.degree_type,
            keywords=combined_keywords,
            results_count=len(ranked_examiners),
        )
        db.add(history)
        db.commit()

        return SearchResponse(
            thesis_title=request.thesis_title,
            degree_type=request.degree_type,
            keywords=combined_keywords,
            research_domains=research_domains,
            examiners=ranked_examiners,
            total_found=len(ranked_examiners),
        )
    except Exception as exc:
        logger.exception("Examiner search failed")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unable to complete examiner search: {exc}",
        ) from exc


@router.get("/api/search/history", response_model=list[SearchHistoryResponse])
async def get_search_history(db: Session = Depends(get_db)) -> list[SearchHistory]:
    return db.query(SearchHistory).order_by(SearchHistory.created_at.desc()).limit(50).all()
