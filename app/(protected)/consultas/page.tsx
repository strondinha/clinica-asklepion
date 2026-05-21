import { AppointmentStatus } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { formatDateTime } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export default async function ConsultasPage() {
  const user = await requireUser();

  const appointments = await prisma.appointment.findMany({
    where: { patientId: user.id },
    include: {
      doctor: {
        include: {
          specialty: true,
        },
      },
    },
    orderBy: { startsAt: "asc" },
  });

  return (
    <section>
      <h2 className="text-2xl font-semibold text-[#1d5f97]">Minhas Consultas</h2>
      <p className="mt-1 text-sm text-slate-600">Consulte e desmarque seus agendamentos.</p>

      <div className="mt-6 space-y-3">
        {appointments.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-slate-600 shadow">Nenhuma consulta encontrada.</p>
        ) : (
          appointments.map((appointment) => {
            const isCanceled = appointment.status === AppointmentStatus.CANCELED;

            return (
              <article key={appointment.id} className="rounded-xl bg-white p-5 shadow">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">{appointment.doctor.name}</h3>
                    <p className="text-sm text-slate-600">{appointment.doctor.specialty.name}</p>
                    <p className="mt-1 text-sm text-slate-600">Sala {appointment.doctor.room}</p>
                    <p className="mt-2 text-sm font-medium text-[#1d5f97]">{formatDateTime(appointment.startsAt)}</p>
                    <p className={`mt-1 text-xs font-semibold ${isCanceled ? "text-red-600" : "text-emerald-600"}`}>
                      {isCanceled ? "Cancelada" : "Agendada"}
                    </p>
                  </div>

                  {!isCanceled ? (
                    <form action={`/api/appointments/${appointment.id}/cancel`} method="POST">
                      <button type="submit" className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700">
                        Desmarcar
                      </button>
                    </form>
                  ) : null}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
