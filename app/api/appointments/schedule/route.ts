import { AppointmentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const user = await requireUser();
  const formData = await request.formData();

  const specialtyId = String(formData.get("specialtyId") ?? "").trim();
  const doctorId = String(formData.get("doctorId") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();

  const searchParams = new URLSearchParams({ specialtyId, doctorId, date });

  if (!specialtyId || !doctorId || !date || !time) {
    searchParams.set("error", "missing_fields");
    return NextResponse.redirect(new URL(`/agendar?${searchParams.toString()}`, request.url));
  }

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  const startsAt = new Date(year, (month ?? 1) - 1, day ?? 1, hour ?? 0, minute ?? 0, 0, 0);

  if (Number.isNaN(startsAt.getTime())) {
    searchParams.set("error", "invalid_date");
    return NextResponse.redirect(new URL(`/agendar?${searchParams.toString()}`, request.url));
  }

  const weekday = startsAt.getDay();

  const availability = await prisma.doctorAvailability.findUnique({
    where: {
      doctorId_weekday_time: {
        doctorId,
        weekday,
        time,
      },
    },
  });

  if (!availability) {
    searchParams.set("error", "invalid_slot");
    return NextResponse.redirect(new URL(`/agendar?${searchParams.toString()}`, request.url));
  }

  const occupiedSlot = await prisma.appointment.findFirst({
    where: {
      doctorId,
      startsAt,
      status: AppointmentStatus.SCHEDULED,
    },
  });

  if (occupiedSlot) {
    searchParams.set("error", "occupied_slot");
    return NextResponse.redirect(new URL(`/agendar?${searchParams.toString()}`, request.url));
  }

  await prisma.appointment.create({
    data: {
      patientId: user.id,
      doctorId,
      startsAt,
      status: AppointmentStatus.SCHEDULED,
    },
  });

  searchParams.set("success", "scheduled");
  return NextResponse.redirect(new URL(`/agendar?${searchParams.toString()}`, request.url));
}
