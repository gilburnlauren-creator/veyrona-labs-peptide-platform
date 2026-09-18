import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";

import { databaseConfigured, getSql } from "@/db/client.server";

const COOKIE = "vl_admin";
const SESSION_DAYS = 7;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `scrypt:${salt}:${scryptSync(password, salt, 64).toString("hex")}`;
}

export function verifyPassword(password: string, stored: string) {
  const [scheme, salt, hash] = stored.split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

function readCookie(name: string) {
  const header = getRequestHeader("cookie") ?? "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return null;
}

function writeCookie(value: string, maxAgeSeconds: number) {
  const secure = process.env["NODE_ENV"] === "production" ? " Secure;" : "";
  setResponseHeader(
    "set-cookie",
    `${COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax;${secure} Max-Age=${maxAgeSeconds}`,
  );
}

export async function login(email: string, password: string) {
  if (!databaseConfigured()) return { ok: false as const, error: "Database not connected." };
  const sql = getSql();
  const rows = await sql<{ id: number; password_hash: string }[]>`
    SELECT id, password_hash FROM admin_users WHERE lower(email) = ${email.trim().toLowerCase()} LIMIT 1`;
  const admin = rows[0];
  if (!admin || !verifyPassword(password, admin.password_hash)) {
    return { ok: false as const, error: "Wrong email or password." };
  }
  const id = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + SESSION_DAYS * 864e5);
  await sql`INSERT INTO admin_sessions (id, admin_id, expires_at) VALUES (${id}, ${admin.id}, ${expires})`;
  writeCookie(id, SESSION_DAYS * 86400);
  return { ok: true as const };
}

export async function logout() {
  const id = readCookie(COOKIE);
  if (id && databaseConfigured()) {
    await getSql()`DELETE FROM admin_sessions WHERE id = ${id}`;
  }
  writeCookie("", 0);
}

export async function currentAdmin() {
  if (!databaseConfigured()) return null;
  const id = readCookie(COOKIE);
  if (!id) return null;
  const rows = await getSql()<{ email: string }[]>`
    SELECT u.email FROM admin_sessions s
    JOIN admin_users u ON u.id = s.admin_id
    WHERE s.id = ${id} AND s.expires_at > now() LIMIT 1`;
  return rows[0] ?? null;
}

export async function requireAdmin() {
  const admin = await currentAdmin();
  if (!admin) throw new Error("UNAUTHORIZED");
  return admin;
}
