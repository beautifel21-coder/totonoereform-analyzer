import json
import os
from pathlib import Path
from datetime import datetime
from instagrapi import Client
from instagrapi.exceptions import LoginRequired
from config import settings

SESSION_FILE = Path("/tmp/instagram_session.json")
_client: Client | None = None


def get_client() -> Client:
    global _client
    if _client is not None:
        return _client

    cl = Client()
    cl.delay_range = [2, 5]

    if SESSION_FILE.exists():
        try:
            cl.load_settings(SESSION_FILE)
            cl.login(settings.instagram_username, settings.instagram_password)
            cl.dump_settings(SESSION_FILE)
            _client = cl
            return cl
        except LoginRequired:
            SESSION_FILE.unlink(missing_ok=True)

    cl.login(settings.instagram_username, settings.instagram_password)
    cl.dump_settings(SESSION_FILE)
    _client = cl
    return cl


def fetch_profile(username: str) -> dict:
    cl = get_client()
    user = cl.user_info_by_username(username)
    return {
        "username": user.username,
        "display_name": user.full_name,
        "follower_count": user.follower_count,
        "following_count": user.following_count,
        "post_count": user.media_count,
    }


def fetch_recent_posts(username: str, count: int = 30) -> list[dict]:
    cl = get_client()
    user_id = cl.user_id_from_username(username)
    medias = cl.user_medias(user_id, amount=count)

    posts = []
    for m in medias:
        hashtags = [tag for tag in (m.caption_text or "").split() if tag.startswith("#")]
        follower_count = cl.user_info(user_id).follower_count or 1
        engagement = (m.like_count + m.comment_count) / follower_count * 100

        content_type = m.media_type
        type_map = {1: "photo", 2: "video", 8: "carousel"}
        if hasattr(m, "product_type") and m.product_type == "clips":
            content_type_str = "reel"
        else:
            content_type_str = type_map.get(m.media_type, "photo")

        posts.append({
            "post_id": str(m.id),
            "platform": "instagram",
            "content_type": content_type_str,
            "caption": m.caption_text or "",
            "hashtags": hashtags,
            "like_count": m.like_count,
            "comment_count": m.comment_count,
            "repost_count": 0,
            "view_count": m.view_count or 0,
            "engagement_rate": round(engagement, 2),
            "posted_at": m.taken_at,
        })
    return posts
