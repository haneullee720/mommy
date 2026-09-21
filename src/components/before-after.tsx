"use client";

import { useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * 청소 전/후 비교. 손잡이를 끌어 두 이미지를 겹쳐 본다.
 * 청소 서비스에서 가장 설득력 있는 장치라 랜딩 중앙에 둔다.
 */
export function BeforeAfter({
  before,
  after,
  className,
}: {
  before: React.ReactNode;
  after: React.ReactNode;
  className?: string;
}) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);

  const moveTo = (clientX: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  };

  return (
    <div
      ref={ref}
      className={cn("relative select-none overflow-hidden", className)}
      style={{ aspectRatio: "4 / 3" }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        moveTo(e.clientX);
      }}
      onPointerMove={(e) => {
        if (e.buttons > 0) moveTo(e.clientX);
      }}
    >
      <div className="absolute inset-0">{after}</div>
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {before}
      </div>

      <span className="pointer-events-none absolute left-4 top-4 rounded bg-ink-900/85 px-2.5 py-1 text-[11.5px] font-semibold text-white">
        청소 전
      </span>
      <span className="pointer-events-none absolute right-4 top-4 rounded bg-brand-600 px-2.5 py-1 text-[11.5px] font-semibold text-white">
        청소 후
      </span>

      <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white" style={{ left: `${pos}%` }}>
        <span className="absolute top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-ink-200 bg-white shadow-lift">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="text-ink-600" aria-hidden>
            <path d="m9 6-5 6 5 6M15 6l5 6-5 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label="청소 전후 비교 위치"
        className="absolute inset-x-0 bottom-0 h-8 w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
