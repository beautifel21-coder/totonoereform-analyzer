import httpx
from datetime import datetime
from config import settings

APIFY_BASE = "https://api.apify.com/v2"
ACTOR_ID = "apify~instagram-scraper"


def fetch_profile(username: str) -> dict:
    """Apify経由でInstagramプロフィール情報を取得"""
    url = f"{APIFY_BASE}/acts/{ACTOR_ID}/run-sync-get-dataset-items"
    body = {
        "usernames": [username],
        "resultsLimit": 1,
        "scrapeType": "posts",
    }
    resp = httpx.post(
        url,
        params={"token": settings.apify_api_token},
        json=body,
        timeout=180,
    )
    resp.raise_for_status()
    items = resp.json()

    if not items:
        return {"username": username, "follower_count": 0, "following_count": 0, "post_count": 0}

    item = items[0]
    return {
        "username": username,
        "display_name": item.get("ownerFullName") or item.get("owner", {}).get("fullName", ""),
        "follower_count": item.get("followersCount") or item.get("owner", {}).get("followersCount", 0),
        "following_count": item.get("followingCount") or 0,
        "post_count": item.get("postsCount") or 0,
    }


def fetch_recent_posts(username: str, count: int = 30) -> list[dict]:
    """Apify経由でInstagram最新投稿を取得"""
    url = f"{APIFY_BASE}/acts/{ACTOR_ID}/run-sync-get-dataset-items"
    body = {
        "usernames": [username],
        "resultsLimit": count,
        "scrapeType": "posts",
    }
    resp = httpx.post(
        url,
        params={"token": settings.apify_api_token},
        json=body,
        timeout=180,
    )
    resp.raise_for_status()
    items = resp.json()

    posts = []
    for item in items:
        followers = item.get("followersCount") or item.get("owner", {}).get("followersCount") or 1
        likes = item.get("likesCount") or 0
        comments = item.get("commentsCount") or 0
        engagement = (likes + comments) / followers * 100

        # コンテンツタイプ判定
        media_type = item.get("type", "").lower()
        if "video" in media_type or item.get("videoUrl"):
            content_type = "video"
        elif media_type == "sidecar" or item.get("childPosts"):
            content_type = "carousel"
        elif item.get("productType") == "clips":
            content_type = "reel"
        else:
            content_type = "photo"

        hashtags = item.get("hashtags") or []
        caption = item.get("caption") or ""

        # タイムスタンプ処理
        posted_at = None
        ts = item.get("timestamp") or item.get("takenAt")
        if ts:
            try:
                if isinstance(ts, str):
                    posted_at = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                elif isinstance(ts, (int, float)):
                    posted_at = datetime.fromtimestamp(ts)
            except Exception:
                pass

        posts.append({
            "post_id": str(item.get("id") or item.get("shortCode") or ""),
            "platform": "instagram",
            "content_type": content_type,
            "caption": caption,
            "hashtags": hashtags,
            "like_count": likes,
            "comment_count": comments,
            "repost_count": 0,
            "view_count": item.get("videoViewCount") or 0,
            "engagement_rate": round(engagement, 2),
            "posted_at": posted_at,
        })

    return posts
