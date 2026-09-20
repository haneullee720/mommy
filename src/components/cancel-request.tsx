"use client";

import { useActionState } from "react";
import { cancelRequestAction } from "@/actions/request";
import { idle } from "@/lib/form";

export function CancelRequestButton({ requestId }: { requestId: string }) {
  const [state, action, pending] = useActionState(cancelRequestAction, idle);

  if (state.ok) return <span className="text-[13px] font-semibold text-ink-400">요청이 취소되었습니다.</span>;

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("견적 요청을 취소할까요? 도착한 견적도 함께 사라집니다.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="requestId" value={requestId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded px-3 py-2 text-[13px] font-semibold text-ink-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      >
        {pending ? "취소 중..." : "요청 취소"}
      </button>
      {state.error && <span className="ml-2 text-[12px] text-red-600">{state.error}</span>}
    </form>
  );
}
