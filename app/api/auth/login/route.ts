import { NextResponse } from "next/server";
import { authenticateByCpfAndPassword, normalizeCpf, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const cpf = String(formData.get("cpf") ?? "").trim();
  const password = String(formData.get("password") ?? "").trim();

  if (!cpf || !password) {
    return NextResponse.redirect(new URL("/login?error=missing_fields", request.url));
  }

  const user = await authenticateByCpfAndPassword(normalizeCpf(cpf), password);

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=invalid_credentials", request.url));
  }

  await setSessionCookie({ userId: user.id, role: user.role });

  return NextResponse.redirect(new URL("/consultas", request.url));
}
