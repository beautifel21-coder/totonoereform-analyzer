"use client";
import { useEffect, useState } from "react";
import { api, type Competitor, type Platform } from "@/lib/api";
import { Trash2, RefreshCw, Plus } from "lucide-react";

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState<number | null>(null);
  const [form, setForm] = useState({ username: "", platform: "instagram" as Platform, note: "" });
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    setCompetitors(await api.competitors.list());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    await api.competitors.create({ ...form, category: "リフォーム", display_name: null });
    setForm({ username: "", platform: "instagram", note: "" });
    await load();
    setAdding(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("削除しますか？")) return;
    await api.competitors.delete(id);
    await load();
  };

  const handleFetch = async (id: number) => {
    setFetching(id);
    try {
      const res = await api.fetch.one(id);
      alert(`取得完了: ${res.posts_fetched}件の投稿 / フォロワー ${res.followers?.toLocaleString()}`);
    } catch (e) {
      alert("取得失敗: " + String(e));
    }
    setFetching(null);
  };

  return (
    <div className="space-y-6 mt-4">
      {/* 追加フォーム */}
      <section className="bg-white rounded-xl shadow p-4">
        <h2 className="font-bold text-brand-navy mb-3">競合アカウントを追加</h2>
        <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-gray-500 block mb-1">ユーザーネーム</label>
            <input
              required
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="例: nakagawa_reform"
              className="border rounded px-3 py-2 text-sm w-48 focus:outline-none focus:border-brand-orange"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">プラットフォーム</label>
            <select
              value={form.platform}
              onChange={e => setForm(f => ({ ...f, platform: e.target.value as Platform }))}
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-orange"
            >
              <option value="instagram">Instagram</option>
              <option value="x">X（Twitter）</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">メモ（任意）</label>
            <input
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="例: 滋賀の大手"
              className="border rounded px-3 py-2 text-sm w-40 focus:outline-none focus:border-brand-orange"
            />
          </div>
          <button
            type="submit"
            disabled={adding}
            className="flex items-center gap-1 bg-brand-orange text-white px-4 py-2 rounded text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            <Plus size={14} />
            {adding ? "追加中..." : "追加"}
          </button>
        </form>
      </section>

      {/* 一覧 */}
      <section className="bg-white rounded-xl shadow overflow-hidden">
        <h2 className="font-bold text-brand-navy p-4 border-b">競合アカウント一覧</h2>
        {loading ? (
          <p className="text-center py-10 text-gray-400">読み込み中...</p>
        ) : competitors.length === 0 ? (
          <p className="text-center py-10 text-gray-400">まだ競合アカウントがありません。</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="text-left px-4 py-2">ユーザーネーム</th>
                <th className="text-left px-4 py-2">表示名</th>
                <th className="text-left px-4 py-2">プラットフォーム</th>
                <th className="text-left px-4 py-2">メモ</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {competitors.map(c => (
                <tr key={c.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">@{c.username}</td>
                  <td className="px-4 py-3 text-gray-600">{c.display_name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.platform === "instagram" ? "bg-pink-100 text-pink-700" : "bg-sky-100 text-sky-700"}`}>
                      {c.platform === "instagram" ? "Instagram" : "X"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{c.note ?? "—"}</td>
                  <td className="px-4 py-3 flex gap-2 justify-end">
                    <button
                      onClick={() => handleFetch(c.id)}
                      disabled={fetching === c.id}
                      className="flex items-center gap-1 text-xs px-2 py-1 border rounded hover:border-brand-orange disabled:opacity-50"
                    >
                      <RefreshCw size={12} className={fetching === c.id ? "animate-spin" : ""} />
                      更新
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
