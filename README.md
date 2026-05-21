# Clínica Asklepion

Sistema web para agendamento de consultas de uma clínica única.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma (migrations + seed)
- Docker Compose

## Requisitos
- Node.js 20+
- Docker + Docker Compose (opcional, para subir DB + app)

## Configuração local
1. Instale dependências:
   ```bash
   npm install
   ```
2. Configure variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
3. Suba o banco PostgreSQL (exemplo com Docker):
   ```bash
   docker compose up -d db
   ```
4. Execute migrations e seed:
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```
5. Inicie a aplicação:
   ```bash
   npm run dev
   ```

## Docker Compose (app + db)
```bash
export JWT_SECRET="troque-esta-chave"
docker compose up --build
```

## Usuários de seed
- **Admin/Atendente**
  - CPF: `11111111111`
  - Senha: `123456`
- **Paciente de teste**
  - CPF: `22222222222`
  - Senha: `123456`

## Scripts
- `npm run dev` — ambiente de desenvolvimento
- `npm run build` — build de produção
- `npm run lint` — lint
- `npm run prisma:generate` — gera client Prisma
- `npm run prisma:migrate` — aplica migration de desenvolvimento
- `npm run prisma:deploy` — aplica migrations em produção
- `npm run prisma:seed` — popula dados base

## Módulos implementados
- Login/cadastro com CPF + senha (hash bcrypt)
- Sessão por cookie seguro
- Minhas Consultas (listar e desmarcar)
- Agendar Consulta (especialidade -> médico -> horário -> confirmar)
- Médicos e Especialidades (cards com sala e horários)
- Área admin/atendente para cadastro base
