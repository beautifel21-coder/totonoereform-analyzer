"use client";
import { api } from "@/lib/api";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const PLANS = [
  {
    name: "Free",
    planKey: null,
    price: 0,
    priceLabel: "無料",
    color: "from-sky-400 to-blue-500",
    border: "border-sky-200",
    features: [
      "競合アカウント 5件まで",
      "エンゲージメント分析",
      "ハッシュタグ分析",
      "コンテンツ分析",
    ],
    cta: "現在のプラン",
  },
  {
    name: "Standard",
    planKey: "standard",
    price: 2980,
    priceLabel: "¥2,980",
    color: "from-violet-500 to-purple-600",
    border: "border-violet-300",
    features: [
      "競合アカウント 15件まで",
      "エンゲージメント分析",
      "ハッシュタグ分析",
      "コンテンツ分析",
      "人気投稿ランキング",
      "CSVエクスポート",
    ],
    cta: "Standardを始める",
    recommended: true,
  },
  {
    name: "Pro",
    planKey: "pro",
    price: 9800,
    priceLabel: "¥9,800",
    color: "from-amber-400 to-orange-500",
    border: "border-amber-300",
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
  },
];

function PricingContent() {
  const [currentPlan, setCurrentPlan] = useState<string>("free");
  const [loading, setLoading] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  useEffect(() => {
    api.billing.me().then((d) => setCurrentPlan(d.plan)).catch(() => {});
  }, []);

  async function handleCheckout(planKey: string) {
    setLoading(planKey);
    try {
      const { url } = await api.billing.checkout(planKey);
      window.location.href = url;
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "エラーが発生しました");
      setLoading(null);
    }
  }

  async function handlePortal() {
    setLoading("portal");
    try {
      const { url } = await api.billing.portal();
      window.location.href = url;
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "エラーが発生しました");
      setLoading(null);
    }
  }

  const isPaid = currentPlan !== "free";

  return (
    <div className="mt-6 space-y-8 animate-fade-in">
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center text-green-700 font-bold">
          🎉 決済が完了しました！プランが更新されます（反映まで少々お待ちください）
        </div>
      )}

      <div className="text-center space-y-2">
        <h1 className="font-black text-3xl text-orange-600">料金プラン</h1>
        <p className="text-gray-500 text-sm">すべてのプランは月額・いつでも解約可能</p>
        {isPaid && (
          <p className="text-sm text-gray-500">
            現在のプラン：<span className="font-bold text-violet-600">{currentPlan}</span>
            {" "}
            <button
              onClick={handlePortal}
              disabled={loading === "portal"}
              className="underline text-violet-500 hover:text-violet-700 ml-2"
            >
              {loading === "portal" ? "移動中..." : "サブスクリプションを管理"}
            </button>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlan === (plan.planKey ?? "free");
          const isDisabled = isCurrentPlan || loading !== null;

          return (
            <div
              key={plan.name}
              className={`card p-6 flex flex-col gap-4 border-2 ${plan.border} ${plan.recommended ? "ring-2 ring-violet-400 ring-offset-2" : ""} relative`}
            >
              {plan.recommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  おすすめ
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute -top-3 right-4 bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  現在のプラン
                </div>
              )}

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

              <ul className="space-y-2 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-orange-500 font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <button
                disabled={isDisabled}
                onClick={() => {
                  if (plan.planKey && !isCurrentPlan) handleCheckout(plan.planKey);
                }}
                className={`w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                  isDisabled
                    ? "bg-gray-100 text-gray-400 cursor-default"
                    : `bg-gradient-to-r ${plan.color} text-white shadow-md hover:opacity-90`
                }`}
              >
                {loading === plan.planKey
                  ? "処理中..."
                  : isCurrentPlan
                  ? "現在のプラン"
                  : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

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

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="mt-6 text-center text-gray-400">読み込み中...</div>}>
      <PricingContent />
    </Suspense>
  );
}
