"use client";
import { useEffect, useState } from "react";
import { api, type TopPost, type Platform } from "@/lib/api";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";

const CONTENT_LABELS: Record<string, string> = {
  photo: "写真", video: "動画", reel: "Reels", carousel: "カルーセル", text: "テキスト",
};

export default function TopPostsPage() {
  const [platform, setPlatform] = useState<Platform | "">("");
  const [days, setDays] = useState(30);
  const [posts, setPosts] = useState<TopPost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setPosts(await api.analytics.topPosts(platform || undefined, days));
    setLoading(false);
  };

  useEffect(() => { load(); }, [platform, days]);

  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {(["", "instagram", "x"] as const).map(p => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${platform === p ? "bg-brand-orange text-white border-brand-orange" : "bg-white border-gray-300"}`}
            >
              {p === "" ? "全て" : p === "instagram" ? "Instagram" : "X"}
            </button>
          ))}
        </div>
        <select
          value={days}
          onChange={e => setDays(Number(e.target.value))}
          className="border rounded px-3 py-1 text-sm"
        >
          <option value={7}>直近7日</option>
          <option value={30}>直近30日</option>
          <option value={90}>直近90日</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">読み込み中...</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400">データがありません。</div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-4 flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-sm">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-2 items-center mb-1">
                  <span className="font-bold text-brand-navy">@{post.username}</span>
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {CONTENT_LABELS[post.content_type] ?? post.content_type}
                  </span>
                  <span className="text-xs text-gray-400">
                    {post.posted_at ? new Date(post.posted_at).toLocaleDateString("ja-JP") : ""}
                  </span>
                  <span className="text-xs font-bold text-brand-orange ml-auto">
                    エンゲージメント {post.engagement_rate}%
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-2 mb-2">{post.caption || "（テキストなし）"}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {(post.hashtags || []).slice(0, 8).map(tag => (
                    <span key={tag} className="text-xs text-brand-orange">{tag}</span>
                  ))}
                  {post.hashtags?.length > 8 && <span className="text-xs text-gray-400">+{post.hashtags.length - 8}</span>}
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Heart size={12} className="text-red-400" />{post.like_count.toLocaleString()}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={12} className="text-blue-400" />{post.comment_count.toLocaleString()}</span>
                  {post.repost_count > 0 && (
                    <span className="flex items-center gap-1"><Repeat2 size={12} className="text-green-400" />{post.repost_count.toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
