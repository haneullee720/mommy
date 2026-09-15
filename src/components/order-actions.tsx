"use client";

import { useActionState, useState } from "react";
import { confirmOrderAction, reviewAction } from "@/actions/order";
import { SubmitButton } from "@/components/submit-button";
import { Alert, Field, inputClass } from "@/components/ui";
import { idle } from "@/lib/form";
import { cn } from "@/lib/cn";

export function ConfirmWorkButton({ orderId }: { orderId: string }) {
  const [state, action] = useActionState(confirmOrderAction, idle);
  if (state.ok) return <Alert tone="success">{state.message}</Alert>;
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("작업이 잘 마무리되었나요? 확인하면 업체에 정산이 시작되며 되돌릴 수 없습니다.")) e.preventDefault();
      }}
    >
      <input type="hidden" name="orderId" value={orderId} />
      {state.error && (
        <div className="mb-3">
          <Alert tone="error">{state.error}</Alert>
        </div>
      )}
      <SubmitButton size="lg" className="w-full" pendingText="확인 중...">
        작업 확인하고 정산 승인
      </SubmitButton>
    </form>
  );
}

const SCORE_LABELS = [
  { key: "kindness", label: "친절도" },
  { key: "detail", label: "꼼꼼함" },
  { key: "punctuality", label: "시간 준수" },
] as const;

export function ReviewForm({ orderId }: { orderId: string }) {
  const [state, action] = useActionState(reviewAction, idle);
  const [rating, setRating] = useState(5);
  const [scores, setScores] = useState({ kindness: 5, detail: 5, punctuality: 5 });

  if (state.ok) return <Alert tone="success">{state.message}</Alert>;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="rating" value={rating} />
      {SCORE_LABELS.map((s) => (
        <input key={s.key} type="hidden" name={s.key} value={scores[s.key]} />
      ))}
      {state.error && <Alert tone="error">{state.error}</Alert>}

      <div>
        <p className="mb-2 text-sm font-semibold text-ink-800">종합 만족도</p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n}점`}
              className={cn("text-3xl leading-none transition", n <= rating ? "text-lemon-500" : "text-ink-200 hover:text-ink-300")}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {SCORE_LABELS.map((s) => (
          <label key={s.key} className="rounded-xl border border-ink-200 p-3">
            <span className="flex items-center justify-between text-[13px] font-semibold text-ink-700">
              {s.label}
              <span className="tnum text-brand-700">{scores[s.key]}</span>
            </span>
            <input
              type="range"
              min={1}
              max={5}
              value={scores[s.key]}
              onChange={(e) => setScores((prev) => ({ ...prev, [s.key]: Number(e.target.value) }))}
              className="mt-2 w-full"
            />
          </label>
        ))}
      </div>

      <Field label="후기" hint="다음 고객에게 큰 도움이 됩니다. 10자 이상.">
        <textarea name="content" rows={4} className={cn(inputClass, "resize-y")} placeholder="어떤 점이 좋았는지, 아쉬웠는지 알려주세요." />
      </Field>

      <SubmitButton className="w-full" pendingText="등록 중...">후기 등록하기</SubmitButton>
    </form>
  );
}
