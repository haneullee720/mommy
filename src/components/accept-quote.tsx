"use client";

import { useActionState } from "react";
import { acceptQuoteAction } from "@/actions/order";
import { SubmitButton } from "@/components/submit-button";
import { Alert } from "@/components/ui";
import { idle } from "@/lib/form";

export function AcceptQuoteForm({
  requestId,
  quoteId,
  label = "이 업체로 결정하기",
  variant = "primary",
}: {
  requestId: string;
  quoteId: string;
  label?: string;
  variant?: "primary" | "secondary";
}) {
  const [state, action] = useActionState(acceptQuoteAction, idle);
  return (
    <form action={action} className="w-full">
      <input type="hidden" name="requestId" value={requestId} />
      <input type="hidden" name="quoteId" value={quoteId} />
      {state.error && (
        <div className="mb-2">
          <Alert tone="error">{state.error}</Alert>
        </div>
      )}
      <SubmitButton variant={variant} className="w-full" pendingText="처리 중...">
        {label}
      </SubmitButton>
    </form>
  );
}
