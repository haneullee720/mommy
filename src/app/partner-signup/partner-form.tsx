"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { partnerSignupAction } from "@/actions/auth";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { REGION_LIST, SERVICES } from "@/lib/catalog";
import { idle } from "@/lib/form";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/icons";

const BANKS = ["국민", "신한", "우리", "하나", "농협", "기업", "카카오뱅크", "토스뱅크", "새마을금고", "우체국"];

export function PartnerSignupForm() {
  const [state, action] = useActionState(partnerSignupAction, idle);
  const [regions, setRegions] = useState<string[]>(["서울"]);
  const [services, setServices] = useState<string[]>(["move-in"]);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  return (
    <form action={action} className="space-y-8">
      {regions.map((r) => (
        <input key={r} type="hidden" name="regions" value={r} />
      ))}
      {services.map((s) => (
        <input key={s} type="hidden" name="services" value={s} />
      ))}
      {state.error && <Alert tone="error">{state.error}</Alert>}

      <section className="card p-6">
        <h2 className="text-[17px] font-bold text-ink-900">사업자 정보</h2>
        <p className="mt-1 text-[13px] text-ink-500">입력하신 정보로 사업자 진위 확인을 진행합니다.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="업체명" required>
            <input name="companyName" className={inputClass} placeholder="깔끔한 청소" />
          </Field>
          <Field label="사업자등록번호" required>
            <input name="bizNo" className={inputClass} placeholder="123-45-67890" />
          </Field>
          <Field label="대표자명" required>
            <input name="ceoName" className={inputClass} placeholder="홍길동" />
          </Field>
          <Field label="설립연도">
            <input name="since" type="number" min={1970} max={new Date().getFullYear()} defaultValue={2020} className={cn(inputClass, "tnum")} />
          </Field>
          <Field label="상시 인력 (명)">
            <input name="crewSize" type="number" min={1} defaultValue={3} className={cn(inputClass, "tnum")} />
          </Field>
          <Field label="배상책임보험">
            <label className="flex h-[46px] items-center gap-2.5 rounded border border-ink-200 px-3.5">
              <input type="checkbox" name="hasInsurance" className="h-4 w-4 accent-brand-600" defaultChecked />
              <span className="text-sm font-semibold text-ink-700">가입되어 있습니다</span>
            </label>
          </Field>
        </div>
        <div className="mt-4">
          <Field label="업체 소개" hint="고객이 견적 카드에서 함께 봅니다. 강점을 구체적으로 적어주세요.">
            <textarea name="intro" rows={3} className={cn(inputClass, "resize-y")} placeholder="입주청소 전문 8년, 누적 1,200건. 새시 분리 세척과 후드 내부까지 기본 포함합니다." />
          </Field>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-[17px] font-bold text-ink-900">서비스 범위</h2>
        <p className="mt-1 text-[13px] text-ink-500">선택한 지역·종목의 요청만 알림으로 받습니다. 나중에 변경할 수 있습니다.</p>

        <div className="mt-5">
          <p className="mb-2 text-sm font-semibold text-ink-800">
            가능한 청소 종류 <span className="text-brand-600">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((s) => {
              const active = services.includes(s.slug);
              return (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() => toggle(services, setServices, s.slug)}
                  className={cn(
                    "rounded border px-3.5 py-2.5 text-sm font-semibold transition",
                    active ? "border-brand-500 bg-brand-600 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300",
                  )}
                >
                  <Icon name={s.icon} className="h-3.5 w-3.5" />
                      {s.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-2 text-sm font-semibold text-ink-800">
            서비스 가능 지역 <span className="text-brand-600">*</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {REGION_LIST.map((r) => {
              const active = regions.includes(r);
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => toggle(regions, setRegions, r)}
                  className={cn(
                    "rounded border px-3 py-2 text-[13px] font-semibold transition",
                    active ? "border-brand-500 bg-brand-50 text-brand-700" : "border-ink-200 text-ink-500 hover:border-ink-300",
                  )}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-[17px] font-bold text-ink-900">정산 계좌</h2>
        <p className="mt-1 text-[13px] text-ink-500">작업 확인 후 영업일 3일 내 이 계좌로 입금됩니다.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Field label="은행">
            <select name="bank" className={inputClass} defaultValue="국민">
              {BANKS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </Field>
          <Field label="계좌번호">
            <input name="bankNumber" className={cn(inputClass, "tnum")} placeholder="숫자만 입력" />
          </Field>
          <Field label="예금주">
            <input name="bankHolder" className={inputClass} placeholder="사업자명과 동일" />
          </Field>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-[17px] font-bold text-ink-900">로그인 계정</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Field label="이메일" required>
            <input name="email" type="email" className={inputClass} placeholder="company@example.com" />
          </Field>
          <Field label="휴대폰" required>
            <input name="phone" inputMode="tel" className={inputClass} placeholder="010-1234-5678" />
          </Field>
          <Field label="비밀번호" required hint="8자 이상">
            <input name="password" type="password" className={inputClass} />
          </Field>
        </div>

        <label className="mt-5 flex items-start gap-2.5 text-[13px] leading-relaxed text-ink-500">
          <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-brand-600" />
          <span>
            <Link href="/terms" className="font-semibold text-ink-700 underline">파트너 이용약관</Link>과 수수료 정책(등급별 10~15%)에 동의하며,
            등록 정보가 사실과 다를 경우 이용이 제한될 수 있음을 확인했습니다. (필수)
          </span>
        </label>

        <div className="mt-6">
          <SubmitButton size="lg" className="w-full" pendingText="신청 중...">
            입점 신청하기 (무료)
          </SubmitButton>
        </div>
        <p className="mt-3 text-center text-[12.5px] text-ink-400">
          이미 파트너 계정이 있으신가요?{" "}
          <Link href="/login?next=/partner" className="font-bold text-brand-700 hover:underline">로그인</Link>
        </p>
      </section>
    </form>
  );
}
