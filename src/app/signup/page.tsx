import type { Metadata } from "next";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "고객 가입" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-ink-900">고객 가입</h1>
        <p className="mt-2 text-sm text-ink-500">가입은 무료입니다. 견적 비교까지 비용이 발생하지 않습니다.</p>
        <div className="card mt-6 p-6 shadow-soft">
          <SignupForm next={next ?? ""} />
        </div>
      </div>
    </div>
  );
}
