// 청소모아 도메인 모델
// 고객 요청 → 업체 견적 → 고객 선택 → 선결제(에스크로) → 작업 → 완료확인 → 정산(수수료 차감)

export type Role = "customer" | "partner" | "admin";

export type ServiceSlug =
  | "move-in"  // 입주청소
  | "stairs"   // 계단/복도청소
  | "office";  // 상가·사무실청소

export type PropertyType = "apartment" | "villa" | "officetel" | "house" | "office" | "store" | "building" | "etc";

export type RequestStatus =
  | "open"        // 견적 접수중
  | "selected"    // 업체 선정 (결제 대기)
  | "paid"        // 선결제 완료 (에스크로 보관)
  | "in_progress" // 작업중
  | "completed"   // 작업 완료 (고객 확인)
  | "settled"     // 업체 정산 완료
  | "canceled";   // 취소

export type QuoteStatus = "submitted" | "accepted" | "rejected" | "withdrawn";

export type OrderStatus =
  | "pending_payment"
  | "escrow"       // 선결제금 플랫폼 보관중
  | "in_progress"
  | "completed"    // 고객 작업 확인 완료 → 정산 대기
  | "settled"      // 업체 지급 완료
  | "refunded";

export type PartnerStatus = "pending" | "approved" | "suspended";
export type PartnerTier = "basic" | "good" | "premium";

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
}

export interface Partner {
  id: string;
  userId: string;
  companyName: string;
  bizNo: string;                 // 사업자등록번호
  ceoName: string;
  regions: string[];             // 서비스 가능 지역 (시/도 또는 시/군/구)
  services: ServiceSlug[];
  intro: string;
  since: number;                 // 설립연도
  crewSize: number;              // 상시 인력
  hasInsurance: boolean;         // 배상책임보험
  certifications: string[];      // 보유 인증/자격
  status: PartnerStatus;
  tier: PartnerTier;
  rating: number;                // 평균 별점 (0~5)
  reviewCount: number;
  completedJobs: number;
  responseMinutes: number;       // 평균 견적 응답 시간
  bankAccount: { bank: string; number: string; holder: string };
  createdAt: string;
}

export interface CleaningRequest {
  id: string;
  code: string;                  // 고객 노출용 요청번호 (CM-240915-0001)
  customerId: string;
  service: ServiceSlug;
  propertyType: PropertyType;
  areaPyeong: number;
  region: string;                // 시/도
  district: string;              // 시/군/구
  addressDetail: string;         // 상세주소 (결제 후 업체 공개)
  preferredDate: string;         // YYYY-MM-DD
  dateFlexible: boolean;
  options: string[];             // 추가 옵션 키
  description: string;
  photoCount: number;
  contactName: string;
  contactPhone: string;
  estimateMin: number;           // 자동 예상 견적 하한
  estimateMax: number;
  status: RequestStatus;
  createdAt: string;
  expiresAt: string;             // 견적 마감
}

export interface Quote {
  id: string;
  requestId: string;
  partnerId: string;
  amount: number;                // 부가세 포함 총액
  crewSize: number;
  workHours: number;
  availableDate: string;
  includes: string[];            // 포함 내역
  message: string;
  warrantyDays: number;          // 무상 A/S 기간
  status: QuoteStatus;
  createdAt: string;
}

export interface Order {
  id: string;
  code: string;
  requestId: string;
  quoteId: string;
  customerId: string;
  partnerId: string;
  amount: number;                // 고객 결제 금액
  feeRate: number;               // 중개 수수료율 (0.10 = 10%)
  feeAmount: number;             // 플랫폼 수수료
  payoutAmount: number;          // 업체 정산 예정 금액
  status: OrderStatus;
  paymentMethod: string;
  paidAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  settledAt: string | null;
  scheduledDate: string;
  createdAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  customerId: string;
  partnerId: string;
  rating: number;                // 1~5 종합
  scores: { kindness: number; detail: number; punctuality: number };
  content: string;
  reply: string | null;
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface Settings {
  feeRates: Record<PartnerTier, number>;
  escrowHoldDays: number;        // 작업 완료 후 정산 보류 기간
  autoConfirmDays: number;       // 고객 미확인 시 자동 구매확정
}

export interface DB {
  users: User[];
  partners: Partner[];
  requests: CleaningRequest[];
  quotes: Quote[];
  orders: Order[];
  reviews: Review[];
  sessions: Session[];
  settings: Settings;
}
