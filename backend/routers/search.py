import httpx
from fastapi import APIRouter, Query, HTTPException
from datetime import datetime, timezone, timedelta
from config import settings

router = APIRouter(prefix="/search", tags=["search"])

APIFY_BASE = "https://api.apify.com/v2"

# リフォーム・リノベーション関連ハッシュタグ（バズり投稿が多いもの）
REFORM_HASHTAGS = [
    "リフォーム", "リノベーション", "リノベ", "リフォーム事例",
    "住宅リフォーム", "マンションリノベ", "戸建てリフォーム",
    "キッチンリフォーム", "お風呂リフォーム", "洗面台リフォーム",
    "リフォーム完成", "リフォームビフォーアフター",
]


@router.get("/accounts")
def search_accounts(
    hashtags: str = Query(default=""),
    min_followers: int = Query(default=10000),
    results_limit: int = Query(default=150),
):
    """今バズってるリフォーム系Instagramアカウントを検索"""
    if not settings.apify_api_token:
        raise HTTPException(status_code=500, detail="Apify APIトークンが設定されていません")

    if hashtags.strip():
        hashtag_list = [h.strip().lstrip("#") for h in hashtags.split(",") if h.strip()]
    else:
        hashtag_list = REFORM_HASHTAGS

    try:
        resp = httpx.post(
            f"{APIFY_BASE}/acts/apify~instagram-hashtag-scraper/run-sync-get-dataset-items",
            params={"token": settings.apify_api_token},
            json={
                "hashtags": REFORM_HASHTAGS,
                "resultsPerPage": results_limit,
                "maxRequestRetries": 3,
            },
            timeout=240,
        )
        resp.raise_for_status()
        items = resp.json()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Apify APIエラー: {str(e)}")

    # 3ヶ月以内の投稿のみ対象
    cutoff = datetime.now(timezone.utc) - timedelta(days=90)

    # アカウントごとに集計
    accounts: dict[str, dict] = {}
    for item in items:
        # 投稿日時チェック
        ts = item.get("timestamp")
        if ts:
            try:
                posted = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                if posted < cutoff:
                    continue
            except Exception:
                pass

        owner = item.get("owner") or {}
        username = owner.get("username") or item.get("ownerUsername")
        if not username:
            continue

        followers = owner.get("followersCount") or item.get("followersCount") or 0
        if followers < min_followers:
            continue

        likes = item.get("likesCount") or 0
        comments = item.get("commentsCount") or 0

        if username not in accounts:
            accounts[username] = {
                "username": username,
                "display_name": owner.get("fullName") or item.get("ownerFullName") or "",
                "followers": followers,
                "post_count": 0,
                "total_likes": 0,
                "total_comments": 0,
                "top_likes": 0,
                "platform": "instagram",
            }

        acc = accounts[username]
        acc["post_count"] += 1
        acc["total_likes"] += likes
        acc["total_comments"] += comments
        acc["top_likes"] = max(acc["top_likes"], likes)
        if followers > acc["followers"]:
            acc["followers"] = followers

    # バズスコアを計算してソート
    result = []
    for acc in accounts.values():
        posts = acc["post_count"] or 1
        followers = acc["followers"] or 1
        avg_likes = acc["total_likes"] // posts
        avg_engagement = round((acc["total_likes"] + acc["total_comments"]) / posts / followers * 100, 2)
        # バズスコア = エンゲージメント率 × log(フォロワー数) × 投稿露出回数
        import math
        buzz_score = avg_engagement * math.log10(max(followers, 1)) * posts
        result.append({
            "username": acc["username"],
            "display_name": acc["display_name"],
            "followers": acc["followers"],
            "post_count": acc["post_count"],
            "avg_likes": avg_likes,
            "top_likes": acc["top_likes"],
            "avg_engagement": avg_engagement,
            "buzz_score": round(buzz_score, 1),
            "platform": "instagram",
        })

    # バズスコア順でソート
    result.sort(key=lambda x: x["buzz_score"], reverse=True)
    return result[:30]
