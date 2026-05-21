import { AppointmentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const user = await requireUser();
  const { id } = await params;

  await prisma.appointment.updateMany({
    where: {
      id,
      patientId: user.id,
      status: AppointmentStatus.SCHEDULED,
    },
    data: {
      status: AppointmentStatus.CANCELED,
    },
  });

  return NextResponse.redirect(new URL("/consultas", request.url));
}
