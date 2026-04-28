"use client";
import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { api, type EngagementRow, type Platform } from "@/lib/api";
import { RefreshCw, Download, TrendingUp, Heart, FileText, Users } from "lucide-react";

const COLORS = ["#E8891A", "#7C3AED", "#0D9488", "#E53E3E", "#3182CE", "#D69E2E"];

function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-orange-100" />
        <div className="absolute inset-0 rounded-full border-4 border-brand-orange border-t-transparent animate-spin" />
        <span className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">📊</span>
      </div>
      <p className="text-gray-400 text-sm font-medium animate-pulse">データを読み込んでいます...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="text-6xl animate-float">🏠</div>
      <p className="font-bold text-lg text-gray-500">まだデータがありません</p>
      <p className="text-sm text-center max-w-xs">「🏆 競合管理」でアカウントを追加して<br/>「全データ更新」を押してください！</p>
    </div>
  );
}

export default function Dashboard() {
  const [platform, setPlatform] = useState<Platform | "">("");
  const [engagement, setEngagement] = useState<EngagementRow[]>([]);
  const [followerTrends, setFollowerTrends] = useState<Record<string, { date: string; followers: number }[]>>({});
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [justFetched, setJustFetched] = useState(false);

  const load = async () => {
    setLoading(true);
    const [eng, trends] = await Promise.all([
      api.analytics.engagement(platform || undefined),
      api.analytics.followerTrends(platform || undefined),
    ]);
    setEngagement(eng);
    setFollowerTrends(trends);
    setLoading(false);
  };

  useEffect(() => { load(); }, [platform]);

  const handleFetchAll = async () => {
    setFetching(true);
    await api.fetch.all();
    await load();
    setFetching(false);
    setJustFetched(true);
    setTimeout(() => setJustFetched(false), 3000);
  };

  const trendDates = Array.from(new Set(
    Object.values(followerTrends).flat().map(d => d.date)
  )).sort();

  const trendData = trendDates.map(date => {
    const row: Record<string, string | number> = { date };
    for (const [username, points] of Object.entries(followerTrends)) {
      const found = points.find(p => p.date === date);
      if (found) row[username] = found.followers;
    }
    return row;
  });

  const usernames = Object.keys(followerTrends);

  // サマリー統計
  const totalAccounts = engagement.length;
  const topEngager = engagement.reduce((a, b) => a.avg_engagement > b.avg_engagement ? a : b, { username: "—", avg_engagement: 0, post_count: 0, avg_likes: 0 });
  const totalPosts = engagement.reduce((s, e) => s + e.post_count, 0);

  return (
    <div className="space-y-5 mt-5 animate-fade-in">
      {/* コントロールバー */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100">
          {([["", "🌐 全て"], ["instagram", "📷 Instagram"], ["x", "𝕏 X"]] as const).map(([p, label]) => (
            <button
              key={p}
              onClick={() => setPlatform(p as Platform | "")}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                platform === p
                  ? "bg-brand-orange text-white shadow-md scale-105"
                  : "text-gray-500 hover:text-brand-orange"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleFetchAll}
            disabled={fetching}
            className={`btn-primary ${justFetched ? "from-green-400 to-green-500" : ""}`}
          >
            <RefreshCw size={14} className={fetching ? "animate-spin" : ""} />
            {fetching ? "取得中..." : justFetched ? "✅ 完了！" : "全データ更新"}
          </button>
          <a href={api.exportCsv()} className="btn-secondary">
            <Download size={14} />
            CSV
          </a>
        </div>
      </div>

      {/* サマリーカード */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="stat-card border-l-4 border-brand-orange">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
              <Users size={14} /> 分析中アカウント
            </div>
            <div className="text-3xl font-black text-brand-navy">{totalAccounts}<span className="text-base font-normal text-gray-400 ml-1">件</span></div>
          </div>
          <div className="stat-card border-l-4 border-purple-500">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
              <TrendingUp size={14} /> エンゲージメントNo.1
            </div>
            <div className="text-xl font-black text-brand-navy truncate">@{topEngager.username}</div>
            <div className="text-xs text-purple-500 font-semibold">{topEngager.avg_engagement}%</div>
          </div>
          <div className="stat-card border-l-4 border-teal-500 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 text-gray-400 text-xs font-medium">
              <FileText size={14} /> 総取得投稿数
            </div>
            <div className="text-3xl font-black text-brand-navy">{totalPosts.toLocaleString()}<span className="text-base font-normal text-gray-400 ml-1">件</span></div>
          </div>
        </div>
      )}

      {loading ? <LoadingSpinner /> : engagement.length === 0 ? <EmptyState /> : (
        <>
          {/* エンゲージメント比較 */}
          <section className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🎯</span>
              <h2 className="font-black text-brand-navy text-lg">エンゲージメント率比較</h2>
              <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">直近30日</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={engagement} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="username" tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis unit="%" tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(v: number) => [`${v}%`, "エンゲージメント率"]}
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="avg_engagement" name="平均エンゲージメント率" fill="url(#orangeGrad)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F6AD55" />
                    <stop offset="100%" stopColor="#E8891A" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* 投稿数・いいね比較 */}
          <section className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">❤️</span>
              <h2 className="font-black text-brand-navy text-lg">投稿数・平均いいね比較</h2>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={engagement} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="username" tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Legend />
                <Bar yAxisId="left" dataKey="post_count" name="投稿数" fill="#7C3AED" radius={[6, 6, 0, 0]} />
                <Bar yAxisId="right" dataKey="avg_likes" name="平均いいね" fill="#E8891A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* フォロワー推移 */}
          <section className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">📈</span>
              <h2 className="font-black text-brand-navy text-lg">フォロワー数推移</h2>
              <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">直近90日</span>
            </div>
            {trendData.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">データが不足しています。</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                  <Legend />
                  {usernames.map((name, i) => (
                    <Line key={name} type="monotone" dataKey={name} stroke={COLORS[i % COLORS.length]} dot={false} strokeWidth={3} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            )}
          </section>
        </>
      )}
    </div>
  );
}
