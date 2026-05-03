from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime
from database import get_db
from models import Competitor, Snapshot, Post, Platform
from scrapers import instagram, twitter

router = APIRouter(prefix="/fetch", tags=["fetch"])


def _save_profile_snapshot(db: Session, competitor: Competitor, profile: dict):
    snap = Snapshot(
        competitor_id=competitor.id,
        follower_count=profile.get("follower_count", 0),
        following_count=profile.get("following_count", 0),
        post_count=profile.get("post_count", 0),
    )
    if profile.get("display_name"):
        competitor.display_name = profile["display_name"]
    db.add(snap)


def _save_posts(db: Session, competitor: Competitor, posts: list[dict]):
    for p in posts:
        existing = db.query(Post).filter(Post.post_id == p["post_id"]).first()
        if existing:
            existing.like_count = p["like_count"]
            existing.comment_count = p["comment_count"]
            existing.repost_count = p["repost_count"]
            existing.view_count = p["view_count"]
            existing.engagement_rate = p["engagement_rate"]
        else:
            post = Post(competitor_id=competitor.id, **p)
            db.add(post)


@router.post("/{competitor_id}")
def fetch_competitor(competitor_id: int, db: Session = Depends(get_db)):
    competitor = db.query(Competitor).filter(Competitor.id == competitor_id).first()
    if not competitor:
        raise HTTPException(status_code=404, detail="Not found")

    try:
        if competitor.platform == Platform.instagram:
            profile = instagram.fetch_profile(competitor.username)
            posts = instagram.fetch_recent_posts(competitor.username, known_followers=profile.get("follower_count", 0))
        else:
            profile = twitter.run_async(twitter.fetch_profile(competitor.username))
            posts = twitter.run_async(twitter.fetch_recent_posts(competitor.username))

        _save_profile_snapshot(db, competitor, profile)
        _save_posts(db, competitor, posts)
        db.commit()

        return {"ok": True, "posts_fetched": len(posts), "followers": profile.get("follower_count")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/all")
def fetch_all(db: Session = Depends(get_db)):
    competitors = db.query(Competitor).all()
    results = []
    for c in competitors:
        try:
            if c.platform == Platform.instagram:
                profile = instagram.fetch_profile(c.username)
                posts = instagram.fetch_recent_posts(c.username, known_followers=profile.get("follower_count", 0))
            else:
                profile = twitter.run_async(twitter.fetch_profile(c.username))
                posts = twitter.run_async(twitter.fetch_recent_posts(c.username))

            _save_profile_snapshot(db, c, profile)
            _save_posts(db, c, posts)
            db.commit()
            results.append({"username": c.username, "ok": True, "posts": len(posts)})
        except Exception as e:
            results.append({"username": c.username, "ok": False, "error": str(e)})

    return results
