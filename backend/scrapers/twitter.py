import httpx
from datetime import datetime
from config import settings

APIFY_BASE = "https://api.apify.com/v2"
ACTOR_ID = "apidojo~tweet-scraper"


def fetch_profile(username: str) -> dict:
    """Apify経由でXプロフィール情報を取得"""
    url = f"{APIFY_BASE}/acts/{ACTOR_ID}/run-sync-get-dataset-items"
    body = {
        "twitterHandles": [username],
        "maxItems": 1,
        "queryType": "Latest",
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
    author = item.get("author") or {}
    return {
        "username": username,
        "display_name": author.get("name") or item.get("author_name", ""),
        "follower_count": author.get("followers") or 0,
        "following_count": author.get("following") or 0,
        "post_count": author.get("statusesCount") or 0,
    }


def fetch_recent_posts(username: str, count: int = 30) -> list[dict]:
    """Apify経由でX最新ツイートを取得"""
    url = f"{APIFY_BASE}/acts/{ACTOR_ID}/run-sync-get-dataset-items"
    body = {
        "twitterHandles": [username],
        "maxItems": count,
        "queryType": "Latest",
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
        author = item.get("author") or {}
        followers = author.get("followers") or 1
        likes = item.get("likeCount") or 0
        replies = item.get("replyCount") or 0
        retweets = item.get("retweetCount") or 0
        engagement = (likes + replies + retweets) / followers * 100

        # コンテンツタイプ判定
        media = item.get("media") or []
        if any(m.get("type") == "video" for m in media):
            content_type = "video"
        elif media:
            content_type = "photo"
        else:
            content_type = "text"

        hashtags = [f"#{h}" for h in (item.get("hashtags") or [])]

        # タイムスタンプ処理
        posted_at = None
        ts = item.get("createdAt")
        if ts:
            try:
                posted_at = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            except Exception:
                pass

        posts.append({
            "post_id": str(item.get("id") or ""),
            "platform": "x",
            "content_type": content_type,
            "caption": item.get("text") or item.get("full_text") or "",
            "hashtags": hashtags,
            "like_count": likes,
            "comment_count": replies,
            "repost_count": retweets,
            "view_count": item.get("viewCount") or 0,
            "engagement_rate": round(engagement, 2),
            "posted_at": posted_at,
        })

    return posts


def run_async(coro):
    """後方互換性のためのダミー関数（Apifyは同期）"""
    import asyncio
    return asyncio.run(coro) if asyncio.iscoroutine(coro) else coro
