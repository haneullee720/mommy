"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DEFAULT_PROPERTY, PROPERTY_TYPES, SERVICES, SERVICE_MAP } from "@/lib/catalog";
import { estimate } from "@/lib/estimate";
import { manwon } from "@/lib/format";
import { Icon } from "./icons";
import type { PropertyType, ServiceSlug } from "@/lib/types";

/**
 * 히어로 하단에 눕히는 예상 견적 바.
 * 히어로의 주인공은 헤드라인이므로, 위젯은 한 줄 스트립으로 눌러 둔다.
 */
export function QuickEstimate() {
  const [service, setService] = useState<ServiceSlug>("move-in");
  const [propertyType, setPropertyType] = useState<PropertyType>("apartment");
  const [area, setArea] = useState(24);

  const def = SERVICE_MAP[service];
  const result = useMemo(
    () => estimate({ service, propertyType, areaPyeong: area, options: [] }),
    [service, propertyType, area],
  );

  const href = `/request/new?service=${service}&property=${propertyType}&area=${area}`;
  const selectClass =
    "w-full appearance-none bg-transparent pr-6 text-[15px] font-semibold text-ink-900 outline-none";

  return (
    <div className="border border-ink-200 bg-white">
      <div className="flex items-center justify-between gap-4 border-b border-ink-100 px-5 py-3">
        <p className="t-eyebrow">30초 예상 견적</p>
        <p className="t-caption">실제 시공가 기준</p>
      </div>

      <div className="grid divide-y divide-ink-100 lg:grid-cols-[1.1fr_1fr_0.9fr_auto] lg:divide-x lg:divide-y-0">
        <label className="block px-5 py-4">
          <span className="t-caption block">청소 종류</span>
          <span className="relative mt-1 block">
            <select
              value={service}
              onChange={(e) => {
                const next = e.target.value as ServiceSlug;
                setService(next);
                setPropertyType(DEFAULT_PROPERTY[next]);
              }}
              className={selectClass}
            >
              {SERVICES.map((s) => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>
            <Icon name="chevronDown" className="pointer-events-none absolute right-0 top-1.5 h-3.5 w-3.5 text-ink-400" />
          </span>
        </label>

        <label className="block px-5 py-4">
          <span className="t-caption block">건물 유형</span>
          <span className="relative mt-1 block">
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as PropertyType)}
              className={selectClass}
            >
              {PROPERTY_TYPES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
            <Icon name="chevronDown" className="pointer-events-none absolute right-0 top-1.5 h-3.5 w-3.5 text-ink-400" />
          </span>
        </label>

        <label className="block px-5 py-4">
          <span className="t-caption block">면적 (평)</span>
          <input
            type="number"
            min={1}
            max={300}
            value={area}
            onChange={(e) => setArea(Math.max(1, Number(e.target.value)))}
            className="tnum mt-1 w-full bg-transparent text-[15px] font-semibold text-ink-900 outline-none"
          />
        </label>

        <div className="flex flex-col items-start gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between lg:gap-6">
          <div>
            <span className="t-caption block">
              {def.name} {def.unit === "month" ? "월 기준" : `${area}평 기준`}
            </span>
            <span className="tnum mt-0.5 block whitespace-nowrap text-[19px] font-bold tracking-[-0.03em] text-ink-900">
              {manwon(result.min)} ~ {manwon(result.max)}
            </span>
          </div>
          <Link
            href={href}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md bg-brand-600 px-5 text-[14px] font-semibold text-white transition-colors hover:bg-brand-700"
          >
            견적 요청
            <Icon name="arrowRight" className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
