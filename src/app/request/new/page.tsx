import type { Metadata } from "next";
import { RequestForm } from "./request-form";
import { currentUser } from "@/lib/auth";
import { SERVICE_MAP } from "@/lib/catalog";
import type { PropertyType, ServiceSlug } from "@/lib/types";

export const metadata: Metadata = {
  title: "무료 견적 요청",
  description: "3분이면 끝나는 요청서. 검증된 청소 업체들이 견적을 보냅니다.",
};

export const dynamic = "force-dynamic";

export default async function NewRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; property?: string; area?: string; options?: string }>;
}) {
  const sp = await searchParams;
  const user = await currentUser();

  const service = (sp.service && SERVICE_MAP[sp.service as ServiceSlug] ? sp.service : "move-in") as ServiceSlug;
  const area = Number(sp.area) > 0 ? Number(sp.area) : 24;

  return (
    <div className="bg-ink-50/40">
      <div className="container-page py-12">
        <div className="mb-8 max-w-2xl">
          <h1 className="text-[28px] font-bold leading-tight text-ink-900 sm:text-[34px]">견적 요청서 작성</h1>
          <p className="mt-2 text-[15px] text-ink-500">
            작성은 3분, 견적은 보통 <strong className="text-ink-800">30분 안</strong>에 도착합니다. 비교와 취소는 언제든 무료입니다.
          </p>
        </div>
        <RequestForm
          defaults={{
            service,
            propertyType: (sp.property || "apartment") as PropertyType,
            area,
            options: sp.options ? sp.options.split(",").filter(Boolean) : [],
          }}
          user={user ? { name: user.name, phone: user.phone } : null}
        />
      </div>
    </div>
  );
}
