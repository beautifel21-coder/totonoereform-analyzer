"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import BuzzlyLogo from "@/components/BuzzlyLogo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await api.auth.login(email, password);
      saveAuth(res.access_token, res.user);
      window.location.href = "/";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* ロゴ */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div style={{ animation: "float 4s ease-in-out infinite" }}>
            <BuzzlyLogo size={72} />
          </div>
          <div className="text-center">
            <h1 className="font-black text-3xl text-sky-700 tracking-tight">Buzzly</h1>
            <p className="text-sky-500 text-sm mt-1">SNS競合分析ツール</p>
          </div>
        </div>

        {/* カード */}
        <div className="card p-6 space-y-5">
          <h2 className="font-bold text-xl text-gray-700 text-center">ログイン</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-sky-100 focus:border-sky-400 outline-none text-sm bg-white/80 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-sky-100 focus:border-sky-400 outline-none text-sm bg-white/80 transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base mt-2"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            アカウントをお持ちでない方は{" "}
            <a href="/register" className="text-sky-600 font-bold hover:underline">
              新規登録
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
