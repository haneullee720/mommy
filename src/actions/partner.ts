"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { currentPartner } from "@/lib/auth";
import { replyToReview, reportDone, startWork, submitQuote } from "@/lib/service";
import { type ActionState, list, num, str, toMessage } from "@/lib/form";

export async function submitQuoteAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await currentPartner();
  if (!ctx) redirect("/login?next=/partner");
  if (ctx.partner.status !== "approved") return { error: "심사 승인 후 견적을 제출할 수 있습니다." };

  const amount = num(fd, "amount");
  if (amount < 10000) return { error: "견적 금액을 확인해 주세요. (최소 10,000원)" };
  const availableDate = str(fd, "availableDate");
  if (!availableDate) return { error: "작업 가능일을 선택해 주세요." };
  const message = str(fd, "message");
  if (message.length < 10) return { error: "고객에게 전할 메시지를 10자 이상 작성해 주세요." };

  const requestId = str(fd, "requestId");
  try {
    await submitQuote({
      requestId,
      partnerId: ctx.partner.id,
      amount,
      crewSize: Math.max(1, num(fd, "crewSize", 2)),
      workHours: Math.max(1, num(fd, "workHours", 4)),
      availableDate,
      includes: list(fd, "includes"),
      message,
      warrantyDays: Math.max(7, num(fd, "warrantyDays", 7)),
    });
  } catch (err) {
    return { error: toMessage(err) };
  }

  revalidatePath("/partner");
  redirect("/partner/quotes?sent=1");
}

export async function startWorkAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await currentPartner();
  if (!ctx) return { error: "로그인이 필요합니다." };
  try {
    await startWork(str(fd, "orderId"), ctx.partner.id);
  } catch (err) {
    return { error: toMessage(err) };
  }
  revalidatePath("/partner");
  revalidatePath("/my");
  return { ok: true, message: "작업 시작이 기록되었습니다." };
}

export async function reportDoneAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await currentPartner();
  if (!ctx) return { error: "로그인이 필요합니다." };
  try {
    await reportDone(str(fd, "orderId"), ctx.partner.id);
  } catch (err) {
    return { error: toMessage(err) };
  }
  revalidatePath("/partner");
  revalidatePath("/my");
  return { ok: true, message: "작업 완료를 보고했습니다. 고객 확인 후 정산됩니다." };
}

export async function replyReviewAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const ctx = await currentPartner();
  if (!ctx) return { error: "로그인이 필요합니다." };
  const reply = str(fd, "reply");
  if (reply.length < 5) return { error: "답변을 5자 이상 작성해 주세요." };
  try {
    await replyToReview(str(fd, "reviewId"), ctx.partner.id, reply);
  } catch (err) {
    return { error: toMessage(err) };
  }
  revalidatePath("/partner/reviews");
  return { ok: true, message: "답변이 등록되었습니다." };
}
