export default function BuzzlyLogo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* 体 */}
      <ellipse cx="20" cy="23" rx="10" ry="12" fill="#A8D8EA" />
      {/* 縞模様 */}
      <ellipse cx="20" cy="21" rx="10" ry="4" fill="#5BA4CF" opacity="0.5" />
      <ellipse cx="20" cy="27" rx="10" ry="4" fill="#5BA4CF" opacity="0.5" />
      {/* 頭 */}
      <circle cx="20" cy="11" r="8" fill="#A8D8EA" />
      {/* 顔 - 目 */}
      <circle cx="17" cy="11" r="2" fill="white" />
      <circle cx="23" cy="11" r="2" fill="white" />
      <circle cx="17.5" cy="11.5" r="1" fill="#1A2D4A" />
      <circle cx="23.5" cy="11.5" r="1" fill="#1A2D4A" />
      {/* ほっぺ */}
      <circle cx="14" cy="13" r="2" fill="#FFB3C6" opacity="0.6" />
      <circle cx="26" cy="13" r="2" fill="#FFB3C6" opacity="0.6" />
      {/* 笑顔 */}
      <path d="M17 15 Q20 17.5 23 15" stroke="#1A2D4A" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      {/* 羽 */}
      <ellipse cx="10" cy="16" rx="6" ry="4" fill="#E8F4FD" stroke="#5BA4CF" strokeWidth="0.8" opacity="0.85" transform="rotate(-25 10 16)" />
      <ellipse cx="30" cy="16" rx="6" ry="4" fill="#E8F4FD" stroke="#5BA4CF" strokeWidth="0.8" opacity="0.85" transform="rotate(25 30 16)" />
      {/* 触覚 */}
      <line x1="17" y1="4" x2="15" y2="1" stroke="#5BA4CF" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="15" cy="1" r="1.2" fill="#5BA4CF" />
      <line x1="23" y1="4" x2="25" y2="1" stroke="#5BA4CF" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="25" cy="1" r="1.2" fill="#5BA4CF" />
    </svg>
  );
}
