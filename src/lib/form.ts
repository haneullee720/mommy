export interface ActionState {
  ok?: boolean;
  error?: string;
  message?: string;
  redirectTo?: string;
}

export const idle: ActionState = {};

export function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export function num(fd: FormData, key: string, fallback = 0): number {
  const v = Number(str(fd, key).replace(/,/g, ""));
  return Number.isFinite(v) ? v : fallback;
}

export function bool(fd: FormData, key: string): boolean {
  const v = fd.get(key);
  return v === "on" || v === "true" || v === "1";
}

export function list(fd: FormData, key: string): string[] {
  return fd.getAll(key).filter((v): v is string => typeof v === "string" && v.length > 0);
}

export const ERROR_MESSAGE: Record<string, string> = {
  UNAUTHENTICATED: "로그인이 필요합니다.",
  FORBIDDEN: "권한이 없습니다.",
  EMAIL_TAKEN: "이미 가입된 이메일입니다.",
  INVALID_CREDENTIALS: "이메일 또는 비밀번호가 올바르지 않습니다.",
  REQUEST_NOT_FOUND: "요청을 찾을 수 없습니다.",
  REQUEST_CLOSED: "이미 마감된 요청입니다.",
  QUOTE_NOT_FOUND: "견적을 찾을 수 없습니다.",
  PARTNER_NOT_FOUND: "업체 정보를 찾을 수 없습니다.",
  ORDER_NOT_FOUND: "주문을 찾을 수 없습니다.",
  ALREADY_PAID: "이미 결제된 주문입니다.",
  ALREADY_REVIEWED: "이미 리뷰를 작성했습니다.",
  INVALID_STATE: "현재 상태에서는 처리할 수 없습니다.",
  PARTNER_NOT_APPROVED: "심사 승인 후 이용할 수 있습니다.",
};

export function toMessage(err: unknown): string {
  const key = err instanceof Error ? err.message : String(err);
  return ERROR_MESSAGE[key] ?? "처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
}
