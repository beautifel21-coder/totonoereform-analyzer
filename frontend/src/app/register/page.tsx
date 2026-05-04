"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("パスワードが一致しません");
      return;
    }
    if (password.length < 8) {
      setError("パスワードは8文字以上にしてください");
      return;
    }
    setLoading(true);
    try {
      const res = await api.auth.register(email, password);
      saveAuth(res.access_token, res.user);
      window.location.href = "/";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-3 mb-8">
          <span className="text-6xl animate-bounce">🏠</span>
          <div className="text-center">
            <h1 className="font-black text-3xl text-gray-800 tracking-tight">Totonoē Reform</h1>
            <p className="text-orange-500 text-sm mt-1">競合SNS分析ツール</p>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-orange-100 shadow-lg p-6 space-y-5">
          <h2 className="font-bold text-xl text-gray-700 text-center">新規登録</h2>

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
                className="w-full px-4 py-2.5 rounded-xl border-2 border-orange-100 focus:border-orange-400 outline-none text-sm bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">パスワード <span className="text-gray-400 font-normal">（8文字以上）</span></label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-orange-100 focus:border-orange-400 outline-none text-sm bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">パスワード（確認）</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border-2 border-orange-100 focus:border-orange-400 outline-none text-sm bg-white transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 active:scale-95 transition-all shadow-md mt-2 disabled:opacity-50"
            >
              {loading ? "登録中..." : "無料で始める"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            すでにアカウントをお持ちの方は{" "}
            <a href="/login" className="text-orange-500 font-bold hover:underline">
              ログイン
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
