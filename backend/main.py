from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
from database import engine, Base
from routers import competitors, fetch, analytics, export

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Totonoē Reform 競合分析API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(competitors.router)
app.include_router(fetch.router)
app.include_router(analytics.router)
app.include_router(export.router)


@app.get("/health")
def health():
    return {"status": "ok"}


# 毎日午前3時に全競合データを自動取得
scheduler = BackgroundScheduler()


def scheduled_fetch():
    from database import SessionLocal
    from routers.fetch import _save_profile_snapshot, _save_posts
    from models import Competitor, Platform
    from scrapers import instagram, twitter

    db = SessionLocal()
    try:
        competitors_list = db.query(Competitor).all()
        for c in competitors_list:
            try:
                if c.platform == Platform.instagram:
                    profile = instagram.fetch_profile(c.username)
                    posts = instagram.fetch_recent_posts(c.username)
                else:
                    profile = twitter.run_async(twitter.fetch_profile(c.username))
                    posts = twitter.run_async(twitter.fetch_recent_posts(c.username))
                _save_profile_snapshot(db, c, profile)
                _save_posts(db, c, posts)
                db.commit()
            except Exception as e:
                print(f"[scheduler] {c.username} error: {e}")
    finally:
        db.close()


scheduler.add_job(scheduled_fetch, "cron", hour=3, minute=0)
scheduler.start()
