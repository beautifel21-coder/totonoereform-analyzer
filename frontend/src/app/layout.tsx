import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Totonoē Reform 競合分析",
  description: "リフォーム業界の競合SNS分析ツール",
  manifest: "/manifest.json",
  themeColor: "#E8891A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <header className="bg-brand-navy text-white px-4 py-3 flex items-center gap-3 shadow">
          <span className="text-brand-orange font-bold text-xl">Totonoē</span>
          <span className="text-sm text-gray-300">競合分析ダッシュボード</span>
        </header>
        <nav className="bg-white border-b px-4 flex gap-4 text-sm font-medium">
          {[
            { href: "/", label: "ダッシュボード" },
            { href: "/competitors", label: "競合管理" },
            { href: "/hashtags", label: "ハッシュタグ" },
            { href: "/content", label: "コンテンツ分析" },
            { href: "/top-posts", label: "人気投稿" },
          ].map(({ href, label }) => (
            <a key={href} href={href} className="py-3 hover:text-brand-orange border-b-2 border-transparent hover:border-brand-orange transition-colors">
              {label}
            </a>
          ))}
        </nav>
        <main className="p-4 max-w-6xl mx-auto">{children}</main>
      </body>
    </html>
  );
}
