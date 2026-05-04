"use client";
import { getUser } from "@/lib/auth";
import { useEffect, useState } from "react";

const PLANS = [
  {
    name: "Free",
    price: 0,
    priceLabel: "無料",
    color: "from-sky-400 to-blue-500",
    border: "border-sky-200",
    accounts: 5,
    features: [
      "競合アカウント 5件まで",
      "エンゲージメント分析",
      "ハッシュタグ分析",
      "コンテンツ分析",
    ],
    cta: "現在のプラン",
    disabled: true,
  },
  {
    name: "Standard",
    price: 2980,
    priceLabel: "¥2,980",
    color: "from-violet-500 to-purple-600",
    border: "border-violet-300",
    accounts: 15,
    features: [
      "競合アカウント 15件まで",
      "エンゲージメント分析",
      "ハッシュタグ分析",
      "コンテンツ分析",
      "人気投稿ランキング",
      "CSVエクスポート",
    ],
    cta: "Standardを始める",
    disabled: false,
    recommended: true,
  },
  {
    name: "Pro",
    price: 9800,
    priceLabel: "¥9,800",
    color: "from-amber-400 to-orange-500",
    border: "border-amber-300",
    accounts: 999,
    features: [
      "競合アカウント 無制限",
      "エンゲージメント分析",
      "ハッシュタグ分析",
      "コンテンツ分析",
      "人気投稿ランキング",
      "CSVエクスポート",
      "優先サポート",
    ],
    cta: "Proを始める",
    disabled: false,
  },
];

export default function PricingPage() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const user = getUser();
    setEmail(user?.email ?? null);
  }, []);

  return (
    <div className="mt-6 space-y-8 animate-fade-in">
      {/* タイトル */}
      <div className="text-center space-y-2">
        <h1 className="font-black text-3xl text-sky-700">料金プラン</h1>
        <p className="text-gray-500 text-sm">すべてのプランは月額・いつでも解約可能</p>
      </div>

      {/* プランカード */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`card p-6 flex flex-col gap-4 border-2 ${plan.border} ${plan.recommended ? "ring-2 ring-violet-400 ring-offset-2" : ""} relative`}
          >
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                おすすめ
              </div>
            )}

            {/* プラン名 */}
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${plan.color} text-white font-black text-lg`}>
              {plan.name[0]}
            </div>
            <div>
              <h2 className="font-black text-xl text-gray-800">{plan.name}</h2>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="font-black text-3xl text-gray-800">{plan.priceLabel}</span>
                {plan.price > 0 && <span className="text-gray-400 text-sm">/月</span>}
              </div>
            </div>

            {/* 機能リスト */}
            <ul className="space-y-2 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-sky-500 font-bold">✓</span>
                  {f}
                </li>
              ))}
            </ul>

            {/* ボタン */}
            <button
              disabled={plan.disabled}
              onClick={() => alert("Stripe決済は近日公開予定です！")}
              className={`w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                plan.disabled
                  ? "bg-gray-100 text-gray-400 cursor-default"
                  : `bg-gradient-to-r ${plan.color} text-white shadow-md hover:opacity-90`
              }`}
            >
              {plan.disabled ? (email ? "現在のプラン" : "無料で始める") : plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="card p-6 space-y-4">
        <h2 className="font-black text-lg text-gray-700">よくある質問</h2>
        {[
          { q: "いつでも解約できますか？", a: "はい。いつでも解約でき、次の請求日以降は課金されません。" },
          { q: "無料プランに制限はありますか？", a: "競合アカウントを5件まで登録できます。分析機能はすべて使えます。" },
          { q: "支払い方法は？", a: "クレジットカード（Visa・Mastercard・JCB等）が使えます。" },
          { q: "プランの変更はできますか？", a: "いつでもアップグレード・ダウングレードが可能です。" },
        ].map(({ q, a }) => (
          <div key={q} className="border-b border-gray-100 pb-3 last:border-0">
            <p className="font-bold text-sm text-gray-700">{q}</p>
            <p className="text-sm text-gray-500 mt-1">{a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
