import csv
import io
from typing import Optional
from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from database import get_db
from models import Post, Competitor, User
from routers.auth import get_current_user, ALGORITHM
from config import settings

router = APIRouter(prefix="/export", tags=["export"])


@router.get("/posts.csv")
def export_posts_csv(
    token: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    # Support token as query param for direct browser download
    if current_user is None and token:
        try:
            payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            if user_id:
                current_user = db.query(User).filter(User.id == int(user_id)).first()
        except JWTError:
            pass
    if not current_user:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="認証が必要です")
    rows = (
        db.query(Post, Competitor.username)
        .join(Competitor)
        .filter(Competitor.user_id == current_user.id)
        .order_by(Post.posted_at.desc())
        .all()
    )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "username", "platform", "content_type", "posted_at",
        "like_count", "comment_count", "repost_count", "view_count",
        "engagement_rate", "hashtags", "caption"
    ])
    for post, username in rows:
        writer.writerow([
            username,
            post.platform,
            post.content_type,
            post.posted_at.isoformat() if post.posted_at else "",
            post.like_count,
            post.comment_count,
            post.repost_count,
            post.view_count,
            post.engagement_rate,
            " ".join(post.hashtags or []),
            (post.caption or "").replace("\n", " "),
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=posts.csv"},
    )
