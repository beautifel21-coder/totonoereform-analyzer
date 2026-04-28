"use client";
import { useEffect, useState } from "react";

const MESSAGES = [
  "にゃん🐱",
  "ととのえてにゃ✨",
  "リフォームにゃ！🏠",
  "分析中…にゃ📊",
  "がんばるにゃ💪",
  "よろしくにゃ😊",
];

export default function Mascot() {
  const [blink, setBlink] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [wave, setWave] = useState(false);
  const [tailDir, setTailDir] = useState(1);

  // まばたき
  useEffect(() => {
    const blinkLoop = () => {
      setBlink(true);
      setTimeout(() => setBlink(false), 120);
      setTimeout(blinkLoop, 2500 + Math.random() * 2000);
    };
    const t = setTimeout(blinkLoop, 1500);
    return () => clearTimeout(t);
  }, []);

  // しっぽ
  useEffect(() => {
    const tail = setInterval(() => setTailDir(d => -d), 700);
    return () => clearInterval(tail);
  }, []);

  // 吹き出し
  useEffect(() => {
    const show = () => {
      const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      setBubble(msg);
      setWave(true);
      setTimeout(() => { setBubble(null); setWave(false); }, 2800);
      setTimeout(show, 6000 + Math.random() * 8000);
    };
    const t = setTimeout(show, 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none select-none flex flex-col items-center">

      {/* 吹き出し */}
      {bubble && (
        <div
          className="mb-2 whitespace-nowrap text-xs font-black px-3 py-1.5 rounded-2xl animate-pop"
          style={{
            background: "white",
            color: "#E8891A",
            boxShadow: "0 4px 16px rgba(232,137,26,0.25)",
            border: "2px solid #FDE68A",
          }}
        >
          {bubble}
          <div className="absolute left-1/2 -translate-x-1/2"
            style={{
              width: 0, height: 0, bottom: -8,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid #FDE68A",
              position: "absolute",
            }}
          />
        </div>
      )}

      {/* ネコ本体 */}
      <svg
        width="90" height="100"
        viewBox="0 0 90 100"
        className="animate-breathe"
        style={{ filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.15))" }}
      >
        {/* しっぽ */}
        <path
          d={`M 62 82 Q ${72 + tailDir * 10} 70 ${68 + tailDir * 8} 55`}
          stroke="#E8891A" strokeWidth="7" fill="none" strokeLinecap="round"
          style={{ transition: "d 0.6s ease-in-out" }}
        />
        {/* しっぽの先 */}
        <circle cx={68 + tailDir * 8} cy={53} r="6" fill="#F6AD55" />

        {/* 胴体 */}
        <ellipse cx="42" cy="80" rx="24" ry="20" fill="#FDDBB4" />
        {/* おなかの模様 */}
        <ellipse cx="42" cy="82" rx="13" ry="12" fill="white" opacity="0.6" />

        {/* 耳（左） */}
        <polygon points="16,28 10,8 30,20" fill="#FDDBB4" />
        <polygon points="18,26 13,12 28,20" fill="#FFB3BA" opacity="0.7" />
        {/* 耳（右） */}
        <polygon points="58,28 68,8 54,20" fill="#FDDBB4" />
        <polygon points="57,26 65,12 55,20" fill="#FFB3BA" opacity="0.7" />

        {/* 頭 */}
        <circle cx="42" cy="38" r="26" fill="#FDDBB4" />

        {/* 目（左） */}
        {blink ? (
          <ellipse cx="32" cy="38" rx="8" ry="1.5" fill="#3D2B1F" />
        ) : (
          <>
            <ellipse cx="32" cy="38" rx="8" ry="9" fill="white" />
            <circle cx="32" cy="39" r="6" fill="#3D2B1F" />
            <circle cx="32" cy="38" r="4" fill="#5C3A1E" />
            <circle cx="34" cy="36" r="2" fill="white" />
            <circle cx="31" cy="41" r="1" fill="white" />
          </>
        )}

        {/* 目（右） */}
        {blink ? (
          <ellipse cx="52" cy="38" rx="8" ry="1.5" fill="#3D2B1F" />
        ) : (
          <>
            <ellipse cx="52" cy="38" rx="8" ry="9" fill="white" />
            <circle cx="52" cy="39" r="6" fill="#3D2B1F" />
            <circle cx="52" cy="38" r="4" fill="#5C3A1E" />
            <circle cx="54" cy="36" r="2" fill="white" />
            <circle cx="51" cy="41" r="1" fill="white" />
          </>
        )}

        {/* 鼻 */}
        <path d="M39 45 Q42 47 45 45 L42 49 Z" fill="#E8891A" />

        {/* 口 */}
        <path d="M38 49 Q42 53 46 49" stroke="#C97213" strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* ひげ（左） */}
        <line x1="16" y1="44" x2="35" y2="46" stroke="#999" strokeWidth="1" opacity="0.6" />
        <line x1="16" y1="48" x2="35" y2="48" stroke="#999" strokeWidth="1" opacity="0.6" />
        <line x1="18" y1="52" x2="35" y2="50" stroke="#999" strokeWidth="1" opacity="0.6" />
        {/* ひげ（右） */}
        <line x1="68" y1="44" x2="49" y2="46" stroke="#999" strokeWidth="1" opacity="0.6" />
        <line x1="68" y1="48" x2="49" y2="48" stroke="#999" strokeWidth="1" opacity="0.6" />
        <line x1="66" y1="52" x2="49" y2="50" stroke="#999" strokeWidth="1" opacity="0.6" />

        {/* ほっぺ */}
        <ellipse cx="24" cy="46" rx="6" ry="4.5" fill="#FFB3B3" opacity="0.55" />
        <ellipse cx="60" cy="46" rx="6" ry="4.5" fill="#FFB3B3" opacity="0.55" />

        {/* 前足（左） */}
        <ellipse
          cx="24" cy="94"
          rx="10" ry="7"
          fill="#FDDBB4"
          transform={wave ? "rotate(-25 24 80)" : ""}
          style={{ transition: "transform 0.3s ease" }}
        />
        {/* 前足（右） */}
        <ellipse cx="60" cy="94" rx="10" ry="7" fill="#FDDBB4" />

        {/* 肉球（左） */}
        <circle cx="21" cy="96" r="2" fill="#FFB3BA" opacity="0.7" />
        <circle cx="26" cy="97" r="2" fill="#FFB3BA" opacity="0.7" />
        {/* 肉球（右） */}
        <circle cx="57" cy="96" r="2" fill="#FFB3BA" opacity="0.7" />
        <circle cx="62" cy="97" r="2" fill="#FFB3BA" opacity="0.7" />

        {/* 首輪 */}
        <path d="M20 58 Q42 64 64 58" stroke="#E8891A" strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* 首輪の鈴 */}
        <circle cx="42" cy="63" r="4" fill="#F6AD55" />
        <circle cx="42" cy="63" r="2.5" fill="#E8891A" />
        <line x1="41" y1="62" x2="43" y2="64" stroke="#C97213" strokeWidth="1" />
      </svg>
    </div>
  );
}
