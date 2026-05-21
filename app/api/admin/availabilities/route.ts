import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  await requireAdmin();

  const formData = await request.formData();
  const doctorId = String(formData.get("doctorId") ?? "").trim();
  const weekday = Number(formData.get("weekday") ?? "");
  const time = String(formData.get("time") ?? "").trim();

  if (!doctorId || Number.isNaN(weekday) || !time) {
    return NextResponse.redirect(new URL("/admin?error=missing_fields", request.url));
  }

  await prisma.doctorAvailability.create({
    data: {
      doctorId,
      weekday,
      time,
    },
  });

  return NextResponse.redirect(new URL("/admin?success=availability_created", request.url));
}
