import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  await requireAdmin();

  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const room = String(formData.get("room") ?? "").trim();
  const specialtyId = String(formData.get("specialtyId") ?? "").trim();
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim();

  if (!name || !room || !specialtyId) {
    return NextResponse.redirect(new URL("/admin?error=missing_fields", request.url));
  }

  await prisma.doctor.create({
    data: {
      name,
      room,
      specialtyId,
      avatarUrl: avatarUrl || null,
    },
  });

  return NextResponse.redirect(new URL("/admin?success=doctor_created", request.url));
}
