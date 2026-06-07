import asyncio
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class ResearcherService:
    def __init__(self) -> None:
        self.openalex_base = "https://api.openalex.org"
        self.crossref_base = "https://api.crossref.org"
        self.orcid_base = "https://pub.orcid.org/v3.0"
        self.timeout = httpx.Timeout(20.0, connect=10.0)
        self._canonical_universities = {
            "university of cape town": "University of Cape Town",
            "uct": "University of Cape Town",
            "stellenbosch university": "Stellenbosch University",
            "su": "Stellenbosch University",
            "university of pretoria": "University of Pretoria",
            "up": "University of Pretoria",
            "university of johannesburg": "University of Johannesburg",
            "uj": "University of Johannesburg",
            "university of the witwatersrand": "University of the Witwatersrand",
            "wits": "University of the Witwatersrand",
            "north-west university": "North-West University",
            "north west university": "North-West University",
            "nwu": "North-West University",
            "university of kwazulu-natal": "University of KwaZulu-Natal",
            "ukzn": "University of KwaZulu-Natal",
            "nelson mandela university": "Nelson Mandela University",
            "nmu": "Nelson Mandela University",
            "rhodes university": "Rhodes University",
            "ru": "Rhodes University",
            "university of the western cape": "University of the Western Cape",
            "uwc": "University of the Western Cape",
            "cape peninsula university of technology": "Cape Peninsula University of Technology",
            "cput": "Cape Peninsula University of Technology",
            "tshwane university of technology": "Tshwane University of Technology",
            "tut": "Tshwane University of Technology",
            "durban university of technology": "Durban University of Technology",
            "dut": "Durban University of Technology",
            "central university of technology": "Central University of Technology",
            "cut": "Central University of Technology",
            "vaal university of technology": "Vaal University of Technology",
            "vut": "Vaal University of Technology",
        }

    async def search_openalex(self, query: str, keywords: List[str]) -> List[dict]:
        search_query = " ".join(dict.fromkeys([query] + keywords[:8]))
        params = {
            "search": search_query,
            "filter": "institutions.country_code:ZA,publication_year:>={}".format(datetime.now(timezone.utc).year - 10),
            "per-page": 50,
            "page": 1,
            "mailto": settings.OPENALEX_EMAIL,
        }

        candidates: Dict[str, dict] = {}
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            for page in range(1, 4):
                params["page"] = page
                try:
                    response = await client.get(f"{self.openalex_base}/works", params=params)
                    response.raise_for_status()
                except httpx.HTTPError as exc:
                    logger.warning("OpenAlex work search failed on page %s: %s", page, exc)
                    break

                results = response.json().get("results", [])
                if not results:
                    break

                for work in results:
                    publication = self._parse_work(work)
                    for authorship in work.get("authorships", []):
                        author = authorship.get("author") or {}
                        author_id = author.get("id")
                        if not author_id:
                            continue
                        institutions = [inst.get("display_name", "") for inst in authorship.get("institutions", []) if inst.get("display_name")]
                        affiliations = institutions + authorship.get("raw_affiliation_strings", [])
                        if not self.is_south_african(affiliations):
                            continue
                        record = candidates.setdefault(
                            author_id,
                            {
                                "name": author.get("display_name", "Unknown Researcher"),
                                "openalex_id": author_id,
                                "university": self.normalize_university_name(institutions[0] if institutions else affiliations[0]),
                                "department": None,
                                "email": None,
                                "orcid": None,
                                "research_interests": [],
                                "h_index": 0,
                                "citation_count": 0,
                                "publication_count": 0,
                                "recent_publication_count": 0,
                                "academic_rank": "Researcher",
                                "publications": [],
                                "coauthors": set(),
                            },
                        )
                        record["recent_publication_count"] += 1 if publication.get("year", 0) >= datetime.now(timezone.utc).year - 5 else 0
                        if publication not in record["publications"]:
                            record["publications"].append(publication)
                        for coauthor in work.get("authorships", []):
                            coauthor_name = (coauthor.get("author") or {}).get("display_name")
                            if coauthor_name and coauthor_name != record["name"]:
                                record["coauthors"].add(coauthor_name)

            enriched = await self._enrich_candidates(client, list(candidates.values()))

        return enriched

    async def search_crossref(self, query: str) -> List[dict]:
        params = {"query": query, "rows": 20, "select": "DOI,title,author,subject,published-print,published-online,is-referenced-by-count"}
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(f"{self.crossref_base}/works", params=params)
                response.raise_for_status()
        except httpx.HTTPError as exc:
            logger.warning("Crossref search failed: %s", exc)
            return []

        items = response.json().get("message", {}).get("items", [])
        results = []
        for item in items:
            authors = [
                " ".join(part for part in [author.get("given"), author.get("family")] if part)
                for author in item.get("author", [])
            ]
            results.append(
                {
                    "title": (item.get("title") or [""])[0],
                    "doi": item.get("DOI"),
                    "authors": [author for author in authors if author],
                    "subjects": item.get("subject", []),
                    "citation_count": item.get("is-referenced-by-count", 0),
                }
            )
        return results

    async def get_researcher_publications(self, openalex_id: str) -> List[dict]:
        author_id = openalex_id.rsplit("/", 1)[-1]
        params = {
            "filter": f"author.id:{author_id}",
            "sort": "publication_year:desc",
            "per-page": 50,
            "page": 1,
            "mailto": settings.OPENALEX_EMAIL,
        }
        publications: List[dict] = []
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            for page in range(1, 3):
                params["page"] = page
                try:
                    response = await client.get(f"{self.openalex_base}/works", params=params)
                    response.raise_for_status()
                except httpx.HTTPError as exc:
                    logger.warning("OpenAlex publication fetch failed for %s: %s", openalex_id, exc)
                    break

                results = response.json().get("results", [])
                if not results:
                    break
                publications.extend(self._parse_work(work) for work in results)
        return publications

    async def enrich_with_orcid(self, orcid_id: str) -> dict:
        headers = {"Accept": "application/json"}
        try:
            async with httpx.AsyncClient(timeout=self.timeout, headers=headers) as client:
                response = await client.get(f"{self.orcid_base}/{orcid_id}/person")
                response.raise_for_status()
        except httpx.HTTPError as exc:
            logger.warning("ORCID enrichment failed for %s: %s", orcid_id, exc)
            return {}

        data = response.json()
        keywords = [
            keyword.get("content")
            for keyword in data.get("keywords", {}).get("keyword", [])
            if keyword.get("content")
        ]
        emails = [
            email.get("email")
            for email in data.get("emails", {}).get("email", [])
            if email.get("email")
        ]
        return {"keywords": keywords, "email": emails[0] if emails else None}

    def is_south_african(self, affiliations: List[str]) -> bool:
        return any(self.normalize_university_name(affiliation) for affiliation in affiliations if affiliation)

    def normalize_university_name(self, name: str) -> str:
        normalized = (name or "").strip().lower()
        normalized = normalized.replace("(uct)", "uct").replace("(wits)", "wits")
        for alias, canonical in self._canonical_universities.items():
            if alias in normalized:
                return canonical
        return ""

    async def _enrich_candidates(self, client: httpx.AsyncClient, candidates: List[dict]) -> List[dict]:
        semaphore = asyncio.Semaphore(5)

        async def fetch(author: dict) -> Optional[dict]:
            async with semaphore:
                try:
                    response = await client.get(f"{self.openalex_base}/authors/{author['openalex_id'].rsplit('/', 1)[-1]}", params={"mailto": settings.OPENALEX_EMAIL})
                    response.raise_for_status()
                except httpx.HTTPError as exc:
                    logger.warning("OpenAlex author enrichment failed for %s: %s", author.get('name'), exc)
                    return author

                payload = response.json()
                topics = [topic.get("display_name") for topic in payload.get("x_concepts", [])[:10] if topic.get("display_name")]
                author["research_interests"] = list(dict.fromkeys(topics + author.get("research_interests", [])))[:12]
                author["orcid"] = (payload.get("ids") or {}).get("orcid")
                summary = payload.get("summary_stats") or {}
                author["h_index"] = summary.get("h_index", 0) or 0
                author["citation_count"] = payload.get("cited_by_count", 0) or 0
                author["publication_count"] = payload.get("works_count", 0) or len(author.get("publications", []))
                rank = payload.get("last_known_institution", {}).get("display_name", "")
                author["university"] = self.normalize_university_name(rank) or author.get("university", "")
                author["coauthors"] = sorted(author.get("coauthors", set()))
                return author

        enriched = await asyncio.gather(*(fetch(candidate) for candidate in candidates))
        return [candidate for candidate in enriched if candidate and candidate.get("university")]

    def _parse_work(self, work: dict) -> dict:
        primary_location = work.get("primary_location") or {}
        source = primary_location.get("source") or {}
        return {
            "title": work.get("title"),
            "abstract": self._abstract_from_inverted_index(work.get("abstract_inverted_index")),
            "year": work.get("publication_year"),
            "journal": source.get("display_name"),
            "doi": work.get("doi"),
            "citation_count": work.get("cited_by_count", 0),
        }

    @staticmethod
    def _abstract_from_inverted_index(inverted_index: Optional[dict]) -> Optional[str]:
        if not inverted_index:
            return None
        words = []
        for token, positions in inverted_index.items():
            for position in positions:
                words.append((position, token))
        return " ".join(token for _, token in sorted(words))
