import Link from "next/link";
import { Role } from "@prisma/client";
import { requireUser } from "@/lib/auth";

export default async function ProtectedLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();

  return (
    <div className="min-h-screen bg-[#f3f6fb]">
      <header className="bg-[#1d5f97] text-white shadow-lg">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-2xl font-bold">Clínica Asklepion</h1>
            <p className="text-sm text-blue-100">Bem-vindo, {user.name}</p>
          </div>

          <nav className="flex flex-wrap items-center gap-3 text-sm font-medium">
            <Link href="/consultas" className="rounded-md bg-white/10 px-3 py-1.5 hover:bg-white/20">
              Minhas Consultas
            </Link>
            <Link href="/agendar" className="rounded-md bg-white/10 px-3 py-1.5 hover:bg-white/20">
              Agendar Consulta
            </Link>
            <Link href="/medicos" className="rounded-md bg-white/10 px-3 py-1.5 hover:bg-white/20">
              Médicos e Especialidades
            </Link>
            {user.role === Role.ADMIN ? (
              <Link href="/admin" className="rounded-md bg-white/10 px-3 py-1.5 hover:bg-white/20">
                Admin
              </Link>
            ) : null}
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="rounded-md bg-white px-3 py-1.5 text-[#1d5f97] hover:bg-blue-50">
                Sair
              </button>
            </form>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
