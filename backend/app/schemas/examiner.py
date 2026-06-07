from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field


class ConflictFlag(BaseModel):
    type: str
    description: str


class ThesisSearchRequest(BaseModel):
    thesis_title: str = Field(..., min_length=3, max_length=500)
    thesis_abstract: str = Field(..., min_length=20)
    degree_type: Literal["masters", "phd"]
    keywords: Optional[List[str]] = None
    supervisor_university: Optional[str] = None
    supervisor_name: Optional[str] = None


class PublicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: Optional[str] = None
    abstract: Optional[str] = None
    year: Optional[int] = None
    journal: Optional[str] = None
    doi: Optional[str] = None
    citation_count: int = 0


class ExaminerBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: Optional[int] = None
    name: str
    university: str
    department: Optional[str] = None
    email: Optional[str] = None
    orcid: Optional[str] = None
    openalex_id: Optional[str] = None
    research_interests: List[str] = Field(default_factory=list)
    h_index: int = 0
    citation_count: int = 0
    publication_count: int = 0
    recent_publication_count: int = 0
    academic_rank: Optional[str] = None
    embedding: Optional[List[float]] = None
    last_updated: Optional[datetime] = None
    created_at: Optional[datetime] = None


class ExaminerResponse(ExaminerBase):
    similarity_score: float = 0.0
    final_score: float = 0.0
    conflict_flags: List[ConflictFlag] = Field(default_factory=list)
    component_scores: Dict[str, float] = Field(default_factory=dict)


class ExaminerDetailResponse(ExaminerBase):
    publications: List[PublicationResponse] = Field(default_factory=list)


class SearchResponse(BaseModel):
    thesis_title: str
    degree_type: str
    keywords: List[str]
    research_domains: List[str]
    examiners: List[ExaminerResponse]
    total_found: int
    generated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class SearchHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    thesis_title: str
    thesis_abstract: str
    degree_type: str
    keywords: List[str] = Field(default_factory=list)
    results_count: int
    created_at: datetime


class ReportRequest(BaseModel):
    search_request: ThesisSearchRequest
    examiners: List[ExaminerResponse]


class ExaminerListResponse(BaseModel):
    items: List[ExaminerDetailResponse]
    total: int
    skip: int
    limit: int


class MessageResponse(BaseModel):
    detail: str
    metadata: Optional[Dict[str, Any]] = None
