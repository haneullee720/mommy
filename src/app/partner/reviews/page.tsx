import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentPartner } from "@/lib/auth";
import { getUsersByIds, listReviewsByPartner } from "@/lib/service";
import { dateFull } from "@/lib/format";
import { EmptyState, Stars } from "@/components/ui";
import { ReviewReplyForm } from "@/components/review-reply";

export const metadata: Metadata = { title: "후기 관리" };
export const dynamic = "force-dynamic";

export default async function PartnerReviewsPage() {
  const ctx = await currentPartner();
  if (!ctx) redirect("/partner-signup");

  const allReviews = await listReviewsByPartner(ctx.partner.id);
  const reviews = allReviews.slice(0, 25);
  const authors = await getUsersByIds(reviews.map((r) => r.customerId));
  const avg = (key: "kindness" | "detail" | "punctuality") =>
    allReviews.length ? (allReviews.reduce((s, r) => s + r.scores[key], 0) / allReviews.length).toFixed(1) : "-";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-extrabold text-ink-900">후기 관리</h1>
        <p className="mt-1 text-sm text-ink-500">답변을 남기면 신뢰도가 올라가고, 다음 고객의 선택 확률이 높아집니다.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        <div className="card p-5">
          <p className="text-[12.5px] font-semibold text-ink-400">종합 평점</p>
          <p className="tnum mt-1.5 text-[21px] font-extrabold text-ink-900">{ctx.partner.rating.toFixed(1)}</p>
          <div className="mt-1">
            <Stars rating={ctx.partner.rating} />
          </div>
        </div>
        {[
          ["친절도", avg("kindness")],
          ["꼼꼼함", avg("detail")],
          ["시간 준수", avg("punctuality")],
        ].map(([k, v]) => (
          <div key={k} className="card p-5">
            <p className="text-[12.5px] font-semibold text-ink-400">{k}</p>
            <p className="tnum mt-1.5 text-[21px] font-extrabold text-ink-900">{v}</p>
          </div>
        ))}
      </div>

      {allReviews.length === 0 ? (
        <EmptyState icon="⭐" title="아직 후기가 없습니다" desc="첫 작업을 완료하면 고객이 후기를 남길 수 있습니다." />
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => {
            const author = authors.get(r.customerId);
            return (
              <li key={r.id} className="card p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Stars rating={r.rating} size={15} />
                  <span className="tnum text-[13px] font-bold text-ink-900">{r.rating.toFixed(1)}</span>
                  <span className="text-[12.5px] text-ink-400">
                    {author ? `${author.name.slice(0, 1)}**` : "고객"} 님
                  </span>
                  <span className="tnum ml-auto text-[12px] text-ink-400">{dateFull(r.createdAt)}</span>
                </div>
                <p className="mt-2.5 whitespace-pre-line text-[14px] leading-relaxed text-ink-700">{r.content}</p>
                <div className="tnum mt-3 flex flex-wrap gap-3 text-[12px] text-ink-500">
                  <span>친절 {r.scores.kindness}</span>
                  <span>꼼꼼 {r.scores.detail}</span>
                  <span>시간 {r.scores.punctuality}</span>
                </div>
                {r.reply ? (
                  <div className="mt-3 rounded-xl border-l-2 border-brand-400 bg-brand-50/60 p-3.5">
                    <p className="text-[12px] font-bold text-brand-700">내 답변</p>
                    <p className="mt-1 text-[13.5px] text-ink-700">{r.reply}</p>
                  </div>
                ) : (
                  <ReviewReplyForm reviewId={r.id} />
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
