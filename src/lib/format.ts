import type { OrderStatus, RequestStatus } from "./types";

export function won(n: number): string {
  return `${Math.round(n).toLocaleString("ko-KR")}원`;
}

export function manwon(n: number): string {
  if (n < 10000) return won(n);
  const m = n / 10000;
  return `${(Math.round(m * 10) / 10).toLocaleString("ko-KR")}만원`;
}

export function dateKo(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export function dateFull(iso: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}. ${String(d.getMonth() + 1).padStart(2, "0")}. ${String(d.getDate()).padStart(2, "0")}`;
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}시간 전`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}일 전`;
  return dateFull(iso);
}

export function untilDeadline(iso: string): string {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return "마감";
  const hr = Math.floor(diff / 3600000);
  if (hr < 24) return `${hr}시간 남음`;
  return `${Math.floor(hr / 24)}일 남음`;
}

export const REQUEST_STATUS_LABEL: Record<RequestStatus, string> = {
  open: "견적 받는 중",
  selected: "업체 선택 완료",
  paid: "결제 완료",
  in_progress: "작업 중",
  completed: "작업 완료",
  settled: "거래 종료",
  canceled: "취소됨",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: "결제 대기",
  escrow: "안전결제 보관중",
  in_progress: "작업 중",
  completed: "확인 대기",
  settled: "정산 완료",
  refunded: "환불",
};

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 9) return phone;
  return `${digits.slice(0, 3)}-****-${digits.slice(-4)}`;
}

export function maskAddress(detail: string): string {
  if (!detail) return "결제 후 공개";
  return `${detail.slice(0, 2)}${"*".repeat(Math.max(3, detail.length - 2))}`;
}
