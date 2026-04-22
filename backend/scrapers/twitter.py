import asyncio
import json
from pathlib import Path
from datetime import datetime
import twikit
from config import settings

COOKIES_FILE = Path("/tmp/x_cookies.json")
_client: twikit.Client | None = None


async def get_client() -> twikit.Client:
    global _client
    if _client is not None:
        return _client

    cl = twikit.Client(language="ja-JP")

    if COOKIES_FILE.exists():
        cl.load_cookies(str(COOKIES_FILE))
        _client = cl
        return cl

    await cl.login(
        auth_info_1=settings.x_username,
        auth_info_2=settings.x_email if settings.x_email else None,
        password=settings.x_password,
    )
    cl.save_cookies(str(COOKIES_FILE))
    _client = cl
    return cl


async def fetch_profile(username: str) -> dict:
    cl = await get_client()
    user = await cl.get_user_by_screen_name(username)
    return {
        "username": user.screen_name,
        "display_name": user.name,
        "follower_count": user.followers_count,
        "following_count": user.following_count,
        "post_count": user.statuses_count,
    }


async def fetch_recent_posts(username: str, count: int = 30) -> list[dict]:
    cl = await get_client()
    user = await cl.get_user_by_screen_name(username)
    tweets = await user.get_tweets("Tweets", count=count)

    posts = []
    follower_count = user.followers_count or 1

    for tweet in tweets:
        hashtags = [f"#{tag['text']}" for tag in (tweet.hashtags or [])]
        engagement = (tweet.favorite_count + tweet.reply_count + tweet.retweet_count) / follower_count * 100

        content_type = "text"
        if tweet.media:
            media_types = [m.type for m in tweet.media]
            if "video" in media_types:
                content_type = "video"
            else:
                content_type = "photo"

        posts.append({
            "post_id": str(tweet.id),
            "platform": "x",
            "content_type": content_type,
            "caption": tweet.full_text or "",
            "hashtags": hashtags,
            "like_count": tweet.favorite_count or 0,
            "comment_count": tweet.reply_count or 0,
            "repost_count": tweet.retweet_count or 0,
            "view_count": tweet.view_count or 0,
            "engagement_rate": round(engagement, 2),
            "posted_at": tweet.created_at_datetime,
        })
    return posts


def run_async(coro):
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                future = pool.submit(asyncio.run, coro)
                return future.result()
        return loop.run_until_complete(coro)
    except RuntimeError:
        return asyncio.run(coro)
