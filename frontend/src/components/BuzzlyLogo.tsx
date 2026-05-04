/* eslint-disable @next/next/no-img-element */
export default function BuzzlyLogo({ size = 40 }: { size?: number }) {
  return (
    // eslint-disable-next-line
    <img
      src="/buzzly-bee.png"
      alt="Buzzly"
      width={size}
      height={size}
      style={{ objectFit: "contain", display: "block" }}
    />
  );
}
