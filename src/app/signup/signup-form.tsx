"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signupAction } from "@/actions/auth";
import { Alert, Field, inputClass } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { idle } from "@/lib/form";

export function SignupForm({ next }: { next: string }) {
  const [state, action] = useActionState(signupAction, idle);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <Field label="이름" required>
        <input name="name" required className={inputClass} placeholder="홍길동" />
      </Field>
      <Field label="이메일" required>
        <input name="email" type="email" required autoComplete="email" className={inputClass} placeholder="name@example.com" />
      </Field>
      <Field label="휴대폰" required hint="견적 도착·작업 일정 안내에만 사용합니다.">
        <input name="phone" required inputMode="tel" className={inputClass} placeholder="010-1234-5678" />
      </Field>
      <Field label="비밀번호" required hint="8자 이상">
        <input name="password" type="password" required autoComplete="new-password" className={inputClass} />
      </Field>
      <label className="flex items-start gap-2.5 text-[13px] leading-relaxed text-ink-500">
        <input type="checkbox" required className="mt-0.5 h-4 w-4 accent-brand-600" />
        <span>
          <Link href="/terms" className="font-semibold text-ink-700 underline">이용약관</Link> 및{" "}
          <Link href="/privacy" className="font-semibold text-ink-700 underline">개인정보 처리방침</Link>에 동의합니다. (필수)
        </span>
      </label>
      <SubmitButton size="lg" className="w-full" pendingText="가입 중...">
        가입하고 견적 받기
      </SubmitButton>
      <p className="pt-2 text-center text-sm text-ink-500">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="font-bold text-brand-700 hover:underline">로그인</Link>
      </p>
    </form>
  );
}
