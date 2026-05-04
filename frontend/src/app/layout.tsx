"use client";
import "./globals.css";
import Mascot from "@/components/Mascot";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser, clearAuth, isLoggedIn } from "@/lib/auth";

const AUTH_PAGES = ["/login", "/register"];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PAGES.includes(pathname);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const user = getUser();
    setEmail(user?.email ?? null);
    if (!isAuthPage && !isLoggedIn()) {
      window.location.href = "/login";
    }
  }, [pathname, isAuthPage]);

  const handleLogout = () => {
    clearAuth();
    window.location.href = "/login";
  };

  return (
    <html lang="ja">
      <head>
        <title>Totonoē Reform 競合分析</title>
        <meta name="description" content="リフォーム業界の競合SNS分析ツール" />
        <meta name="theme-color" content="#E8891A" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="text-gray-900 min-h-screen">

        {!isAuthPage && <Mascot />}

        {/* ヘッダー */}
        {!isAuthPage && (
          <header className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-orange-900 text-white px-5 py-4 flex items-center gap-3 shadow-warm-lg z-40">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-brand-orange/25 blur-3xl animate-breathe" />
              <div className="absolute -bottom-6 left-1/4 w-40 h-40 rounded-full bg-yellow-400/15 blur-2xl animate-float-slow" />
            </div>

            <div className="relative flex items-center gap-2">
              <span className="text-2xl animate-wave inline-block">🏠</span>
              <div>
                <span className="text-gradient font-black text-xl tracking-tight">Totonoē</span>
                <span className="text-white font-bold text-xl"> Reform</span>
              </div>
            </div>
            <span className="relative text-gray-400 text-sm hidden sm:block">｜ 競合SNS分析</span>

            <div className="ml-auto relative flex items-center gap-2">
              {email && (
                <span className="hidden sm:block text-gray-400 text-xs truncate max-w-[160px]">{email}</span>
              )}
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 text-white hover:opacity-90 active:scale-95 transition-all shadow-warm">
                📷 Instagram
              </a>
              <a href="https://x.com/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-black text-white border border-gray-600 hover:bg-gray-800 active:scale-95 transition-all">
                𝕏 X
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 active:scale-95 transition-all border border-white/20"
              >
                ログアウト
              </button>
            </div>
          </header>
        )}

        {/* ナビゲーション */}
        {!isAuthPage && (
          <nav className="bg-white/75 backdrop-blur-lg border-b border-white/60 px-4 flex gap-1 text-sm font-medium shadow-soft overflow-x-auto sticky top-0 z-50">
            {[
              { href: "/",            label: "📊 ダッシュボード" },
              { href: "/competitors", label: "🏆 競合管理" },
              { href: "/hashtags",    label: "#️⃣ ハッシュタグ" },
              { href: "/content",     label: "🎨 コンテンツ" },
              { href: "/top-posts",   label: "🔥 人気投稿" },
              { href: "/trends",      label: "📈 推移グラフ" },
            ].map(({ href, label }) => (
              <a key={href} href={href}
                className={`py-3 px-3 whitespace-nowrap border-b-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                  pathname === href
                    ? "text-brand-orange border-brand-orange font-bold"
                    : "text-gray-500 border-transparent hover:text-brand-orange hover:border-brand-orange"
                }`}>
                {label}
              </a>
            ))}
          </nav>
        )}

        {/* メインコンテンツ */}
        <main className={`relative z-10 ${isAuthPage ? "" : "p-4 max-w-6xl mx-auto"}`}>
          {children}
        </main>

        {/* 背景 */}
        {!isAuthPage && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
            <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-orange-100/40 blur-[80px] animate-breathe" />
            <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full bg-purple-100/25 blur-[80px] animate-float-slow" />
            <div className="absolute top-2/3 right-1/3 w-[300px] h-[300px] rounded-full bg-yellow-100/35 blur-[60px] animate-shimmer" />
          </div>
        )}
      </body>
    </html>
  );
}
