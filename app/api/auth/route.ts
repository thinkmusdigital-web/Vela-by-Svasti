import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  verifyPassword,
  signSession,
  SESSION_COOKIE,
  sessionCookieOptions,
  destroySession,
} from "@/lib/auth";
import { clientIp, json, jsonError, assertSameOrigin, readJson } from "@/lib/http";
import { consume, RATE_LIMITS } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validate";

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) return jsonError("Invalid request", 400);

  const ip = clientIp(request);
  const limited = consume(`login:${ip}`, RATE_LIMITS.login);
  if (!limited.ok) {
    return jsonError("Too many attempts. Please try again later.", 429, {
      retryAfter: limited.retryAfterSec,
    });
  }

  const body = await readJson(request);
  const parsed = loginSchema.safeParse(body ?? {});
  if (!parsed.success) {
    return jsonError("Invalid email or password.", 400);
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: { role: true },
  });

  if (!user || !user.active) {
    return jsonError("Invalid email or password.", 401);
  }

  const passwordOk = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!passwordOk) {
    return jsonError("Invalid email or password.", 401);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const token = await signSession({
    sub: user.id,
    role: user.role.name,
    name: user.name,
    email: user.email,
  });

  const response = NextResponse.json({
    ok: true,
    user: { name: user.name, email: user.email, role: user.role.name },
  });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
  return response;
}

export async function DELETE() {
  await destroySession();
  return json({ ok: true });
}