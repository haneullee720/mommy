"use client";

import { useActionState } from "react";
import { replyReviewAction } from "@/actions/partner";
import { SubmitButton } from "@/components/submit-button";
import { Alert, inputClass } from "@/components/ui";
import { idle } from "@/lib/form";
import { cn } from "@/lib/cn";

export function ReviewReplyForm({ reviewId }: { reviewId: string }) {
  const [state, action] = useActionState(replyReviewAction, idle);
  if (state.ok) return <Alert tone="success">{state.message}</Alert>;
  return (
    <form action={action} className="mt-3 space-y-2">
      <input type="hidden" name="reviewId" value={reviewId} />
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <textarea name="reply" rows={2} className={cn(inputClass, "resize-y text-[13.5px]")} placeholder="감사 인사나 보완 내용을 남겨보세요. 다음 고객이 함께 봅니다." />
      <SubmitButton size="sm" variant="secondary" pendingText="등록 중...">답변 등록</SubmitButton>
    </form>
  );
}
