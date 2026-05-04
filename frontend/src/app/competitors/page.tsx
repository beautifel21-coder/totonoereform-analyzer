"use client";
import { useEffect, useState } from "react";
import { api, type Competitor, type Platform, type SearchedAccount } from "@/lib/api";
import { Trash2, RefreshCw, Plus, ExternalLink, Flame, Heart, Users, Zap } from "lucide-react";

function profileUrl(platform: Platform, username: string) {
  return platform === "instagram"
    ? `https://www.instagram.com/${username}/`
    : `https://x.com/${username}`;
}

function PlatformBadge({ platform }: { platform: Platform }) {
  return platform === "instagram" ? (
    <span className="pill platform-instagram">📷 Instagram</span>
  ) : (
    <span className="pill platform-x">𝕏 X</span>
  );
}

function formatNum(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}万`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState<number | null>(null);
  const [form, setForm] = useState({ username: "", platform: "instagram" as Platform, note: "" });
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [addingUsername, setAddingUsername] = useState<string | null>(null);

  // 検索
  const [hashtags, setHashtags] = useState("リフォーム,リノベーション,リフォーム事例,住宅リフォーム,リノベ");
  const [minFollowers, setMinFollowers] = useState(10000);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchedAccount[] | null>(null);
  const [searchError, setSearchError] = useState("");

  const load = async () => {
    setLoading(true);
    setCompetitors(await api.competitors.list());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSearch = async () => {
    setSearching(true);
    setSearchError("");
    setSearchResults(null);
    try {
      const results = await api.search.accounts(hashtags, minFollowers);
      setSearchResults(results);
    } catch {
      setSearchError("検索に失敗しました。時間をおいて再試行してください。");
    }
    setSearching(false);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await api.competitors.create({ ...form, category: "リフォーム", display_name: null });
      setForm({ username: "", platform: "instagram", note: "" });
      await load();
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "エラーが発生しました";
      if (msg.includes("上限") || msg.includes("402")) {
        if (confirm("プランの上限に達しました。料金プランページでアップグレードしますか？")) {
          window.location.href = "/pricing";
        }
      } else {
        alert(msg);
      }
    }
    setAdding(false);
  };

  const handleAddAccount = async (acc: SearchedAccount) => {
    setAddingUsername(acc.username);
    try {
      await api.competitors.create({
        username: acc.username,
        platform: acc.platform,
        note: `フォロワー${formatNum(acc.followers)}`,
        category: "リフォーム",
        display_name: acc.display_name || null,
      });
      await load();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "エラーが発生しました";
      if (msg.includes("上限") || msg.includes("402")) {
        if (confirm("プランの上限に達しました。料金プランページでアップグレードしますか？")) {
          window.location.href = "/pricing";
        }
      } else {
        alert(msg);
      }
    }
    setAddingUsername(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("このアカウントを削除しますか？")) return;
    await api.competitors.delete(id);
    await load();
  };

  const handleFetch = async (id: number) => {
    setFetching(id);
    try {
      const res = await api.fetch.one(id);
      alert(`✅ 取得完了！\n投稿: ${res.posts_fetched}件\nフォロワー: ${res.followers?.toLocaleString() ?? "—"}`);
    } catch {
      alert("❌ 取得失敗しました");
    }
    setFetching(null);
  };

  const alreadyAdded = new Set(competitors.map(c => c.username));
  const [planInfo, setPlanInfo] = useState<{ plan: string; limit: number } | null>(null);
  useEffect(() => { api.billing.me().then(setPlanInfo).catch(() => {}); }, []);

  return (
    <div className="space-y-6 mt-5 animate-fade-in">
      {/* プランバナー */}
      {planInfo && (
        <div className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium ${
          planInfo.plan === "free"
            ? "bg-orange-50 border border-orange-200 text-orange-700"
            : "bg-violet-50 border border-violet-200 text-violet-700"
        }`}>
          <span>
            現在のプラン：<strong>{planInfo.plan === "free" ? "Free" : planInfo.plan === "standard" ? "Standard" : "Pro"}</strong>
            　アカウント：<strong>{competitors.length}</strong> / {planInfo.limit === 999 ? "無制限" : `${planInfo.limit}件`}
          </span>
          {planInfo.plan === "free" && (
            <a href="/pricing" className="ml-3 px-3 py-1.5 rounded-xl bg-orange-500 text-white text-xs font-bold hover:bg-orange-600 transition-colors whitespace-nowrap">
              アップグレード →
            </a>
          )}
        </div>
      )}

      {/* ハッシュタグ検索 */}
      <section className="card overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-gray-100">
          <span className="text-xl">🔍</span>
          <h2 className="font-black text-brand-navy text-lg">人気アカウントを検索</h2>
          <span className="ml-2 bg-orange-100 text-brand-orange text-xs font-bold px-2.5 py-1 rounded-full">
            万垢・バズ投稿のみ
          </span>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-52">
              <label className="text-xs text-gray-500 block mb-1 font-semibold">ハッシュタグ（カンマ区切り）</label>
              <input
                value={hashtags}
                onChange={e => setHashtags(e.target.value)}
                placeholder="リフォーム,リノベーション,リノベ"
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-orange transition-colors"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1 font-semibold">最小フォロワー数</label>
              <select
                value={minFollowers}
                onChange={e => setMinFollowers(Number(e.target.value))}
                className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-orange transition-colors"
              >
                <option value={5000}>5,000人以上</option>
                <option value={10000}>1万人以上</option>
                <option value={30000}>3万人以上</option>
                <option value={100000}>10万人以上</option>
              </select>
            </div>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="btn-primary"
            >
              <Flame size={15} className={searching ? "animate-pulse" : ""} />
              {searching ? "スキャン中... (1〜2分)" : "今バズってるアカウントを探す"}
            </button>
          </div>

          {/* ローディング */}
          {searching && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="text-4xl animate-float">🔍</div>
              <p className="text-gray-500 font-bold">Instagramを分析中...</p>
              <p className="text-xs text-gray-400">ハッシュタグから人気アカウントを探しています（約1〜2分）</p>
              <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-brand-orange rounded-full animate-pulse" style={{ width: "60%" }} />
              </div>
            </div>
          )}

          {/* エラー */}
          {searchError && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
              ❌ {searchError}
            </div>
          )}

          {/* 検索結果 */}
          {searchResults !== null && !searching && (
            <>
              {searchResults.length === 0 ? (
                <div className="empty-state py-8">
                  <div className="text-4xl animate-float">😔</div>
                  <p className="font-bold text-gray-500">条件を満たすアカウントが見つかりませんでした</p>
                  <p className="text-sm text-gray-400">ハッシュタグや最小フォロワー数を変えて再検索してください</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-600">
                      🎉 {searchResults.length}件見つかりました
                    </span>
                    <span className="text-xs text-gray-400">フォロワー数順</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {searchResults.map((acc, i) => {
                      const added = alreadyAdded.has(acc.username);
                      const isAdding = addingUsername === acc.username;
                      return (
                        <div
                          key={acc.username}
                          className={`p-4 rounded-2xl border-2 transition-all animate-slide-in ${
                            added ? "border-green-200 bg-green-50" : "border-gray-100 bg-gray-50 hover:border-orange-200 hover:bg-orange-50"
                          }`}
                          style={{ animationDelay: `${i * 40}ms` }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                              {acc.username[0].toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <a
                                  href={profileUrl(acc.platform, acc.username)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-bold text-gray-800 hover:text-brand-orange transition-colors text-sm truncate"
                                >
                                  @{acc.username}
                                </a>
                                <ExternalLink size={11} className="text-gray-400 flex-shrink-0" />
                              </div>
                              {acc.display_name && (
                                <p className="text-xs text-gray-500 truncate">{acc.display_name}</p>
                              )}
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="flex items-center gap-1 text-xs font-bold text-gray-600">
                                  <Users size={11} />
                                  {formatNum(acc.followers)}
                                </span>
                                <span className="flex items-center gap-1 text-xs font-bold text-red-500">
                                  <Heart size={11} fill="currentColor" />
                                  avg {formatNum(acc.avg_likes)}
                                </span>
                                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                                  acc.avg_engagement >= 3 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
                                }`}>
                                  <Flame size={10} />
                                  {acc.avg_engagement}%
                                </span>
                                <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-600">
                                  <Zap size={10} />
                                  バズ {acc.buzz_score}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => !added && handleAddAccount(acc)}
                            disabled={added || isAdding}
                            className={`mt-3 w-full text-xs font-bold py-2 rounded-xl transition-all ${
                              added
                                ? "bg-green-100 text-green-600 cursor-default"
                                : "bg-brand-orange text-white hover:opacity-90 active:scale-95"
                            }`}
                          >
                            {isAdding ? "追加中..." : added ? "✅ 追加済み" : "＋ 競合リストに追加"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* 手動追加フォーム */}
      <section className="card p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">➕</span>
          <h2 className="font-black text-brand-navy text-lg">手動で追加</h2>
          {justAdded && (
            <span className="ml-auto text-green-500 font-bold text-sm animate-pop">🎉 追加しました！</span>
          )}
        </div>
        <form onSubmit={handleAdd} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-gray-500 block mb-1 font-semibold">ユーザーネーム</label>
            <input
              required
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="例: nakagawa_reform"
              className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm w-48 focus:outline-none focus:border-brand-orange transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1 font-semibold">プラットフォーム</label>
            <select
              value={form.platform}
              onChange={e => setForm(f => ({ ...f, platform: e.target.value as Platform }))}
              className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-orange transition-colors"
            >
              <option value="instagram">📷 Instagram</option>
              <option value="x">𝕏 X（Twitter）</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1 font-semibold">メモ（任意）</label>
            <input
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              placeholder="例: 滋賀の大手"
              className="border-2 border-gray-200 rounded-xl px-3 py-2 text-sm w-40 focus:outline-none focus:border-brand-orange transition-colors"
            />
          </div>
          <button type="submit" disabled={adding} className="btn-primary">
            <Plus size={16} />
            {adding ? "追加中..." : "追加する"}
          </button>
        </form>
      </section>

      {/* 一覧 */}
      <section className="card overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-gray-100">
          <span className="text-xl">🏆</span>
          <h2 className="font-black text-brand-navy text-lg">競合アカウント一覧</h2>
          <span className="ml-auto bg-brand-orange text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {competitors.length}件
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
            <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
            読み込み中...
          </div>
        ) : competitors.length === 0 ? (
          <div className="empty-state">
            <div className="text-5xl animate-float">🔍</div>
            <p className="font-bold text-gray-500">まだアカウントがありません</p>
            <p className="text-sm text-gray-400">上の検索から追加してみましょう！</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {competitors.map((c, idx) => (
              <div
                key={c.id}
                className="flex items-center gap-3 px-5 py-4 hover:bg-orange-50 transition-colors group"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
                  {c.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <a
                    href={profileUrl(c.platform, c.username)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-bold text-gray-800 hover:text-brand-orange transition-colors w-fit"
                  >
                    @{c.username}
                    <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                  <div className="flex items-center gap-2 mt-0.5">
                    <PlatformBadge platform={c.platform} />
                    {c.note && <span className="text-xs text-gray-400">{c.note}</span>}
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => handleFetch(c.id)}
                    disabled={fetching === c.id}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    <RefreshCw size={12} className={fetching === c.id ? "animate-spin" : ""} />
                    {fetching === c.id ? "取得中..." : "更新"}
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="btn-danger">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
