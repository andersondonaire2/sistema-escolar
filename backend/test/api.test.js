import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { request, stamp } from './helpers.js';

const U = (prefix) => `${prefix}_QA_${stamp()}`;

before(async () => {
  const r = await request('GET', '/alunos');
  assert.equal(r.status, 200, 'Backend deve estar acessível antes de iniciar a suíte.');
});

// ---------------------------------------------------------------------------
// ALUNOS
// ---------------------------------------------------------------------------
test.describe('Módulo ALUNOS', () => {
  const criados = [];

  after(async () => {
    for (const id of criados) await request('DELETE', `/alunos/${id}`);
  });

  test('GET /alunos lista alunos (200)', async () => {
    const r = await request('GET', '/alunos');
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.data), 'deve retornar um array');
  });

  test('POST /alunos cadastra aluno válido (201)', async () => {
    const body = {
      nome: U('Aluno'),
      email: `${U('email')}@qa.com`,
      data_nascimento: '2010-01-01',
      serie: '1 Ano',
    };
    const r = await request('POST', '/alunos', body);
    assert.equal(r.status, 201, JSON.stringify(r.data));
    assert.ok(r.data.id);
    assert.equal(r.data.nome, body.nome);
    criados.push(r.data.id);
  });

  test('POST /alunos rejeita email duplicado (400/erro)', async () => {
    const email = `${U('dup')}@qa.com`;
    const a = await request('POST', '/alunos', { nome: U('Dup'), email });
    assert.equal(a.status, 201);
    criados.push(a.data.id);
    const b = await request('POST', '/alunos', { nome: U('Dup2'), email });
    assert.notEqual(b.status, 201, 'email duplicado deve falhar');
  });

  test('PUT /alunos/:id edita aluno (200)', async () => {
    const a = await request('POST', '/alunos', { nome: U('Edit'), email: `${U('e')}@qa.com` });
    assert.equal(a.status, 201);
    criados.push(a.data.id);
    const novoNome = U('Editado');
    const r = await request('PUT', `/alunos/${a.data.id}`, { nome: novoNome, email: a.data.email });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    assert.equal(r.data.nome, novoNome);
  });

  test('PUT /alunos/:id retorna 404 para id inexistente', async () => {
    const r = await request('PUT', '/alunos/99999999', { nome: 'X', email: `${U('x')}@qa.com` });
    assert.equal(r.status, 404);
  });

  test('DELETE /alunos/:id exclui (204) e depois 404', async () => {
    const a = await request('POST', '/alunos', { nome: U('Del'), email: `${U('d')}@qa.com` });
    assert.equal(a.status, 201);
    const del = await request('DELETE', `/alunos/${a.data.id}`);
    assert.equal(del.status, 204);
    const falta = await request('PUT', `/alunos/${a.data.id}`, { nome: 'X', email: `${U('z')}@qa.com` });
    assert.equal(falta.status, 404);
  });
});

// ---------------------------------------------------------------------------
// TURMAS
// ---------------------------------------------------------------------------
test.describe('Módulo TURMAS', () => {
  const criadas = [];
  const alunosCriados = [];

  after(async () => {
    for (const id of alunosCriados) await request('DELETE', `/alunos/${id}`);
    for (const id of criadas) await request('DELETE', `/turmas/${id}`);
  });

  test('GET /turmas lista turmas (200)', async () => {
    const r = await request('GET', '/turmas');
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.data));
  });

  test('POST /turmas cadastra turma válida (201)', async () => {
    const body = { nome: U('Turma'), serie: '1 Ano', ano: 2026 };
    const r = await request('POST', '/turmas', body);
    assert.equal(r.status, 201, JSON.stringify(r.data));
    assert.ok(r.data.id);
    assert.equal(r.data.nome, body.nome);
    criadas.push(r.data.id);
  });

  test('POST /turmas rejeita campos obrigatórios ausentes (400)', async () => {
    const r = await request('POST', '/turmas', { nome: 'X' });
    assert.equal(r.status, 400, JSON.stringify(r.data));
  });

  test('POST /turmas rejeita ano não inteiro (400)', async () => {
    const r = await request('POST', '/turmas', { nome: 'X', serie: '1', ano: 'abc' });
    assert.equal(r.status, 400);
  });

  test('PUT /turmas/:id retorna 404 para id inexistente', async () => {
    const r = await request('PUT', '/turmas/99999999', { nome: 'X', serie: '1', ano: 2026 });
    assert.equal(r.status, 404);
  });

  test('vínculo e desvínculo de aluno na turma', async () => {
    const t = await request('POST', '/turmas', { nome: U('Turma'), serie: '2 Ano', ano: 2026 });
    assert.equal(t.status, 201);
    criadas.push(t.data.id);
    const a = await request('POST', '/alunos', { nome: U('Vinc'), email: `${U('v')}@qa.com` });
    assert.equal(a.status, 201);
    alunosCriados.push(a.data.id);

    const vincula = await request('POST', `/turmas/${t.data.id}/alunos`, { alunoId: a.data.id });
    assert.equal(vincula.status, 200, JSON.stringify(vincula.data));
    assert.ok(vincula.data.alunos.some((al) => Number(al.id) === Number(a.data.id)));

    const lista = await request('GET', `/turmas/${t.data.id}/alunos`);
    assert.equal(lista.status, 200);
    assert.ok(lista.data.some((al) => Number(al.id) === Number(a.data.id)));

    const desvincula = await request('DELETE', `/turmas/${t.data.id}/alunos/${a.data.id}`);
    assert.equal(desvincula.status, 200);
    assert.ok(!desvincula.data.alunos.some((al) => Number(al.id) === Number(a.data.id)));
  });

  test('desvincular aluno não vinculado retorna 400', async () => {
    const t = await request('POST', '/turmas', { nome: U('Turma'), serie: '3 Ano', ano: 2026 });
    assert.equal(t.status, 201);
    criadas.push(t.data.id);
    const a = await request('POST', '/alunos', { nome: U('Solto'), email: `${U('s')}@qa.com` });
    assert.equal(a.status, 201);
    alunosCriados.push(a.data.id);
    const r = await request('DELETE', `/turmas/${t.data.id}/alunos/${a.data.id}`);
    assert.equal(r.status, 400);
  });
});

// ---------------------------------------------------------------------------
// DISCIPLINAS
// ---------------------------------------------------------------------------
test.describe('Módulo DISCIPLINAS', () => {
  const criadas = [];
  const turmas = [];

  after(async () => {
    for (const id of criadas) await request('DELETE', `/disciplinas/${id}`);
    for (const id of turmas) await request('DELETE', `/turmas/${id}`);
  });

  test('GET /disciplinas lista disciplinas (200)', async () => {
    const r = await request('GET', '/disciplinas');
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.data));
  });

  test('POST /disciplinas cadastra disciplina válida (201)', async () => {
    const t = await request('POST', '/turmas', { nome: U('Turma'), serie: '1 Ano', ano: 2026 });
    assert.equal(t.status, 201);
    turmas.push(t.data.id);
    const body = { turma_id: t.data.id, nome: U('Disciplina') };
    const r = await request('POST', '/disciplinas', body);
    assert.equal(r.status, 201, JSON.stringify(r.data));
    criadas.push(r.data.id);
  });

  test('POST /disciplinas rejeita duplicidade na mesma turma (409)', async () => {
    const t = await request('POST', '/turmas', { nome: U('Turma'), serie: '1 Ano', ano: 2026 });
    assert.equal(t.status, 201);
    turmas.push(t.data.id);
    const nome = U('DupDisc');
    const a = await request('POST', '/disciplinas', { turma_id: t.data.id, nome });
    assert.equal(a.status, 201);
    criadas.push(a.data.id);
    const b = await request('POST', '/disciplinas', { turma_id: t.data.id, nome });
    assert.equal(b.status, 409, JSON.stringify(b.data));
  });

  test('POST /disciplinas com turma inexistente retorna 404', async () => {
    const r = await request('POST', '/disciplinas', { turma_id: 99999999, nome: U('Disc') });
    assert.equal(r.status, 404);
  });

  test('PUT /disciplinas/:id de id inexistente retorna 404', async () => {
    const t = await request('POST', '/turmas', { nome: U('Turma'), serie: '1 Ano', ano: 2026 });
    turmas.push(t.data.id);
    const r = await request('PUT', '/disciplinas/99999999', { turma_id: t.data.id, nome: 'X' });
    assert.equal(r.status, 404);
  });
});

// ---------------------------------------------------------------------------
// NOTAS / BOLETIM
// ---------------------------------------------------------------------------
test.describe('Módulo BOLETIM (NOTAS)', () => {
  const notas = [];
  const alunos = [];

  after(async () => {
    for (const id of notas) await request('DELETE', `/notas/${id}`);
    for (const id of alunos) await request('DELETE', `/alunos/${id}`);
  });

  async function criarAluno() {
    const a = await request('POST', '/alunos', { nome: U('NAluno'), email: `${U('n')}@qa.com` });
    assert.equal(a.status, 201);
    alunos.push(a.data.id);
    return a.data.id;
  }

  test('GET /notas lista notas (200)', async () => {
    const r = await request('GET', '/notas');
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.data));
  });

  test('POST /notas cadastra nota válida (201)', async () => {
    const alunoId = await criarAluno();
    const body = { aluno_id: alunoId, disciplina: 'Matemática', bimestre: '1º Bimestre', nota: 8.5 };
    const r = await request('POST', '/notas', body);
    assert.equal(r.status, 201, JSON.stringify(r.data));
    assert.equal(Number(r.data.nota), 8.5);
    notas.push(r.data.id);
  });

  test('POST /notas rejeita nota fora do intervalo 0-10 (400)', async () => {
    const alunoId = await criarAluno();
    const r = await request('POST', '/notas', { aluno_id: alunoId, disciplina: 'Mat', bimestre: '1º', nota: 11 });
    assert.equal(r.status, 400, JSON.stringify(r.data));
  });

  test('POST /notas rejeita nota negativa (400)', async () => {
    const alunoId = await criarAluno();
    const r = await request('POST', '/notas', { aluno_id: alunoId, disciplina: 'Mat', bimestre: '1º', nota: -1 });
    assert.equal(r.status, 400);
  });

  test('POST /notas rejeita campos obrigatórios ausentes (400)', async () => {
    const alunoId = await criarAluno();
    const r = await request('POST', '/notas', { aluno_id: alunoId, disciplina: 'Mat' });
    assert.equal(r.status, 400);
  });

  test('POST /notas com aluno inexistente retorna 404', async () => {
    const r = await request('POST', '/notas', { aluno_id: 99999999, disciplina: 'Mat', bimestre: '1º', nota: 5 });
    assert.equal(r.status, 404);
  });

  test('PUT /notas/:id edita nota (200)', async () => {
    const alunoId = await criarAluno();
    const a = await request('POST', '/notas', { aluno_id: alunoId, disciplina: 'Mat', bimestre: '1º', nota: 5 });
    assert.equal(a.status, 201);
    notas.push(a.data.id);
    const r = await request('PUT', `/notas/${a.data.id}`, { aluno_id: alunoId, disciplina: 'Física', bimestre: '2º', nota: 9 });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    assert.equal(Number(r.data.nota), 9);
  });

  test('PUT /notas/:id de id inexistente retorna 404', async () => {
    const alunoId = await criarAluno();
    const r = await request('PUT', '/notas/99999999', { aluno_id: alunoId, disciplina: 'X', bimestre: '1º', nota: 5 });
    assert.equal(r.status, 404);
  });

  test('DELETE /notas/:id exclui (204)', async () => {
    const alunoId = await criarAluno();
    const a = await request('POST', '/notas', { aluno_id: alunoId, disciplina: 'Mat', bimestre: '1º', nota: 7 });
    assert.equal(a.status, 201);
    const del = await request('DELETE', `/notas/${a.data.id}`);
    assert.equal(del.status, 204);
  });
});

// ---------------------------------------------------------------------------
// FREQUÊNCIAS
// ---------------------------------------------------------------------------
test.describe('Módulo FREQUÊNCIAS', () => {
  const freq = [];
  const alunos = [];

  after(async () => {
    for (const id of freq) await request('DELETE', `/frequencias/${id}`);
    for (const id of alunos) await request('DELETE', `/alunos/${id}`);
  });

  async function criarAluno() {
    const a = await request('POST', '/alunos', { nome: U('FAluno'), email: `${U('f')}@qa.com` });
    assert.equal(a.status, 201);
    alunos.push(a.data.id);
    return a.data.id;
  }

  test('GET /frequencias lista frequências (200)', async () => {
    const r = await request('GET', '/frequencias');
    assert.equal(r.status, 200);
    assert.ok(Array.isArray(r.data));
  });

  test('POST /frequencias registra presença (201)', async () => {
    const alunoId = await criarAluno();
    const body = { aluno_id: alunoId, data_aula: '2026-08-26', presente: true };
    const r = await request('POST', '/frequencias', body);
    assert.equal(r.status, 201, JSON.stringify(r.data));
    freq.push(r.data.id);
  });

  test('POST /frequencias rejeita duplicidade (mesmo aluno e data) (409)', async () => {
    const alunoId = await criarAluno();
    const data = '2026-08-27';
    const a = await request('POST', '/frequencias', { aluno_id: alunoId, data_aula: data, presente: true });
    assert.equal(a.status, 201);
    freq.push(a.data.id);
    const b = await request('POST', '/frequencias', { aluno_id: alunoId, data_aula: data, presente: false });
    assert.equal(b.status, 409, JSON.stringify(b.data));
  });

  test('POST /frequencias rejeita campos obrigatórios ausentes (400)', async () => {
    const r = await request('POST', '/frequencias', { aluno_id: 1 });
    assert.equal(r.status, 400);
  });

  test('POST /frequencias com aluno inexistente retorna 404', async () => {
    const r = await request('POST', '/frequencias', { aluno_id: 99999999, data_aula: '2026-08-26', presente: true });
    assert.equal(r.status, 404);
  });

  test('GET /frequencias/resumo retorna resumo por aluno (200)', async () => {
    const r = await request('GET', '/frequencias/resumo');
    assert.equal(r.status, 200, JSON.stringify(r.data));
    assert.ok(Array.isArray(r.data));
  });

  test('GET /frequencias/ranking retorna ranking (200)', async () => {
    const r = await request('GET', '/frequencias/ranking');
    assert.equal(r.status, 200, JSON.stringify(r.data));
    assert.ok(Array.isArray(r.data));
  });

  test('PUT /frequencias/:id edita (200)', async () => {
    const alunoId = await criarAluno();
    const a = await request('POST', '/frequencias', { aluno_id: alunoId, data_aula: '2026-08-28', presente: true });
    assert.equal(a.status, 201);
    freq.push(a.data.id);
    const r = await request('PUT', `/frequencias/${a.data.id}`, { aluno_id: alunoId, data_aula: '2026-08-28', presente: false });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    assert.equal(r.data.presente, false);
  });

  test('PUT /frequencias/:id de id inexistente retorna 404', async () => {
    const alunoId = await criarAluno();
    const r = await request('PUT', '/frequencias/99999999', { aluno_id: alunoId, data_aula: '2026-08-28', presente: true });
    assert.equal(r.status, 404);
  });

  test('DELETE /frequencias/:id exclui (204)', async () => {
    const alunoId = await criarAluno();
    const a = await request('POST', '/frequencias', { aluno_id: alunoId, data_aula: '2026-08-29', presente: true });
    assert.equal(a.status, 201);
    const del = await request('DELETE', `/frequencias/${a.data.id}`);
    assert.equal(del.status, 204);
  });
});

// ---------------------------------------------------------------------------
// AUTENTICAÇÃO E CONTROLE DE ACESSO
// ---------------------------------------------------------------------------
test.describe('Módulo AUTENTICAÇÃO', () => {
  test('POST /login aceita credenciais válidas e retorna token', async () => {
    const r = await request('POST', '/login', { email: 'admin@escola.com', senha: '123456' });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    assert.ok(r.data.token, 'deve retornar um token JWT');
    assert.equal(r.data.usuario.email, 'admin@escola.com');
  });

  test('POST /login rejeita credenciais inválidas (401)', async () => {
    const r = await request('POST', '/login', { email: 'admin@escola.com', senha: 'errada' });
    assert.equal(r.status, 401, JSON.stringify(r.data));
  });

  test('POST /professores/login aceita professor e indica disciplina vinculada', async () => {
    const r = await request('POST', '/professores/login', { usuario: 'maria', senha: '123456' });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    assert.ok(r.data.professor);
    assert.ok(r.data.professor.disciplina || r.data.professor.disciplina_id !== null);
  });

  test('GET /professores lista professores cadastrados (200)', async () => {
    const r = await request('GET', '/professores');
    assert.equal(r.status, 200, JSON.stringify(r.data));
    assert.ok(Array.isArray(r.data));
  });
});

// ---------------------------------------------------------------------------
// AUDITORIA DIGITAL
// ---------------------------------------------------------------------------
test.describe('Módulo AUDITORIA', () => {
  test('GET /auditoria exige token (401)', async () => {
    const r = await request('GET', '/auditoria', undefined, { auth: false });
    assert.equal(r.status, 401);
  });

  test('GET /auditoria bloqueia professor (403)', async () => {
    const login = await request('POST', '/professores/login', { usuario: 'maria', senha: '123456' });
    assert.equal(login.status, 200);
    const r = await request('GET', '/auditoria', undefined, { token: login.data.token });
    assert.equal(r.status, 403);
  });

  test('login válido e recusado geram eventos sem segredos', async () => {
    const aceito = await request('POST', '/login', { email: 'admin@escola.com', senha: '123456' });
    assert.equal(aceito.status, 200);
    const recusado = await request('POST', '/login', { email: 'admin@escola.com', senha: 'senha_qa_que_nao_deve_aparecer' });
    assert.equal(recusado.status, 401);

    const r = await request('GET', '/auditoria?usuario=Administrador', undefined, { token: aceito.data.token });
    assert.equal(r.status, 200, JSON.stringify(r.data));
    assert.ok(r.data.some((evento) => evento.operacao === 'LOGIN_SUCESSO'));
    assert.ok(r.data.some((evento) => evento.operacao === 'LOGIN_RECUSADO'));
    assert.ok(!JSON.stringify(r.data).includes('senha_qa_que_nao_deve_aparecer'));
    assert.ok(!JSON.stringify(r.data).includes(aceito.data.token));
  });

  test('criação de nota e exclusão de frequência geram eventos filtráveis', async () => {
    const admin = await request('POST', '/login', { email: 'admin@escola.com', senha: '123456' });
    assert.equal(admin.status, 200);
    const aluno = await request('POST', '/alunos', { nome: U('AudAluno'), email: `${U('aud')}@qa.com` });
    assert.equal(aluno.status, 201);
    const nota = await request('POST', '/notas', { aluno_id: aluno.data.id, disciplina: 'Auditoria', bimestre: '1º', nota: 8 });
    assert.equal(nota.status, 201);
    const frequencia = await request('POST', '/frequencias', { aluno_id: aluno.data.id, data_aula: `2026-09-${String((Date.now() % 20) + 1).padStart(2, '0')}`, presente: true });
    assert.equal(frequencia.status, 201);
    const excluida = await request('DELETE', `/frequencias/${frequencia.data.id}`);
    assert.equal(excluida.status, 204);

    const notas = await request('GET', '/auditoria?recurso=NOTA&operacao=CRIACAO', undefined, { token: admin.data.token });
    assert.equal(notas.status, 200);
    assert.ok(notas.data.some((evento) => Number(evento.recurso_id) === Number(nota.data.id)));
    const frequencias = await request('GET', '/auditoria?recurso=FREQUENCIA&operacao=EXCLUSAO', undefined, { token: admin.data.token });
    assert.equal(frequencias.status, 200);
    assert.ok(frequencias.data.some((evento) => Number(evento.recurso_id) === Number(frequencia.data.id)));

    await request('DELETE', `/notas/${nota.data.id}`);
    await request('DELETE', `/alunos/${aluno.data.id}`);
  });
});
