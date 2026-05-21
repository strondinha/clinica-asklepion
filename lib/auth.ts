import { Role, type User } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "asklepion_session";

type SessionPayload = {
  userId: string;
  role: Role;
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET não configurado.");
  }

  return secret;
}

export function normalizeCpf(rawCpf: string) {
  return rawCpf.replace(/\D/g, "");
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function createSessionToken(payload: SessionPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const cookieStore = await cookies();
  const token = createSessionToken(payload);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getSessionPayload() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function getCurrentUser() {
  const payload = await getSessionPayload();

  if (!payload) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      cpf: true,
      role: true,
    },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== Role.ADMIN) {
    redirect("/consultas");
  }

  return user;
}

export async function authenticateByCpfAndPassword(cpf: string, password: string): Promise<User | null> {
  const normalizedCpf = normalizeCpf(cpf);
  const user = await prisma.user.findUnique({ where: { cpf: normalizedCpf } });

  if (!user) {
    return null;
  }

  const isValidPassword = await verifyPassword(password, user.passwordHash);
  return isValidPassword ? user : null;
}
