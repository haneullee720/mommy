#!/usr/bin/env node
/**
 * 청소모아 데모 데이터 시드
 *   npm run seed
 * 기존 data/db.json 을 덮어씁니다.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = process.env.CM_DATA_DIR || path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const PASSWORD = "cheongso1234";

const FEE_RATES = { basic: 0.15, good: 0.12, premium: 0.1 };

function hash(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  return `${salt}:${crypto.scryptSync(password, salt, 32).toString("hex")}`;
}

let seq = 0;
const uid = (p) => `${p}_seed${String(++seq).padStart(4, "0")}`;

const now = Date.now();
const iso = (daysAgo, hoursAgo = 0) => new Date(now - daysAgo * 864e5 - hoursAgo * 36e5).toISOString();
const day = (offset) => new Date(now + offset * 864e5).toISOString().slice(0, 10);
const code = (prefix, n, daysAgo = 0) => {
  const d = new Date(now - daysAgo * 864e5);
  return `${prefix}-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(n).padStart(4, "0")}`;
};

/* ---------------------------------------------------------------- 사용자 */

const users = [];
const addUser = (role, name, email, phone, createdAt) => {
  const u = { id: uid("usr"), role, name, email, phone, passwordHash: hash(PASSWORD), createdAt };
  users.push(u);
  return u;
};

const admin = addUser("admin", "운영팀", "admin@demo.kr", "02-1600-0000", iso(400));
const customer = addUser("customer", "김도윤", "customer@demo.kr", "010-2345-6789", iso(120));
const c2 = addUser("customer", "이서연", "seoyeon@demo.kr", "010-3456-7890", iso(90));
const c3 = addUser("customer", "박민준", "minjun@demo.kr", "010-4567-8901", iso(70));
const c4 = addUser("customer", "최지우", "jiwoo@demo.kr", "010-5678-9012", iso(45));
const c5 = addUser("customer", "정하윤", "hayun@demo.kr", "010-6789-0123", iso(20));

/* ---------------------------------------------------------------- 업체 */

const partners = [];
const PARTNER_SEED = [
  {
    email: "partner@demo.kr", ceo: "장수현", company: "클린메이트 서울",
    biz: "214-81-33021", regions: ["서울", "경기"], services: ["move-in", "move-out", "office", "construction"],
    intro: "입주·준공청소 전문 9년차. 새시 분리 세척과 후드 내부까지 기본 포함하며, 작업 전후 사진 리포트를 모든 고객에게 보내드립니다.",
    since: 2016, crew: 12, insurance: true, certs: ["소독업 신고 완료", "배상책임보험 1억", "친환경 인증 약품 사용"],
    tier: "premium", rating: 4.9, reviewCount: 148, completed: 412, response: 12, phone: "010-7788-1122",
    bank: { bank: "국민", number: "123456-04-567890", holder: "클린메이트" },
  },
  {
    email: "sparkle@demo.kr", ceo: "윤태경", company: "스파클 하우스",
    biz: "312-86-44190", regions: ["서울"], services: ["move-in", "home-regular", "special"],
    intro: "여성 팀장 전담제로 운영합니다. 아이·반려동물이 있는 집 전문이며, 친환경 약품만 사용합니다.",
    since: 2019, crew: 7, insurance: true, certs: ["배상책임보험 5천만원", "아토피 안심 약품"],
    tier: "good", rating: 4.7, reviewCount: 62, completed: 187, response: 23, phone: "010-8899-2233",
    bank: { bank: "신한", number: "110-421-889900", holder: "스파클하우스" },
  },
  {
    email: "stairs@demo.kr", ceo: "한동석", company: "우리동네 계단관리",
    biz: "105-92-77813", regions: ["서울", "인천"], services: ["stairs", "office", "commercial"],
    intro: "빌라·오피스텔 계단 정기 관리 전문. 월 단위 도급 계약으로 관리비를 평균 20% 낮춰드립니다.",
    since: 2014, crew: 18, insurance: true, certs: ["건물위생관리업 등록", "배상책임보험 1억"],
    tier: "premium", rating: 4.8, reviewCount: 96, completed: 318, response: 31, phone: "010-9900-3344",
    bank: { bank: "농협", number: "301-0099-1234-11", holder: "우리동네계단관리" },
  },
  {
    email: "office@demo.kr", ceo: "서정민", company: "데일리오피스 클린",
    biz: "220-88-10245", regions: ["서울", "경기"], services: ["office", "commercial", "stairs"],
    intro: "사무실 야간·새벽 청소 전문. 업무에 지장 없는 시간대에 상주·정기 인력을 배치합니다.",
    since: 2018, crew: 24, insurance: true, certs: ["배상책임보험 1억", "위생교육 이수"],
    tier: "good", rating: 4.6, reviewCount: 54, completed: 142, response: 18, phone: "010-1122-4455",
    bank: { bank: "하나", number: "255-910022-33307", holder: "데일리오피스" },
  },
  {
    email: "newclean@demo.kr", ceo: "오현우", company: "새집처럼 청소",
    biz: "418-30-55672", regions: ["경기", "인천"], services: ["move-in", "move-out", "construction"],
    intro: "경기·인천 입주청소 전담. 준공 후 미세먼지 3회 제거 공정을 표준으로 운영합니다.",
    since: 2021, crew: 6, insurance: true, certs: ["배상책임보험 5천만원"],
    tier: "good", rating: 4.5, reviewCount: 31, completed: 88, response: 27, phone: "010-2233-5566",
    bank: { bank: "카카오뱅크", number: "3333-01-2345678", holder: "새집처럼" },
  },
  {
    email: "busan@demo.kr", ceo: "강민석", company: "해운대 클린스토리",
    biz: "617-22-90013", regions: ["부산"], services: ["move-in", "office", "commercial", "home-regular"],
    intro: "부산 전 지역 당일 방문 가능. 상가·매장 기름때 제거에 강점이 있습니다.",
    since: 2017, crew: 9, insurance: true, certs: ["배상책임보험 5천만원"],
    tier: "good", rating: 4.6, reviewCount: 44, completed: 121, response: 35, phone: "010-3344-6677",
    bank: { bank: "부산", number: "101-2233-4455-01", holder: "클린스토리" },
  },
  {
    email: "special@demo.kr", ceo: "문가온", company: "리셋 특수청소",
    biz: "511-19-30028", regions: ["서울", "경기", "인천"], services: ["special", "move-out"],
    intro: "곰팡이 제거, 흡연 냄새 탈취, 유품 정리 전문. 작업 전 현장 실사 후 확정 견적을 드립니다.",
    since: 2015, crew: 5, insurance: true, certs: ["폐기물처리업 등록", "소독업 신고", "배상책임보험 1억"],
    tier: "basic", rating: 4.4, reviewCount: 17, completed: 58, response: 44, phone: "010-4455-7788",
    bank: { bank: "우리", number: "1002-455-667788", holder: "리셋특수청소" },
  },
  {
    email: "fresh@demo.kr", ceo: "배유진", company: "프레시홈 클리닝",
    biz: "703-45-11209", regions: ["경기"], services: ["home-regular", "move-in", "office"],
    intro: "수원·용인·화성 정기청소 전문. 같은 담당자가 지속 방문하도록 배정합니다.",
    since: 2022, crew: 4, insurance: false, certs: [],
    tier: "basic", rating: 4.2, reviewCount: 9, completed: 24, response: 52, phone: "010-5566-8899",
    bank: { bank: "기업", number: "088-112233-01-011", holder: "프레시홈" },
  },
  {
    email: "pending@demo.kr", ceo: "노재현", company: "반짝반짝 청소단",
    biz: "128-77-66054", regions: ["서울"], services: ["move-in", "stairs"],
    intro: "신규 입점 신청 업체입니다. 입주청소 5년 경력의 팀장 2명이 직접 시공합니다.",
    since: 2023, crew: 3, insurance: true, certs: ["배상책임보험 5천만원"],
    tier: "basic", rating: 0, reviewCount: 0, completed: 0, response: 60, phone: "010-6677-9900",
    status: "pending",
  },
];

for (const [i, p] of PARTNER_SEED.entries()) {
  // 심사 대기 업체는 막 신청한 것으로 둔다
  const joinedDaysAgo = p.status === "pending" ? 1 : 300 - i * 20;
  const u = addUser("partner", p.ceo, p.email, p.phone, iso(joinedDaysAgo));
  partners.push({
    id: uid("ptn"),
    userId: u.id,
    companyName: p.company,
    bizNo: p.biz,
    ceoName: p.ceo,
    regions: p.regions,
    services: p.services,
    intro: p.intro,
    since: p.since,
    crewSize: p.crew,
    hasInsurance: p.insurance,
    certifications: p.certs,
    status: p.status ?? "approved",
    tier: p.tier,
    rating: p.rating,
    reviewCount: p.reviewCount,
    completedJobs: p.completed,
    responseMinutes: p.response,
    bankAccount: p.bank ?? { bank: "국민", number: "000000-00-000000", holder: p.company },
    createdAt: iso(joinedDaysAgo),
  });
}

const byEmail = (email) => {
  const u = users.find((x) => x.email === email);
  return partners.find((p) => p.userId === u.id);
};

const pClean = byEmail("partner@demo.kr");
const pSparkle = byEmail("sparkle@demo.kr");
const pStairs = byEmail("stairs@demo.kr");
const pOffice = byEmail("office@demo.kr");
const pNew = byEmail("newclean@demo.kr");
const pBusan = byEmail("busan@demo.kr");
const pSpecial = byEmail("special@demo.kr");

/* ---------------------------------------------------------------- 요청·견적·주문 */

const requests = [];
const quotes = [];
const orders = [];
const reviews = [];

let reqSeq = 0;
let ordSeq = 0;

function addRequest(data) {
  const daysAgo = data.daysAgo ?? 0;
  const req = {
    id: uid("req"),
    code: code("CM", ++reqSeq, daysAgo),
    customerId: data.customerId,
    service: data.service,
    propertyType: data.propertyType,
    areaPyeong: data.areaPyeong,
    region: data.region,
    district: data.district,
    addressDetail: data.addressDetail,
    preferredDate: data.preferredDate,
    dateFlexible: data.dateFlexible ?? true,
    options: data.options ?? [],
    description: data.description ?? "",
    photoCount: 0,
    contactName: data.contactName,
    contactPhone: data.contactPhone,
    estimateMin: data.estimateMin,
    estimateMax: data.estimateMax,
    status: data.status,
    createdAt: iso(daysAgo, data.hoursAgo ?? 0),
    expiresAt: new Date(now - daysAgo * 864e5 + 3 * 864e5).toISOString(),
  };
  requests.push(req);
  return req;
}

function addQuote(req, partner, data) {
  const q = {
    id: uid("qot"),
    requestId: req.id,
    partnerId: partner.id,
    amount: data.amount,
    crewSize: data.crewSize,
    workHours: data.workHours,
    availableDate: data.availableDate ?? req.preferredDate,
    includes: data.includes,
    message: data.message,
    warrantyDays: data.warrantyDays ?? 7,
    status: data.status ?? "submitted",
    createdAt: iso(data.daysAgo ?? 0, data.hoursAgo ?? 1),
  };
  quotes.push(q);
  return q;
}

function addOrder(req, quote, data) {
  const partner = partners.find((p) => p.id === quote.partnerId);
  const feeRate = FEE_RATES[partner.tier];
  const feeAmount = Math.round((quote.amount * feeRate) / 10) * 10;
  const o = {
    id: uid("ord"),
    code: code("ORD", ++ordSeq, data.daysAgo ?? 0),
    requestId: req.id,
    quoteId: quote.id,
    customerId: req.customerId,
    partnerId: partner.id,
    amount: quote.amount,
    feeRate,
    feeAmount,
    payoutAmount: quote.amount - feeAmount,
    status: data.status,
    paymentMethod: data.method ?? "card",
    paidAt: data.paidAt ?? null,
    startedAt: data.startedAt ?? null,
    completedAt: data.completedAt ?? null,
    settledAt: data.settledAt ?? null,
    scheduledDate: quote.availableDate,
    createdAt: iso(data.daysAgo ?? 0, 2),
  };
  orders.push(o);
  return o;
}

/* --- 1. 데모 고객의 열린 요청 (견적 4개 도착) --- */
const r1 = addRequest({
  customerId: customer.id, service: "move-in", propertyType: "apartment", areaPyeong: 32,
  region: "서울", district: "송파구", addressDetail: "올림픽로 240, 105동 1802호",
  preferredDate: day(6), dateFlexible: true, options: ["duct", "sterilize"],
  description: "이사 이틀 전 빈집 상태입니다. 베란다 곰팡이가 조금 있고, 에어컨은 거실 스탠드 1대입니다. 주차는 지하 가능합니다.",
  contactName: "김도윤", contactPhone: "010-2345-6789",
  estimateMin: 448000, estimateMax: 628000, status: "open", daysAgo: 0, hoursAgo: 5,
});
addQuote(r1, pClean, {
  amount: 470000, crewSize: 4, workHours: 6, includes: ["새시·방충망 분리 세척", "주방 후드·싱크대 내부", "작업 전후 사진 리포트", "친환경 약품 사용"],
  message: "안녕하세요, 클린메이트 서울입니다. 송파구 올림픽로 일대 시공만 60건 넘게 했습니다.\n요청하신 거실 스탠드 에어컨 분해 세척과 베란다 곰팡이 제거를 견적에 포함했습니다. 4인 팀으로 6시간 내 마감하고, 작업 전후 사진을 모두 보내드립니다.",
  warrantyDays: 30, daysAgo: 0, hoursAgo: 4,
});
addQuote(r1, pSparkle, {
  amount: 512000, crewSize: 3, workHours: 7, includes: ["욕실 물때·곰팡이 제거", "빌트인 가전 외부", "친환경 약품 사용", "아이 안심 마감 소독"],
  message: "스파클 하우스입니다. 여성 팀장이 전 과정을 직접 관리합니다.\n아이가 있는 집이라면 저희 친환경 약품 시공을 추천드립니다. 마감 후 살균·탈취까지 포함된 금액입니다.",
  warrantyDays: 14, daysAgo: 0, hoursAgo: 3,
});
addQuote(r1, pNew, {
  amount: 438000, crewSize: 3, workHours: 6, includes: ["전체 바닥·벽면 손닦음", "새시·방충망 분리 세척", "폐기물 정리"],
  message: "새집처럼 청소입니다. 요청하신 일정에 바로 투입 가능합니다.\n32평 기준 3인 6시간으로 진행하며, 일정을 하루만 조율해 주시면 5% 더 낮춰드릴 수 있습니다.",
  warrantyDays: 7, daysAgo: 0, hoursAgo: 2,
});
addQuote(r1, pSpecial, {
  amount: 495000, crewSize: 2, workHours: 8, includes: ["곰팡이 집중 제거", "살균·탈취 시공", "작업 전후 사진 리포트"],
  message: "리셋 특수청소입니다. 베란다 곰팡이는 표면 제거만으로는 재발합니다.\n저희는 실리콘 교체까지 포함해 재발을 막는 방식으로 시공하며, 30일 재발 보증을 드립니다.",
  warrantyDays: 30, daysAgo: 0, hoursAgo: 1,
});

/* --- 2. 데모 고객의 진행 중 작업 (결제 완료 → 작업 중) --- */
const r2 = addRequest({
  customerId: customer.id, service: "office", propertyType: "office", areaPyeong: 60,
  region: "서울", district: "강남구", addressDetail: "테헤란로 152, 8층 전체",
  preferredDate: day(1), dateFlexible: false, options: ["sterilize"],
  description: "주 2회(화·금) 정기 청소 견적입니다. 야간 7시 이후 진행 희망합니다.",
  contactName: "김도윤", contactPhone: "010-2345-6789",
  estimateMin: 240000, estimateMax: 540000, status: "in_progress", daysAgo: 6,
});
const q2 = addQuote(r2, pOffice, {
  amount: 380000, crewSize: 3, workHours: 3, availableDate: day(1),
  includes: ["바닥 진공·물걸레", "책상·집기 표면 소독", "탕비실·화장실", "쓰레기 분리 배출"],
  message: "데일리오피스 클린입니다. 강남 테헤란로 오피스 20여 곳을 야간 담당하고 있습니다.\n화·금 19시 이후 3인 투입으로 3시간 내 마감하며, 살균 소독은 무상 포함입니다.",
  warrantyDays: 14, daysAgo: 6, hoursAgo: 3,
});
q2.status = "accepted";
addOrder(r2, q2, {
  status: "in_progress", daysAgo: 5, paidAt: iso(5), startedAt: iso(0, 3), method: "card",
});

/* --- 3. 데모 고객의 완료 대기 건 (업체가 완료 보고 → 고객 확인 필요) --- */
const r3 = addRequest({
  customerId: customer.id, service: "move-out", propertyType: "villa", areaPyeong: 18,
  region: "서울", district: "마포구", addressDetail: "월드컵로 88, 302호",
  preferredDate: day(-2), dateFlexible: true, options: ["waste"],
  description: "퇴거 청소입니다. 소형 가구 2점 폐기 부탁드립니다.",
  contactName: "김도윤", contactPhone: "010-2345-6789",
  estimateMin: 200000, estimateMax: 300000, status: "completed", daysAgo: 12,
});
const q3 = addQuote(r3, pSparkle, {
  amount: 245000, crewSize: 2, workHours: 4, availableDate: day(-2),
  includes: ["전체 바닥·벽면 청소", "주방·욕실 집중 세척", "잔여 쓰레기 정리", "폐기물 정리"],
  message: "스파클 하우스입니다. 18평 빌라 퇴거 청소는 2인 4시간이면 충분합니다.\n소형 가구 2점 폐기 비용도 포함된 금액이니 추가 비용 없습니다.",
  warrantyDays: 7, daysAgo: 12, hoursAgo: 4,
});
q3.status = "accepted";
addOrder(r3, q3, {
  status: "completed", daysAgo: 11, paidAt: iso(11), startedAt: iso(2, 6), completedAt: iso(2, 1), method: "easy",
});

/* --- 4. 데모 고객의 완료·정산·후기 작성 건 --- */
const r4 = addRequest({
  customerId: customer.id, service: "move-in", propertyType: "officetel", areaPyeong: 14,
  region: "서울", district: "송파구", addressDetail: "가락로 100, 1204호",
  preferredDate: day(-40), dateFlexible: true, options: [],
  description: "오피스텔 입주 전 청소입니다.",
  contactName: "김도윤", contactPhone: "010-2345-6789",
  estimateMin: 186000, estimateMax: 240000, status: "settled", daysAgo: 48,
});
const q4 = addQuote(r4, pClean, {
  amount: 210000, crewSize: 2, workHours: 4, availableDate: day(-40),
  includes: ["전체 바닥·벽면 손닦음", "욕실 물때·곰팡이 제거", "새시·방충망 분리 세척"],
  message: "클린메이트 서울입니다. 오피스텔 14평은 2인 4시간으로 충분히 마감됩니다.\n빌트인 가전 외부까지 포함해 진행하겠습니다.",
  warrantyDays: 30, daysAgo: 48, hoursAgo: 5,
});
q4.status = "accepted";
const o4 = addOrder(r4, q4, {
  status: "settled", daysAgo: 47, paidAt: iso(47), startedAt: iso(40, 8), completedAt: iso(40, 2), settledAt: iso(38), method: "card",
});
reviews.push({
  id: uid("rev"), orderId: o4.id, customerId: customer.id, partnerId: pClean.id,
  rating: 5, scores: { kindness: 5, detail: 5, punctuality: 5 },
  content: "약속 시간보다 10분 일찍 도착하셨고, 새시 분리해서 창틀까지 다 닦아주셨어요. 사진 리포트도 바로 보내주셔서 확인이 편했습니다. 다음 이사 때도 여기로 할게요.",
  reply: "소중한 후기 감사합니다. 다음에도 꼼꼼하게 시공하겠습니다!",
  createdAt: iso(37),
});

/* --- 5~10. 다른 고객들의 요청 (피드·통계용) --- */
const r5 = addRequest({
  customerId: c2.id, service: "stairs", propertyType: "villa", areaPyeong: 40,
  region: "서울", district: "은평구", addressDetail: "연서로 21길 8",
  preferredDate: day(4), dateFlexible: true, options: [],
  description: "5층 빌라 계단·복도 주 2회 관리 희망합니다. 분리수거장 정리도 포함해 주세요.",
  contactName: "이서연", contactPhone: "010-3456-7890",
  estimateMin: 100000, estimateMax: 250000, status: "open", daysAgo: 0, hoursAgo: 9,
});
addQuote(r5, pStairs, {
  amount: 160000, crewSize: 1, workHours: 2, includes: ["계단·복도 물청소", "난간·우편함 먼지 제거", "분리수거장 정리"],
  message: "우리동네 계단관리입니다. 은평구 빌라 30여 곳을 월 단위로 관리하고 있습니다.\n주 2회(월·목) 방문 기준이며, 분리수거장 정리까지 포함된 금액입니다.",
  warrantyDays: 7, daysAgo: 0, hoursAgo: 7,
});
addQuote(r5, pOffice, {
  amount: 180000, crewSize: 1, workHours: 2, includes: ["계단·복도 물청소", "현관 유리 닦기", "분리수거장 정리"],
  message: "데일리오피스 클린입니다. 오전 7시 이전 방문으로 주민 통행에 지장 없이 진행합니다.\n계약 3개월 이후부터는 월 1회 대청소를 무상 제공합니다.",
  warrantyDays: 14, daysAgo: 0, hoursAgo: 5,
});

const r6 = addRequest({
  customerId: c3.id, service: "construction", propertyType: "store", areaPyeong: 28,
  region: "경기", district: "성남시", addressDetail: "분당구 판교역로 166, 1층",
  preferredDate: day(3), dateFlexible: false, options: ["waste", "window"],
  description: "카페 인테리어 완료 후 준공청소입니다. 보양재와 실리콘 자국 제거 필요합니다.",
  contactName: "박민준", contactPhone: "010-4567-8901",
  estimateMin: 520000, estimateMax: 780000, status: "open", daysAgo: 1, hoursAgo: 3,
});
addQuote(r6, pNew, {
  amount: 620000, crewSize: 4, workHours: 9, includes: ["보양재·스티커 제거", "실리콘·페인트 자국 제거", "미세먼지 3회 제거", "폐기물 정리"],
  message: "새집처럼 청소입니다. 판교 상가 준공청소 경험이 많습니다.\n오픈 일정에 맞춰 야간 작업도 가능하며, 폐기물 배출까지 포함된 금액입니다.",
  warrantyDays: 14, daysAgo: 1, hoursAgo: 1,
});

const r7 = addRequest({
  customerId: c4.id, service: "special", propertyType: "apartment", areaPyeong: 24,
  region: "서울", district: "노원구", addressDetail: "동일로 1400, 502호",
  preferredDate: day(5), dateFlexible: true, options: ["mold", "sterilize"],
  description: "이전 세입자 흡연으로 냄새가 심합니다. 벽지 교체 전 탈취 시공 가능할까요?",
  contactName: "최지우", contactPhone: "010-5678-9012",
  estimateMin: 570000, estimateMax: 1200000, status: "open", daysAgo: 0, hoursAgo: 14,
});
addQuote(r7, pSpecial, {
  amount: 680000, crewSize: 2, workHours: 10, includes: ["살균·탈취 시공", "곰팡이 집중 제거", "작업 전후 사진 리포트"],
  message: "리셋 특수청소입니다. 흡연 냄새는 벽지 교체 전 오존·광촉매 시공을 병행해야 재발하지 않습니다.\n현장 실사 후 확정 견적을 드리며, 탈취 미흡 시 1회 무상 재시공해 드립니다.",
  warrantyDays: 30, daysAgo: 0, hoursAgo: 11,
});

const r8 = addRequest({
  customerId: c5.id, service: "commercial", propertyType: "store", areaPyeong: 22,
  region: "부산", district: "해운대구", addressDetail: "구남로 20, 2층",
  preferredDate: day(2), dateFlexible: true, options: [],
  description: "식당 주방 기름때 제거 위주로 부탁드립니다. 영업 종료 후 22시 이후 가능합니다.",
  contactName: "정하윤", contactPhone: "010-6789-0123",
  estimateMin: 162000, estimateMax: 347000, status: "open", daysAgo: 0, hoursAgo: 20,
});
addQuote(r8, pBusan, {
  amount: 290000, crewSize: 3, workHours: 5, includes: ["주방 기름때 제거", "홀 바닥 세척", "집기 소독"],
  message: "해운대 클린스토리입니다. 구남로 일대 식당 시공 경험이 많습니다.\n22시 투입해 3시간 내 마감 가능하며, 후드 내부까지 포함된 금액입니다.",
  warrantyDays: 7, daysAgo: 0, hoursAgo: 17,
});

/* --- 과거 완료 이력 생성 (후기·평점·정산 통계의 근거가 되는 실제 레코드) --- */

// 데모 고객(customer@demo.kr)의 대시보드는 위 시나리오 4건만 남도록 이력 생성에서 제외한다
const CUSTOMERS = [c2, c3, c4, c5];

const REVIEW_POOL = {
  "move-in": [
    "3인이 오셔서 쉬지 않고 작업하셨어요. 후드 내부까지 열어서 닦아주신 건 처음 봅니다.",
    "새시를 분리해서 창틀 구석까지 닦아주셨어요. 사진 리포트도 바로 보내주셔서 확인이 편했습니다.",
    "이사 당일 아침에 들어가 보니 정말 새집 같았습니다. 다음에도 여기로 할게요.",
    "견적서에 적힌 범위 그대로 해주셨고 추가 요구가 전혀 없었습니다.",
    "욕실 물때가 심했는데 깨끗하게 없어졌어요. 곰팡이도 다시 안 올라옵니다.",
    "약속 시간보다 일찍 오셨고, 마무리 점검도 같이 돌면서 해주셨습니다.",
  ],
  "move-out": [
    "보증금 문제없이 잘 마무리했습니다. 집주인도 만족하셨어요.",
    "잔짐 정리랑 폐기물 배출까지 한 번에 해결됐습니다. 따로 부를 필요가 없었어요.",
    "퇴거 전날 급하게 요청드렸는데 바로 잡아주셔서 감사했습니다.",
    "전체적으로 깔끔했는데 베란다 배수구는 조금 아쉬웠습니다. 말씀드리니 바로 다시 봐주셨어요.",
  ],
  stairs: [
    "매주 같은 분이 오셔서 관리해주십니다. 입주민 민원이 확실히 줄었습니다.",
    "오전 일찍 오셔서 통행에 방해가 없습니다. 난간까지 매번 닦아주세요.",
    "분리수거장이 늘 정리되어 있어서 관리가 훨씬 수월해졌습니다.",
    "이전 업체보다 비용은 비슷한데 상태는 확실히 낫습니다.",
  ],
  office: [
    "야간에 오셔서 업무에 방해가 전혀 없었습니다.",
    "탕비실이랑 화장실 관리가 눈에 띄게 좋아졌습니다. 직원들 반응이 좋아요.",
    "책상 위 집기를 건드리지 않고 정확히 표면만 닦아주셔서 좋았습니다.",
    "담당자가 바뀌어도 인수인계가 잘 되어 있어 품질 편차가 없습니다.",
  ],
  commercial: [
    "주방 기름때가 심했는데 깔끔하게 정리해주셨습니다. 시간 약속도 정확했어요.",
    "영업 종료 후 들어오셔서 다음 날 오픈에 전혀 지장이 없었습니다.",
    "홀 바닥 왁스까지 새로 해주셔서 매장이 훨씬 밝아 보입니다.",
  ],
  construction: [
    "준공 먼지가 정말 심했는데 3회 나눠서 제거해주셨어요.",
    "실리콘 자국이랑 보양재 테이프 자국까지 다 제거해주셨습니다.",
    "팀장님이 체크리스트 들고 다니면서 확인하시더라고요. 믿음이 갔습니다.",
  ],
  "home-regular": [
    "아이 둘 키우는 집인데 친환경 약품 쓰신다고 해서 믿고 맡겼습니다.",
    "정리 정돈까지 해주셔서 퇴근하고 오면 집이 늘 깔끔합니다.",
    "같은 분이 계속 오셔서 우리 집 사정을 잘 아십니다. 편해요.",
  ],
  special: [
    "곰팡이가 다시 올라오지 않는지 2주 뒤에 연락까지 주셨습니다. 값어치 합니다.",
    "흡연 냄새가 정말 심했는데 시공 후에는 거의 안 납니다.",
    "유품 정리를 조심스럽게 진행해주셔서 감사했습니다.",
  ],
};

const DISTRICTS = {
  서울: ["강남구", "송파구", "마포구", "은평구", "성동구", "영등포구", "노원구", "강서구", "관악구", "서대문구"],
  경기: ["수원시", "성남시", "고양시", "용인시", "화성시", "부천시", "안양시", "남양주시"],
  인천: ["연수구", "남동구", "부평구", "서구"],
  부산: ["해운대구", "수영구", "남구", "동래구", "부산진구"],
};

const AREA_BY_SERVICE = { "move-in": [18, 42], "move-out": [12, 32], stairs: [24, 70], office: [25, 90], commercial: [14, 45], construction: [20, 60], "home-regular": [16, 40], special: [12, 34] };

/** 목표 평점에 수렴하는 개별 별점 배열 */
function makeRatings(count, target) {
  const ratings = new Array(count).fill(5);
  for (let i = 0; i < count; i++) {
    const avg = ratings.reduce((a, b) => a + b, 0) / count;
    if (avg <= target + 0.02) break;
    ratings[i] = i % 8 === 5 ? 3 : 4;
  }
  // 섞어서 시간순으로 흩어놓는다 (결정적 셔플)
  for (let i = ratings.length - 1; i > 0; i--) {
    const j = (i * 7 + 3) % (i + 1);
    [ratings[i], ratings[j]] = [ratings[j], ratings[i]];
  }
  return ratings;
}

const HISTORY = [
  { p: pClean, jobs: 96, reviewed: 58, target: 4.9 },
  { p: pStairs, jobs: 72, reviewed: 41, target: 4.8 },
  { p: pSparkle, jobs: 44, reviewed: 27, target: 4.8 },
  { p: pOffice, jobs: 38, reviewed: 22, target: 4.7 },
  { p: pBusan, jobs: 31, reviewed: 18, target: 4.7 },
  { p: pNew, jobs: 23, reviewed: 13, target: 4.6 },
  { p: pSpecial, jobs: 16, reviewed: 9, target: 4.4 },
  { p: byEmail("fresh@demo.kr"), jobs: 7, reviewed: 4, target: 4.2 },
];

function tierOf(jobs, rating) {
  if (jobs >= 60 && rating >= 4.7) return "premium";
  if (jobs >= 20 && rating >= 4.5) return "good";
  return "basic";
}

let hSeed = 0;
const pick = (arr) => arr[hSeed++ % arr.length];

for (const h of HISTORY) {
  const ratings = makeRatings(h.reviewed, h.target);
  let reviewIdx = 0;

  for (let i = 0; i < h.jobs; i++) {
    const service = h.p.services[i % h.p.services.length];
    const region = h.p.regions[i % h.p.regions.length];
    const district = pick(DISTRICTS[region] ?? ["중구"]);
    const [minA, maxA] = AREA_BY_SERVICE[service];
    const area = minA + ((i * 5) % (maxA - minA));
    const cust = CUSTOMERS[i % CUSTOMERS.length];
    // 오래된 건부터 최근 건까지 고르게 분포 (11~330일 전)
    const daysAgo = 11 + Math.round(((h.jobs - i) / h.jobs) * 320);

    const req = addRequest({
      customerId: cust.id, service, propertyType: service === "office" ? "office" : service === "commercial" ? "store" : "apartment",
      areaPyeong: area, region, district, addressDetail: "상세주소 (완료 건)",
      preferredDate: day(-daysAgo + 4), dateFlexible: true, options: [],
      description: "", contactName: cust.name, contactPhone: cust.phone,
      estimateMin: 0, estimateMax: 0, status: "settled", daysAgo,
    });

    const unit = { "move-in": 14000, "move-out": 11000, stairs: 3000, office: 6500, commercial: 11000, construction: 17000, "home-regular": 9000, special: 26000 }[service];
    const amount = Math.max(120000, Math.round((unit * area) / 10000) * 10000);
    req.estimateMin = Math.round(amount * 0.88);
    req.estimateMax = Math.round(amount * 1.24);

    const q = addQuote(req, h.p, {
      amount, crewSize: 2 + (i % 3), workHours: 3 + (i % 5), availableDate: day(-daysAgo + 4),
      includes: ["작업 전후 사진 리포트", "친환경 약품 사용"],
      message: "요청하신 조건 확인했습니다. 책임지고 시공하겠습니다.",
      warrantyDays: 7 + (i % 3) * 7, status: "accepted", daysAgo,
    });

    // 경쟁 견적: 같은 지역·종목을 취급하는 다른 업체들이 함께 제출했다가 미선정된 기록
    const rivals = partners.filter(
      (x) => x.id !== h.p.id && x.status === "approved" && x.services.includes(service),
    );
    const rivalCount = Math.min(rivals.length, 2 + (i % 4));
    for (let k = 0; k < rivalCount; k++) {
      const rival = rivals[(i + k) % rivals.length];
      const delta = [0.94, 1.08, 1.17, 0.88, 1.25][(i + k) % 5];
      addQuote(req, rival, {
        amount: Math.round((amount * delta) / 10000) * 10000,
        crewSize: 2 + ((i + k) % 3), workHours: 3 + ((i + k) % 5), availableDate: day(-daysAgo + 4 + (k % 2)),
        includes: ["작업 전후 사진 리포트"], message: "요청하신 조건으로 견적 드립니다.",
        warrantyDays: 7 + ((i + k) % 3) * 7, status: "rejected", daysAgo,
      });
    }

    const o = addOrder(req, q, {
      status: "settled", daysAgo: daysAgo - 1,
      paidAt: iso(daysAgo - 1), startedAt: iso(daysAgo - 4, 8), completedAt: iso(daysAgo - 4, 2),
      settledAt: iso(daysAgo - 6), method: ["card", "easy", "transfer", "vbank"][i % 4],
    });

    if (reviewIdx < h.reviewed && (i * h.reviewed) % h.jobs < h.reviewed) {
      const rating = ratings[reviewIdx++];
      reviews.push({
        id: uid("rev"), orderId: o.id, customerId: cust.id, partnerId: h.p.id,
        rating,
        scores: {
          kindness: Math.min(5, rating + (i % 2)),
          detail: rating,
          punctuality: Math.min(5, rating + ((i + 1) % 2)),
        },
        content: pick(REVIEW_POOL[service]),
        reply: i % 5 === 0 ? "소중한 후기 감사합니다. 다음에도 꼼꼼하게 시공하겠습니다!" : null,
        createdAt: iso(daysAgo - 5),
      });
    }
  }
  // 남은 후기 수를 채우지 못한 경우를 대비해 실제 레코드 기준으로 집계
}

// 실제 레코드로 업체 집계 지표를 다시 계산한다 (데이터 정합성)
for (const p of partners) {
  const mine = reviews.filter((r) => r.partnerId === p.id);
  const done = orders.filter((o) => o.partnerId === p.id && o.status === "settled");
  p.reviewCount = mine.length;
  p.rating = mine.length ? Math.round((mine.reduce((s, r) => s + r.rating, 0) / mine.length) * 10) / 10 : 0;
  p.completedJobs = done.length;
  p.tier = tierOf(p.completedJobs, p.rating);
}

/* ---------------------------------------------------------------- 저장 */

const db = {
  users,
  partners,
  requests,
  quotes,
  orders,
  reviews,
  sessions: [],
  settings: { feeRates: { ...FEE_RATES }, escrowHoldDays: 3, autoConfirmDays: 7 },
};

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");

console.log(`✅ 시드 완료 → ${DB_FILE}`);
console.log(`   업체 ${partners.length}곳 · 요청 ${requests.length}건 · 견적 ${quotes.length}건 · 주문 ${orders.length}건 · 후기 ${reviews.length}건`);
console.log(`   로그인: customer@demo.kr / partner@demo.kr / admin@demo.kr  (비밀번호: ${PASSWORD})`);
void admin;
