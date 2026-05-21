import { requireAdmin } from "@/lib/auth";
import { weekdayLabel } from "@/lib/date";
import { prisma } from "@/lib/prisma";

type AdminPageProps = {
  searchParams: Promise<{ success?: string; error?: string }>;
};

const MESSAGES: Record<string, string> = {
  specialty_created: "Especialidade cadastrada com sucesso.",
  doctor_created: "Médico cadastrado com sucesso.",
  availability_created: "Disponibilidade cadastrada com sucesso.",
  missing_fields: "Preencha os campos obrigatórios.",
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdmin();

  const params = await searchParams;

  const [specialties, doctors] = await Promise.all([
    prisma.specialty.findMany({ orderBy: { name: "asc" } }),
    prisma.doctor.findMany({ include: { specialty: true }, orderBy: { name: "asc" } }),
  ]);

  const availabilities = await prisma.doctorAvailability.findMany({
    include: { doctor: true },
    orderBy: [{ weekday: "asc" }, { time: "asc" }],
  });

  return (
    <section>
      <h2 className="text-2xl font-semibold text-[#1d5f97]">Admin / Atendente</h2>
      <p className="mt-1 text-sm text-slate-600">Cadastre especialidades, médicos e disponibilidades.</p>

      {params.success ? <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{MESSAGES[params.success] ?? "Cadastro realizado."}</p> : null}
      {params.error ? <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{MESSAGES[params.error] ?? "Erro ao cadastrar."}</p> : null}

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <form action="/api/admin/specialties" method="POST" className="rounded-xl bg-white p-5 shadow space-y-3">
          <h3 className="text-lg font-semibold text-slate-800">Nova Especialidade</h3>
          <input name="name" type="text" required placeholder="Ex.: Cardiologia" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          <button type="submit" className="rounded-lg bg-[#1d5f97] px-4 py-2 font-semibold text-white hover:bg-[#154b78]">
            Cadastrar
          </button>
        </form>

        <form action="/api/admin/doctors" method="POST" className="rounded-xl bg-white p-5 shadow space-y-3">
          <h3 className="text-lg font-semibold text-slate-800">Novo Médico</h3>
          <input name="name" type="text" required placeholder="Nome" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          <input name="room" type="text" required placeholder="Sala" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          <input name="avatarUrl" type="url" placeholder="URL do avatar (opcional)" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          <select name="specialtyId" required className="w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="">Especialidade</option>
            {specialties.map((specialty) => (
              <option key={specialty.id} value={specialty.id}>
                {specialty.name}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-lg bg-[#1d5f97] px-4 py-2 font-semibold text-white hover:bg-[#154b78]">
            Cadastrar
          </button>
        </form>

        <form action="/api/admin/availabilities" method="POST" className="rounded-xl bg-white p-5 shadow space-y-3">
          <h3 className="text-lg font-semibold text-slate-800">Nova Disponibilidade</h3>
          <select name="doctorId" required className="w-full rounded-lg border border-slate-300 px-3 py-2">
            <option value="">Médico</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name}
              </option>
            ))}
          </select>
          <select name="weekday" required className="w-full rounded-lg border border-slate-300 px-3 py-2">
            {Array.from({ length: 7 }).map((_, weekday) => (
              <option key={weekday} value={weekday}>
                {weekdayLabel(weekday)}
              </option>
            ))}
          </select>
          <input name="time" type="time" required className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          <button type="submit" className="rounded-lg bg-[#1d5f97] px-4 py-2 font-semibold text-white hover:bg-[#154b78]">
            Cadastrar
          </button>
        </form>
      </div>

      <div className="mt-8 rounded-xl bg-white p-5 shadow">
        <h3 className="text-lg font-semibold text-slate-800">Dados cadastrados</h3>
        <div className="mt-3 space-y-4 text-sm">
          <div>
            <p className="font-semibold text-slate-700">Médicos</p>
            <ul className="mt-1 list-disc pl-5 text-slate-600">
              {doctors.map((doctor) => (
                <li key={doctor.id}>
                  {doctor.name} — {doctor.specialty.name} (Sala {doctor.room})
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-semibold text-slate-700">Disponibilidades</p>
            <ul className="mt-1 list-disc pl-5 text-slate-600">
              {availabilities.map((slot) => (
                <li key={slot.id}>
                  {slot.doctor.name}: {weekdayLabel(slot.weekday)} às {slot.time}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
