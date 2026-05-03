from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from collections import Counter
from database import get_db
from models import Competitor, Snapshot, Post, Platform, User
from routers.auth import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/follower-trends")
def follower_trends(
    platform: Platform | None = None,
    days: int = Query(90, ge=7, le=365),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    since = datetime.utcnow() - timedelta(days=days)
    query = (
        db.query(Snapshot, Competitor.username, Competitor.platform)
        .join(Competitor)
        .filter(Snapshot.recorded_at >= since)
        .filter(Competitor.user_id == current_user.id)
    )
    if platform:
        query = query.filter(Competitor.platform == platform)

    rows = query.order_by(Snapshot.recorded_at).all()

    result: dict[str, list] = {}
    for snap, username, _ in rows:
        if username not in result:
            result[username] = []
        result[username].append({
            "date": snap.recorded_at.strftime("%Y-%m-%d"),
            "followers": snap.follower_count,
        })
    return result


@router.get("/engagement")
def engagement_summary(
    platform: Platform | None = None,
    days: int = Query(30, ge=7, le=180),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    since = datetime.utcnow() - timedelta(days=days)
    query = (
        db.query(
            Competitor.username,
            func.avg(Post.engagement_rate).label("avg_engagement"),
            func.count(Post.id).label("post_count"),
            func.avg(Post.like_count).label("avg_likes"),
            func.avg(Post.comment_count).label("avg_comments"),
        )
        .join(Post)
        .filter(Post.posted_at >= since)
        .filter(Competitor.user_id == current_user.id)
        .group_by(Competitor.username)
    )
    if platform:
        query = query.filter(Competitor.platform == platform)

    rows = query.all()
    return [
        {
            "username": r.username,
            "avg_engagement": round(r.avg_engagement or 0, 2),
            "post_count": r.post_count,
            "avg_likes": round(r.avg_likes or 0, 1),
            "avg_comments": round(r.avg_comments or 0, 1),
        }
        for r in rows
    ]


@router.get("/hashtags")
def hashtag_analysis(
    platform: Platform | None = None,
    days: int = Query(30, ge=7, le=180),
    top: int = Query(30, ge=5, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    since = datetime.utcnow() - timedelta(days=days)
    query = (
        db.query(Post.hashtags, Post.engagement_rate)
        .join(Competitor)
        .filter(Post.posted_at >= since)
        .filter(Competitor.user_id == current_user.id)
    )
    if platform:
        query = query.filter(Competitor.platform == platform)

    rows = query.all()
    tag_counter: Counter = Counter()
    tag_engagement: dict[str, list] = {}

    for hashtags, eng in rows:
        for tag in (hashtags or []):
            tag_counter[tag] += 1
            tag_engagement.setdefault(tag, []).append(eng or 0)

    result = []
    for tag, count in tag_counter.most_common(top):
        engs = tag_engagement[tag]
        result.append({
            "tag": tag,
            "count": count,
            "avg_engagement": round(sum(engs) / len(engs), 2) if engs else 0,
        })
    return result


@router.get("/content-types")
def content_type_analysis(
    platform: Platform | None = None,
    days: int = Query(30, ge=7, le=180),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    since = datetime.utcnow() - timedelta(days=days)
    query = (
        db.query(
            Post.content_type,
            func.count(Post.id).label("count"),
            func.avg(Post.engagement_rate).label("avg_engagement"),
            func.avg(Post.like_count).label("avg_likes"),
        )
        .join(Competitor)
        .filter(Post.posted_at >= since)
        .filter(Competitor.user_id == current_user.id)
        .group_by(Post.content_type)
    )
    if platform:
        query = query.filter(Competitor.platform == platform)

    rows = query.all()
    return [
        {
            "content_type": r.content_type,
            "count": r.count,
            "avg_engagement": round(r.avg_engagement or 0, 2),
            "avg_likes": round(r.avg_likes or 0, 1),
        }
        for r in rows
    ]


@router.get("/top-posts")
def top_posts(
    platform: Platform | None = None,
    days: int = Query(30, ge=7, le=180),
    limit: int = Query(10, ge=5, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    since = datetime.utcnow() - timedelta(days=days)
    query = (
        db.query(Post, Competitor.username)
        .join(Competitor)
        .filter(Post.posted_at >= since)
        .filter(Competitor.user_id == current_user.id)
        .order_by(desc(Post.engagement_rate))
        .limit(limit)
    )
    if platform:
        query = query.filter(Competitor.platform == platform)

    rows = query.all()
    return [
        {
            "username": username,
            "content_type": p.content_type,
            "caption": (p.caption or "")[:100],
            "hashtags": p.hashtags,
            "like_count": p.like_count,
            "comment_count": p.comment_count,
            "engagement_rate": p.engagement_rate,
            "posted_at": p.posted_at.isoformat() if p.posted_at else None,
        }
        for p, username in rows
    ]


@router.get("/post-frequency")
def post_frequency(
    platform: Platform | None = None,
    days: int = Query(30, ge=7, le=180),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    since = datetime.utcnow() - timedelta(days=days)
    query = (
        db.query(
            Competitor.username,
            func.date(Post.posted_at).label("date"),
            func.count(Post.id).label("count"),
        )
        .join(Post)
        .filter(Post.posted_at >= since)
        .filter(Competitor.user_id == current_user.id)
        .group_by(Competitor.username, func.date(Post.posted_at))
        .order_by(func.date(Post.posted_at))
    )
    if platform:
        query = query.filter(Competitor.platform == platform)

    rows = query.all()
    result: dict[str, list] = {}
    for username, date, count in rows:
        result.setdefault(username, []).append({"date": str(date), "count": count})
    return result
