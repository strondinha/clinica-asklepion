import { requireUser } from "@/lib/auth";
import { getIsoDate, weekdayLabel } from "@/lib/date";
import { prisma } from "@/lib/prisma";

type AgendarPageProps = {
  searchParams: Promise<{ specialtyId?: string; doctorId?: string; date?: string; error?: string; success?: string }>;
};

const MESSAGES: Record<string, string> = {
  missing_fields: "Selecione especialidade, médico, data e horário.",
  invalid_slot: "O horário não está disponível para este médico.",
  occupied_slot: "Este horário já foi ocupado. Escolha outro.",
  invalid_date: "Data inválida para agendamento.",
  scheduled: "Consulta agendada com sucesso!",
};

export default async function AgendarPage({ searchParams }: AgendarPageProps) {
  await requireUser();

  const params = await searchParams;
  const specialties = await prisma.specialty.findMany({ orderBy: { name: "asc" } });
  const selectedSpecialtyId = params.specialtyId ?? specialties[0]?.id;
  const doctors = selectedSpecialtyId
    ? await prisma.doctor.findMany({
        where: { specialtyId: selectedSpecialtyId },
        orderBy: { name: "asc" },
      })
    : [];

  const selectedDoctorId = params.doctorId ?? doctors[0]?.id;
  const selectedDate = params.date ?? getIsoDate(new Date());
  const selectedDateObj = new Date(`${selectedDate}T00:00:00`);
  const weekday = selectedDateObj.getDay();

  const availabilities = selectedDoctorId
    ? await prisma.doctorAvailability.findMany({
        where: { doctorId: selectedDoctorId, weekday },
        orderBy: { time: "asc" },
      })
    : [];

  return (
    <section>
      <h2 className="text-2xl font-semibold text-[#1d5f97]">Agendar Nova Consulta</h2>
      <p className="mt-1 text-sm text-slate-600">Escolha especialidade, médico e horário disponível.</p>

      {params.error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{MESSAGES[params.error] ?? "Não foi possível agendar."}</p> : null}
      {params.success ? <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{MESSAGES[params.success] ?? "Consulta confirmada."}</p> : null}

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl bg-white p-5 shadow">
          <h3 className="text-lg font-semibold text-slate-800">1. Selecionar opções</h3>
          <form method="GET" className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Especialidade</span>
              <select name="specialtyId" defaultValue={selectedSpecialtyId} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                {specialties.map((specialty) => (
                  <option key={specialty.id} value={specialty.id}>
                    {specialty.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Médico</span>
              <select name="doctorId" defaultValue={selectedDoctorId} className="w-full rounded-lg border border-slate-300 px-3 py-2">
                {doctors.length === 0 ? <option>Nenhum médico disponível</option> : null}
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name} (Sala {doctor.room})
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Data</span>
              <input name="date" type="date" defaultValue={selectedDate} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
            </label>

            <button type="submit" className="rounded-lg bg-[#1d5f97] px-4 py-2 font-semibold text-white hover:bg-[#154b78]">
              Buscar horários
            </button>
          </form>
        </div>

        <div className="rounded-xl bg-white p-5 shadow">
          <h3 className="text-lg font-semibold text-slate-800">2. Confirmar horário</h3>
          <p className="mt-1 text-sm text-slate-600">
            Dia selecionado: <strong>{selectedDateObj.toLocaleDateString("pt-BR")}</strong> ({weekdayLabel(weekday)})
          </p>

          <form action="/api/appointments/schedule" method="POST" className="mt-4 space-y-4">
            <input type="hidden" name="specialtyId" value={selectedSpecialtyId ?? ""} />
            <input type="hidden" name="doctorId" value={selectedDoctorId ?? ""} />
            <input type="hidden" name="date" value={selectedDate} />

            <label className="block">
              <span className="mb-1 block text-sm font-medium">Horário</span>
              <select name="time" required className="w-full rounded-lg border border-slate-300 px-3 py-2">
                <option value="">Selecione...</option>
                {availabilities.map((slot) => (
                  <option key={slot.id} value={slot.time}>
                    {slot.time}
                  </option>
                ))}
              </select>
            </label>

            {availabilities.length === 0 ? <p className="text-sm text-slate-600">Sem horários para este dia.</p> : null}

            <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700">
              Confirmar consulta
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
