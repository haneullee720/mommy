"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/actions/auth";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { idle } from "@/lib/form";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(loginAction, idle);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="이메일" required>
        <input name="email" type="email" required autoComplete="email" className={inputClass} placeholder="name@example.com" />
      </Field>
      <Field label="비밀번호" required>
        <input name="password" type="password" required autoComplete="current-password" className={inputClass} placeholder="8자 이상" />
      </Field>
      <SubmitButton size="lg" className="w-full" pendingText="로그인 중...">
        로그인
      </SubmitButton>
      <p className="pt-2 text-center text-sm text-ink-500">
        아직 회원이 아니신가요?{" "}
        <Link href="/signup" className="font-bold text-brand-700 hover:underline">
          고객 가입
        </Link>
        {" · "}
        <Link href="/partner-signup" className="font-bold text-brand-700 hover:underline">
          업체 등록
        </Link>
      </p>
    </form>
  );
}
