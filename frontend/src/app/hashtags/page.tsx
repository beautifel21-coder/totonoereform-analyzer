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

      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-bold text-brand-navy mb-3">使用ハッシュタグ TOP20（使用回数）</h2>
        {loading ? (
          <p className="text-center py-10 text-gray-400">読み込み中...</p>
        ) : top20.length === 0 ? (
          <p className="text-center py-10 text-gray-400">データがありません。</p>
        ) : (
          <ResponsiveContainer width="100%" height={420}>
            <BarChart data={top20} layout="vertical" margin={{ top: 5, right: 20, left: 120, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="tag" tick={{ fontSize: 11 }} width={120} />
              <Tooltip />
              <Bar dataKey="count" name="使用回数" fill="#E8891A" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-bold text-brand-navy mb-3">ハッシュタグ別 平均エンゲージメント率 TOP20</h2>
        {loading ? (
          <p className="text-center py-10 text-gray-400">読み込み中...</p>
        ) : top20.length === 0 ? (
          <p className="text-center py-10 text-gray-400">データがありません。</p>
        ) : (
          <ResponsiveContainer width="100%" height={420}>
            <BarChart
              data={[...top20].sort((a, b) => b.avg_engagement - a.avg_engagement)}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" unit="%" tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="tag" tick={{ fontSize: 11 }} width={120} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="avg_engagement" name="平均エンゲージメント率" fill="#2D3748" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* テーブル */}
      <section className="bg-white rounded-xl shadow overflow-hidden">
        <h2 className="font-bold text-brand-navy p-4 border-b">ハッシュタグ一覧</h2>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th className="text-left px-4 py-2">ハッシュタグ</th>
              <th className="text-right px-4 py-2">使用回数</th>
              <th className="text-right px-4 py-2">平均エンゲージメント</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.tag} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-brand-orange">{row.tag}</td>
                <td className="px-4 py-2 text-right">{row.count}</td>
                <td className="px-4 py-2 text-right">{row.avg_engagement}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
