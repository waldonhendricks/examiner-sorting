from datetime import datetime, timezone

from sqlalchemy import JSON, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship

from app.core.database import Base


string_array = ARRAY(String).with_variant(JSON, "sqlite")
float_array = ARRAY(Float).with_variant(JSON, "sqlite")


class Examiner(Base):
    __tablename__ = "examiners"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    university = Column(String, nullable=False, index=True)
    department = Column(String)
    email = Column(String)
    orcid = Column(String, unique=True, nullable=True, index=True)
    openalex_id = Column(String, unique=True, nullable=True, index=True)
    research_interests = Column(string_array)
    h_index = Column(Integer, default=0)
    citation_count = Column(Integer, default=0)
    publication_count = Column(Integer, default=0)
    recent_publication_count = Column(Integer, default=0)
    academic_rank = Column(String)
    embedding = Column(float_array)
    last_updated = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    publications = relationship(
        "Publication",
        back_populates="examiner",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Publication(Base):
    __tablename__ = "publications"

    id = Column(Integer, primary_key=True, index=True)
    examiner_id = Column(Integer, ForeignKey("examiners.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String)
    abstract = Column(Text)
    year = Column(Integer, index=True)
    journal = Column(String)
    doi = Column(String, index=True)
    citation_count = Column(Integer, default=0)

    examiner = relationship("Examiner", back_populates="publications")


class SearchHistory(Base):
    __tablename__ = "search_history"

    id = Column(Integer, primary_key=True, index=True)
    thesis_title = Column(String, nullable=False)
    thesis_abstract = Column(Text, nullable=False)
    degree_type = Column(String, nullable=False)
    keywords = Column(string_array)
    results_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
