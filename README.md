# Persistema - Sistema Escolar

Sistema didático desenvolvido pelos alunos do 3º ano de Desenvolvimento de
Sistemas. O projeto possui cadastro escolar, boletim, frequência e a primeira
camada de autenticação com JWT.

O histórico de decisões e o estado entre conversas ficam em
[CONTEXTO.md](CONTEXTO.md).

## Missão 004 entregue

O sistema permite:

- registrar presença e ausência por aluno e data;
- consultar a frequência registrada em uma tabela centralizada;
- calcular o percentual de frequência de cada aluno;
- classificar a situação (Frequência Boa, Atenção, Risco de Reprovação);
- alertar alunos com frequência abaixo de 75%;
- exibir um ranking das melhores frequências;
- manter a base das Missões 001, 002 e 003 funcionando no mesmo painel.
- autenticar administradores por e-mail e professores por usuário;
- bloquear os módulos da API sem token JWT;
- manter sessão no frontend com token e usuário no armazenamento local.

## Como executar

### Backend

```bash
cd backend
npm install
npm run dev
```

O backend usa as configurações do arquivo `backend/.env` e sincroniza os modelos
quando o servidor inicia. `DB_SYNC_ALTER=true` mantém os registros existentes ao
atualizar a estrutura do banco.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`.

### Testes de QA automatizados (validação até a Missão 004)

Com o backend em execução (`npm.cmd run dev`), na pasta `backend`:

```bash
npm.cmd test
```

Alternativas no Windows/PowerShell:

```bash
node --test
```

- A suíte roda contra `http://localhost:3000` e cobre Alunos, Turmas, Disciplinas, Boletim (notas) e Frequências.
- Esperado: **37 testes passando**.
- No PowerShell, `npm` pode falhar por política de execução (`npm.ps1` não assinado); use `npm.cmd`.
- Dados de teste são temporários (nome/email `_QA_`) e limpos ao final de cada suíte; resíduos de execuções abortadas devem ser removidos.

## Endpoints da Missão 003

| Método | Endpoint | Finalidade |
| --- | --- | --- |
| `GET` | `/notas` | Lista as notas cadastradas |
| `POST` | `/notas` | Cadastra uma nova nota |
| `DELETE` | `/notas/:id` | Exclui uma nota |

O módulo de alunos e turmas continua com seus endpoints anteriores em `/alunos`
 e `/turmas`.

Exemplo de cadastro:

```json
{
  "aluno_id": 1,
  "disciplina": "Matemática",
  "bimestre": "1º Bimestre",
  "nota": 8.5
}
```

## Endpoints da Missão 004

| Método | Endpoint | Finalidade |
| --- | --- | --- |
| `GET` | `/frequencias` | Lista os registros de frequência |
| `POST` | `/frequencias` | Registra uma presença/ausência |
| `PUT` | `/frequencias/:id` | Edita um registro de frequência |
| `DELETE` | `/frequencias/:id` | Exclui um registro de frequência |
| `GET` | `/frequencias/resumo` | Resumo de frequência por aluno |
| `GET` | `/frequencias/ranking` | Ranking das melhores frequências |

O módulo rejeita registros duplicados (mesmo aluno e data) e valida que o aluno
existe antes de salvar.

Exemplo de cadastro:

```json
{
  "aluno_id": 1,
  "data_aula": "2026-08-26",
  "presente": true
}
```

O percentual de frequência é calculado por aluno e classificado: abaixo de 75%
(Risco de Reprovação), entre 75% e 89% (Atenção) e 90% ou mais (Frequência Boa).

## Organização do código

- `backend/src/models/Aluno.js`: modelo de aluno com `turma_id` opcional.
- `backend/src/models/Turma.js`: modelo de turma.
- `backend/src/models/Nota.js`: modelo de notas do boletim.
- `backend/src/models/Frequencia.js`: modelo de frequência.
- `backend/src/controllers/notaController.js`: regras de cadastro e consulta de notas.
- `backend/src/controllers/frequenciaController.js`: regras de frequência (resumo, classificação e ranking).
- `backend/src/routes/boletim/routes.js`: rotas da Missão 003.
- `backend/src/routes/frequencias/routes.js`: rotas da Missão 004.
- `frontend/src/App.jsx`: painel com módulos de alunos, turmas, boletim e frequência.

Cada módulo do backend mantém suas rotas, controller e model separados. O
arquivo `backend/src/routes/index.js` apenas registra os módulos existentes.

## Padrão dos relatórios

As listas de registros são apresentadas com tabela do Material UI. A tela de
frequência segue o mesmo padrão: busca global, colunas objetivas, ações rápidas
e resumo/ranking de presença.

## Validações realizadas

- Build do frontend executado com sucesso.
- Sintaxe dos arquivos JavaScript do backend validada com `node --check`.
- Fluxo da Missão 004 validado contra o MySQL (criar, duplicidade 409, resumo, ranking, editar e excluir).
- Suíte de QA automatizada cobrindo as Missões 001-004: 37 testes passando (`npm.cmd test` na pasta `backend` com o servidor no ar).
- Script de teste corrigido em `backend/package.json` (`node --test`) para funcionar no Windows/Node 24.

### Validação da autenticação

- `POST /login` com `admin@escola.com` e `123456`: 200 com JWT.
- `POST /professores/login` com `maria` e `123456`: 200 com JWT e disciplina vinculada.
- `GET /alunos` sem token: 401.

## Missão 007: Auditoria Digital

O roteiro semanal está em `🎯 MISSÃO 007 - OPERAÇÃO AUDITORIA DIGITAL.txt`.
A próxima etapa é registrar logins e alterações de notas/frequências, restringir
a consulta ao perfil admin e criar os testes de 401, 403 e filtros.

## Próxima etapa

O QA das Missões 001 a 004 está concluído. A autenticação básica das Missões 005
e 006 foi validada por chamadas HTTP; ainda falta finalizar autorização por perfil
e a tela de chamada exclusiva do professor. A Missão 007 prepara a próxima sprint.

## Guia pedagógico da Missão 003

Objetivo da Missão 003:
- lançar notas do aluno;
- registrar disciplina, bimestre e nota;
- consultar notas e médias;
- preparar o sistema para boletim digital.

### Modelagem sugerida

- `notas`: id, aluno_id, disciplina, bimestre, nota.
- Relacionamento: `Aluno` possui muitas `Notas`.

### Checklist de QA

- cadastro com aluno, disciplina, bimestre e nota preenchidos;
- nota salva com valor válido entre 0 e 10;
- lista exibe os registros corretamente;
- média geral calculada sem erros visíveis;
- sistema continua funcionando com as missões anteriores.

### Boss Challenge

- calcular média do aluno;
- classificar aprovação, recuperação ou reprovação;
- mostrar resumo geral do boletim.  "serie": "3o Ano",
  "ano": "2026"
}

Padrao de resposta esperada:

{
  "id": 1,
  "nome": "3o DS",
  "serie": "3o Ano",
  "ano": "2026"
}

## 5) Erros comuns que a turma deve evitar

- Colocar todas as rotas no mesmo arquivo.
- Misturar logica de alunos e turmas no mesmo controller.
- Alterar diretamente o server para adicionar regra de negocio.
- Quebrar o endpoint de alunos ja pronto.
- Pular validacao de campos obrigatorios.

## 6) Definicao de pronto da Missao 002

A missao esta pronta quando:
- Existe modulo de turmas separado no backend.
- Front consegue cadastrar e listar turmas.
- Existe relacao turma-aluno validada pelo QA.
- Missao 001 continua funcionando.

## 7) Sugestao de apresentacao final (3 minutos)

1. Problema: alunos sem organizacao por turma.
2. Solucao tecnica: novo modulo "turmas" com rotas e controller proprios.
3. Evidencia: cadastro de turma + vinculacao de aluno + consulta.
4. Aprendizado: separacao de responsabilidades e modularizacao.

---

# Guia pedagógico da Missão 004 - Frequência Inteligente

## Objetivo

- registrar presença e ausência por aluno e data;
- consultar a frequência dos alunos;
- calcular o percentual de presença;
- identificar alunos com baixa frequência.

## Modelagem sugerida

- `frequencias`: id, aluno_id, data_aula, presente.
- Relacionamento: `Aluno` possui muitos registros de `Frequencia`.

## Checklist de QA

- registro de presença funciona;
- registro de falta funciona;
- data preenchida;
- aluno selecionado;
- quantidade de registros correta;
- sem duplicações (mesmo aluno e data).

## Boss Challenge

- calcular % de frequência do aluno;
- classificar (Frequência Boa, Atenção, Risco de Reprovação);
- alertar aluno abaixo de 75%;
- criar ranking das melhores frequências.
