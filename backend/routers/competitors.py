from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Competitor, Platform, Snapshot, User
from routers.auth import get_current_user

router = APIRouter(prefix="/competitors", tags=["competitors"])


class CompetitorCreate(BaseModel):
    username: str
    display_name: str | None = None
    platform: Platform
    category: str = "一般"
    note: str | None = None


class CompetitorOut(BaseModel):
    id: int
    username: str
    display_name: str | None
    platform: Platform
    category: str
    note: str | None

    class Config:
        from_attributes = True


@router.get("/", response_model=list[CompetitorOut])
def list_competitors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Competitor).filter(Competitor.user_id == current_user.id).all()


@router.post("/", response_model=CompetitorOut)
def create_competitor(
    data: CompetitorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    competitor = Competitor(**data.model_dump(), user_id=current_user.id)
    db.add(competitor)
    db.commit()
    db.refresh(competitor)
    return competitor


@router.delete("/{competitor_id}")
def delete_competitor(
    competitor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    c = db.query(Competitor).filter(
        Competitor.id == competitor_id,
        Competitor.user_id == current_user.id,
    ).first()
    if not c:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(c)
    db.commit()
    return {"ok": True}


class SnapshotIn(BaseModel):
    follower_count: int


@router.post("/{competitor_id}/snapshot")
def record_snapshot(
    competitor_id: int,
    data: SnapshotIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    c = db.query(Competitor).filter(
        Competitor.id == competitor_id,
        Competitor.user_id == current_user.id,
    ).first()
    if not c:
        raise HTTPException(status_code=404, detail="Not found")
    snap = Snapshot(competitor_id=competitor_id, follower_count=data.follower_count)
    db.add(snap)
    db.commit()
    return {"ok": True}
