import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { mutate, readDB, uid } from "./db";
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
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 864e5);
  mutate((db) => {
    db.sessions = db.sessions.filter((s) => new Date(s.expiresAt) > now);
    db.sessions.push({ token, userId, createdAt: now.toISOString(), expiresAt: expires.toISOString() });
  });
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
  if (token) mutate((db) => { db.sessions = db.sessions.filter((s) => s.token !== token); });
  jar.delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const db = readDB();
  const session = db.sessions.find((s) => s.token === token);
  if (!session || new Date(session.expiresAt) < new Date()) return null;
  return db.users.find((u) => u.id === session.userId) ?? null;
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
  const partner = readDB().partners.find((p) => p.userId === user.id);
  return partner ? { user, partner } : null;
}

export function createUser(input: {
  role: Role;
  name: string;
  email: string;
  phone: string;
  password: string;
}): User {
  return mutate((db) => {
    if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
      throw new Error("EMAIL_TAKEN");
    }
    const user: User = {
      id: uid("usr"),
      role: input.role,
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      passwordHash: hashPassword(input.password),
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    return user;
  });
}
