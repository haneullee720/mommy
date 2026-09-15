"use client";

import { useActionState } from "react";
import { forceSettleAction, setPartnerStatusAction, updateSettingsAction } from "@/actions/admin";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Field, inputClass } from "@/components/ui";
import { idle } from "@/lib/form";
import { cn } from "@/lib/cn";
import type { PartnerStatus } from "@/lib/types";

export function PartnerStatusForm({ partnerId, status }: { partnerId: string; status: PartnerStatus }) {
  const [state, action] = useActionState(setPartnerStatusAction, idle);
  return (
    <form action={action} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="partnerId" value={partnerId} />
      {state.error && <span className="text-[12px] text-red-600">{state.error}</span>}
      {status !== "approved" && (
        <button name="status" value="approved" className="rounded-lg bg-brand-600 px-3 py-2 text-[12.5px] font-bold text-white hover:bg-brand-700">
          승인
        </button>
      )}
      {status !== "suspended" && (
        <button name="status" value="suspended" className="rounded-lg border border-red-200 px-3 py-2 text-[12.5px] font-bold text-red-600 hover:bg-red-50">
          이용 정지
        </button>
      )}
      {status === "suspended" && (
        <button name="status" value="pending" className="rounded-lg border border-ink-200 px-3 py-2 text-[12.5px] font-bold text-ink-600 hover:bg-ink-50">
          심사 대기로
        </button>
      )}
    </form>
  );
}

export function ForceSettleButton({ orderId }: { orderId: string }) {
  const [state, action] = useActionState(forceSettleAction, idle);
  if (state.ok) return <span className="text-[12px] font-bold text-emerald-600">정산 완료</span>;
  return (
    <form action={action}>
      <input type="hidden" name="orderId" value={orderId} />
      <SubmitButton size="sm" variant="secondary" pendingText="처리 중...">강제 정산</SubmitButton>
      {state.error && <p className="mt-1 text-[12px] text-red-600">{state.error}</p>}
    </form>
  );
}

export function SettingsForm({
  rates,
  escrowHoldDays,
  autoConfirmDays,
}: {
  rates: { basic: number; good: number; premium: number };
  escrowHoldDays: number;
  autoConfirmDays: number;
}) {
  const [state, action] = useActionState(updateSettingsAction, idle);
  return (
    <form action={action} className="space-y-6">
      {state.error && <Alert tone="error">{state.error}</Alert>}
      {state.ok && <Alert tone="success">{state.message}</Alert>}

      <div className="grid gap-4 sm:grid-cols-3">
        {([
          ["basic", "일반 등급 수수료 (%)", rates.basic],
          ["good", "우수 등급 수수료 (%)", rates.good],
          ["premium", "프리미엄 등급 수수료 (%)", rates.premium],
        ] as const).map(([name, label, value]) => (
          <Field key={name} label={label} required>
            <input name={name} type="number" step={0.5} min={0} max={50} defaultValue={Math.round(value * 1000) / 10} className={cn(inputClass, "tnum")} />
          </Field>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="정산 지급 소요일 (영업일)" hint="고객 확인 후 업체 계좌 입금까지">
          <input name="escrowHoldDays" type="number" min={0} max={30} defaultValue={escrowHoldDays} className={cn(inputClass, "tnum")} />
        </Field>
        <Field label="자동 구매확정 기간 (일)" hint="고객 미확인 시 자동으로 정산 처리">
          <input name="autoConfirmDays" type="number" min={1} max={30} defaultValue={autoConfirmDays} className={cn(inputClass, "tnum")} />
        </Field>
      </div>

      <SubmitButton size="lg" pendingText="저장 중...">정책 저장</SubmitButton>
    </form>
  );
}
