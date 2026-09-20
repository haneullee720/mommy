"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { confirmAndSettle } from "@/lib/service";
import { type ActionState, num, str, toMessage } from "@/lib/form";
import type { PartnerStatus } from "@/lib/types";

export async function setPartnerStatusAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await requireUser("admin");
    const rows = await db()`
      update partners set status = ${str(fd, "status") as PartnerStatus}
      where id = ${str(fd, "partnerId")}
      returning id`;
    if (!rows[0]) throw new Error("PARTNER_NOT_FOUND");
  } catch (err) {
    return { error: toMessage(err) };
  }
  revalidatePath("/admin/partners");
  return { ok: true, message: "업체 상태를 변경했습니다." };
}

export async function updateSettingsAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    await requireUser("admin");
    const basic = num(fd, "basic", 15) / 100;
    const good = num(fd, "good", 12) / 100;
    const premium = num(fd, "premium", 10) / 100;
    if ([basic, good, premium].some((r) => r < 0 || r > 0.5)) {
      return { error: "수수료율은 0~50% 사이여야 합니다." };
    }
    const sql = db();
    await sql`
      update settings set
        fee_rates = ${sql.json({ basic, good, premium })},
        escrow_hold_days = ${Math.max(0, num(fd, "escrowHoldDays", 3))},
        auto_confirm_days = ${Math.max(1, num(fd, "autoConfirmDays", 7))}
      where id = 1`;
  } catch (err) {
    return { error: toMessage(err) };
  }
  revalidatePath("/admin/settings");
  return { ok: true, message: "정책이 저장되었습니다. 신규 계약부터 적용됩니다." };
}

export async function forceSettleAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  try {
    const admin = await requireUser("admin");
    await confirmAndSettle(str(fd, "orderId"), admin.id, true);
  } catch (err) {
    return { error: toMessage(err) };
  }
  revalidatePath("/admin/orders");
  return { ok: true, message: "정산 처리되었습니다." };
}
