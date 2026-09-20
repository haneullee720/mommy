"use server";

import { redirect } from "next/navigation";
import { db, uid } from "@/lib/db";
import { createSession, createUser, destroySession, verifyPassword } from "@/lib/auth";
import { type ActionState, bool, list, num, str, toMessage } from "@/lib/form";
import type { ServiceSlug } from "@/lib/types";

export async function loginAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");
  const next = str(fd, "next");

  const rows = await db()`select id, role, password_hash from users where email = ${email}`;
  const user = rows[0];
  if (!user || !verifyPassword(password, user.passwordHash as string)) {
    return { error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }
  await createSession(user.id as string);
  redirect(next || defaultHome(user.role as string));
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
    const user = await createUser({ role: "customer", name, email, phone, password });
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
    const user = await createUser({ role: "partner", name, email, phone, password });
    userId = user.id;
  } catch (err) {
    return { error: toMessage(err) };
  }

  const sql = db();
  await sql`
    insert into partners (
      id, user_id, company_name, biz_no, ceo_name, regions, services, intro, since,
      crew_size, has_insurance, certifications, status, tier, response_minutes, bank_account
    ) values (
      ${uid("ptn")}, ${userId}, ${companyName}, ${bizNo}, ${name}, ${regions}, ${services},
      ${str(fd, "intro")}, ${num(fd, "since", new Date().getFullYear())}, ${num(fd, "crewSize", 2)},
      ${bool(fd, "hasInsurance")}, ${list(fd, "certifications")}, 'pending', 'basic', 60,
      ${sql.json({
        bank: str(fd, "bank"),
        number: str(fd, "bankNumber"),
        holder: str(fd, "bankHolder") || companyName,
      })}
    )`;

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
