import logging
import re
from collections import Counter
from typing import List, Optional

import numpy as np
from sklearn.feature_extraction.text import ENGLISH_STOP_WORDS, TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.core.config import settings

logger = logging.getLogger(__name__)

DEFAULT_STOPWORDS = set(ENGLISH_STOP_WORDS).union(
    {
        "study",
        "research",
        "using",
        "based",
        "analysis",
        "approach",
        "investigate",
        "investigating",
        "thesis",
        "examiner",
        "south",
        "africa",
    }
)

DOMAIN_KEYWORDS = {
    "Computer Science": {"machine learning", "artificial intelligence", "computer vision", "data mining", "software", "algorithm", "cybersecurity", "distributed systems", "cloud computing", "nlp"},
    "Engineering": {"structural", "mechanical", "electrical", "control systems", "manufacturing", "materials", "robotics", "civil engineering", "chemical engineering"},
    "Health Sciences": {"clinical", "epidemiology", "public health", "disease", "biomedical", "patient", "medicine", "nursing", "healthcare"},
    "Life Sciences": {"genetics", "microbiology", "ecology", "biodiversity", "molecular biology", "biochemistry", "cell biology", "plant", "animal"},
    "Social Sciences": {"education", "sociology", "politics", "economics", "development", "policy", "psychology", "anthropology", "governance"},
    "Business": {"finance", "marketing", "management", "entrepreneurship", "accounting", "operations", "supply chain", "leadership"},
    "Humanities": {"history", "literature", "philosophy", "language", "culture", "ethics", "theology", "linguistics"},
    "Environmental Science": {"climate", "sustainability", "water", "conservation", "renewable energy", "pollution", "environmental", "agriculture"},
}


class NLPService:
    def __init__(self) -> None:
        self._model = None
        self._fallback_vectorizer: Optional[TfidfVectorizer] = None
        self._use_fallback = False

    @property
    def model(self):
        if self._use_fallback:
            return None
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer

                self._model = SentenceTransformer(settings.EMBEDDING_MODEL)
            except Exception as exc:  # pragma: no cover - depends on optional dependency
                logger.warning("sentence-transformers unavailable, using TF-IDF fallback: %s", exc)
                self._use_fallback = True
        return self._model

    def extract_keywords(self, text: str) -> List[str]:
        cleaned = re.sub(r"[^a-zA-Z0-9\s-]", " ", text.lower())
        tokens = [token for token in cleaned.split() if len(token) > 2 and token not in DEFAULT_STOPWORDS]

        unigrams = Counter(tokens)
        bigrams = Counter(
            " ".join(pair)
            for pair in zip(tokens, tokens[1:])
            if pair[0] not in DEFAULT_STOPWORDS and pair[1] not in DEFAULT_STOPWORDS
        )

        ranked = [phrase for phrase, _ in bigrams.most_common(8)] + [word for word, _ in unigrams.most_common(10)]

        seen = set()
        keywords = []
        for item in ranked:
            normalized = item.strip()
            if not normalized or normalized in seen:
                continue
            seen.add(normalized)
            keywords.append(normalized)
            if len(keywords) >= 15:
                break
        return keywords

    def generate_embedding(self, text: str) -> List[float]:
        if self.model is not None:
            embedding = self.model.encode(text)
            if hasattr(embedding, "tolist"):
                embedding = embedding.tolist()
            return [float(value) for value in embedding]

        if self._fallback_vectorizer is None:
            self._fallback_vectorizer = TfidfVectorizer(max_features=384, stop_words="english")
            matrix = self._fallback_vectorizer.fit_transform([text])
        else:
            matrix = self._fallback_vectorizer.transform([text])
        return matrix.toarray()[0].astype(float).tolist()

    def compute_similarity(self, embedding1: List[float], embedding2: List[float]) -> float:
        if not embedding1 or not embedding2:
            return 0.0

        vec1 = np.array(embedding1, dtype=float).reshape(1, -1)
        vec2 = np.array(embedding2, dtype=float).reshape(1, -1)
        max_len = max(vec1.shape[1], vec2.shape[1])

        if vec1.shape[1] != max_len:
            vec1 = np.pad(vec1, ((0, 0), (0, max_len - vec1.shape[1])))
        if vec2.shape[1] != max_len:
            vec2 = np.pad(vec2, ((0, 0), (0, max_len - vec2.shape[1])))

        score = float(cosine_similarity(vec1, vec2)[0][0])
        return max(0.0, min(1.0, score))

    def identify_research_domains(self, text: str) -> List[str]:
        lowered = text.lower()
        matches = []
        for domain, keywords in DOMAIN_KEYWORDS.items():
            score = sum(1 for keyword in keywords if keyword in lowered)
            if score:
                matches.append((domain, score))

        matches.sort(key=lambda item: item[1], reverse=True)
        return [domain for domain, _ in matches[:5]] or ["Interdisciplinary Research"]
