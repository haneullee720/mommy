import { OPTION_MAP, SERVICE_MAP } from "./catalog";
import type { PropertyType, ServiceSlug } from "./types";

/** 건물 유형별 난이도 계수 */
const PROPERTY_FACTOR: Record<PropertyType, number> = {
  apartment: 1,
  villa: 1.05,
  officetel: 0.95,
  house: 1.15,
  office: 1,
  store: 1.05,
  building: 1.2,
  etc: 1.05,
};

export interface EstimateInput {
  service: ServiceSlug;
  propertyType: PropertyType;
  areaPyeong: number;
  options: string[];
  dateFlexible?: boolean;
}

export interface EstimateResult {
  min: number;
  max: number;
  base: number;
  optionAdd: number;
  breakdown: { label: string; value: string }[];
}

const round = (n: number) => Math.round(n / 1000) * 1000;

/**
 * 고객에게 즉시 보여주는 "예상 견적 범위".
 * 실제 금액은 업체가 제출한 견적으로 확정된다.
 */
export function estimate(input: EstimateInput): EstimateResult {
  const def = SERVICE_MAP[input.service];
  const factor = PROPERTY_FACTOR[input.propertyType] ?? 1;
  const area = Math.max(1, input.areaPyeong || 1);

  let baseMin: number;
  let baseMax: number;

  if (def.unit === "month") {
    // 월 단위 도급: 규모에 따라 완만하게 증가
    const scale = 1 + Math.max(0, area - 20) / 120;
    baseMin = def.unitPriceMin * scale * factor;
    baseMax = def.unitPriceMax * scale * factor;
  } else {
    baseMin = def.unitPriceMin * area * factor;
    baseMax = def.unitPriceMax * area * factor;
  }

  baseMin = Math.max(def.minPrice, baseMin);
  baseMax = Math.max(def.minPrice * 1.3, baseMax);

  let flat = 0;
  let rate = 0;
  for (const key of input.options) {
    const opt = OPTION_MAP[key];
    if (!opt) continue;
    if (opt.addFlat) flat += opt.addFlat;
    if (opt.addRate) rate += opt.addRate;
  }

  // 일정 조율 가능 시 업체 동선 효율로 소폭 할인
  const flexDiscount = input.dateFlexible ? 0.05 : 0;

  const min = round((baseMin * (1 + rate) + flat) * (1 - flexDiscount));
  const max = round((baseMax * (1 + rate) + flat) * (1 - flexDiscount));
  const optionAdd = round(flat + ((baseMin + baseMax) / 2) * rate);

  return {
    min,
    max,
    base: round((baseMin + baseMax) / 2),
    optionAdd,
    breakdown: [
      { label: "서비스", value: def.name },
      { label: "기준 단가", value: def.unit === "month" ? `월 ${won(def.unitPriceMin)}~${won(def.unitPriceMax)}` : `평당 ${won(def.unitPriceMin)}~${won(def.unitPriceMax)}` },
      { label: "규모", value: `${area}${def.unit === "month" ? "평 규모" : "평"}` },
      { label: "추가 옵션", value: optionAdd > 0 ? `+${won(optionAdd)}` : "없음" },
      ...(flexDiscount ? [{ label: "일정 조율 할인", value: "-5%" }] : []),
    ],
  };
}

export function won(n: number): string {
  return `${Math.round(n).toLocaleString("ko-KR")}원`;
}

export function manwon(n: number): string {
  if (n >= 10000) {
    const m = n / 10000;
    return `${Number.isInteger(m) ? m : m.toFixed(1)}만원`;
  }
  return won(n);
}
