"use client";
import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, Cell, LabelList,
} from "recharts";
import { api, type Competitor, type Platform } from "@/lib/api";
import { TrendingUp, TrendingDown, Minus, RefreshCw, Save } from "lucide-react";

const COLORS = ["#E8891A", "#7C3AED", "#0D9488", "#E53E3E", "#3182CE", "#D69E2E", "#ED64A6", "#48BB78"];

function formatNum(n: number) {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function TrendsPage() {
  const [platform, setPlatform] = useState<Platform | "">("");
  const [days, setDays] = useState(30);
  const [followerTrends, setFollowerTrends] = useState<Record<string, { date: string; followers: number }[]>>({});
  const [postFrequency, setPostFrequency] = useState<Record<string, { date: string; count: number }[]>>({});
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [fetchResult, setFetchResult] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [manualFollowers, setManualFollowers] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});

  const fetchAll = async () => {
    setFetching(true);
    setFetchResult(null);
    try {
      const results = await api.fetch.all();
      const ok = results.filter(r => r.ok).length;
      const ng = results.filter(r => !r.ok).length;
      setFetchResult(ng > 0 ? `✅ ${ok}件更新 / ⚠️ ${ng}件失敗` : `✅ ${ok}件のデータを更新しました`);
      await load();
    } catch {
      setFetchResult("❌ 更新に失敗しました");
    } finally {
      setFetching(false);
    }
  };

  const load = async () => {
    setLoading(true);
    const [followers, posts] = await Promise.all([
      api.analytics.followerTrends(platform || undefined, days),
      api.analytics.postFrequency(platform || undefined, days),
    ]);
    setFollowerTrends(followers);
    setPostFrequency(posts);
    setLoading(false);
  };

  useEffect(() => {
    api.competitors.list().then(setCompetitors);
  }, []);

  useEffect(() => { load(); }, [platform, days]);

  const saveSnapshot = async (id: number) => {
    const val = parseInt(manualFollowers[id] ?? "");
    if (isNaN(val) || val < 0) return;
    setSaving(s => ({ ...s, [id]: true }));
    await api.competitors.recordSnapshot(id, val);
    setSaving(s => ({ ...s, [id]: false }));
    setManualFollowers(m => ({ ...m, [id]: "" }));
    await load();
  };

  const usernames = Array.from(new Set([
    ...Object.keys(followerTrends),
    ...Object.keys(postFrequency),
  ]));

  // 現在のフォロワー数（最新スナップショット）
  const currentFollowers = usernames
    .filter(u => followerTrends[u]?.length > 0)
    .map((u, i) => {
      const points = followerTrends[u];
      const latest = points[points.length - 1];
      return { username: `@${u}`, followers: latest.followers, color: COLORS[i % COLORS.length] };
    })
    .sort((a, b) => b.followers - a.followers);

  // フォロワー推移データ整形
  const followerDates = Array.from(new Set(
    Object.values(followerTrends).flat().map(d => d.date)
  )).sort();

  const followerData = followerDates.map(date => {
    const row: Record<string, string | number> = { date };
    for (const [username, points] of Object.entries(followerTrends)) {
      const found = points.find(p => p.date === date);
      if (found) row[username] = found.followers;
    }
    return row;
  });

  // 投稿頻度データ整形
  const postDates = Array.from(new Set(
    Object.values(postFrequency).flat().map(d => d.date)
  )).sort();

  const postData = postDates.map(date => {
    const row: Record<string, string | number> = { date };
    for (const [username, points] of Object.entries(postFrequency)) {
      const found = points.find(p => p.date === date);
      row[username] = found?.count ?? 0;
    }
    return row;
  });

  // フォロワー増減サマリー
  const followerChanges = usernames.map(username => {
    const points = followerTrends[username] || [];
    if (points.length < 2) return { username, change: 0, rate: 0, latest: points[0]?.followers ?? 0 };
    const first = points[0].followers;
    const last = points[points.length - 1].followers;
    const change = last - first;
    const rate = first > 0 ? Math.round((change / first) * 100) : 0;
    return { username, change, rate, latest: last };
  }).sort((a, b) => b.change - a.change);

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
        <button
          onClick={fetchAll}
          disabled={fetching}
          className="btn-primary ml-auto"
        >
          <RefreshCw size={15} className={fetching ? "animate-spin" : ""} />
          {fetching ? "取得中..." : "今すぐ更新"}
        </button>
      </div>
      {fetchResult && (
        <div className="text-sm font-semibold px-4 py-2 rounded-xl bg-green-50 text-green-700 border border-green-200 animate-fade-in">
          {fetchResult}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="text-5xl animate-float">📈</div>
          <p className="text-gray-400 animate-pulse font-medium">推移データを読み込み中...</p>
        </div>
      ) : usernames.length === 0 ? (
        <div className="empty-state">
          <div className="text-5xl animate-float">📊</div>
          <p className="font-black text-gray-600 text-lg">まだデータがありません</p>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            「🏆 競合管理」でアカウントを追加し、<br />「更新」ボタンを押すとグラフが表示されます
          </p>
          <a
            href="/competitors"
            className="mt-2 btn-primary pointer-events-auto"
          >
            🏆 競合管理へ
          </a>
        </div>
      ) : (
        <>
          {/* フォロワー数手動入力 */}
          {competitors.length > 0 && (
            <section className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">✏️</span>
                <h2 className="font-black text-brand-navy text-lg">フォロワー数を入力</h2>
                <span className="ml-auto text-xs text-gray-400">今日の数字を入力して記録</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {competitors.map((c, i) => (
                  <div key={c.id} className="flex items-center gap-2 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                      style={{ background: COLORS[i % COLORS.length] }}
                    >
                      {c.username[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-bold text-gray-700 min-w-0 truncate flex-1">@{c.username}</span>
                    <input
                      type="number"
                      placeholder="例: 12500"
                      value={manualFollowers[c.id] ?? ""}
                      onChange={e => setManualFollowers(m => ({ ...m, [c.id]: e.target.value }))}
                      onKeyDown={e => e.key === "Enter" && saveSnapshot(c.id)}
                      className="w-28 border-2 border-gray-200 rounded-xl px-2 py-1.5 text-sm focus:outline-none focus:border-brand-orange text-right"
                    />
                    <button
                      onClick={() => saveSnapshot(c.id)}
                      disabled={!manualFollowers[c.id] || saving[c.id]}
                      className="p-2 rounded-xl bg-brand-orange text-white disabled:opacity-30 hover:bg-orange-600 transition-colors"
                    >
                      <Save size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 現在のフォロワー数バーチャート */}
          {currentFollowers.length > 0 && (
            <section className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">👥</span>
                <h2 className="font-black text-brand-navy text-lg">現在のフォロワー数比較</h2>
                <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">最新</span>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={currentFollowers}
                  margin={{ top: 20, right: 20, left: 10, bottom: 30 }}
                  barCategoryGap="30%"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis
                    dataKey="username"
                    tick={{ fontSize: 11, fontWeight: 600 }}
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                    height={55}
                  />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={formatNum} width={55} />
                  <Tooltip
                    formatter={(v: number) => [formatNum(v), "フォロワー数"]}
                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                  />
                  <Bar dataKey="followers" radius={[8, 8, 0, 0]}>
                    {currentFollowers.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                    <LabelList
                      dataKey="followers"
                      position="top"
                      formatter={formatNum}
                      style={{ fontSize: 11, fontWeight: 700, fill: "#555" }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </section>
          )}

          {/* フォロワー増減サマリーカード */}
          {followerChanges.some(f => f.latest > 0) && (
            <section className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🏅</span>
                <h2 className="font-black text-brand-navy text-lg">フォロワー増減ランキング</h2>
                <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">期間中</span>
              </div>
              {followerChanges.filter(f => f.latest > 0).every(f => f.change === 0) ? (
                <p className="text-sm text-gray-400 py-4 text-center">
                  📅 データが1日分のみです。毎日自動更新されるので翌日以降に増減が表示されます。
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {followerChanges.filter(f => f.latest > 0).map((f, i) => (
                    <div
                      key={f.username}
                      className="flex items-center gap-3 p-3 rounded-2xl border-2 border-gray-100 bg-gray-50 animate-slide-in"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                        {f.username[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 text-xs truncate">@{f.username}</p>
                        <p className="text-xs text-gray-500">{formatNum(f.latest)}</p>
                        <div className={`flex items-center gap-1 text-xs font-bold mt-0.5 ${
                          f.change > 0 ? "text-green-600" : f.change < 0 ? "text-red-500" : "text-gray-400"
                        }`}>
                          {f.change > 0 ? <TrendingUp size={11} /> : f.change < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
                          {f.change > 0 ? "+" : ""}{formatNum(f.change)}
                          <span className="text-gray-400 font-normal">({f.rate > 0 ? "+" : ""}{f.rate}%)</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* フォロワー推移グラフ */}
          {followerData.length > 1 && (
            <section className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📈</span>
                <h2 className="font-black text-brand-navy text-lg">フォロワー数推移</h2>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={followerData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={formatNum} width={55} />
                  <Tooltip
                    formatter={(v: number, name: string) => [formatNum(v), `@${name}`]}
                    labelFormatter={l => `📅 ${l}`}
                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                  />
                  <Legend formatter={name => `@${name}`} />
                  {usernames.filter(u => followerTrends[u]).map((name, i) => (
                    <Line
                      key={name}
                      type="monotone"
                      dataKey={name}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 5 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </section>
          )}

          {/* 投稿頻度推移グラフ */}
          {postData.length > 0 && (
            <section className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">📝</span>
                <h2 className="font-black text-brand-navy text-lg">日別投稿数推移</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={postData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(v: number, name: string) => [`${v}件`, `@${name}`]}
                    labelFormatter={l => `📅 ${l}`}
                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                  />
                  <Legend formatter={name => `@${name}`} />
                  {usernames.filter(u => postFrequency[u]).map((name, i) => (
                    <Line
                      key={name}
                      type="monotone"
                      dataKey={name}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </section>
          )}
        </>
      )}
    </div>
  );
}
