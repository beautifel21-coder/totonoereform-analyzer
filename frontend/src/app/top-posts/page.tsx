"use client";
import { useEffect, useState } from "react";
import { api, type TopPost, type Platform } from "@/lib/api";
import { Heart, MessageCircle, Repeat2, Flame } from "lucide-react";

const CONTENT_LABELS: Record<string, string> = {
  photo: "📷 写真", video: "🎬 動画", reel: "🎞️ Reels", carousel: "🖼️ カルーセル", text: "💬 テキスト",
};

const RANK_STYLES = [
  "bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-lg scale-110",
  "bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-md",
  "bg-gradient-to-br from-orange-700 to-orange-800 text-white shadow-md",
];

const RANK_EMOJI = ["🥇", "🥈", "🥉"];

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
    <div className="space-y-5 mt-5 animate-fade-in">
      {/* コントロール */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
          {([["", "🌐 全て"], ["instagram", "📷 Instagram"], ["x", "𝕏 X"]] as const).map(([p, label]) => (
            <button
              key={p}
              onClick={() => setPlatform(p as Platform | "")}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                platform === p ? "bg-brand-orange text-white shadow-md scale-105" : "text-gray-500 hover:text-brand-orange"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          value={days}
          onChange={e => setDays(Number(e.target.value))}
          className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-orange transition-colors"
        >
          <option value={7}>📅 直近7日</option>
          <option value={30}>📅 直近30日</option>
          <option value={90}>📅 直近90日</option>
        </select>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="text-5xl animate-float">🔥</div>
          <p className="text-gray-400 animate-pulse font-medium">人気投稿を分析中...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="text-5xl animate-float">📭</div>
          <p className="font-bold text-gray-500">データがありません</p>
          <p className="text-sm text-gray-400">競合アカウントを追加してデータを取得してください</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, i) => (
            <div
              key={i}
              className={`card p-5 flex gap-4 animate-slide-in transition-all hover:-translate-y-0.5 ${i < 3 ? "ring-2 ring-offset-1" : ""} ${i === 0 ? "ring-yellow-400" : i === 1 ? "ring-gray-300" : i === 2 ? "ring-orange-700" : ""}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* ランクバッジ */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${i < 3 ? RANK_STYLES[i] : "bg-gray-100 text-gray-500 font-bold text-sm"}`}>
                {i < 3 ? RANK_EMOJI[i] : i + 1}
              </div>

              <div className="flex-1 min-w-0">
                {/* ヘッダー */}
                <div className="flex flex-wrap gap-2 items-center mb-2">
                  <span className="font-black text-brand-navy text-base">@{post.username}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full font-medium">
                    {CONTENT_LABELS[post.content_type] ?? post.content_type}
                  </span>
                  {post.posted_at && (
                    <span className="text-xs text-gray-400">
                      {new Date(post.posted_at).toLocaleDateString("ja-JP")}
                    </span>
                  )}
                  <span className={`ml-auto flex items-center gap-1 text-sm font-black px-3 py-1 rounded-full ${
                    post.engagement_rate >= 5 ? "bg-red-100 text-red-600" :
                    post.engagement_rate >= 3 ? "bg-orange-100 text-orange-600" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    <Flame size={12} />
                    {post.engagement_rate}%
                  </span>
                </div>

                {/* キャプション */}
                <p className="text-sm text-gray-700 line-clamp-2 mb-2 leading-relaxed">
                  {post.caption || "（テキストなし）"}
                </p>

                {/* ハッシュタグ */}
                {post.hashtags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.hashtags.slice(0, 8).map(tag => (
                      <span key={tag} className="text-xs text-brand-orange bg-orange-50 px-2 py-0.5 rounded-full font-medium hover:bg-orange-100 transition-colors cursor-default">
                        {tag}
                      </span>
                    ))}
                    {post.hashtags.length > 8 && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                        +{post.hashtags.length - 8}個
                      </span>
                    )}
                  </div>
                )}

                {/* エンゲージメント数値 */}
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1.5 text-red-500 font-semibold">
                    <Heart size={14} fill="currentColor" />
                    {post.like_count.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-500 font-semibold">
                    <MessageCircle size={14} />
                    {post.comment_count.toLocaleString()}
                  </span>
                  {(post.repost_count ?? 0) > 0 && (
                    <span className="flex items-center gap-1.5 text-green-500 font-semibold">
                      <Repeat2 size={14} />
                      {(post.repost_count ?? 0).toLocaleString()}
                    </span>
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
