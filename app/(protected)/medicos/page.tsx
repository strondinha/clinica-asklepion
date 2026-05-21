import { requireUser } from "@/lib/auth";
import { weekdayLabel } from "@/lib/date";
import { prisma } from "@/lib/prisma";

export default async function MedicosPage() {
  await requireUser();

  const doctors = await prisma.doctor.findMany({
    include: {
      specialty: true,
      availabilities: {
        orderBy: [{ weekday: "asc" }, { time: "asc" }],
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <section>
      <h2 className="text-2xl font-semibold text-[#1d5f97]">Médicos e Especialidades</h2>
      <p className="mt-1 text-sm text-slate-600">Conheça os profissionais, salas e horários disponíveis.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {doctors.map((doctor) => (
          <article key={doctor.id} className="rounded-xl bg-white p-5 shadow">
            <h3 className="text-lg font-semibold text-slate-800">{doctor.name}</h3>
            <p className="text-sm text-[#1d5f97]">{doctor.specialty.name}</p>
            <p className="mt-1 text-sm text-slate-600">Sala {doctor.room}</p>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              {doctor.availabilities.map((availability) => (
                <p key={availability.id}>
                  <strong>{weekdayLabel(availability.weekday)}:</strong> {availability.time}
                </p>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
