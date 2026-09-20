"use client";

import { useActionState, useState } from "react";
import { payOrderAction } from "@/actions/order";
import { SubmitButton } from "@/components/submit-button";
import { Alert } from "@/components/ui";
import { idle } from "@/lib/form";
import { cn } from "@/lib/cn";
import { won } from "@/lib/format";
import { Icon } from "@/components/icons";

const METHODS = [
  { key: "card", label: "신용·체크카드", desc: "국내 모든 카드 · 최대 6개월 무이자", icon: "card" },
  { key: "transfer", label: "계좌이체", desc: "즉시 이체 · 수수료 없음", icon: "bank" },
  { key: "vbank", label: "가상계좌", desc: "입금 확인 후 업체 배정", icon: "receipt" },
  { key: "easy", label: "간편결제", desc: "카카오페이 · 네이버페이 · 토스", icon: "bolt" },
] as const;

export function PayForm({ orderId, amount }: { orderId: string; amount: number }) {
  const [state, action] = useActionState(payOrderAction, idle);
  const [method, setMethod] = useState("card");
  const [agree, setAgree] = useState(false);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="method" value={method} />
      {state.error && <Alert tone="error">{state.error}</Alert>}

      <div className="grid gap-2 sm:grid-cols-2">
        {METHODS.map((m) => {
          const active = method === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setMethod(m.key)}
              className={cn(
                "flex items-start gap-3 rounded border p-4 text-left transition",
                active ? "border-brand-500 bg-brand-50 ring-2 ring-brand-100" : "border-ink-200 hover:border-ink-300",
              )}
            >
              <Icon name={m.icon} className="h-5 w-5 text-ink-400" />
              <span>
                <span className="block text-[14px] font-semibold text-ink-900">{m.label}</span>
                <span className="mt-0.5 block text-[12px] text-ink-500">{m.desc}</span>
              </span>
            </button>
          );
        })}
      </div>

      <label className="flex items-start gap-2.5 rounded bg-ink-50 p-4 text-[13px] leading-relaxed text-ink-600">
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-600" />
        <span>
          결제 금액이 <strong className="text-ink-900">청소모아에 예치</strong>되고, 작업 완료를 확인한 뒤 업체에 지급되는 방식(안전결제)에
          동의합니다. 작업 3일 전까지는 전액 환불이 가능합니다.
        </span>
      </label>

      <SubmitButton size="lg" className="w-full" pendingText="결제 처리 중..." disabled={!agree}>
        {won(amount)} 안전결제하기
      </SubmitButton>
      {!agree && <p className="text-center text-[12px] text-ink-400">위 안내에 동의하시면 결제가 진행됩니다.</p>}
    </form>
  );
}
