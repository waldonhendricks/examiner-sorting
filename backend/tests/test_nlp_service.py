import numpy as np

from app.services.nlp_service import NLPService


class FakeModel:
    def encode(self, text: str):
        return np.array([0.1, 0.2, 0.3], dtype=float)


def test_generate_embedding():
    service = NLPService()
    service._model = FakeModel()
    embedding = service.generate_embedding("machine learning for healthcare")
    assert embedding == [0.1, 0.2, 0.3]
    assert all(isinstance(value, float) for value in embedding)


def test_compute_similarity():
    service = NLPService()
    score = service.compute_similarity([1.0, 0.0], [0.5, 0.5])
    assert 0.0 <= score <= 1.0
    assert round(score, 2) == 0.71


def test_extract_keywords():
    service = NLPService()
    text = "Machine learning methods for cancer diagnosis using medical imaging and data analysis."
    keywords = service.extract_keywords(text)
    assert "machine learning" in keywords
    assert "cancer diagnosis" in keywords
    assert any("medical" in keyword for keyword in keywords)


def test_identify_research_domains():
    service = NLPService()
    domains = service.identify_research_domains("This study applies machine learning and computer vision to clinical imaging.")
    assert "Computer Science" in domains
    assert "Health Sciences" in domains
