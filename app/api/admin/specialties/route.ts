import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  await requireAdmin();

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    return NextResponse.redirect(new URL("/admin?error=missing_fields", request.url));
  }

  await prisma.specialty.create({ data: { name } });

  return NextResponse.redirect(new URL("/admin?success=specialty_created", request.url));
}
