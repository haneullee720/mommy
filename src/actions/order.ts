"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { currentUser } from "@/lib/auth";
import { acceptQuote, confirmAndSettle, createReview, payOrder } from "@/lib/service";
import { type ActionState, num, str, toMessage } from "@/lib/form";

export async function acceptQuoteAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await currentUser();
  if (!user) redirect("/login?next=/my");

  const requestId = str(fd, "requestId");
  let orderId: string;
  try {
    const order = await acceptQuote(requestId, str(fd, "quoteId"), user.id);
    orderId = order.id;
  } catch (err) {
    return { error: toMessage(err) };
  }
  revalidatePath(`/my/requests/${requestId}`);
  redirect(`/my/pay/${orderId}`);
}

export async function payOrderAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await currentUser();
  if (!user) redirect("/login?next=/my");

  const orderId = str(fd, "orderId");
  try {
    await payOrder(orderId, user.id, str(fd, "method") || "card");
  } catch (err) {
    return { error: toMessage(err) };
  }
  revalidatePath("/my");
  redirect(`/my/orders/${orderId}?paid=1`);
}

export async function confirmOrderAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await currentUser();
  if (!user) return { error: "로그인이 필요합니다." };
  try {
    await confirmAndSettle(str(fd, "orderId"), user.id, user.role === "admin");
  } catch (err) {
    return { error: toMessage(err) };
  }
  revalidatePath("/my");
  revalidatePath("/partner");
  revalidatePath("/admin");
  return { ok: true, message: "작업을 확인했습니다. 업체 정산이 진행됩니다." };
}

export async function reviewAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await currentUser();
  if (!user) return { error: "로그인이 필요합니다." };
  const content = str(fd, "content");
  if (content.length < 10) return { error: "후기를 10자 이상 남겨주세요." };
  try {
    await createReview({
      orderId: str(fd, "orderId"),
      customerId: user.id,
      rating: num(fd, "rating", 5),
      scores: {
        kindness: num(fd, "kindness", 5),
        detail: num(fd, "detail", 5),
        punctuality: num(fd, "punctuality", 5),
      },
      content,
    });
  } catch (err) {
    return { error: toMessage(err) };
  }
  revalidatePath("/my");
  return { ok: true, message: "후기가 등록되었습니다. 감사합니다!" };
}
