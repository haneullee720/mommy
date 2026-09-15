import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: {
    default: "청소모아 | 청소 견적 비교·안전결제 중개 플랫폼",
    template: "%s | 청소모아",
  },
  description:
    "입주청소·계단청소·사무실청소까지. 요청 한 번으로 검증된 청소 업체 견적을 모아 비교하고, 안전결제로 맡기세요. 평균 5개 견적, 최대 40% 절약.",
  keywords: ["입주청소", "이사청소", "계단청소", "사무실청소", "준공청소", "청소견적", "청소업체", "청소모아"],
  openGraph: {
    title: "청소모아 | 청소 견적을 한 번에 모아 비교",
    description: "요청 한 번이면 검증된 업체가 견적을 보냅니다. 비교하고 고르고, 안전결제로 맡기세요.",
    type: "website",
    locale: "ko_KR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#128872",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
