"use client";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api, type HashtagRow, type Platform } from "@/lib/api";

export default function HashtagsPage() {
  const [platform, setPlatform] = useState<Platform | "">("");
  const [days, setDays] = useState(30);
  const [data, setData] = useState<HashtagRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setData(await api.analytics.hashtags(platform || undefined, days));
    setLoading(false);
  };

  useEffect(() => { load(); }, [platform, days]);

  const top20 = data.slice(0, 20);

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
          <div className="text-5xl animate-float">#️⃣</div>
          <p className="text-gray-400 animate-pulse font-medium">ハッシュタグを分析中...</p>
        </div>
      ) : top20.length === 0 ? (
        <div className="empty-state">
          <div className="text-5xl animate-float">#️⃣</div>
          <p className="font-bold text-gray-500">ハッシュタグデータがありません</p>
          <p className="text-sm text-gray-400">競合アカウントを追加してデータを取得してください</p>
        </div>
      ) : (
        <>
          {/* チップ表示 */}
          <section className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🔥</span>
              <h2 className="font-black text-brand-navy text-lg">よく使われるハッシュタグ</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.slice(0, 30).map((row, i) => {
                const max = data[0].count;
                const size = 0.7 + (row.count / max) * 0.6;
                const opacity = 0.5 + (row.count / max) * 0.5;
                return (
                  <span
                    key={row.tag}
                    className="px-3 py-1.5 rounded-full font-bold text-white cursor-default transition-transform hover:scale-110 active:scale-95"
                    style={{
                      fontSize: `${size}rem`,
                      opacity,
                      background: `hsl(${(i * 37) % 360}, 70%, 50%)`,
                    }}
                    title={`${row.count}回使用 / エンゲージメント${row.avg_engagement}%`}
                  >
                    {row.tag}
                  </span>
                );
              })}
            </div>
          </section>

          {/* 使用回数グラフ */}
          <section className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">📊</span>
              <h2 className="font-black text-brand-navy text-lg">使用回数 TOP20</h2>
            </div>
            <ResponsiveContainer width="100%" height={420}>
              <BarChart data={top20} layout="vertical" margin={{ top: 5, right: 20, left: 120, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="tag" tick={{ fontSize: 11, fontWeight: 600 }} width={120} />
                <Tooltip
                  formatter={(v: number) => [`${v}回`, "使用回数"]}
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="count" name="使用回数" radius={[0, 8, 8, 0]}>
                  {top20.map((_, i) => (
                    <rect key={i} fill={`hsl(${30 + i * 5}, 85%, 55%)`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* エンゲージメントグラフ */}
          <section className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">💡</span>
              <h2 className="font-black text-brand-navy text-lg">平均エンゲージメント率 TOP20</h2>
            </div>
            <ResponsiveContainer width="100%" height={420}>
              <BarChart
                data={[...top20].sort((a, b) => b.avg_engagement - a.avg_engagement)}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 120, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" unit="%" tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="tag" tick={{ fontSize: 11, fontWeight: 600 }} width={120} />
                <Tooltip
                  formatter={(v: number) => [`${v}%`, "平均エンゲージメント率"]}
                  contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                />
                <Bar dataKey="avg_engagement" name="平均エンゲージメント率" fill="#7C3AED" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* テーブル */}
          <section className="card overflow-hidden">
            <div className="flex items-center gap-2 p-5 border-b border-gray-100">
              <span className="text-xl">📋</span>
              <h2 className="font-black text-brand-navy text-lg">ハッシュタグ一覧</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs font-bold">
                  <tr>
                    <th className="text-left px-5 py-3">ランク</th>
                    <th className="text-left px-5 py-3">ハッシュタグ</th>
                    <th className="text-right px-5 py-3">使用回数</th>
                    <th className="text-right px-5 py-3">平均エンゲージメント</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => (
                    <tr key={row.tag} className="border-t border-gray-50 hover:bg-orange-50 transition-colors">
                      <td className="px-5 py-3 font-bold text-gray-400">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                      </td>
                      <td className="px-5 py-3 font-bold text-brand-orange">{row.tag}</td>
                      <td className="px-5 py-3 text-right font-semibold">{row.count}<span className="text-gray-400 font-normal ml-1">回</span></td>
                      <td className="px-5 py-3 text-right">
                        <span className="bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full text-xs">{row.avg_engagement}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
