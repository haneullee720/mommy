import type { PropertyType, ServiceSlug } from "./types";

export interface ServiceDef {
  slug: ServiceSlug;
  name: string;
  short: string;
  emoji: string;
  description: string;
  unit: "pyeong" | "month" | "floor";
  /** 평당(또는 단위당) 기준 단가 범위 (원) */
  unitPriceMin: number;
  unitPriceMax: number;
  /** 최소 시공 금액 */
  minPrice: number;
  duration: string;
  includes: string[];
  popular?: boolean;
}

export const SERVICES: ServiceDef[] = [
  {
    slug: "move-in",
    name: "입주청소",
    short: "이사 전 새집처럼",
    emoji: "🏠",
    description:
      "이사 들어가기 전, 빈집 상태에서 진행하는 전체 청소입니다. 새시·베란다·주방 후드·화장실 물때까지 전 구간을 손닦음으로 마감합니다.",
    unit: "pyeong",
    unitPriceMin: 11000,
    unitPriceMax: 17000,
    minPrice: 180000,
    duration: "4~8시간",
    includes: ["전체 바닥·벽면 손닦음", "주방 후드·싱크대 내부", "욕실 물때·곰팡이 제거", "새시·방충망 분리 세척", "빌트인 가전 외부"],
    popular: true,
  },
  {
    slug: "move-out",
    name: "이사청소",
    short: "퇴거 후 원상복구",
    emoji: "📦",
    description: "퇴거 시 보증금 분쟁을 줄이기 위한 원상복구 중심 청소입니다. 잔짐 정리와 폐기물 배출까지 함께 처리할 수 있습니다.",
    unit: "pyeong",
    unitPriceMin: 9000,
    unitPriceMax: 14000,
    minPrice: 150000,
    duration: "3~6시간",
    includes: ["전체 바닥·벽면 청소", "주방·욕실 집중 세척", "잔여 쓰레기 정리", "베란다·창틀"],
  },
  {
    slug: "stairs",
    name: "계단청소",
    short: "공동주택 정기 관리",
    emoji: "🪜",
    description: "빌라·오피스텔·상가 계단과 복도를 주 1~4회 정기 관리합니다. 관리비 절감형 월 단위 도급 계약이 가능합니다.",
    unit: "month",
    unitPriceMin: 60000,
    unitPriceMax: 150000,
    minPrice: 60000,
    duration: "회당 1~3시간",
    includes: ["계단·복도 물청소", "난간·우편함 먼지 제거", "현관 유리 닦기", "분리수거장 정리"],
    popular: true,
  },
  {
    slug: "office",
    name: "사무실청소",
    short: "상주·정기·야간",
    emoji: "🏢",
    description: "업무 공간의 일상 청소부터 대청소까지. 상주 미화, 주 2~3회 정기, 야간 청소 등 운영 형태에 맞춰 도급 계약합니다.",
    unit: "pyeong",
    unitPriceMin: 4000,
    unitPriceMax: 9000,
    minPrice: 120000,
    duration: "2~5시간",
    includes: ["바닥 진공·물걸레", "책상·집기 표면 소독", "탕비실·화장실", "쓰레기 분리 배출"],
    popular: true,
  },
  {
    slug: "commercial",
    name: "상가·매장청소",
    short: "영업 전후 시간대",
    emoji: "🏪",
    description: "카페·식당·매장 등 영업장 청소. 주방 기름때, 바닥 왁스, 유리 외벽까지 업종에 맞춰 견적합니다.",
    unit: "pyeong",
    unitPriceMin: 7000,
    unitPriceMax: 15000,
    minPrice: 150000,
    duration: "3~6시간",
    includes: ["주방 기름때 제거", "홀 바닥 세척", "유리·간판 닦기", "집기 소독"],
  },
  {
    slug: "construction",
    name: "준공청소",
    short: "신축·인테리어 후",
    emoji: "🧱",
    description: "인테리어·신축 공사 후 남은 먼지, 실리콘, 보양재, 스티커를 제거하는 1차·2차 준공청소입니다.",
    unit: "pyeong",
    unitPriceMin: 13000,
    unitPriceMax: 22000,
    minPrice: 250000,
    duration: "6~12시간",
    includes: ["보양재·스티커 제거", "실리콘·페인트 자국 제거", "미세먼지 3회 제거", "창호·타일 마감 세척"],
  },
  {
    slug: "home-regular",
    name: "가정 정기청소",
    short: "주 1회 생활 관리",
    emoji: "🧺",
    description: "주 1회 또는 격주로 방문하는 생활 청소. 같은 담당자가 지속 방문하도록 배정합니다.",
    unit: "month",
    unitPriceMin: 200000,
    unitPriceMax: 460000,
    minPrice: 200000,
    duration: "회당 3~4시간",
    includes: ["거실·방 정리 정돈", "주방 설거지·정리", "욕실 세척", "분리수거"],
  },
  {
    slug: "special",
    name: "특수청소",
    short: "곰팡이·유품·폐기물",
    emoji: "🧪",
    description: "곰팡이 제거, 흡연 냄새 탈취, 유품 정리, 대형 폐기물 처리 등 전문 장비가 필요한 청소입니다.",
    unit: "pyeong",
    unitPriceMin: 18000,
    unitPriceMax: 45000,
    minPrice: 300000,
    duration: "현장 협의",
    includes: ["현장 실사 후 견적", "폐기물 합법 처리", "살균·탈취 시공", "작업 전후 사진 리포트"],
  },
];

export const SERVICE_MAP: Record<ServiceSlug, ServiceDef> = Object.fromEntries(
  SERVICES.map((s) => [s.slug, s]),
) as Record<ServiceSlug, ServiceDef>;

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "apartment", label: "아파트" },
  { value: "villa", label: "빌라·연립" },
  { value: "officetel", label: "오피스텔" },
  { value: "house", label: "단독주택" },
  { value: "office", label: "사무실" },
  { value: "store", label: "상가·매장" },
  { value: "building", label: "건물 전체" },
  { value: "etc", label: "기타" },
];

export const PROPERTY_LABEL: Record<PropertyType, string> = Object.fromEntries(
  PROPERTY_TYPES.map((p) => [p.value, p.label]),
) as Record<PropertyType, string>;

export interface OptionDef {
  key: string;
  label: string;
  /** 정액 가산 (원) */
  addFlat?: number;
  /** 총액 대비 가산 비율 */
  addRate?: number;
  note: string;
}

export const OPTIONS: OptionDef[] = [
  { key: "duct", label: "에어컨 분해 세척", addFlat: 90000, note: "벽걸이 기준 1대" },
  { key: "fridge", label: "냉장고 내부 세척", addFlat: 50000, note: "양문형 기준" },
  { key: "mold", label: "곰팡이 집중 제거", addFlat: 120000, note: "욕실·베란다" },
  { key: "waste", label: "폐기물 배출 대행", addFlat: 80000, note: "1톤 미만" },
  { key: "sterilize", label: "살균·탈취 시공", addRate: 0.12, note: "친환경 약품" },
  { key: "window", label: "외창 고소 작업", addRate: 0.15, note: "2층 이상 외부" },
  { key: "pet", label: "반려동물 케어", addFlat: 40000, note: "털·냄새 제거" },
  { key: "urgent", label: "48시간 내 긴급", addRate: 0.1, note: "가능 업체 우선 매칭" },
];

export const OPTION_MAP: Record<string, OptionDef> = Object.fromEntries(OPTIONS.map((o) => [o.key, o]));

export const REGIONS: Record<string, string[]> = {
  서울: ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"],
  경기: ["수원시", "성남시", "고양시", "용인시", "부천시", "안산시", "안양시", "남양주시", "화성시", "평택시", "의정부시", "시흥시", "파주시", "김포시", "광명시", "광주시", "군포시", "하남시"],
  인천: ["중구", "동구", "미추홀구", "연수구", "남동구", "부평구", "계양구", "서구"],
  부산: ["해운대구", "수영구", "남구", "동래구", "부산진구", "연제구", "사하구", "북구", "금정구", "기장군"],
  대구: ["중구", "동구", "서구", "남구", "북구", "수성구", "달서구", "달성군"],
  대전: ["동구", "중구", "서구", "유성구", "대덕구"],
  광주: ["동구", "서구", "남구", "북구", "광산구"],
  울산: ["중구", "남구", "동구", "북구", "울주군"],
  세종: ["세종시"],
  강원: ["춘천시", "원주시", "강릉시", "속초시"],
  충북: ["청주시", "충주시", "제천시"],
  충남: ["천안시", "아산시", "서산시", "당진시"],
  전북: ["전주시", "익산시", "군산시"],
  전남: ["여수시", "순천시", "목포시"],
  경북: ["포항시", "구미시", "경주시", "경산시"],
  경남: ["창원시", "김해시", "진주시", "양산시", "거제시"],
  제주: ["제주시", "서귀포시"],
};

export const REGION_LIST = Object.keys(REGIONS);
