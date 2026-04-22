"use client";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { api, type ContentTypeRow, type Platform } from "@/lib/api";

const COLORS = ["#E8891A", "#2D3748", "#38A169", "#E53E3E", "#805AD5"];
const CONTENT_LABELS: Record<string, string> = {
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

  const labeled = data.map(d => ({ ...d, label: CONTENT_LABELS[d.content_type] ?? d.content_type }));

  return (
    <div className="space-y-6 mt-4">
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
      ) : data.length === 0 ? (
        <div className="text-center py-20 text-gray-400">データがありません。</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {/* 投稿数の内訳（円グラフ） */}
          <section className="bg-white rounded-xl shadow p-4">
            <h2 className="font-bold text-brand-navy mb-3">コンテンツ種別 投稿数割合</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={labeled}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ label, percent }) => `${label} ${(percent * 100).toFixed(0)}%`}
                >
                  {labeled.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </section>

          {/* エンゲージメント率比較 */}
          <section className="bg-white rounded-xl shadow p-4">
            <h2 className="font-bold text-brand-navy mb-3">コンテンツ種別 平均エンゲージメント率</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={labeled} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis unit="%" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Bar dataKey="avg_engagement" name="平均エンゲージメント率" fill="#E8891A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>

          {/* いいね比較 */}
          <section className="bg-white rounded-xl shadow p-4 md:col-span-2">
            <h2 className="font-bold text-brand-navy mb-3">コンテンツ種別 平均いいね数</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={labeled} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="avg_likes" name="平均いいね" fill="#2D3748" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>
        </div>
      )}
    </div>
  );
}
