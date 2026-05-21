import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

type RegisterPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: "Preencha todos os campos.",
  password_short: "A senha deve ter pelo menos 6 caracteres.",
  cpf_taken: "Já existe um usuário cadastrado com este CPF.",
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/consultas");
  }

  const params = await searchParams;
  const error = params.error ? ERROR_MESSAGES[params.error] ?? "Erro ao cadastrar." : null;

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-semibold text-[#1d5f97]">Criar conta</h1>
        <p className="mt-2 text-sm text-slate-600">Cadastro de paciente da Clínica Asklepion.</p>

        {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        <form action="/api/auth/register" method="POST" className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Nome completo</span>
            <input name="name" type="text" required className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">CPF</span>
            <input
              name="cpf"
              type="text"
              required
              maxLength={14}
              placeholder="000.000.000-00"
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Senha</span>
            <input name="password" type="password" required minLength={6} className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>

          <button type="submit" className="w-full rounded-lg bg-[#1d5f97] px-4 py-2 font-semibold text-white hover:bg-[#154b78]">
            Criar conta
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Já possui conta?{" "}
          <Link href="/login" className="font-semibold text-[#1d5f97] underline">
            Entrar
          </Link>
        </p>
      </section>
    </main>
  );
}
