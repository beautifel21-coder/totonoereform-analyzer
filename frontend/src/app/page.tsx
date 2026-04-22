"use client";
import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { api, type EngagementRow, type Platform } from "@/lib/api";
import { RefreshCw, Download } from "lucide-react";

const COLORS = ["#E8891A", "#2D3748", "#38A169", "#E53E3E", "#805AD5", "#3182CE"];

export default function Dashboard() {
  const [platform, setPlatform] = useState<Platform | "">("");
  const [engagement, setEngagement] = useState<EngagementRow[]>([]);
  const [followerTrends, setFollowerTrends] = useState<Record<string, { date: string; followers: number }[]>>({});
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

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
  };

  // フォロワー推移を単一の配列に変換
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

  return (
    <div className="space-y-6 mt-4">
      {/* ヘッダー操作 */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          {(["", "instagram", "x"] as const).map(p => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${platform === p ? "bg-brand-orange text-white border-brand-orange" : "bg-white border-gray-300 hover:border-brand-orange"}`}
            >
              {p === "" ? "全て" : p === "instagram" ? "Instagram" : "X"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleFetchAll}
            disabled={fetching}
            className="flex items-center gap-1 px-3 py-1 bg-brand-navy text-white text-sm rounded hover:opacity-90 disabled:opacity-50"
          >
            <RefreshCw size={14} className={fetching ? "animate-spin" : ""} />
            {fetching ? "取得中..." : "全データ更新"}
          </button>
          <a
            href={api.exportCsv()}
            className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 text-sm rounded hover:border-brand-orange"
          >
            <Download size={14} />
            CSV出力
          </a>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">読み込み中...</div>
      ) : (
        <>
          {/* エンゲージメント比較 */}
          <section className="bg-white rounded-xl shadow p-4">
            <h2 className="font-bold text-brand-navy mb-3">エンゲージメント率比較（直近30日）</h2>
            {engagement.length === 0 ? (
              <p className="text-gray-400 text-sm">データがありません。競合を追加してデータを取得してください。</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={engagement} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="username" tick={{ fontSize: 12 }} />
                  <YAxis unit="%" tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Bar dataKey="avg_engagement" name="平均エンゲージメント率" fill="#E8891A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>

          {/* 投稿数比較 */}
          <section className="bg-white rounded-xl shadow p-4">
            <h2 className="font-bold text-brand-navy mb-3">投稿数・平均いいね比較</h2>
            {engagement.length === 0 ? (
              <p className="text-gray-400 text-sm">データがありません。</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={engagement} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="username" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="post_count" name="投稿数" fill="#2D3748" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="right" dataKey="avg_likes" name="平均いいね" fill="#E8891A" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>

          {/* フォロワー推移 */}
          <section className="bg-white rounded-xl shadow p-4">
            <h2 className="font-bold text-brand-navy mb-3">フォロワー数推移（直近90日）</h2>
            {trendData.length === 0 ? (
              <p className="text-gray-400 text-sm">データがありません。</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  {usernames.map((name, i) => (
                    <Line key={name} type="monotone" dataKey={name} stroke={COLORS[i % COLORS.length]} dot={false} strokeWidth={2} />
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
