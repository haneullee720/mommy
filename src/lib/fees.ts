import type { PartnerTier } from "./types";

export const DEFAULT_FEE_RATES: Record<PartnerTier, number> = {
  basic: 0.15,
  good: 0.12,
  premium: 0.1,
};

export const TIER_LABEL: Record<PartnerTier, string> = {
  basic: "일반",
  good: "우수",
  premium: "프리미엄",
};

export const TIER_RULE: Record<PartnerTier, string> = {
  basic: "가입 직후 기본 등급",
  good: "완료 20건 & 평점 4.5 이상",
  premium: "완료 60건 & 평점 4.7 이상 & 분쟁 0건",
};

export interface FeeBreakdown {
  amount: number;
  feeRate: number;
  feeAmount: number;
  payoutAmount: number;
}

/** 결제 금액에서 중개 수수료를 떼고 업체 정산액을 계산한다. PG 수수료는 플랫폼이 부담. */
export function calcFee(amount: number, feeRate: number): FeeBreakdown {
  const feeAmount = Math.round((amount * feeRate) / 10) * 10;
  return {
    amount,
    feeRate,
    feeAmount,
    payoutAmount: amount - feeAmount,
  };
}

/** 누적 실적으로 등급을 재계산한다. */
export function evaluateTier(completedJobs: number, rating: number): PartnerTier {
  if (completedJobs >= 60 && rating >= 4.7) return "premium";
  if (completedJobs >= 20 && rating >= 4.5) return "good";
  return "basic";
}
