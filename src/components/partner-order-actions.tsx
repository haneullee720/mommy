"use client";

import { useActionState } from "react";
import { reportDoneAction, startWorkAction } from "@/actions/partner";
import { SubmitButton } from "@/components/submit-button";
import { Alert } from "@/components/ui";
import { idle } from "@/lib/form";

export function StartWorkButton({ orderId }: { orderId: string }) {
  const [state, action] = useActionState(startWorkAction, idle);
  if (state.ok) return <Alert tone="success">{state.message}</Alert>;
  return (
    <form action={action}>
      <input type="hidden" name="orderId" value={orderId} />
      {state.error && <div className="mb-2"><Alert tone="error">{state.error}</Alert></div>}
      <SubmitButton size="sm" pendingText="처리 중...">작업 시작</SubmitButton>
    </form>
  );
}

export function ReportDoneButton({ orderId }: { orderId: string }) {
  const [state, action] = useActionState(reportDoneAction, idle);
  if (state.ok) return <Alert tone="success">{state.message}</Alert>;
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("작업 완료를 보고할까요? 고객 확인 후 정산이 진행됩니다.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="orderId" value={orderId} />
      {state.error && <div className="mb-2"><Alert tone="error">{state.error}</Alert></div>}
      <SubmitButton size="sm" pendingText="처리 중...">작업 완료 보고</SubmitButton>
    </form>
  );
}
