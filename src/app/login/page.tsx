import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "로그인" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <div className="container-page flex justify-center py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-ink-900">로그인</h1>
        <p className="mt-2 text-sm text-ink-500">고객·업체·운영자 계정 모두 이곳에서 로그인합니다.</p>
        <div className="card mt-6 p-6 shadow-soft">
          <LoginForm next={next ?? ""} />
        </div>
      </div>
    </div>
  );
}
