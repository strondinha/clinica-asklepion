# Clínica Asklepion

Front-end estático recriado do zero em **HTML, CSS e JavaScript puro**, com foco no fluxo de **agendamento de consulta**.

## Estrutura

- `index.html`
- `css/styles.css`
- `js/app.js`
- `assets/`

## Como executar

1. Clone ou baixe o repositório.
2. Abra o arquivo `index.html` diretamente no navegador.

Não há backend nem dependências externas.

## Fluxo implementado

1. **Lista de médicos**: seleção por card com nome e especialidade.
2. **Detalhe do médico**: nome, especialidade, frase de orientação e dias disponíveis.
3. **Escolha de horário**: horários filtrados pelo dia selecionado.
4. **Dados do cliente**: preenchimento de nome completo.
5. **Confirmação**: resumo do agendamento com médico, especialidade, dia, hora e nome do cliente.

## Dados mockados

Os médicos e disponibilidades são definidos em `js/app.js` (3 profissionais) e o estado do fluxo é persistido em `localStorage`.
