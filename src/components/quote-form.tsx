"use client";

import { useActionState, useState } from "react";
import { submitQuoteAction } from "@/actions/partner";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Field, inputClass } from "@/components/ui";
import { idle } from "@/lib/form";
import { won } from "@/lib/format";
import { cn } from "@/lib/cn";

const TEMPLATES = [
  "안녕하세요, {company}입니다. 요청하신 조건으로 경력 5년 이상 팀장급이 직접 시공합니다. 작업 전후 사진을 보내드리고, 미흡한 부분은 무상으로 다시 봐 드립니다.",
  "요청 주신 일정에 바로 투입 가능합니다. 친환경 약품만 사용하며, 아이·반려동물이 있는 집도 안심하고 맡기실 수 있습니다.",
  "해당 지역에서 300건 이상 시공했습니다. 새시 분리 세척과 후드 내부까지 기본 포함이며, 추가 비용은 발생하지 않습니다.",
];

export function QuoteForm({
  requestId,
  companyName,
  feeRate,
  suggestMin,
  suggestMax,
  preferredDate,
  baseIncludes,
  existing,
}: {
  requestId: string;
  companyName: string;
  feeRate: number;
  suggestMin: number;
  suggestMax: number;
  preferredDate: string;
  baseIncludes: string[];
  existing?: { amount: number; crewSize: number; workHours: number; availableDate: string; includes: string[]; message: string; warrantyDays: number } | null;
}) {
  const [state, action] = useActionState(submitQuoteAction, idle);
  const [amount, setAmount] = useState(existing?.amount ?? Math.round((suggestMin + suggestMax) / 2 / 10000) * 10000);
  const [includes, setIncludes] = useState<string[]>(existing?.includes ?? baseIncludes.slice(0, 3));
  const [message, setMessage] = useState(existing?.message ?? "");

  const fee = Math.round((amount * feeRate) / 10) * 10;
  const payout = amount - fee;

  const toggle = (v: string) => setIncludes((p) => (p.includes(v) ? p.filter((x) => x !== v) : [...p, v]));

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="requestId" value={requestId} />
      {includes.map((i) => (
        <input key={i} type="hidden" name="includes" value={i} />
      ))}
      {state.error && <Alert tone="error">{state.error}</Alert>}

      <Field label="견적 금액 (부가세 포함)" required hint={`고객 예상 범위 ${won(suggestMin)} ~ ${won(suggestMax)}`}>
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="amount"
            step={10000}
            min={10000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className={cn(inputClass, "tnum text-right text-lg font-extrabold")}
          />
          <span className="shrink-0 text-sm font-bold text-ink-500">원</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {[-20000, -10000, 10000, 20000, 50000].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setAmount((a) => Math.max(10000, a + d))}
              className="tnum rounded-lg border border-ink-200 px-2.5 py-1.5 text-[12px] font-bold text-ink-600 hover:border-ink-300"
            >
              {d > 0 ? "+" : ""}
              {(d / 10000).toLocaleString("ko-KR")}만
            </button>
          ))}
        </div>
      </Field>

      <div className="rounded-2xl bg-ink-900 p-5 text-white">
        <p className="text-[12.5px] font-semibold text-ink-300">이 금액으로 낙찰되면</p>
        <dl className="tnum mt-3 space-y-2 text-[13.5px]">
          <div className="flex justify-between">
            <dt className="text-ink-300">고객 결제 금액</dt>
            <dd className="font-bold">{won(amount)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-300">중개 수수료 ({Math.round(feeRate * 100)}%)</dt>
            <dd className="font-bold text-red-300">-{won(fee)}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-white/15 pt-2">
            <dt className="text-[14px] font-bold">실 정산액</dt>
            <dd className="text-[20px] font-extrabold text-brand-300">{won(payout)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-[11.5px] text-ink-400">카드·이체 수수료는 청소모아가 부담합니다.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="투입 인원" required>
          <input type="number" name="crewSize" min={1} max={20} defaultValue={existing?.crewSize ?? 2} className={cn(inputClass, "tnum")} />
        </Field>
        <Field label="예상 작업 시간" required>
          <input type="number" name="workHours" min={1} max={24} defaultValue={existing?.workHours ?? 5} className={cn(inputClass, "tnum")} />
        </Field>
        <Field label="무상 A/S (일)" required hint="최소 7일">
          <input type="number" name="warrantyDays" min={7} max={90} defaultValue={existing?.warrantyDays ?? 7} className={cn(inputClass, "tnum")} />
        </Field>
      </div>

      <Field label="작업 가능일" required>
        <input type="date" name="availableDate" defaultValue={existing?.availableDate ?? preferredDate} className={inputClass} />
      </Field>

      <Field label="포함 작업" hint="고객이 견적 카드에서 바로 확인합니다.">
        <div className="flex flex-wrap gap-1.5">
          {baseIncludes.map((inc) => {
            const active = includes.includes(inc);
            return (
              <button
                key={inc}
                type="button"
                onClick={() => toggle(inc)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[12.5px] font-semibold transition",
                  active ? "border-brand-500 bg-brand-600 text-white" : "border-ink-200 text-ink-600 hover:border-ink-300",
                )}
              >
                {active ? "✓ " : "+ "}
                {inc}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="고객에게 전할 메시지" required hint="10자 이상. 경험·차별점을 구체적으로 적을수록 낙찰률이 높습니다.">
        <textarea
          name="message"
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={cn(inputClass, "resize-y")}
          placeholder="시공 방식, 사용 약품, 작업 후 A/S 등을 적어주세요."
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {TEMPLATES.map((t, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setMessage(t.replace("{company}", companyName))}
              className="rounded-lg border border-ink-200 px-2.5 py-1.5 text-[11.5px] font-semibold text-ink-500 hover:border-brand-300 hover:text-brand-700"
            >
              템플릿 {i + 1}
            </button>
          ))}
        </div>
      </Field>

      <SubmitButton size="lg" className="w-full" pendingText="제출 중...">
        {existing ? "견적 수정해서 다시 보내기" : "견적 보내기"}
      </SubmitButton>
      <p className="text-center text-[12px] text-ink-400">견적 제출은 무료입니다. 낙찰된 건에만 수수료가 발생합니다.</p>
    </form>
  );
}
