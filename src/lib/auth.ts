import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { db, toPartner, toUser, uid } from "./db";
import type { Partner, Role, User } from "./types";

const COOKIE = "cm_session";
const SESSION_DAYS = 14;

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")): string {
  const hash = crypto.scryptSync(password, salt, 32).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(password, salt, 32).toString("hex");
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(candidate, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function createSession(userId: string): Promise<void> {
  const token = crypto.randomBytes(24).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);

  const sql = db();
  await sql`delete from sessions where expires_at < now()`;
  await sql`
    insert into sessions (token, user_id, expires_at)
    values (${token}, ${userId}, ${expires})`;

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await db()`delete from sessions where token = ${token}`;
  jar.delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;

  const rows = await db()`
    select u.* from sessions s
    join users u on u.id = s.user_id
    where s.token = ${token} and s.expires_at > now()`;
  return rows[0] ? toUser(rows[0]) : null;
}

export async function requireUser(role?: Role | Role[]): Promise<User> {
  const user = await currentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  if (role) {
    const roles = Array.isArray(role) ? role : [role];
    if (!roles.includes(user.role)) throw new Error("FORBIDDEN");
  }
  return user;
}

export async function currentPartner(): Promise<{ user: User; partner: Partner } | null> {
  const user = await currentUser();
  if (!user || user.role !== "partner") return null;
  const rows = await db()`select * from partners where user_id = ${user.id}`;
  return rows[0] ? { user, partner: toPartner(rows[0]) } : null;
}

export async function createUser(input: {
  role: Role;
  name: string;
  email: string;
  phone: string;
  password: string;
}): Promise<User> {
  try {
    const rows = await db()`
      insert into users (id, role, name, email, phone, password_hash)
      values (
        ${uid("usr")}, ${input.role}, ${input.name}, ${input.email.toLowerCase()},
        ${input.phone}, ${hashPassword(input.password)}
      )
      returning *`;
    return toUser(rows[0]);
  } catch (err) {
    // unique_violation — 이미 가입된 이메일
    if (typeof err === "object" && err !== null && (err as { code?: string }).code === "23505") {
      throw new Error("EMAIL_TAKEN");
    }
    throw err;
  }
}
