import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { hashPassword, normalizeCpf, setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const formData = await request.formData();

  const name = String(formData.get("name") ?? "").trim();
  const cpf = normalizeCpf(String(formData.get("cpf") ?? "").trim());
  const password = String(formData.get("password") ?? "").trim();

  if (!name || !cpf || !password) {
    return NextResponse.redirect(new URL("/register?error=missing_fields", request.url));
  }

  if (password.length < 6) {
    return NextResponse.redirect(new URL("/register?error=password_short", request.url));
  }

  try {
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        cpf,
        passwordHash,
      },
    });

    await setSessionCookie({ userId: user.id, role: user.role });

    return NextResponse.redirect(new URL("/consultas", request.url));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.redirect(new URL("/register?error=cpf_taken", request.url));
    }

    throw error;
  }
}
