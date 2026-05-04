"use client";
import "./globals.css";
import BuzzlyLogo from "@/components/BuzzlyLogo";
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

    // ログインしていない場合、認証不要ページ以外はリダイレクト
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
        <title>Buzzly - SNS競合分析</title>
        <meta name="description" content="SNS競合分析ツール Buzzly" />
        <meta name="theme-color" content="#3B9ED4" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="text-gray-800 min-h-screen">

        {/* 浮かぶ泡の背景 */}
        <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
          <div className="absolute inset-0" style={{
            background: "linear-gradient(160deg, #B8DFF5 0%, #C8E6F7 25%, #D6EEFF 55%, #E8F5FF 80%, #F0F8FF 100%)"
          }} />
          <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full opacity-60"
            style={{ background: "radial-gradient(circle, #A8D8EA 0%, transparent 70%)", animation: "breathe 8s ease-in-out infinite" }} />
          <div className="absolute bottom-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-50"
            style={{ background: "radial-gradient(circle, #7EC8E3 0%, transparent 70%)", animation: "breathe 10s ease-in-out infinite 2s" }} />
          <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full opacity-30"
            style={{ background: "radial-gradient(circle, #5BA4CF 0%, transparent 70%)", animation: "breathe 12s ease-in-out infinite 4s" }} />
          {[
            { size: 60, left: "10%", delay: "0s", duration: "15s" },
            { size: 40, left: "25%", delay: "3s", duration: "18s" },
            { size: 80, left: "50%", delay: "6s", duration: "20s" },
            { size: 30, left: "70%", delay: "1s", duration: "13s" },
            { size: 50, left: "85%", delay: "8s", duration: "17s" },
            { size: 25, left: "40%", delay: "4s", duration: "22s" },
          ].map((b, i) => (
            <div key={i} className="bubble" style={{
              width: b.size, height: b.size,
              left: b.left,
              animationDelay: b.delay,
              animationDuration: b.duration,
            }} />
          ))}
        </div>

        {/* ヘッダー */}
        {!isAuthPage && (
          <header className="relative overflow-hidden text-white px-5 py-4 flex items-center gap-3 z-40"
            style={{
              background: "linear-gradient(135deg, #1A6FA8 0%, #2B8CC4 50%, #3B9ED4 100%)",
              boxShadow: "0 4px 30px rgba(27,111,168,0.4)"
            }}>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, white, transparent)" }} />
              <div className="absolute top-0 left-1/3 w-32 h-32 rounded-full opacity-10"
                style={{ background: "radial-gradient(circle, white, transparent)" }} />
            </div>

            <div className="relative flex items-center gap-3">
              <div style={{ animation: "float 4s ease-in-out infinite" }}>
                <BuzzlyLogo size={44} />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-2xl tracking-tight leading-none" style={{
                  textShadow: "0 2px 8px rgba(0,0,0,0.2)"
                }}>Buzzly</span>
                <span className="text-sky-200 text-xs font-medium">SNS競合分析</span>
              </div>
            </div>

            <div className="ml-auto relative flex items-center gap-2">
              {email && (
                <span className="hidden sm:block text-sky-200 text-xs truncate max-w-[160px]">{email}</span>
              )}
              <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white active:scale-95 transition-all"
                style={{ background: "linear-gradient(135deg, #F58529, #DD2A7B, #8134AF)", boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
                📷 Instagram
              </a>
              <a href="https://x.com/" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-900 text-white border border-gray-600 hover:bg-gray-800 active:scale-95 transition-all"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
                𝕏 X
              </a>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 active:scale-95 transition-all border border-white/30"
              >
                ログアウト
              </button>
            </div>
          </header>
        )}

        {/* ナビゲーション */}
        {!isAuthPage && (
          <nav className="backdrop-blur-xl border-b border-white/50 px-4 flex gap-1 text-sm font-medium overflow-x-auto sticky top-0 z-50"
            style={{ background: "rgba(255,255,255,0.6)", boxShadow: "0 2px 20px rgba(91,164,207,0.15)" }}>
            {[
              { href: "/",            label: "📊 ダッシュボード" },
              { href: "/competitors", label: "🏆 競合管理" },
              { href: "/hashtags",    label: "#️⃣ ハッシュタグ" },
              { href: "/content",     label: "🎨 コンテンツ" },
              { href: "/top-posts",   label: "🔥 人気投稿" },
              { href: "/trends",      label: "📈 推移グラフ" },
              { href: "/pricing",     label: "💳 料金プラン" },
            ].map(({ href, label }) => (
              <a key={href} href={href}
                className={`py-3 px-3 whitespace-nowrap border-b-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                  pathname === href
                    ? "text-sky-600 border-sky-500 font-bold"
                    : "text-gray-500 border-transparent hover:text-sky-500 hover:border-sky-300"
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
      </body>
    </html>
  );
}
