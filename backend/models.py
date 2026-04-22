from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from database import Base


class Platform(str, enum.Enum):
    instagram = "instagram"
    x = "x"


class Competitor(Base):
    __tablename__ = "competitors"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=False)
    display_name = Column(String)
    platform = Column(Enum(Platform), nullable=False)
    category = Column(String, default="リフォーム")
    note = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    snapshots = relationship("Snapshot", back_populates="competitor", cascade="all, delete-orphan")
    posts = relationship("Post", back_populates="competitor", cascade="all, delete-orphan")


class Snapshot(Base):
    """週次フォロワー数スナップショット"""
    __tablename__ = "snapshots"

    id = Column(Integer, primary_key=True, index=True)
    competitor_id = Column(Integer, ForeignKey("competitors.id"), nullable=False)
    follower_count = Column(Integer)
    following_count = Column(Integer)
    post_count = Column(Integer)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    competitor = relationship("Competitor", back_populates="snapshots")


class Post(Base):
    """投稿データ"""
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    competitor_id = Column(Integer, ForeignKey("competitors.id"), nullable=False)
    post_id = Column(String, unique=True, nullable=False)
    platform = Column(Enum(Platform))
    content_type = Column(String)  # photo, video, reel, carousel, text
    caption = Column(String)
    hashtags = Column(JSON, default=list)
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    repost_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    engagement_rate = Column(Float, default=0.0)
    posted_at = Column(DateTime)
    fetched_at = Column(DateTime, default=datetime.utcnow)

    competitor = relationship("Competitor", back_populates="posts")
