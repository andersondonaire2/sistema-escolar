# Contexto de continuidade

Este arquivo preserva o contexto de trabalho entre conversas. Atualize-o ao
final de cada etapa relevante, registrando decisões e o próximo passo concreto.

## Objetivo do projeto

Construir um sistema escolar com frontend em React/Vite e backend em
Node.js/Express.

## Estado atual

- A Missão 001 contém o módulo inicial de alunos.
- A Missão 002 foi implementada: cadastro, listagem e relação entre turmas e alunos.
- A Missão 003 foi introduzida com o módulo de boletim digital: cadastro de notas, consulta por aluno/disciplina e resumo de médias.
- A Missão 004 foi implementada com o módulo de frequência: registro de presença/ausência, resumo, classificação e ranking.
- O QA automatizado cobre as Missões 001 a 004 e autenticação (alunos, turmas, disciplinas, notas, frequências e login) com 42 testes passando.
- A autenticação das Missões 005/006 foi implementada parcialmente: login admin/professor, JWT e proteção das rotas principais.
- A Missão 007 foi implementada com auditoria digital, consulta restrita a admin e tela de filtros.
- A Missão 008 foi redefinida como próxima atividade semanal de acesso do aluno.
- A suíte de QA agora cobre 46 testes, incluindo autenticação e auditoria.
- A sincronização usa `DB_SYNC_ALTER` para atualizar tabelas existentes sem apagar registros.
- As listas de alunos, turmas, notas e frequências usam tabela Material UI, busca global e ações de editar/excluir quando relevantes.
- Existe uma carga SQL de teste em `backend/sql/seed-missao-002.sql` com três turmas e seis alunos.
- A estrutura do backend agora inclui `Nota` e `Frequencia`, com associações com `Aluno`.
- A frequência agora suporta `disciplina_id`, `plano_aula`, `quantidade_aulas` e `numero_aula`; a chamada em lote grava uma linha por aluno e por aula.
- O frontend exibe abas de boletim e frequência com formulário, listas, resumo e ranking.

## Estrutura relevante

- Backend: `backend/src/server.js`
- Rotas principais: `backend/src/routes/index.js`
- Módulo de alunos: `backend/src/routes/alunos/`, `backend/src/controllers/alunoController.js` e `backend/src/models/Aluno.js`
- Módulo de turma: `backend/src/routes/turmas/`, `backend/src/controllers/turmaController.js` e `backend/src/models/Turma.js`
- Módulo de boletim: `backend/src/routes/boletim/`, `backend/src/controllers/notaController.js` e `backend/src/models/Nota.js`
- Módulo de frequência: `backend/src/routes/frequencias/`, `backend/src/controllers/frequenciaController.js` e `backend/src/models/Frequencia.js`
- Módulo de auditoria: `backend/src/routes/auditoria/`, `backend/src/controllers/auditoriaController.js` e `backend/src/models/Auditoria.js`
- Próximo módulo: portal do aluno com login próprio, notas e frequência em modo somente leitura.
- Frontend: `frontend/src/App.jsx` e `frontend/src/styles.css`

## Decisões importantes

- Cada novo módulo do backend deve ter suas próprias rotas, controller e model.
- `backend/src/routes/index.js` deve apenas registrar os módulos.
- O cadastro existente de alunos não deve ser quebrado ao implementar turmas ou boletim.
- As notas são armazenadas com relação `Aluno -> Muitas Notas` e validam intervalo entre 0 e 10.
- As frequências são armazenadas com relação `Aluno -> Muitas Frequencias` e não permitem duplicidade (mesmo aluno e data).
- O boletim precisa manter a lógica de visualização simples e transparente para apresentação em aula.
- Os testes de QA ficam em `backend/test/` (`api.test.js` + `helpers.js`) e rodam contra o backend em execução em `http://localhost:3000`.
- No Windows, no PowerShell, o `npm.ps1` pode ser bloqueado pela política de execução; usar `npm.cmd test` ou `node --test` diretamente na pasta `backend`.
- O script de teste é `node --test` (descobre os arquivos automaticamente). Evitar `node --test test/` (com barra) que falha no Node 24/Windows com `MODULE_NOT_FOUND`.
- Os testes criam dados temporários com nome/email `_QA_` e os removem no final de cada suíte; execuções abortadas podem deixar resíduos que precisam ser limpos.

## Pendências

- Confirmar visualmente no navegador o fluxo completo da Missão 004 (chamada, resumo e ranking).
- Resolver pendências anteriores das Missões 002/003 pendentes de verificação no navegador.
- A proteção de rotas exige JWT, mas ainda falta finalizar a autorização por perfil e a tela de chamada exclusiva da disciplina do professor.
- A tela de frequência foi convertida em chamada: matéria do professor logado, plano de aula, data, aulas consecutivas e checkboxes de falta por aluno/aula.
- A Missão 007 foi concluída; a Missão 008 (`🎯 MISSÃO 008 - OPERAÇÃO ACESSO DO ALUNO.txt`) aguarda implementação.
- Manter `DB_SYNC_FORCE=false` ao testar dados persistidos.
- Ajustar o vínculo de alunos por turma com operação de desvínculo e revínculo em fluxo contínuo.
- Um front de "chamada por turma/matéria" (com plano de aula, quantidade de aulas e checkbox de falta por aluno) foi iniciado em edição, mas as alterações não commitadas foram descartadas via `git restore` a pedido do usuário; o repositório está limpo, alinhado ao commit `9ad7ee7` (Missão 4). Essa evolução da frequência é a base da Missão 5 e fica para retomar quando for pedida.
- Atualizar esta seção conforme cada pendência for resolvida.

## Como retomar em caso de perda de conexão

1. Ler este `CONTEXTO.md` e o `README.md`.
2. Garantir o backend rodando: `npm.cmd run dev` (ou `node src/server.js`) na pasta `backend`; conferir `http://localhost:3000` respondendo.
3. Rodar a suíte de QA completa: na pasta `backend`, `npm.cmd test` (ou `node --test`). Esperado: 46 testes passando.
4. Verificar resíduos de testes no banco (`_QA_`/`@qa.com`) e limpar se houver.
5. Implementar o login do aluno e o portal protegido de notas e frequência definidos na Missão 008.

## Histórico de missões

### Missões concluídas

- Missão 002: módulo de turmas implementado em 2026-08-16.
  - Cadastro e listagem de turmas.
  - Relacionamento 1:N entre turma e aluno usando `turma_id`.
  - Vínculo e consulta de alunos por turma.
  - Interface de gestão integrada ao painel.
  - Build do frontend e sintaxe do backend validados.
  - Validação contra o banco depende das credenciais locais.

- Missão 003: módulo de boletim digital introduzido em 2026-08-23.
  - Modelagem de notas com `aluno_id`, `disciplina`, `bimestre` e `nota`.
  - Backend com rotas `GET/POST/DELETE /notas`.
  - Associação `Aluno.hasMany(Nota)` e `Nota.belongsTo(Aluno)`.
  - Interface em React com cadastro e listagem de notas.
  - Resumo de média geral e situação do aluno.
  - Validação de build e sintaxe executadas após a implementação.

- Missão 004: módulo de frequência implementado em 2026-08-29.
  - Modelagem de `Frequencia` com `aluno_id`, `data_aula` e `presente`.
  - Backend com rotas `GET/POST/PUT/DELETE /frequencias`, `/frequencias/resumo` e `/frequencias/ranking`.
  - Associação `Aluno.hasMany(Frequencia)` e `Frequencia.belongsTo(Aluno)`.
  - Validação de duplicidade (mesmo aluno e data) e de aluno existente.
  - Interface em React com tela de chamada, resumo e ranking por aluno.
  - Classificação: Frequência Boa (>=90%), Atenção (75%-89%), Risco de Reprovação (<75%).
  - Fluxo validado contra o MySQL (criar 201, duplicidade 409, resumo, ranking, editar 200, excluir 204); dados de teste removidos.
  - Build do frontend e sintaxe do backend validados.
  - QA automatizado criado em `backend/test/` cobrindo as Missões 001-004; 37 testes passando via `npm.cmd test`.
  - Corrigido o script de teste em `backend/package.json` para `node --test` (a forma antiga `node --test test/` quebrava no Windows/Node 24).

- Missão 007: auditoria digital implementada em 2026-09-21.
  - Criado model `Auditoria`, tabela com índices por data, operação e recurso.
  - Registrados login aceito/recusado e criação, edição e exclusão de notas/frequências.
  - Criada consulta `GET /auditoria` com filtros por usuário, operação, recurso e período.
  - Acesso restrito a admin; professor recebe 403 e ausência de token recebe 401.
  - Criada tela administrativa de auditoria e testes de segurança/segredos.
  - 46 testes passaram e o build frontend foi concluído.

## Última atualização

- Data: 2026-09-21
- Ação: redefinida a Missão 008 para especificar login do aluno e consulta protegida das próprias notas e frequência; nenhuma implementação foi realizada.
- Data: 2026-08-29
- Ação: Descartadas (via `git restore`) as alterações não commitadas que ampliavam a tela de frequência (chamada por turma/matéria com plano de aula e checkbox de falta), voltando o repositório ao estado limpo do commit `9ad7ee7`. Em seguida, o texto do arquivo `🎯 MISSÃO 005 - OPERAÇÃO ESCOLA SEGURA.txt` foi reescrito com o escopo real da Missão 5: login do professor + tela de chamada exclusiva da disciplina dele, com um checkbox de falta por aula lançada (quando a quantidade de aulas for maior que 1, um checkbox por aula, não apenas um por sessão).
- Ação: estabilizado o banco local, validado o login admin/professor e adicionada a proteção JWT às rotas da API. Criada a especificação da Missão 007.
- Validação adicional: helper de QA adaptado para enviar JWT nas rotas protegidas; 42 testes passaram. Corrigida a listagem de notas para ordenar por `id`, pois timestamps estão desativados.
- Corrigido o fluxo do frontend: erros de login agora aparecem na tela, tokens expirados são invalidados e o carregamento do painel aguarda o token recém-recebido. Build do frontend e testes HTTP de autenticação validados.
- Criado e executado `backend/sql/seed-demo.js`: 3 turmas demo, 30 alunos, 9 disciplinas, 9 professores, 180 notas e 150 frequências. Segunda execução confirmou idempotência; login `demo_prof_1` validado.
- Implementada a chamada em lote em `/frequencias/chamada`; validação confirmou 20 registros para 10 alunos em 2 aulas e 3 faltas selecionadas. Suíte backend: 42 testes passando; build frontend concluído.
- Próximo passo: decidir a modelagem das credenciais do aluno e implementar o login/portal somente leitura da Missão 008.

## Como atualizar

Ao concluir uma etapa, atualize somente o que mudou:

1. estado atual;
2. decisões que não devem ser esquecidas;
3. pendências concluídas ou novas;
4. última atualização e próximo passo.

Ao concluir uma missão, também:

5. adicione um registro em `Histórico de missões`;
6. reescreva o `README.md` para preparar a próxima missão.