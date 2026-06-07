from app.services.ranking_service import RankingService


def test_compute_final_score():
    service = RankingService()
    examiner = {
        "h_index": 40,
        "citation_count": 800,
        "recent_publication_count": 12,
        "academic_rank": "Professor",
    }
    score = service.compute_final_score(examiner, similarity_score=0.8, max_h_index=50, max_citations=1000, max_recent_pubs=20)
    assert score == 78.0


def test_rank_examiners():
    service = RankingService()
    examiners = [
        {
            "name": "Examiner A",
            "embedding": [1.0, 0.0],
            "h_index": 20,
            "citation_count": 300,
            "recent_publication_count": 5,
            "academic_rank": "Professor",
        },
        {
            "name": "Examiner B",
            "embedding": [0.2, 0.8],
            "h_index": 50,
            "citation_count": 900,
            "recent_publication_count": 10,
            "academic_rank": "Associate Professor",
        },
    ]
    ranked = service.rank_examiners(examiners, thesis_embedding=[1.0, 0.0])
    assert ranked[0]["name"] == "Examiner A"
    assert ranked[0]["final_score"] >= ranked[1]["final_score"]


def test_detect_conflicts():
    service = RankingService()
    examiner = {
        "university": "University of Cape Town",
        "department": "Computer Science",
        "supervisor_department": "Computer Science",
        "coauthors": ["Dr Jane Smith", "Prof John Doe"],
    }
    conflicts = service.detect_conflicts(examiner, "UCT", "John Doe")
    types = {item["type"] for item in conflicts}
    assert {"same_university", "same_department", "co_authorship"}.issubset(types)
