from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.models.examiner import Examiner, Publication
from app.schemas.examiner import ExaminerDetailResponse, ExaminerListResponse, MessageResponse, PublicationResponse

router = APIRouter(tags=["examiners"])


@router.get("/api/examiners", response_model=ExaminerListResponse)
async def list_examiners(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> ExaminerListResponse:
    total = db.query(Examiner).count()
    items = (
        db.query(Examiner)
        .options(joinedload(Examiner.publications))
        .order_by(Examiner.name.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return ExaminerListResponse(items=items, total=total, skip=skip, limit=limit)


@router.get("/api/examiners/{examiner_id}", response_model=ExaminerDetailResponse)
async def get_examiner(examiner_id: int, db: Session = Depends(get_db)) -> Examiner:
    examiner = (
        db.query(Examiner)
        .options(joinedload(Examiner.publications))
        .filter(Examiner.id == examiner_id)
        .first()
    )
    if examiner is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Examiner not found")
    return examiner


@router.get("/api/examiners/{examiner_id}/publications", response_model=list[PublicationResponse])
async def get_examiner_publications(examiner_id: int, db: Session = Depends(get_db)) -> list[Publication]:
    examiner = db.query(Examiner).filter(Examiner.id == examiner_id).first()
    if examiner is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Examiner not found")
    return db.query(Publication).filter(Publication.examiner_id == examiner_id).order_by(Publication.year.desc()).all()


@router.delete("/api/examiners/{examiner_id}", response_model=MessageResponse)
async def delete_examiner(examiner_id: int, db: Session = Depends(get_db)) -> MessageResponse:
    examiner = db.query(Examiner).filter(Examiner.id == examiner_id).first()
    if examiner is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Examiner not found")
    db.delete(examiner)
    db.commit()
    return MessageResponse(detail="Examiner deleted successfully")
