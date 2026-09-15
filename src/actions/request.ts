"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { currentUser, createSession, createUser } from "@/lib/auth";
import { cancelRequest, createRequest } from "@/lib/service";
import { type ActionState, bool, list, num, str, toMessage } from "@/lib/form";
import { SERVICE_MAP } from "@/lib/catalog";
import type { PropertyType, ServiceSlug } from "@/lib/types";

export async function createRequestAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const service = str(fd, "service") as ServiceSlug;
  if (!SERVICE_MAP[service]) return { error: "청소 종류를 선택해 주세요." };

  const region = str(fd, "region");
  const district = str(fd, "district");
  if (!region || !district) return { error: "지역을 선택해 주세요." };

  const preferredDate = str(fd, "preferredDate");
  if (!preferredDate) return { error: "희망 작업일을 선택해 주세요." };

  const contactName = str(fd, "contactName");
  const contactPhone = str(fd, "contactPhone");
  if (contactName.length < 2) return { error: "연락받으실 이름을 입력해 주세요." };
  if (!/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(contactPhone.replace(/\s/g, ""))) {
    return { error: "휴대폰 번호를 확인해 주세요." };
  }

  let user = await currentUser();

  // 비회원이면 요청서와 함께 간편 가입 처리
  if (!user) {
    const email = str(fd, "email");
    const password = str(fd, "password");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "이메일 형식이 올바르지 않습니다." };
    if (password.length < 8) return { error: "비밀번호는 8자 이상이어야 합니다." };
    try {
      user = createUser({ role: "customer", name: contactName, email, phone: contactPhone, password });
    } catch (err) {
      return { error: `${toMessage(err)} 로그인 후 다시 시도해 주세요.` };
    }
    await createSession(user.id);
  }

  if (user.role === "partner") {
    return { error: "업체 계정으로는 견적을 요청할 수 없습니다. 고객 계정으로 로그인해 주세요." };
  }

  let requestId: string;
  try {
    const req = createRequest({
      customerId: user.id,
      service,
      propertyType: (str(fd, "propertyType") || "apartment") as PropertyType,
      areaPyeong: Math.max(1, num(fd, "areaPyeong", 24)),
      region,
      district,
      addressDetail: str(fd, "addressDetail"),
      preferredDate,
      dateFlexible: bool(fd, "dateFlexible"),
      options: list(fd, "options"),
      description: str(fd, "description"),
      contactName,
      contactPhone,
    });
    requestId = req.id;
  } catch (err) {
    return { error: toMessage(err) };
  }

  revalidatePath("/my");
  redirect(`/my/requests/${requestId}?new=1`);
}

export async function cancelRequestAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const user = await currentUser();
  if (!user) return { error: "로그인이 필요합니다." };
  try {
    cancelRequest(str(fd, "requestId"), user.id);
  } catch (err) {
    return { error: toMessage(err) };
  }
  revalidatePath("/my");
  return { ok: true, message: "요청이 취소되었습니다." };
}
