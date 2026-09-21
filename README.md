# Persistema - Sistema Escolar

Sistema didático em React/Vite e Node.js/Express para cadastro escolar,
boletim, frequência, autenticação JWT e auditoria digital.

O estado do projeto e as decisões de continuidade estão em
[CONTEXTO.md](CONTEXTO.md).

## Estado atual

O painel possui alunos, turmas, disciplinas, notas e chamada por disciplina.
Administradores e professores autenticam com JWT. Professores ficam limitados
à disciplina vinculada; administradores também consultam a tela de Auditoria.

A Missão 7 adicionou:

- tabela `auditoria` com data, usuário, perfil, operação, recurso e identificador;
- registro de login aceito/recusado e operações de notas/frequências;
- `GET /auditoria`, com filtros por usuário, operação, recurso e período;
- proteção 401/403 e tela administrativa com busca e filtros;
- garantia de que senha e token não são armazenados nos eventos.

A próxima sprint é a Missão 8, descrita em
[🎯 MISSÃO 008 - OPERAÇÃO PAINEL DE CONFIANÇA.txt](🎯%20MISSÃO%20008%20-%20OPERAÇÃO%20PAINEL%20DE%20CONFIANÇA.txt).

## Como executar

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`. O backend usa `backend/.env` e sincroniza os
modelos com `DB_SYNC_ALTER=true`, preservando os registros existentes.

## Testes

Com o backend rodando, na pasta `backend`:

```bash
npm.cmd test
```

No Windows, use `npm.cmd` quando a política do PowerShell bloquear `npm.ps1`.
A suíte cobre 46 casos das Missões 1 a 7, incluindo login, autorização,
auditoria, filtros e proteção contra segredos.

O build do frontend pode ser validado com:

```bash
cd frontend
npm.cmd run build
```

## Endpoints principais

| Método | Endpoint | Finalidade |
| --- | --- | --- |
| `POST` | `/login` | Login de administrador |
| `POST` | `/professores/login` | Login de professor |
| `GET` | `/alunos` | Lista alunos |
| `GET/POST/PUT/DELETE` | `/notas` | Consulta e gestão de notas |
| `GET/POST/PUT/DELETE` | `/frequencias` | Consulta e gestão de frequência |
| `GET` | `/frequencias/resumo` | Resumo por aluno |
| `GET` | `/frequencias/ranking` | Ranking de frequência |
| `GET` | `/auditoria` | Consulta admin dos eventos auditados |

## Organização

- `backend/src/models`: modelos Sequelize, incluindo `Auditoria.js`;
- `backend/src/controllers`: regras de negócio e registro dos eventos;
- `backend/src/routes`: módulos separados e registro central em `index.js`;
- `backend/test`: suíte HTTP automatizada;
- `frontend/src/App.jsx`: painel React com módulos e tela de auditoria.

## Dados de demonstração

Na pasta `backend`, execute `node sql/seed-demo.js` para criar dados fictícios
idempotentes. Professores demo usam usuários `demo_prof_1` a `demo_prof_9`, com
senha `123456`.

## Próxima missão

Implementar o painel de confiança da Missão 8: indicadores por operação,
últimos acessos e alertas de tentativas recusadas, sempre com acesso exclusivo
ao perfil admin.