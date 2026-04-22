import csv
import io
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models import Post, Competitor

router = APIRouter(prefix="/export", tags=["export"])


@router.get("/posts.csv")
def export_posts_csv(db: Session = Depends(get_db)):
    rows = (
        db.query(Post, Competitor.username)
        .join(Competitor)
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
