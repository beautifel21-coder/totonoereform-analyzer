"use client";
import "./globals.css";
import BuzzlyLogo from "@/components/BuzzlyLogo";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <html lang="ja">
      <head>
        <title>Buzzly - SNS競合分析</title>
        <meta name="description" content="SNS競合分析ツール Buzzly" />
        <meta name="theme-color" content="#5BA4CF" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="text-gray-900 min-h-screen">

        {/* ヘッダー */}
        <header className="relative overflow-hidden text-white px-5 py-4 flex items-center gap-3 shadow-blue-lg z-40"
          style={{ background: "linear-gradient(135deg, #1A2D4A 0%, #2D5F8A 60%, #5BA4CF 100%)" }}>
          {/* 背景の光 */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-brand-blue/20 blur-3xl animate-breathe" />
            <div className="absolute -bottom-6 left-1/4 w-40 h-40 rounded-full bg-brand-sky/15 blur-2xl animate-float-slow" />
          </div>

          <div className="relative flex items-center gap-3">
            <div className="animate-float">
              <BuzzlyLogo size={38} />
            </div>
            <div>
              <span className="text-gradient font-black text-xl tracking-tight">Buzzly</span>
            </div>
          </div>
          <span className="relative text-blue-200 text-sm hidden sm:block">｜ SNS競合分析</span>

          <div className="ml-auto relative flex gap-2">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 text-white hover:opacity-90 active:scale-95 transition-all shadow-soft"
            >
              📷 Instagram
            </a>
            <a
              href="https://x.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-black text-white border border-gray-600 hover:bg-gray-800 active:scale-95 transition-all shadow-soft"
            >
              𝕏 X
            </a>
          </div>
        </header>

        {/* ナビゲーション */}
        <nav className="bg-white/75 backdrop-blur-lg border-b border-white/60 px-4 flex gap-1 text-sm font-medium shadow-soft overflow-x-auto sticky top-0 z-50">
          {[
            { href: "/",            label: "📊 ダッシュボード" },
            { href: "/competitors", label: "🏆 競合管理" },
            { href: "/hashtags",    label: "#️⃣ ハッシュタグ" },
            { href: "/content",     label: "🎨 コンテンツ" },
            { href: "/top-posts",   label: "🔥 人気投稿" },
            { href: "/trends",      label: "📈 推移グラフ" },
          ].map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className={`py-3 px-3 whitespace-nowrap border-b-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                pathname === href
                  ? "text-brand-blue border-brand-blue font-bold"
                  : "text-gray-500 border-transparent hover:text-brand-blue hover:border-brand-blue"
              }`}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* メインコンテンツ */}
        <main className="p-4 max-w-6xl mx-auto relative z-10">
          {children}
        </main>

        {/* 背景のぼんやり光 */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
          <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-blue-100/40 blur-[80px] animate-breathe" />
          <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full bg-sky-100/25 blur-[80px] animate-float-slow" />
          <div className="absolute top-2/3 right-1/3 w-[300px] h-[300px] rounded-full bg-blue-50/35 blur-[60px] animate-shimmer" />
        </div>
      </body>
    </html>
  );
}
