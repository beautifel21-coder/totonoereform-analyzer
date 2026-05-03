import httpx
from datetime import datetime
from config import settings

APIFY_BASE = "https://api.apify.com/v2"


def _run_actor(actor_id: str, body: dict, timeout: int = 180) -> list:
    url = f"{APIFY_BASE}/acts/{actor_id}/run-sync-get-dataset-items"
    resp = httpx.post(
        url,
        params={"token": settings.apify_api_token},
        json=body,
        timeout=timeout,
    )
    resp.raise_for_status()
    return resp.json()


def fetch_profile(username: str) -> dict:
    """Apifyのプロフィールスクレイパーでフォロワー数を取得"""
    username = username.lstrip("@")
    # apify~instagram-profile-scraper はプロフィール情報に特化
    try:
        items = _run_actor(
            "apify~instagram-profile-scraper",
            {"usernames": [username]},
        )
    except Exception:
        items = []

    if items:
        item = items[0]
        return {
            "username": username,
            "display_name": item.get("fullName") or item.get("name") or "",
            "follower_count": item.get("followersCount") or item.get("followers") or 0,
            "following_count": item.get("followingCount") or item.get("following") or 0,
            "post_count": item.get("postsCount") or item.get("posts") or 0,
        }

    # フォールバック: instagram-scraper で投稿から取得
    try:
        items2 = _run_actor(
            "apify~instagram-scraper",
            {
                "usernames": [username],
                "resultsType": "posts",
                "resultsLimit": 3,
            },
        )
    except Exception:
        items2 = []

    if items2:
        item = items2[0]
        followers = (
            item.get("followersCount")
            or item.get("owner", {}).get("followersCount")
            or 0
        )
        return {
            "username": username,
            "display_name": item.get("ownerFullName") or item.get("owner", {}).get("fullName", ""),
            "follower_count": followers,
            "following_count": item.get("followingCount") or 0,
            "post_count": item.get("postsCount") or 0,
        }

    return {"username": username, "follower_count": 0, "following_count": 0, "post_count": 0}


def fetch_recent_posts(username: str, count: int = 30) -> list[dict]:
    """Apify経由でInstagram最新投稿を取得"""
    username = username.lstrip("@")
    try:
        items = _run_actor(
            "apify~instagram-scraper",
            {
                "directUrls": [f"https://www.instagram.com/{username}/"],
                "resultsType": "posts",
                "resultsLimit": count,
            },
        )
    except Exception:
        return []

    posts = []
    for item in items:
        followers = (
            item.get("followersCount")
            or item.get("owner", {}).get("followersCount")
            or 1
        )
        likes = item.get("likesCount") or 0
        comments = item.get("commentsCount") or 0
        engagement = (likes + comments) / followers * 100

        media_type = item.get("type", "").lower()
        if item.get("productType") == "clips":
            content_type = "reel"
        elif "video" in media_type or item.get("videoUrl"):
            content_type = "video"
        elif media_type == "sidecar" or item.get("childPosts"):
            content_type = "carousel"
        else:
            content_type = "photo"

        hashtags = item.get("hashtags") or []
        caption = item.get("caption") or ""

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
