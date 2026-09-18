"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DEFAULT_PROPERTY, OPTIONS, PROPERTY_TYPES, SERVICE_MAP } from "@/lib/catalog";
import { estimate } from "@/lib/estimate";
import { manwon } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { PropertyType, ServiceSlug } from "@/lib/types";

const QUICK_SERVICES: ServiceSlug[] = ["move-in", "move-out", "stairs", "office", "commercial", "construction"];

export function QuickEstimate() {
  const [service, setService] = useState<ServiceSlug>("move-in");
  const [propertyType, setPropertyType] = useState<PropertyType>("apartment");
  const [area, setArea] = useState(24);
  const [options, setOptions] = useState<string[]>([]);

  const def = SERVICE_MAP[service];
  const result = useMemo(
    () => estimate({ service, propertyType, areaPyeong: area, options }),
    [service, propertyType, area, options],
  );

  const href = `/request/new?service=${service}&property=${propertyType}&area=${area}${
    options.length ? `&options=${options.join(",")}` : ""
  }`;

  const toggle = (key: string) =>
    setOptions((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  return (
    <div className="card shadow-lift overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-ink-100 bg-ink-50/70 px-5 py-3.5">
        <p className="text-sm font-extrabold text-ink-900">30초 예상 견적</p>
        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-brand-700 ring-1 ring-brand-200">
          실제 시공가 기준
        </span>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <p className="mb-2 text-[13px] font-bold text-ink-700">어떤 청소가 필요하세요?</p>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_SERVICES.map((slug) => {
              const s = SERVICE_MAP[slug];
              const active = service === slug;
              return (
                <button
                  key={slug}
                  type="button"
                  onClick={() => {
                    setService(slug);
                    setPropertyType(DEFAULT_PROPERTY[slug]);
                  }}
                  className={cn(
                    "rounded-xl border px-2 py-3 text-center transition",
                    active
                      ? "border-brand-500 bg-brand-50 ring-2 ring-brand-100"
                      : "border-ink-200 bg-white hover:border-ink-300",
                  )}
                >
                  <span className="block text-lg leading-none">{s.emoji}</span>
                  <span className={cn("mt-1.5 block text-[12.5px] font-bold", active ? "text-brand-700" : "text-ink-700")}>
                    {s.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-bold text-ink-700">건물 유형</span>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
              className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm font-semibold text-ink-900 outline-none focus:border-brand-500"
            >
              {PROPERTY_TYPES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
          <div>
            <span className="mb-1.5 flex items-baseline justify-between text-[13px] font-bold text-ink-700">
              면적
              <span className="tnum text-brand-700">{area}평</span>
            </span>
            <input
              type="range"
              min={5}
              max={120}
              step={1}
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className="mt-3 w-full"
              aria-label="면적(평)"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-[13px] font-bold text-ink-700">추가 옵션</p>
          <div className="flex flex-wrap gap-1.5">
            {OPTIONS.slice(0, 5).map((o) => {
              const active = options.includes(o.key);
              return (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => toggle(o.key)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition",
                    active ? "border-brand-500 bg-brand-600 text-white" : "border-ink-200 bg-white text-ink-600 hover:border-ink-300",
                  )}
                >
                  {active ? "✓ " : "+ "}
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-ink-900 px-5 py-4 text-white">
          <p className="text-[12.5px] font-semibold text-ink-300">
            {def.name} · {def.unit === "month" ? "월 기준" : `${area}평 기준`} 예상 범위
          </p>
          <p className="tnum mt-1 text-[26px] font-extrabold leading-tight">
            {manwon(result.min)} ~ {manwon(result.max)}
          </p>
          <p className="mt-1 text-[12.5px] text-ink-400">
            업체가 직접 보내는 실제 견적은 보통 이 범위 안에서 결정됩니다.
          </p>
        </div>

        <Link
          href={href}
          className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-4 text-[15.5px] font-extrabold text-white shadow-soft transition hover:bg-brand-700"
        >
          견적 무료로 받아보기
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 12h13m0 0-5.5-5.5M18 12l-5.5 5.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <p className="text-center text-[12px] text-ink-400">가입 없이 시작 · 견적 비교까지 무료 · 결제 전까지 비용 0원</p>
      </div>
    </div>
  );
}
