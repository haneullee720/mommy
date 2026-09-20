import type { SVGProps } from "react";

/**
 * 라인 아이콘 세트.
 * 24px 그리드, stroke 1.5, currentColor — 이모지를 대체한다.
 * 이모지는 플랫폼마다 모양이 달라 브랜드가 생기지 않고, 선 굵기가 본문과 따로 논다.
 */

export type IconName =
  // 서비스
  | "home"
  | "box"
  | "stairs"
  | "building"
  | "store"
  | "wall"
  | "repeat"
  | "flask"
  // 단계
  | "document"
  | "inbox"
  | "scale"
  | "shield"
  // 보장
  | "lock"
  | "certificate"
  | "rotate"
  | "gavel"
  // 결제
  | "card"
  | "bank"
  | "receipt"
  | "bolt"
  // 범용
  | "arrowRight"
  | "check"
  | "plus"
  | "minus"
  | "chevronDown"
  | "chart"
  | "bell"
  | "send"
  | "gear"
  | "star"
  | "wallet"
  | "broom"
  | "bellOff"
  | "clock"
  | "pin"
  | "user";

const PATHS: Record<IconName, React.ReactNode> = {
  home: (
    <>
      <path d="M3.5 10.2 12 3.5l8.5 6.7" />
      <path d="M5.8 9v11.5h12.4V9" />
      <path d="M9.8 20.5V14h4.4v6.5" />
    </>
  ),
  box: (
    <>
      <path d="M3.5 7.6 12 3.4l8.5 4.2v8.8L12 20.6l-8.5-4.2z" />
      <path d="M3.5 7.6 12 11.9l8.5-4.3" />
      <path d="M12 11.9v8.7" />
    </>
  ),
  stairs: <path d="M3.5 20.5v-4h4.25v-4h4.25v-4h4.25v-4h4.25v16z" />,
  building: (
    <>
      <path d="M5 20.5V4.6a1 1 0 0 1 1-1h8.5a1 1 0 0 1 1 1v15.9" />
      <path d="M15.5 9.5H19a1 1 0 0 1 1 1v10" />
      <path d="M3.6 20.5h16.8" />
      <path d="M8.3 7.6h4.2M8.3 11.4h4.2M8.3 15.2h4.2" />
    </>
  ),
  store: (
    <>
      <path d="M4 9.4h16v10.1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="M3.2 9.4 5 3.5h14l1.8 5.9" />
      <path d="M9.4 20.5v-5.3h5.2v5.3" />
    </>
  ),
  wall: (
    <>
      <path d="M3.5 4.5h17v15h-17z" />
      <path d="M3.5 9.5h17M3.5 14.5h17" />
      <path d="M9 4.5v5M15 9.5v5M9 14.5v5" />
    </>
  ),
  repeat: (
    <>
      <path d="M4 10.2a8 8 0 0 1 13.4-4.4l2.3 2.2" />
      <path d="M20 13.8a8 8 0 0 1-13.4 4.4l-2.3-2.2" />
      <path d="M19.9 3.6V8h-4.4M4.1 20.4V16h4.4" />
    </>
  ),
  flask: (
    <>
      <path d="M9.4 3.5v5.7L4.7 17.8a1.6 1.6 0 0 0 1.4 2.4h11.8a1.6 1.6 0 0 0 1.4-2.4l-4.7-8.6V3.5" />
      <path d="M8.3 3.5h7.4" />
      <path d="M6.9 14.6h10.2" />
    </>
  ),
  document: (
    <>
      <path d="M14 3.5H6.5a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V8z" />
      <path d="M13.8 3.5V8h4.7" />
      <path d="M8.8 12.6h6.4M8.8 16.2h4.2" />
    </>
  ),
  inbox: (
    <>
      <path d="M3.6 13.4h4.2l1.4 2.6h5.6l1.4-2.6h4.2" />
      <path d="M5.6 4.6h12.8l2 8.8v5a1 1 0 0 1-1 1H4.6a1 1 0 0 1-1-1v-5z" />
      <path d="M12 5.4v5.2M9.7 8.5l2.3 2.3 2.3-2.3" />
    </>
  ),
  scale: (
    <>
      <path d="M12 4.2v16.3M7 20.5h10" />
      <path d="M4.4 7h15.2M8.4 7.6 12 4.2l3.6 3.4" />
      <path d="M4.4 7 1.9 13.2a3 3 0 0 0 5 0z" />
      <path d="M19.6 7l-2.5 6.2a3 3 0 0 0 5 0z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.4 4.8 6v6.2c0 4 3 7.3 7.2 8.4 4.2-1.1 7.2-4.4 7.2-8.4V6z" />
      <path d="M9 12.1l2.2 2.2 4-4.2" />
    </>
  ),
  lock: (
    <>
      <path d="M5.6 10.6h12.8v9.9H5.6z" />
      <path d="M8.4 10.6V7.9a3.6 3.6 0 0 1 7.2 0v2.7" />
      <path d="M12 14.4v2.4" />
    </>
  ),
  certificate: (
    <>
      <path d="M17.5 13.8V4.5a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1v15a1 1 0 0 0 1 1h5" />
      <path d="M9.4 7.6h5.2M9.4 11h5.2" />
      <path d="M17 20.6l-2.3 1.2.4-2.6-1.9-1.8 2.6-.4 1.2-2.4 1.2 2.4 2.6.4-1.9 1.8.4 2.6z" />
    </>
  ),
  rotate: (
    <>
      <path d="M3.8 12a8.2 8.2 0 1 0 2.5-5.9" />
      <path d="M3.6 4.4v4.4h4.4" />
    </>
  ),
  gavel: (
    <>
      <path d="M4 20.5h9.4" />
      <path d="m7.3 10.8 5.9-5.9 3.9 3.9-5.9 5.9z" />
      <path d="m11.8 3.5 5.7 5.7M14.4 13.1l3.9 3.9" />
    </>
  ),
  card: (
    <>
      <path d="M3.5 6.5h17v11h-17z" />
      <path d="M3.5 10.2h17" />
      <path d="M6.8 14.2h3.4" />
    </>
  ),
  bank: (
    <>
      <path d="M3.4 9.4 12 4.2l8.6 5.2" />
      <path d="M5.8 9.4v8.2M10.6 9.4v8.2M13.4 9.4v8.2M18.2 9.4v8.2" />
      <path d="M3.6 20.4h16.8M3.6 17.6h16.8" />
    </>
  ),
  receipt: (
    <>
      <path d="M5.6 3.5h12.8v17.8l-2.6-1.6-2.6 1.6-2.6-1.6-2.6 1.6-2.4-1.6z" />
      <path d="M8.8 8.2h6.4M8.8 12h6.4" />
    </>
  ),
  bolt: <path d="M13.4 3.4 5.6 13.6h5.4l-.9 7 7.8-10.2h-5.4z" />,
  arrowRight: (
    <>
      <path d="M4.5 12h14.4" />
      <path d="m13.4 6.5 5.5 5.5-5.5 5.5" />
    </>
  ),
  check: <path d="m5 12.6 4.4 4.4L19 7.4" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  chevronDown: <path d="m6 9.5 6 6 6-6" />,
  chart: (
    <>
      <path d="M3.6 20.4h16.8" />
      <path d="M6.4 20.4v-6.8M11 20.4V6.2M15.6 20.4v-4.4M20.2 20.4V9.8" />
    </>
  ),
  bell: (
    <>
      <path d="M18.3 9.2a6.3 6.3 0 1 0-12.6 0c0 5.1-2.1 6.6-2.1 6.6h16.8s-2.1-1.5-2.1-6.6z" />
      <path d="M10.2 19.3a2.1 2.1 0 0 0 3.6 0" />
    </>
  ),
  bellOff: (
    <>
      <path d="M18.3 9.2a6.3 6.3 0 0 0-8.9-5.7" />
      <path d="M5.7 9.2c0 5.1-2.1 6.6-2.1 6.6h13.2" />
      <path d="M10.2 19.3a2.1 2.1 0 0 0 3.6 0" />
      <path d="M3.5 3.5 20.5 20.5" />
    </>
  ),
  send: (
    <>
      <path d="M20.8 3.2 10.9 13.1" />
      <path d="M20.8 3.2 14.5 20.8l-3.6-7.7-7.7-3.6z" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M19.6 14.6a1.6 1.6 0 0 0 .3 1.7l.1.1a1.9 1.9 0 1 1-2.7 2.7l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a1.9 1.9 0 0 1-3.8 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a1.9 1.9 0 1 1-2.7-2.7l.1-.1a1.6 1.6 0 0 0-1.1-2.7h-.2a1.9 1.9 0 0 1 0-3.8h.2a1.6 1.6 0 0 0 1.1-2.8l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1a1.6 1.6 0 0 0 1.7.3h.1a1.6 1.6 0 0 0 1-1.5v-.2a1.9 1.9 0 0 1 3.8 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.2a1.9 1.9 0 0 1 0 3.8h-.2a1.6 1.6 0 0 0-1.4 1z" />
    </>
  ),
  star: <path d="m12 3.8 2.6 5.3 5.8.9-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.9z" />,
  wallet: (
    <>
      <path d="M3.6 7.4a2 2 0 0 1 2-2h11.2v2" />
      <path d="M3.6 7.4v11.2a2 2 0 0 0 2 2h12.8a2 2 0 0 0 2-2V9.4a2 2 0 0 0-2-2H3.6z" />
      <circle cx="16.4" cy="14" r="1.1" />
    </>
  ),
  broom: (
    <>
      <path d="M14.6 3.4 9.1 8.9" />
      <path d="m7 10.9 6.1 6.1" />
      <path d="M12.4 6.8 17.2 11.6 20.4 20.6 5.2 14.2z" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.2V12l3.2 2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21.2s6.6-5.6 6.6-10.4a6.6 6.6 0 1 0-13.2 0C5.4 15.6 12 21.2 12 21.2z" />
      <circle cx="12" cy="10.6" r="2.4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.2" r="3.9" />
      <path d="M4.8 20.5a7.2 7.2 0 0 1 14.4 0" />
    </>
  ),
};

export function Icon({
  name,
  className = "h-5 w-5",
  ...rest
}: { name: IconName; className?: string } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...rest}
    >
      {PATHS[name]}
    </svg>
  );
}
