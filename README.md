# Clínica Asklepion (Front-end)

Projeto simples (HTML/CSS/JS) para simular um sistema de clínica com **cadastro, login e dashboard**, usando `localStorage`.

## Como rodar

### Opção 1 — Abrir direto no navegador
1. Baixe/clonar o repositório.
2. Abra o arquivo `index.html` no navegador.

> Observação: algumas funções que dependem de URLs/rotas funcionam melhor com servidor local.

### Opção 2 — Servidor local (recomendado)
Você pode usar qualquer servidor estático. Exemplos:

- Com Node:
  ```bash
  npx serve
  ```

- Com Python:
  ```bash
  python -m http.server 8000
  ```

Depois acesse no navegador o endereço exibido.

## Funcionalidades
- Seleção de perfil: **Paciente / Médico / Recepcionista**
- Cadastro e login por perfil (armazenado no `localStorage`)
- Dashboard com abas
- **Sessão persistente** (mantém login após recarregar)
- **Logout**

## Dados
Os dados ficam no `localStorage` do seu navegador.
- Usuários: `usuariosAsklepion`
- Sessão: `asklepionSession`
