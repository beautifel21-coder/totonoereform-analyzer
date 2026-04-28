"use client";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { api, type ContentTypeRow, type Platform } from "@/lib/api";

const COLORS = ["#E8891A", "#7C3AED", "#0D9488", "#E53E3E", "#3182CE"];
const CONTENT_LABELS: Record<string, string> = {
  photo: "📷 写真",
  video: "🎬 動画",
  reel: "🎞️ Reels",
  carousel: "🖼️ カルーセル",
  text: "💬 テキスト",
};
const CONTENT_LABELS_SHORT: Record<string, string> = {
  photo: "写真",
  video: "動画",
  reel: "Reels",
  carousel: "カルーセル",
  text: "テキスト",
};

export default function ContentPage() {
  const [platform, setPlatform] = useState<Platform | "">("");
  const [days, setDays] = useState(30);
  const [data, setData] = useState<ContentTypeRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setData(await api.analytics.contentTypes(platform || undefined, days));
    setLoading(false);
  };

  useEffect(() => { load(); }, [platform, days]);

  const labeled = data.map(d => ({
    ...d,
    label: CONTENT_LABELS_SHORT[d.content_type] ?? d.content_type,
    labelFull: CONTENT_LABELS[d.content_type] ?? d.content_type,
  }));

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
          <div className="text-5xl animate-float">🎨</div>
          <p className="text-gray-400 animate-pulse font-medium">コンテンツを分析中...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="empty-state">
          <div className="text-5xl animate-float">🎨</div>
          <p className="font-bold text-gray-500">データがありません</p>
          <p className="text-sm text-gray-400">競合アカウントを追加してデータを取得してください</p>
        </div>
      ) : (
        <>
          {/* コンテンツ種別チップ */}
          <section className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🎭</span>
              <h2 className="font-black text-brand-navy text-lg">コンテンツ種別の内訳</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {labeled.map((d, i) => (
                <div
                  key={d.content_type}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-white font-bold text-sm shadow-md hover:scale-105 transition-transform cursor-default"
                  style={{ background: COLORS[i % COLORS.length] }}
                >
                  <span>{d.labelFull}</span>
                  <span className="bg-white/30 text-white text-xs px-2 py-0.5 rounded-full font-bold">{d.count}件</span>
                </div>
              ))}
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-5">
            {/* 投稿数の内訳（円グラフ） */}
            <section className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🥧</span>
                <h2 className="font-black text-brand-navy text-lg">投稿数割合</h2>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={labeled}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    innerRadius={35}
                    paddingAngle={3}
                    label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: "#ccc" }}
                  >
                    {labeled.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [`${v}件`, "投稿数"]}
                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </section>

            {/* エンゲージメント率比較 */}
            <section className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🎯</span>
                <h2 className="font-black text-brand-navy text-lg">平均エンゲージメント率</h2>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={labeled} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fontWeight: 600 }} />
                  <YAxis unit="%" tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(v: number) => [`${v}%`, "平均エンゲージメント率"]}
                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                  />
                  <Bar dataKey="avg_engagement" name="平均エンゲージメント率" radius={[8, 8, 0, 0]}>
                    {labeled.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </section>

            {/* いいね比較 */}
            <section className="card p-5 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">❤️</span>
                <h2 className="font-black text-brand-navy text-lg">コンテンツ種別 平均いいね数</h2>
              </div>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={labeled} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fontWeight: 600 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
                  />
                  <Legend />
                  <Bar dataKey="avg_likes" name="平均いいね" fill="#E8891A" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
