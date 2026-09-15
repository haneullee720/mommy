"use server";

import { redirect } from "next/navigation";
import { readDB, mutate, uid } from "@/lib/db";
import { createSession, createUser, destroySession, verifyPassword } from "@/lib/auth";
import { type ActionState, bool, list, num, str, toMessage } from "@/lib/form";
import { DEFAULT_FEE_RATES } from "@/lib/fees";
import type { Partner, ServiceSlug } from "@/lib/types";

export async function loginAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  const next = str(fd, "next");

  const user = readDB().users.find((u) => u.email === email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }
  await createSession(user.id);
  redirect(next || defaultHome(user.role));
}

export async function signupAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const name = str(fd, "name");
  const email = str(fd, "email");
  const phone = str(fd, "phone");
  const password = str(fd, "password");
  const next = str(fd, "next");

  if (name.length < 2) return { error: "이름을 2자 이상 입력해 주세요." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "이메일 형식이 올바르지 않습니다." };
  if (!/^0\d{1,2}-?\d{3,4}-?\d{4}$/.test(phone.replace(/\s/g, ""))) return { error: "휴대폰 번호를 확인해 주세요." };
  if (password.length < 8) return { error: "비밀번호는 8자 이상이어야 합니다." };

  let userId: string;
  try {
    const user = createUser({ role: "customer", name, email, phone, password });
    userId = user.id;
  } catch (err) {
    return { error: toMessage(err) };
  }
  await createSession(userId);
  redirect(next || "/my");
}

export async function partnerSignupAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const name = str(fd, "ceoName");
  const email = str(fd, "email");
  const phone = str(fd, "phone");
  const password = str(fd, "password");
  const companyName = str(fd, "companyName");
  const bizNo = str(fd, "bizNo");
  const regions = list(fd, "regions");
  const services = list(fd, "services") as ServiceSlug[];

  if (!companyName) return { error: "업체명을 입력해 주세요." };
  if (!/^\d{3}-?\d{2}-?\d{5}$/.test(bizNo)) return { error: "사업자등록번호 10자리를 확인해 주세요." };
  if (name.length < 2) return { error: "대표자명을 입력해 주세요." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "이메일 형식이 올바르지 않습니다." };
  if (password.length < 8) return { error: "비밀번호는 8자 이상이어야 합니다." };
  if (regions.length === 0) return { error: "서비스 가능 지역을 1곳 이상 선택해 주세요." };
  if (services.length === 0) return { error: "가능한 청소 종류를 1개 이상 선택해 주세요." };

  let userId: string;
  try {
    const user = createUser({ role: "partner", name, email, phone, password });
    userId = user.id;
  } catch (err) {
    return { error: toMessage(err) };
  }

  mutate((db) => {
    const partner: Partner = {
      id: uid("ptn"),
      userId,
      companyName,
      bizNo,
      ceoName: name,
      regions,
      services,
      intro: str(fd, "intro"),
      since: num(fd, "since", new Date().getFullYear()),
      crewSize: num(fd, "crewSize", 2),
      hasInsurance: bool(fd, "hasInsurance"),
      certifications: list(fd, "certifications"),
      status: "pending",
      tier: "basic",
      rating: 0,
      reviewCount: 0,
      completedJobs: 0,
      responseMinutes: 60,
      bankAccount: { bank: str(fd, "bank"), number: str(fd, "bankNumber"), holder: str(fd, "bankHolder") || companyName },
      createdAt: new Date().toISOString(),
    };
    db.partners.push(partner);
    if (!db.settings?.feeRates) db.settings = { feeRates: { ...DEFAULT_FEE_RATES }, escrowHoldDays: 3, autoConfirmDays: 7 };
  });

  await createSession(userId);
  redirect("/partner");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

function defaultHome(role: string): string {
  if (role === "partner") return "/partner";
  if (role === "admin") return "/admin";
  return "/my";
}
