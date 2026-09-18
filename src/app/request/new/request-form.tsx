"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";
import { createRequestAction } from "@/actions/request";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { DEFAULT_PROPERTY, OPTIONS, PROPERTY_TYPES, REGIONS, REGION_LIST, SERVICES, SERVICE_MAP } from "@/lib/catalog";
import { estimate } from "@/lib/estimate";
import { manwon } from "@/lib/format";
import { idle } from "@/lib/form";
import { cn } from "@/lib/cn";
import type { PropertyType, ServiceSlug } from "@/lib/types";

const STEP_LABELS = ["청소 종류", "공간 정보", "일정·옵션", "연락처 확인"];

interface Props {
  defaults: { service: ServiceSlug; propertyType: PropertyType; area: number; options: string[] };
  user: { name: string; phone: string } | null;
}

function todayPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function RequestForm({ defaults, user }: Props) {
  const [state, action] = useActionState(createRequestAction, idle);
  const [step, setStep] = useState(0);
  const [stepError, setStepError] = useState("");

  const [service, setService] = useState<ServiceSlug>(defaults.service);
  const [propertyType, setPropertyType] = useState<PropertyType>(defaults.propertyType);
  const [area, setArea] = useState(defaults.area);
  const [region, setRegion] = useState("서울");
  const [district, setDistrict] = useState(REGIONS["서울"][0]);
  const [addressDetail, setAddressDetail] = useState("");
  const [preferredDate, setPreferredDate] = useState(todayPlus(5));
  const [dateFlexible, setDateFlexible] = useState(true);
  const [options, setOptions] = useState<string[]>(defaults.options);
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState(user?.name ?? "");
  const [contactPhone, setContactPhone] = useState(user?.phone ?? "");

  const def = SERVICE_MAP[service];
  const est = useMemo(
    () => estimate({ service, propertyType, areaPyeong: area, options, dateFlexible }),
    [service, propertyType, area, options, dateFlexible],
  );

  const toggleOption = (key: string) =>
    setOptions((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  function next() {
    if (step === 1 && !addressDetail.trim()) {
      setStepError("상세 주소를 입력해 주세요. 결제 전까지 업체에 공개되지 않습니다.");
      return;
    }
    if (step === 2 && !preferredDate) {
      setStepError("희망 작업일을 선택해 주세요.");
      return;
    }
    setStepError("");
    setStep((s) => Math.min(3, s + 1));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div>
        {/* 진행 표시 */}
        <ol className="mb-8 flex items-center gap-2">
          {STEP_LABELS.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-2">
              <div className="flex-1">
                <div className={cn("h-1.5 rounded-full transition", i <= step ? "bg-brand-600" : "bg-ink-200")} />
                <p className={cn("mt-2 text-[12px] font-bold transition", i <= step ? "text-brand-700" : "text-ink-400")}>
                  <span className="tnum">{i + 1}.</span> {label}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <form action={action} className="card p-6 shadow-soft sm:p-8">
          {/* 모든 값은 항상 폼에 포함 */}
          <input type="hidden" name="service" value={service} />
          <input type="hidden" name="propertyType" value={propertyType} />
          <input type="hidden" name="areaPyeong" value={area} />
          <input type="hidden" name="region" value={region} />
          <input type="hidden" name="district" value={district} />
          <input type="hidden" name="addressDetail" value={addressDetail} />
          <input type="hidden" name="preferredDate" value={preferredDate} />
          {dateFlexible && <input type="hidden" name="dateFlexible" value="true" />}
          {options.map((o) => (
            <input key={o} type="hidden" name="options" value={o} />
          ))}
          <input type="hidden" name="description" value={description} />
          <input type="hidden" name="contactName" value={contactName} />
          <input type="hidden" name="contactPhone" value={contactPhone} />

          {(state.error || stepError) && (
            <div className="mb-5">
              <Alert tone="error">{stepError || state.error}</Alert>
            </div>
          )}

          {/* --------------------------------------------- 1. 청소 종류 */}
          {step === 0 && (
            <div className="animate-rise">
              <h2 className="text-xl font-extrabold text-ink-900">어떤 청소가 필요하세요?</h2>
              <p className="mt-1.5 text-sm text-ink-500">종류에 따라 견적을 보낼 업체가 달라집니다.</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {SERVICES.map((s) => {
                  const active = service === s.slug;
                  return (
                    <button
                      key={s.slug}
                      type="button"
                      onClick={() => {
                        setService(s.slug);
                        setPropertyType(DEFAULT_PROPERTY[s.slug]);
                      }}
                      className={cn(
                        "flex items-start gap-3 rounded-2xl border p-4 text-left transition",
                        active ? "border-brand-500 bg-brand-50 ring-2 ring-brand-100" : "border-ink-200 hover:border-ink-300",
                      )}
                    >
                      <span className="text-2xl">{s.emoji}</span>
                      <span className="min-w-0">
                        <span className="block text-[15px] font-extrabold text-ink-900">{s.name}</span>
                        <span className="mt-0.5 block text-[12.5px] text-ink-500">{s.short}</span>
                        <span className="tnum mt-1.5 block text-[12px] font-bold text-brand-700">
                          {s.unit === "month" ? "월 " : "평당 "}
                          {manwon(s.unitPriceMin)}~{manwon(s.unitPriceMax)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* --------------------------------------------- 2. 공간 정보 */}
          {step === 1 && (
            <div className="animate-rise space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-ink-900">공간 정보를 알려주세요</h2>
                <p className="mt-1.5 text-sm text-ink-500">면적이 정확할수록 견적 편차가 줄어듭니다.</p>
              </div>

              <Field label="건물 유형" required>
                <div className="flex flex-wrap gap-2">
                  {PROPERTY_TYPES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPropertyType(p.value)}
                      className={cn(
                        "rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition",
                        propertyType === p.value ? "border-brand-500 bg-brand-600 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300",
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label={`면적 (${area}평)`} required hint="전용면적 기준. 모르면 대략적인 값으로 두세요.">
                <div className="flex items-center gap-4">
                  <input type="range" min={5} max={200} value={area} onChange={(e) => setArea(Number(e.target.value))} className="flex-1" />
                  <input
                    type="number"
                    min={1}
                    value={area}
                    onChange={(e) => setArea(Math.max(1, Number(e.target.value)))}
                    className="tnum w-24 rounded-xl border border-ink-200 px-3 py-2.5 text-center text-sm font-bold"
                  />
                </div>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="지역" required>
                  <select
                    value={region}
                    onChange={(e) => {
                      setRegion(e.target.value);
                      setDistrict(REGIONS[e.target.value][0]);
                    }}
                    className={inputClass}
                  >
                    {REGION_LIST.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </Field>
                <Field label="시·군·구" required>
                  <select value={district} onChange={(e) => setDistrict(e.target.value)} className={inputClass}>
                    {REGIONS[region].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="상세 주소" required hint="🔒 결제가 완료된 업체에게만 공개됩니다.">
                <input
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                  className={inputClass}
                  placeholder="○○로 12길 34, 101동 1502호"
                />
              </Field>
            </div>
          )}

          {/* --------------------------------------------- 3. 일정·옵션 */}
          {step === 2 && (
            <div className="animate-rise space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-ink-900">언제, 어떻게 해드릴까요?</h2>
                <p className="mt-1.5 text-sm text-ink-500">일정을 조율할 수 있으면 더 좋은 가격이 나옵니다.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="희망 작업일" required>
                  <input
                    type="date"
                    value={preferredDate}
                    min={todayPlus(1)}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <div className="flex items-end">
                  <label
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition",
                      dateFlexible ? "border-brand-500 bg-brand-50" : "border-ink-200",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={dateFlexible}
                      onChange={(e) => setDateFlexible(e.target.checked)}
                      className="h-4 w-4 accent-brand-600"
                    />
                    <span className="text-sm">
                      <span className="block font-bold text-ink-900">일정 조율 가능</span>
                      <span className="block text-[12px] text-ink-500">평균 5% 저렴한 견적</span>
                    </span>
                  </label>
                </div>
              </div>

              <Field label="추가 옵션" hint="선택하지 않아도 됩니다. 업체가 현장 확인 후 조정할 수 있습니다.">
                <div className="grid gap-2 sm:grid-cols-2">
                  {OPTIONS.map((o) => {
                    const active = options.includes(o.key);
                    return (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => toggleOption(o.key)}
                        className={cn(
                          "flex items-center justify-between gap-2 rounded-xl border px-3.5 py-3 text-left transition",
                          active ? "border-brand-500 bg-brand-50" : "border-ink-200 hover:border-ink-300",
                        )}
                      >
                        <span>
                          <span className={cn("block text-[13.5px] font-bold", active ? "text-brand-700" : "text-ink-800")}>{o.label}</span>
                          <span className="block text-[11.5px] text-ink-400">{o.note}</span>
                        </span>
                        <span className="tnum shrink-0 text-[12px] font-bold text-ink-500">
                          {o.addFlat ? `+${manwon(o.addFlat)}` : `+${Math.round((o.addRate ?? 0) * 100)}%`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="상세 요청사항" hint="반려동물, 주차 조건, 특히 신경 쓸 곳 등을 적어주시면 견적이 정확해집니다.">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className={cn(inputClass, "resize-y")}
                  placeholder="예) 베란다 곰팡이가 심합니다. 엘리베이터 없는 3층이고, 주차는 건물 앞 가능합니다."
                />
              </Field>
            </div>
          )}

          {/* --------------------------------------------- 4. 연락처 */}
          {step === 3 && (
            <div className="animate-rise space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-ink-900">어디로 연락드릴까요?</h2>
                <p className="mt-1.5 text-sm text-ink-500">견적이 도착하면 알려드립니다. 업체에는 결제 전까지 공개되지 않습니다.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="이름" required>
                  <input value={contactName} onChange={(e) => setContactName(e.target.value)} className={inputClass} placeholder="홍길동" />
                </Field>
                <Field label="휴대폰" required>
                  <input
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    inputMode="tel"
                    className={inputClass}
                    placeholder="010-1234-5678"
                  />
                </Field>
              </div>

              {!user && (
                <div className="rounded-2xl border border-brand-200 bg-brand-50/60 p-5">
                  <p className="text-sm font-extrabold text-brand-800">간편 가입하고 견적 받기</p>
                  <p className="mt-1 text-[12.5px] text-brand-700">
                    견적 비교·안전결제 내역을 확인하려면 계정이 필요합니다. 아래 두 칸이면 끝납니다.
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Field label="이메일" required>
                      <input name="email" type="email" className={inputClass} placeholder="name@example.com" />
                    </Field>
                    <Field label="비밀번호" required>
                      <input name="password" type="password" className={inputClass} placeholder="8자 이상" />
                    </Field>
                  </div>
                  <p className="mt-3 text-[12px] text-brand-700">
                    이미 계정이 있으신가요?{" "}
                    <Link href="/login?next=/request/new" className="font-bold underline">로그인</Link>
                  </p>
                </div>
              )}

              <div className="rounded-2xl bg-ink-50 p-5">
                <p className="text-sm font-extrabold text-ink-900">요청 내용 확인</p>
                <dl className="mt-3 space-y-2 text-[13.5px]">
                  {[
                    ["청소 종류", def.name],
                    ["공간", `${PROPERTY_TYPES.find((p) => p.value === propertyType)?.label} · ${area}평`],
                    ["지역", `${region} ${district}`],
                    ["희망일", `${preferredDate}${dateFlexible ? " (조율 가능)" : ""}`],
                    ["옵션", options.length ? options.map((o) => OPTIONS.find((x) => x.key === o)?.label).join(", ") : "없음"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4">
                      <dt className="shrink-0 text-ink-400">{k}</dt>
                      <dd className="text-right font-semibold text-ink-800">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          )}

          {/* --------------------------------------------- 버튼 */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-ink-100 pt-6">
            <button
              type="button"
              onClick={() => {
                setStepError("");
                setStep((s) => Math.max(0, s - 1));
              }}
              disabled={step === 0}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-ink-500 transition hover:bg-ink-100 disabled:opacity-0"
            >
              ← 이전
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={next}
                className="inline-flex h-12 items-center rounded-xl bg-brand-600 px-7 text-[15px] font-extrabold text-white shadow-soft transition hover:bg-brand-700"
              >
                다음
              </button>
            ) : (
              <SubmitButton size="lg" pendingText="요청 접수 중...">
                견적 요청 완료하기
              </SubmitButton>
            )}
          </div>
        </form>
      </div>

      {/* --------------------------------------------- 사이드 요약 */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card overflow-hidden shadow-soft">
          <div className="bg-ink-900 px-5 py-5 text-white">
            <p className="text-[12.5px] font-semibold text-ink-300">예상 견적 범위</p>
            <p className="tnum mt-1 text-[25px] font-extrabold leading-tight">
              {manwon(est.min)} ~ {manwon(est.max)}
            </p>
          </div>
          <dl className="divide-y divide-ink-100">
            {est.breakdown.map((b) => (
              <div key={b.label} className="flex items-center justify-between px-5 py-3 text-[13px]">
                <dt className="text-ink-400">{b.label}</dt>
                <dd className="font-semibold text-ink-800">{b.value}</dd>
              </div>
            ))}
          </dl>
          <div className="border-t border-ink-100 bg-ink-50/70 px-5 py-4">
            <p className="text-[12.5px] leading-relaxed text-ink-500">
              업체가 보내는 실제 견적으로 금액이 확정됩니다. 요청서를 보내도 <strong className="text-ink-800">결제 의무는 없습니다.</strong>
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-ink-200 bg-white p-5">
          <p className="text-sm font-extrabold text-ink-900">{def.name}에 포함되는 작업</p>
          <ul className="mt-3 space-y-2">
            {def.includes.map((t) => (
              <li key={t} className="flex items-start gap-2 text-[13px] text-ink-600">
                <span className="mt-1 text-brand-600">✓</span>
                {t}
              </li>
            ))}
          </ul>
          <p className="tnum mt-4 border-t border-ink-100 pt-3 text-[12.5px] text-ink-400">평균 소요 {def.duration}</p>
        </div>
      </aside>
    </div>
  );
}
