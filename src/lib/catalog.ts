import type { IconName } from "@/components/icons";
import type { PropertyType, ServiceSlug } from "./types";

export interface ServiceDef {
  slug: ServiceSlug;
  name: string;
  short: string;
  icon: IconName;
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
    icon: "home",
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
    slug: "stairs",
    name: "계단청소",
    short: "공동주택 정기 관리",
    icon: "stairs",
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
    name: "상가·사무실청소",
    short: "업무 공간·영업장",
    icon: "building",
    description:
      "사무실·상가·매장 등 영업 공간 청소입니다. 상주 미화, 주 2~3회 정기, 야간·영업 전후 시간대까지 운영 형태에 맞춰 도급 계약합니다. 주방 기름때와 유리 외벽 같은 매장 전용 작업도 함께 견적합니다.",
    unit: "pyeong",
    unitPriceMin: 4000,
    unitPriceMax: 15000,
    minPrice: 120000,
    duration: "2~6시간",
    includes: ["바닥 진공·물걸레·왁스", "책상·집기 표면 소독", "주방 기름때 제거", "유리·간판 닦기", "탕비실·화장실", "쓰레기 분리 배출"],
    popular: true,
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

/** 서비스 선택 시 자동으로 맞춰지는 기본 건물 유형 */
export const DEFAULT_PROPERTY: Record<ServiceSlug, PropertyType> = {
  "move-in": "apartment",
  stairs: "villa",
  office: "office",
};

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
