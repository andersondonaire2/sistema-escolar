import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

const initialForm = {
  nome: '',
  email: '',
  data_nascimento: '',
  serie: '',
  cpf: '',
  telefone: '',
  endereco: '',
};

const initialTurmaForm = {
  nome: '',
  serie: '',
  ano: new Date().getFullYear().toString(),
};

const menuItems = [
  { key: 'dashboard', label: 'Início', description: 'Visão geral do sistema' },
  { key: 'alunos', label: 'Alunos', description: 'Cadastro e consulta de estudantes' },
  { key: 'turmas', label: 'Turmas', description: 'Organização escolar' },
  { key: 'boletim', label: 'Boletim', description: 'Lançamento e consulta de notas' },
  { key: 'frequencia', label: 'Frequência', description: 'Controle de presença dos alunos' },
];

const initialNotaForm = {
  aluno_id: '',
  disciplina: '',
  bimestre: '1º Bimestre',
  nota: '',
};

const initialDisciplinaForm = {
  turma_id: '',
  nome: '',
};

const initialFrequenciaForm = {
  aluno_id: '',
  data_aula: new Date().toISOString().slice(0, 10),
  presente: 'true',
};

async function buscarJson(url, mensagemPadrao, authToken = '') {
  const response = await fetch(url, {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
  });
  if (!response.ok) {
    let detalhe = '';
    try {
      const corpo = await response.json();
      detalhe = corpo.erro || '';
    } catch {
      detalhe = '';
    }
    throw new Error(detalhe || mensagemPadrao);
  }
  return response.json();
}

function App() {
  const [form, setForm] = useState(initialForm);
  const [alunos, setAlunos] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [notas, setNotas] = useState([]);
  const [frequencias, setFrequencias] = useState([]);
  const [resumoFrequencia, setResumoFrequencia] = useState([]);
  const [rankingFrequencia, setRankingFrequencia] = useState([]);
  const [turmaForm, setTurmaForm] = useState(initialTurmaForm);
  const [disciplinaForm, setDisciplinaForm] = useState(initialDisciplinaForm);
  const [notaForm, setNotaForm] = useState(initialNotaForm);
  const [frequenciaForm, setFrequenciaForm] = useState(initialFrequenciaForm);
  const [alunosSelecionados, setAlunosSelecionados] = useState({});
  const [alunoBusca, setAlunoBusca] = useState('');
  const [turmaBusca, setTurmaBusca] = useState('');
  const [disciplinaBusca, setDisciplinaBusca] = useState('');
  const [notaBusca, setNotaBusca] = useState('');
  const [frequenciaBusca, setFrequenciaBusca] = useState('');
  const [alunoEmEdicao, setAlunoEmEdicao] = useState(null);
  const [turmaEmEdicao, setTurmaEmEdicao] = useState(null);
  const [disciplinaEmEdicao, setDisciplinaEmEdicao] = useState(null);
  const [notaEmEdicao, setNotaEmEdicao] = useState(null);
  const [frequenciaEmEdicao, setFrequenciaEmEdicao] = useState(null);
  const [message, setMessage] = useState('');
  const [turmaMessage, setTurmaMessage] = useState('');
  const [notaMessage, setNotaMessage] = useState('');
  const [frequenciaMessage, setFrequenciaMessage] = useState('');
  const [view, setView] = useState('dashboard');
  const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem('escola_token')));
  const [usuarioLogado, setUsuarioLogado] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('escola_usuario') || 'null');
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('escola_token') || '');
  const [loginForm, setLoginForm] = useState({ usuario: '', senha: '' });

  const carregarAlunos = async () => {
    try {
      setAlunos(await buscarJson('/api/alunos', 'Erro ao carregar alunos. Verifique se o backend está rodando.', token));
    } catch (error) {
      console.error(error);
    }
  };

  const carregarTurmas = async () => {
    try {
      setTurmas(await buscarJson('/api/turmas', 'Erro ao carregar turmas. Verifique se o backend está rodando.', token));
    } catch (error) {
      setTurmaMessage(error.message);
    }
  };

  const carregarNotas = async () => {
    try {
      setNotas(await buscarJson('/api/notas', 'Erro ao carregar notas. Verifique se o backend está rodando.', token));
    } catch (error) {
      setNotaMessage(error.message);
    }
  };

  const carregarDisciplinas = async () => {
    try {
      setDisciplinas(await buscarJson('/api/disciplinas', 'Erro ao carregar disciplinas. Verifique se o backend está rodando.', token));
    } catch (error) {
      setNotaMessage(error.message);
    }
  };

  const carregarFrequencias = async () => {
    try {
      setFrequencias(await buscarJson('/api/frequencias', 'Erro ao carregar frequências. Verifique se o backend está rodando.', token));
    } catch (error) {
      setFrequenciaMessage(error.message);
    }
  };

  const carregarResumoFrequencia = async () => {
    try {
      setResumoFrequencia(await buscarJson('/api/frequencias/resumo', 'Erro ao carregar resumo de frequência.', token));
    } catch (error) {
      setFrequenciaMessage(error.message);
    }
  };

  const carregarRankingFrequencia = async () => {
    try {
      setRankingFrequencia(await buscarJson('/api/frequencias/ranking', 'Erro ao carregar ranking de frequência.', token));
    } catch (error) {
      setFrequenciaMessage(error.message);
    }
  };

  useEffect(() => {
    carregarAlunos();
    carregarTurmas();
    carregarDisciplinas();
    carregarNotas();
    carregarFrequencias();
    carregarResumoFrequencia();
    carregarRankingFrequencia();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({ ...form, [name]: value });
  };

  const handleLoginChange = (event) => {
    const { name, value } = event.target;
    setLoginForm({ ...loginForm, [name]: value });
  };

  const handleLoginSubmit = async (event) => {
    event.preventDefault();
    if (!loginForm.usuario || !loginForm.senha) {
      return;
    }

    try {
      const payload = loginForm.usuario.includes('@')
        ? { email: loginForm.usuario, senha: loginForm.senha }
        : { usuario: loginForm.usuario, senha: loginForm.senha };
      const route = loginForm.usuario.includes('@') ? '/api/login' : '/api/professores/login';

      const response = await fetch(route, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.erro || 'Credenciais inválidas.');
      }

      const usuario = data.usuario || data.professor || null;
      const tokenRecebido = data.token || '';
      localStorage.setItem('escola_token', tokenRecebido);
      localStorage.setItem('escola_usuario', JSON.stringify(usuario));
      setToken(tokenRecebido);
      setUsuarioLogado(usuario);
      setLoggedIn(true);
      setTurmaMessage('');
      setNotaMessage('');
      setFrequenciaMessage('');
      carregarAlunos();
      carregarTurmas();
      carregarDisciplinas();
      carregarNotas();
      carregarFrequencias();
      carregarResumoFrequencia();
      carregarRankingFrequencia();
    } catch (error) {
      setTurmaMessage(error.message);
      setNotaMessage(error.message);
      setFrequenciaMessage(error.message);
    }
  };

  const handleTurmaChange = (event) => {
    const { name, value } = event.target;
    setTurmaForm({ ...turmaForm, [name]: value });
  };

  const handleDisciplinaChange = (event) => {
    const { name, value } = event.target;
    setDisciplinaForm({ ...disciplinaForm, [name]: value });
  };

  const handleNotaChange = (event) => {
    const { name, value } = event.target;
    setNotaForm({ ...notaForm, [name]: value });
  };

  const handleFrequenciaChange = (event) => {
    const { name, value } = event.target;
    setFrequenciaForm({ ...frequenciaForm, [name]: value });
  };

  const handleDisciplinaSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(disciplinaEmEdicao ? `/api/disciplinas/${disciplinaEmEdicao}` : '/api/disciplinas', {
        method: disciplinaEmEdicao ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          turma_id: Number(disciplinaForm.turma_id),
          nome: disciplinaForm.nome,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.erro || 'Erro ao cadastrar disciplina');
      }

      setNotaMessage(disciplinaEmEdicao ? 'Disciplina atualizada com sucesso!' : 'Disciplina cadastrada com sucesso!');
      setDisciplinaForm(initialDisciplinaForm);
      setDisciplinaEmEdicao(null);
      carregarDisciplinas();
    } catch (error) {
      setNotaMessage(error.message);
    }
  };

  const handleNotaSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(notaEmEdicao ? `/api/notas/${notaEmEdicao}` : '/api/notas', {
        method: notaEmEdicao ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...notaForm,
          aluno_id: Number(notaForm.aluno_id),
          nota: Number(notaForm.nota),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.erro || 'Erro ao cadastrar nota');
      }

      setNotaMessage(notaEmEdicao ? 'Nota atualizada com sucesso!' : 'Nota cadastrada com sucesso!');
      setNotaForm(initialNotaForm);
      setNotaEmEdicao(null);
      carregarNotas();
    } catch (error) {
      setNotaMessage(error.message);
    }
  };

  const handleFrequenciaSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(frequenciaEmEdicao ? `/api/frequencias/${frequenciaEmEdicao}` : '/api/frequencias', {
        method: frequenciaEmEdicao ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aluno_id: Number(frequenciaForm.aluno_id),
          data_aula: frequenciaForm.data_aula,
          presente: frequenciaForm.presente === 'true',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.erro || 'Erro ao registrar frequência');
      }

      setFrequenciaMessage(frequenciaEmEdicao ? 'Frequência atualizada com sucesso!' : 'Frequência registrada com sucesso!');
      setFrequenciaForm(initialFrequenciaForm);
      setFrequenciaEmEdicao(null);
      carregarFrequencias();
      carregarResumoFrequencia();
      carregarRankingFrequencia();
    } catch (error) {
      setFrequenciaMessage(error.message);
    }
  };

  const editarFrequencia = (frequencia) => {
    setFrequenciaEmEdicao(frequencia.id);
    setFrequenciaForm({
      aluno_id: String(frequencia.aluno_id),
      data_aula: frequencia.data_aula,
      presente: frequencia.presente ? 'true' : 'false',
    });
    setView('frequencia');
  };

  const excluirFrequencia = async (frequencia) => {
    if (!window.confirm(`Excluir o registro de frequência de ${frequencia.aluno?.nome || 'este aluno'}?`)) return;
    const response = await fetch(`/api/frequencias/${frequencia.id}`, { method: 'DELETE' });
    if (!response.ok) {
      setFrequenciaMessage('Não foi possível excluir o registro de frequência.');
      return;
    }
    setFrequenciaMessage('Registro de frequência excluído com sucesso!');
    carregarFrequencias();
    carregarResumoFrequencia();
    carregarRankingFrequencia();
  };

  const handleTurmaSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(turmaEmEdicao ? `/api/turmas/${turmaEmEdicao}` : '/api/turmas', {
        method: turmaEmEdicao ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(turmaForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.erro || 'Erro ao cadastrar turma');
      }

      setTurmaMessage(turmaEmEdicao ? 'Turma atualizada com sucesso!' : 'Turma cadastrada com sucesso!');
      setTurmaForm(initialTurmaForm);
      setTurmaEmEdicao(null);
      carregarTurmas();
    } catch (error) {
      setTurmaMessage(error.message);
    }
  };

  const vincularAluno = async (turmaId) => {
    const alunoId = alunosSelecionados[turmaId];
    if (!alunoId) return;

    try {
      const response = await fetch(`/api/turmas/${turmaId}/alunos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alunoId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.erro || 'Erro ao vincular aluno');
      }

      setTurmaMessage('Aluno vinculado com sucesso!');
      setAlunosSelecionados({ ...alunosSelecionados, [turmaId]: '' });
      carregarAlunos();
      carregarTurmas();
    } catch (error) {
      setTurmaMessage(error.message);
    }
  };

  const desvincularAluno = async (turmaId, alunoId) => {
    if (!window.confirm('Deseja desvincular este aluno da turma?')) return;

    try {
      const response = await fetch(`/api/turmas/${turmaId}/alunos/${alunoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.erro || 'Erro ao desvincular aluno');
      }

      setTurmaMessage('Aluno desvinculado com sucesso!');
      carregarAlunos();
      carregarTurmas();
    } catch (error) {
      setTurmaMessage(error.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(alunoEmEdicao ? `/api/alunos/${alunoEmEdicao}` : '/api/alunos', {
        method: alunoEmEdicao ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Erro ao cadastrar aluno');
      }

      setMessage(alunoEmEdicao ? 'Aluno atualizado com sucesso!' : 'Aluno cadastrado com sucesso!');
      setForm(initialForm);
      setAlunoEmEdicao(null);
      carregarAlunos();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const editarAluno = (aluno) => {
    setAlunoEmEdicao(aluno.id);
    setForm({
      nome: aluno.nome || '',
      email: aluno.email || '',
      data_nascimento: aluno.data_nascimento || '',
      serie: aluno.serie || '',
      cpf: aluno.cpf || '',
      telefone: aluno.telefone || '',
      endereco: aluno.endereco || '',
    });
    setView('alunos');
  };

  const excluirAluno = async (aluno) => {
    if (!window.confirm(`Excluir o aluno ${aluno.nome}?`)) return;
    const response = await fetch(`/api/alunos/${aluno.id}`, { method: 'DELETE' });
    if (!response.ok) {
      setMessage('Não foi possível excluir o aluno.');
      return;
    }
    setMessage('Aluno excluído com sucesso!');
    carregarAlunos();
  };

  const editarTurma = (turma) => {
    setTurmaEmEdicao(turma.id);
    setTurmaForm({ nome: turma.nome, serie: turma.serie, ano: String(turma.ano) });
    setView('turmas');
  };

  const editarDisciplina = (disciplina) => {
    setDisciplinaEmEdicao(disciplina.id);
    setDisciplinaForm({ turma_id: String(disciplina.turma_id), nome: disciplina.nome });
    setView('turmas');
  };

  const editarNota = (nota) => {
    setNotaEmEdicao(nota.id);
    setNotaForm({
      aluno_id: String(nota.aluno_id),
      disciplina: nota.disciplina,
      bimestre: nota.bimestre,
      nota: String(nota.nota),
    });
    setView('boletim');
  };

  const excluirTurma = async (turma) => {
    if (!window.confirm(`Excluir a turma ${turma.nome}? Os alunos serão desassociados.`)) return;
    const response = await fetch(`/api/turmas/${turma.id}`, { method: 'DELETE' });
    if (!response.ok) {
      setTurmaMessage('Não foi possível excluir a turma.');
      return;
    }
    setTurmaMessage('Turma excluída com sucesso!');
    carregarAlunos();
    carregarTurmas();
    carregarDisciplinas();
  };

  const excluirDisciplina = async (disciplina) => {
    if (!window.confirm(`Excluir a disciplina ${disciplina.nome}?`)) return;
    const response = await fetch(`/api/disciplinas/${disciplina.id}`, { method: 'DELETE' });
    if (!response.ok) {
      setNotaMessage('Não foi possível excluir a disciplina.');
      return;
    }
    setNotaMessage('Disciplina excluída com sucesso!');
    carregarDisciplinas();
  };

  const excluirNota = async (nota) => {
    if (!window.confirm(`Excluir a nota de ${nota.aluno?.nome || 'este aluno'}?`)) return;
    const response = await fetch(`/api/notas/${nota.id}`, { method: 'DELETE' });
    if (!response.ok) {
      setNotaMessage('Não foi possível excluir a nota.');
      return;
    }
    setNotaMessage('Nota excluída com sucesso!');
    carregarNotas();
  };

  const alunosFiltrados = alunos.filter((aluno) => (
    `${aluno.nome} ${aluno.email} ${aluno.serie}`.toLowerCase().includes(alunoBusca.toLowerCase())
  ));

  const turmasFiltradas = turmas.filter((turma) => (
    `${turma.nome} ${turma.serie} ${turma.ano}`.toLowerCase().includes(turmaBusca.toLowerCase())
  ));

  const disciplinasFiltradas = disciplinas.filter((disciplina) => {
    const turmaNome = turmas.find((turma) => Number(turma.id) === Number(disciplina.turma_id))?.nome || '';
    return `${disciplina.nome} ${turmaNome}`.toLowerCase().includes(disciplinaBusca.toLowerCase());
  });

  const notasFiltradas = notas.filter((nota) => {
    const alunoNome = nota.aluno?.nome || '';
    return `${alunoNome} ${nota.disciplina} ${nota.bimestre}`.toLowerCase().includes(notaBusca.toLowerCase());
  });

  const frequenciasFiltradas = frequencias.filter((frequencia) => {
    const alunoNome = frequencia.aluno?.nome || '';
    return `${alunoNome} ${frequencia.data_aula}`.toLowerCase().includes(frequenciaBusca.toLowerCase());
  });

  const formatarData = (data) => {
    if (!data) return '—';
    const [ano, mes, dia] = String(data).slice(0, 10).split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const resumoBoletim = alunos.map((aluno) => {
    const notasAluno = notas.filter((nota) => Number(nota.aluno_id) === Number(aluno.id));
    const media = notasAluno.length
      ? (notasAluno.reduce((soma, nota) => soma + Number(nota.nota), 0) / notasAluno.length).toFixed(1)
      : '—';

    return {
      aluno,
      media,
      notas: notasAluno,
      situacao: media === '—' ? 'Sem notas' : Number(media) >= 7 ? 'Aprovado' : Number(media) >= 5 ? 'Recuperação' : 'Reprovado',
    };
  });

  const mediaGeral = notas.length
    ? (notas.reduce((soma, nota) => soma + Number(nota.nota), 0) / notas.length).toFixed(1)
    : '0.0';

  const calcularSituacao = (media) => {
    if (media === null || Number.isNaN(media)) return 'Sem notas';
    if (media >= 7) return 'Aprovado';
    if (media >= 5) return 'Recuperação';
    return 'Reprovado';
  };

  const maiorNotaGeral = notas.length ? Math.max(...notas.map((nota) => Number(nota.nota))) : 0;
  const menorNotaGeral = notas.length ? Math.min(...notas.map((nota) => Number(nota.nota))) : 0;

  const desempenhoPorAluno = alunos.map((aluno) => {
    const notasAluno = notas.filter((nota) => Number(nota.aluno_id) === Number(aluno.id));
    const mediaAluno = notasAluno.length
      ? notasAluno.reduce((soma, nota) => soma + Number(nota.nota), 0) / notasAluno.length
      : null;

    return {
      aluno,
      mediaAluno,
      maiorNota: notasAluno.length ? Math.max(...notasAluno.map((nota) => Number(nota.nota))) : null,
      menorNota: notasAluno.length ? Math.min(...notasAluno.map((nota) => Number(nota.nota))) : null,
      situacao: calcularSituacao(mediaAluno),
      miniBoletim: notasAluno.map((nota) => ({
        disciplina: nota.disciplina,
        nota: Number(nota.nota),
      })),
    };
  });

  if (!loggedIn) {
    return (
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper elevation={6} sx={{ p: { xs: 3, md: 5 }, borderRadius: 4 }}>
          <Stack spacing={3} alignItems="center">
            <Box textAlign="center">
              <Typography variant="h4" fontWeight={700}>
                Sistema Escolar
              </Typography>
              <Typography color="text.secondary">
                Acesso seguro ao painel administrativo da escola.
              </Typography>
            </Box>

            <form onSubmit={handleLoginSubmit} style={{ width: '100%' }}>
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Usuário ou e-mail"
                  name="usuario"
                  value={loginForm.usuario}
                  onChange={handleLoginChange}
                />
                <TextField
                  fullWidth
                  label="Senha"
                  name="senha"
                  type="password"
                  value={loginForm.senha}
                  onChange={handleLoginChange}
                />
                <Button type="submit" variant="contained" size="large">
                  Entrar
                </Button>
              </Stack>
            </form>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Acesso provisório ao sistema. Preencha usuário e senha para entrar.
            </Typography>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 4 }, borderRadius: 4 }}>
        <Stack spacing={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Painel Escolar
              </Typography>
              <Typography color="text.secondary">
                Gestão administrativa e cadastro de estudantes.
              </Typography>
            </Box>
            <Button
              type="button"
              variant="outlined"
              onClick={() => {
                localStorage.removeItem('escola_token');
                localStorage.removeItem('escola_usuario');
                setToken('');
                setUsuarioLogado(null);
                setLoggedIn(false);
              }}
            >
              Sair
            </Button>
          </Box>

          <Grid container spacing={2}>
            {menuItems.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.key}>
                <Button
                  type="button"
                  fullWidth
                  variant={view === item.key ? 'contained' : 'outlined'}
                  sx={{ justifyContent: 'flex-start', py: 2, px: 2, minHeight: 88 }}
                  onClick={() => setView(item.key)}
                >
                  <Box textAlign="left">
                    <Typography fontWeight={600}>{item.label}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      {item.description}
                    </Typography>
                  </Box>
                </Button>
              </Grid>
            ))}
          </Grid>

          {view === 'boletim' ? (
            <Box>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                Boletim digital
              </Typography>

              {notaMessage && (
                <Alert severity={notaMessage.includes('sucesso') ? 'success' : 'error'} sx={{ mb: 2 }}>
                  {notaMessage}
                </Alert>
              )}

              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <form onSubmit={handleNotaSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField select fullWidth label="Aluno" name="aluno_id" value={notaForm.aluno_id} onChange={handleNotaChange} required>
                        {alunos.map((aluno) => (
                          <MenuItem key={aluno.id} value={aluno.id}>{aluno.nome}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        select
                        fullWidth
                        label="Disciplina"
                        name="disciplina"
                        value={notaForm.disciplina}
                        onChange={handleNotaChange}
                        required
                        disabled={!disciplinas.length}
                      >
                        {disciplinas.map((disciplina) => (
                          <MenuItem key={disciplina.id} value={disciplina.nome}>{disciplina.nome}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField select fullWidth label="Bimestre" name="bimestre" value={notaForm.bimestre} onChange={handleNotaChange} required>
                        <MenuItem value="1º Bimestre">1º Bimestre</MenuItem>
                        <MenuItem value="2º Bimestre">2º Bimestre</MenuItem>
                        <MenuItem value="3º Bimestre">3º Bimestre</MenuItem>
                        <MenuItem value="4º Bimestre">4º Bimestre</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <TextField fullWidth label="Nota" name="nota" type="number" inputProps={{ min: 0, max: 10, step: '0.1' }} value={notaForm.nota} onChange={handleNotaChange} required />
                    </Grid>
                  </Grid>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
                    <Button type="submit" variant="contained" size="large" disabled={!disciplinas.length}>{notaEmEdicao ? 'Atualizar nota' : 'Salvar nota'}</Button>
                    <Button variant="outlined" size="large" onClick={() => { setNotaForm(initialNotaForm); setNotaEmEdicao(null); }}>Limpar</Button>
                  </Stack>
                </form>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Resumo do boletim</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f7ff' }}>
                      <Typography variant="body2" color="text.secondary">Média geral da turma</Typography>
                      <Typography variant="h5" fontWeight={700}>{mediaGeral}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5fff7' }}>
                      <Typography variant="body2" color="text.secondary">Maior nota</Typography>
                      <Typography variant="h5" fontWeight={700}>{notas.length ? maiorNotaGeral.toFixed(1) : '0.0'}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fffaf1' }}>
                      <Typography variant="body2" color="text.secondary">Menor nota</Typography>
                      <Typography variant="h5" fontWeight={700}>{notas.length ? menorNotaGeral.toFixed(1) : '0.0'}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f7ff' }}>
                      <Typography variant="body2" color="text.secondary">Total de notas</Typography>
                      <Typography variant="h5" fontWeight={700}>{notas.length}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5fff7' }}>
                      <Typography variant="body2" color="text.secondary">Alunos com notas</Typography>
                      <Typography variant="h5" fontWeight={700}>{resumoBoletim.filter((item) => item.notas.length).length}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fffaf1' }}>
                      <Typography variant="body2" color="text.secondary">Status da turma</Typography>
                      <Typography variant="h5" fontWeight={700}>{notas.length ? (Number(mediaGeral) >= 7 ? 'Aprovada' : Number(mediaGeral) >= 5 ? 'Recuperação' : 'Reprovada') : 'Sem notas'}</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Desempenho por aluno</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Aluno</TableCell>
                        <TableCell>Média</TableCell>
                        <TableCell>Maior nota</TableCell>
                        <TableCell>Menor nota</TableCell>
                        <TableCell>Situação</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {desempenhoPorAluno.map(({ aluno, mediaAluno, maiorNota, menorNota, situacao }) => (
                        <TableRow key={aluno.id} hover>
                          <TableCell>{aluno.nome}</TableCell>
                          <TableCell>{mediaAluno === null ? '—' : mediaAluno.toFixed(1)}</TableCell>
                          <TableCell>{maiorNota === null ? '—' : maiorNota.toFixed(1)}</TableCell>
                          <TableCell>{menorNota === null ? '—' : menorNota.toFixed(1)}</TableCell>
                          <TableCell>{situacao}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Mini boletim</Typography>
                <Grid container spacing={2}>
                  {desempenhoPorAluno.filter((item) => item.miniBoletim.length > 0).map(({ aluno, mediaAluno, miniBoletim, situacao }) => (
                    <Grid item xs={12} md={6} key={aluno.id}>
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Typography variant="subtitle1" fontWeight={700}>{aluno.nome}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Média: {mediaAluno === null ? '—' : mediaAluno.toFixed(1)} · Situação: {situacao}
                        </Typography>
                        <Stack spacing={1}>
                          {miniBoletim.map((item) => (
                            <Box key={`${aluno.id}-${item.disciplina}`} sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee', pb: 0.5 }}>
                              <Typography variant="body2">{item.disciplina}</Typography>
                              <Typography variant="body2" fontWeight={600}>{item.nota.toFixed(1)}</Typography>
                            </Box>
                          ))}
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
                  <Typography variant="h6">Notas cadastradas</Typography>
                  <TextField size="small" label="Buscar nota" value={notaBusca} onChange={(event) => setNotaBusca(event.target.value)} />
                </Stack>

                {notasFiltradas.length === 0 ? (
                  <Typography color="text.secondary">Nenhuma nota cadastrada ainda.</Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Aluno</TableCell>
                          <TableCell>Disciplina</TableCell>
                          <TableCell>Bimestre</TableCell>
                          <TableCell>Nota</TableCell>
                          <TableCell>Situação</TableCell>
                          <TableCell align="right">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {notasFiltradas.map((nota) => {
                          const media = Number(nota.nota);
                          const situacao = media >= 7 ? 'Aprovado' : media >= 5 ? 'Recuperação' : 'Reprovado';
                          return (
                            <TableRow key={nota.id} hover>
                              <TableCell>{nota.aluno?.nome || 'Aluno removido'}</TableCell>
                              <TableCell>{nota.disciplina}</TableCell>
                              <TableCell>{nota.bimestre}</TableCell>
                              <TableCell>{Number(nota.nota).toFixed(1)}</TableCell>
                              <TableCell>{situacao}</TableCell>
                              <TableCell align="right">
                                <Button size="small" onClick={() => editarNota(nota)}>Editar</Button>
                                <Button size="small" color="error" onClick={() => excluirNota(nota)}>Excluir</Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Box>
          ) : view === 'alunos' ? (
            <Box>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                Cadastro de Alunos
              </Typography>

              {message && (
                <Alert severity={message.includes('sucesso') ? 'success' : 'error'} sx={{ mb: 2 }}>
                  {message}
                </Alert>
              )}

              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <form onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="Nome" name="nome" value={form.nome} onChange={handleChange} required />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="E-mail" name="email" type="email" value={form.email} onChange={handleChange} required />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="Data de nascimento" name="data_nascimento" type="date" value={form.data_nascimento} onChange={handleChange} InputLabelProps={{ shrink: true }} required />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField select fullWidth label="Série" name="serie" value={form.serie} onChange={handleChange} required>
                        <MenuItem value="1º Ano">1º Ano</MenuItem>
                        <MenuItem value="2º Ano">2º Ano</MenuItem>
                        <MenuItem value="3º Ano">3º Ano</MenuItem>
                        <MenuItem value="4º Ano">4º Ano</MenuItem>
                        <MenuItem value="5º Ano">5º Ano</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField fullWidth label="CPF" name="cpf" value={form.cpf} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField fullWidth label="Telefone" name="telefone" value={form.telefone} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField fullWidth label="Endereço" name="endereco" value={form.endereco} onChange={handleChange} />
                    </Grid>
                  </Grid>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
                    <Button type="submit" variant="contained" size="large">
                      {alunoEmEdicao ? 'Atualizar aluno' : 'Salvar aluno'}
                    </Button>
                    <Button variant="outlined" size="large" onClick={() => { setForm(initialForm); setAlunoEmEdicao(null); }}>
                      Limpar
                    </Button>
                  </Stack>
                </form>
              </Paper>

              <Paper variant="outlined" sx={{ mt: 4, p: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
                  <Typography variant="h6">Lista de alunos</Typography>
                  <TextField size="small" label="Buscar aluno" value={alunoBusca} onChange={(event) => setAlunoBusca(event.target.value)} />
                </Stack>
                {alunosFiltrados.length === 0 ? (
                    <Typography color="text.secondary">Nenhum aluno cadastrado ainda.</Typography>
                  ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead><TableRow><TableCell>Nome</TableCell><TableCell>E-mail</TableCell><TableCell>Série</TableCell><TableCell align="right">Ações</TableCell></TableRow></TableHead>
                      <TableBody>{alunosFiltrados.map((aluno) => (
                        <TableRow key={aluno.id} hover>
                          <TableCell>{aluno.nome}</TableCell><TableCell>{aluno.email}</TableCell><TableCell>{aluno.serie}</TableCell>
                          <TableCell align="right"><Button size="small" onClick={() => editarAluno(aluno)}>Editar</Button><Button size="small" color="error" onClick={() => excluirAluno(aluno)}>Excluir</Button></TableCell>
                        </TableRow>
                      ))}</TableBody>
                    </Table>
                  </TableContainer>
                  )}
              </Paper>
            </Box>
          ) : view === 'turmas' ? (
            <Box>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                Gestão de Turmas
              </Typography>

              {turmaMessage && (
                <Alert
                  severity={turmaMessage.includes('sucesso') ? 'success' : 'error'}
                  sx={{ mb: 2 }}
                  action={
                    turmaMessage.includes('carregar') ? (
                      <Button color="inherit" size="small" onClick={carregarTurmas}>
                        Tentar novamente
                      </Button>
                    ) : null
                  }
                >
                  {turmaMessage}
                </Alert>
              )}

              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <form onSubmit={handleTurmaSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField fullWidth label="Nome da turma" name="nome" value={turmaForm.nome} onChange={handleTurmaChange} placeholder="Ex.: 3º DS" required />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField select fullWidth label="Série" name="serie" value={turmaForm.serie} onChange={handleTurmaChange} required>
                        <MenuItem value="1º Ano">1º Ano</MenuItem>
                        <MenuItem value="2º Ano">2º Ano</MenuItem>
                        <MenuItem value="3º Ano">3º Ano</MenuItem>
                        <MenuItem value="4º Ano">4º Ano</MenuItem>
                        <MenuItem value="5º Ano">5º Ano</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField fullWidth label="Ano letivo" name="ano" type="number" value={turmaForm.ano} onChange={handleTurmaChange} inputProps={{ min: 2000, max: 2100 }} required />
                    </Grid>
                  </Grid>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
                    <Button type="submit" variant="contained" size="large">{turmaEmEdicao ? 'Atualizar turma' : 'Salvar turma'}</Button>
                    <Button variant="outlined" size="large" onClick={() => { setTurmaForm(initialTurmaForm); setTurmaEmEdicao(null); }}>Limpar</Button>
                  </Stack>
                </form>
              </Paper>

              <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
                  <Typography variant="h6">Lista de turmas</Typography>
                  <TextField size="small" label="Buscar turma" value={turmaBusca} onChange={(event) => setTurmaBusca(event.target.value)} />
                </Stack>
                {turmasFiltradas.length === 0 ? <Typography color="text.secondary">Nenhuma turma cadastrada ainda.</Typography> : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead><TableRow><TableCell>Turma</TableCell><TableCell>Série</TableCell><TableCell>Ano</TableCell><TableCell>Alunos</TableCell><TableCell align="right">Ações</TableCell></TableRow></TableHead>
                      <TableBody>{turmasFiltradas.map((turma) => {
                  const alunosVinculados = turma.alunos || [];
                  const alunosDisponiveis = alunos.filter((aluno) => !aluno.turma_id);

                  return (
                    <TableRow key={turma.id} hover>
                      <TableCell>{turma.nome}</TableCell><TableCell>{turma.serie}</TableCell><TableCell>{turma.ano}</TableCell><TableCell>{alunosVinculados.length}</TableCell>
                      <TableCell align="right"><Button size="small" onClick={() => editarTurma(turma)}>Editar</Button><Button size="small" color="error" onClick={() => excluirTurma(turma)}>Excluir</Button></TableCell>
                    </TableRow>
                  );
                })}</TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>

              <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Cadastre disciplinas da turma</Typography>
                <form onSubmit={handleDisciplinaSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={5}>
                      <TextField select fullWidth label="Turma" name="turma_id" value={disciplinaForm.turma_id} onChange={handleDisciplinaChange} required>
                        {turmas.map((turma) => (
                          <MenuItem key={turma.id} value={turma.id}>{turma.nome} - {turma.serie}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={5}>
                      <TextField fullWidth label="Nome da disciplina" name="nome" value={disciplinaForm.nome} onChange={handleDisciplinaChange} placeholder="Ex.: Matemática" required />
                    </Grid>
                    <Grid item xs={12} md={2}>
                      <Button type="submit" variant="contained" fullWidth sx={{ height: '100%' }}>{disciplinaEmEdicao ? 'Atualizar' : 'Salvar'}</Button>
                    </Grid>
                  </Grid>
                </form>
              </Paper>

              <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
                  <Typography variant="h6">Disciplinas cadastradas</Typography>
                  <TextField size="small" label="Buscar disciplina" value={disciplinaBusca} onChange={(event) => setDisciplinaBusca(event.target.value)} />
                </Stack>
                {disciplinasFiltradas.length === 0 ? (
                  <Typography color="text.secondary">Nenhuma disciplina cadastrada ainda.</Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Disciplina</TableCell>
                          <TableCell>Turma</TableCell>
                          <TableCell align="right">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {disciplinasFiltradas.map((disciplina) => {
                          const turma = turmas.find((item) => Number(item.id) === Number(disciplina.turma_id));
                          return (
                            <TableRow key={disciplina.id} hover>
                              <TableCell>{disciplina.nome}</TableCell>
                              <TableCell>{turma ? `${turma.nome} - ${turma.serie}` : 'Turma não encontrada'}</TableCell>
                              <TableCell align="right">
                                <Button size="small" onClick={() => editarDisciplina(disciplina)}>Editar</Button>
                                <Button size="small" color="error" onClick={() => excluirDisciplina(disciplina)}>Excluir</Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>

              <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Alunos por turma</Typography>
                {turmasFiltradas.map((turma) => {
                  const alunosVinculados = turma.alunos || [];
                  const alunosDisponiveis = alunos.filter((aluno) => !aluno.turma_id);
                  return (
                    <Box key={turma.id} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                      <Typography fontWeight={600}>{turma.nome}</Typography>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Adicionar aluno"
                          value={alunosSelecionados[turma.id] || ''}
                          onChange={(event) => setAlunosSelecionados({ ...alunosSelecionados, [turma.id]: event.target.value })}
                        >
                          {alunosDisponiveis.map((aluno) => (
                            <MenuItem key={aluno.id} value={aluno.id}>{aluno.nome}</MenuItem>
                          ))}
                        </TextField>
                        <Button variant="outlined" onClick={() => vincularAluno(turma.id)} disabled={!alunosSelecionados[turma.id]}>
                          Vincular
                        </Button>
                      </Stack>

                      <Box sx={{ mt: 2 }}>
                        {alunosVinculados.length ? (
                          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                            {alunosVinculados.map((aluno) => (
                              <Chip
                                key={aluno.id}
                                label={aluno.nome}
                                onDelete={() => desvincularAluno(turma.id, aluno.id)}
                                color="primary"
                                variant="outlined"
                              />
                            ))}
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.secondary">Nenhum aluno vinculado.</Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Paper>
            </Box>
          ) : view === 'frequencia' ? (
            <Box>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                Controle de Frequência
              </Typography>

              {frequenciaMessage && (
                <Alert
                  severity={frequenciaMessage.includes('sucesso') ? 'success' : 'error'}
                  sx={{ mb: 2 }}
                >
                  {frequenciaMessage}
                </Alert>
              )}

              <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Registrar Frequência</Typography>
                <form onSubmit={handleFrequenciaSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <TextField select fullWidth label="Aluno" name="aluno_id" value={frequenciaForm.aluno_id} onChange={handleFrequenciaChange} required>
                        {alunos.map((aluno) => (
                          <MenuItem key={aluno.id} value={aluno.id}>{aluno.nome}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField fullWidth label="Data" name="data_aula" type="date" value={frequenciaForm.data_aula} onChange={handleFrequenciaChange} InputLabelProps={{ shrink: true }} required />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField select fullWidth label="Presença" name="presente" value={frequenciaForm.presente} onChange={handleFrequenciaChange} required>
                        <MenuItem value="true">Presente</MenuItem>
                        <MenuItem value="false">Ausente</MenuItem>
                      </TextField>
                    </Grid>
                  </Grid>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
                    <Button type="submit" variant="contained" size="large">{frequenciaEmEdicao ? 'Atualizar frequência' : 'Registrar'}</Button>
                    <Button variant="outlined" size="large" onClick={() => { setFrequenciaForm(initialFrequenciaForm); setFrequenciaEmEdicao(null); }}>Limpar</Button>
                  </Stack>
                </form>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Painel de frequência</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f7ff' }}>
                      <Typography variant="body2" color="text.secondary">Total de registros</Typography>
                      <Typography variant="h5" fontWeight={700}>{frequencias.length}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5fff7' }}>
                      <Typography variant="body2" color="text.secondary">Presenças</Typography>
                      <Typography variant="h5" fontWeight={700}>{frequencias.filter((item) => item.presente).length}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fff1f1' }}>
                      <Typography variant="body2" color="text.secondary">Ausências</Typography>
                      <Typography variant="h5" fontWeight={700}>{frequencias.filter((item) => !item.presente).length}</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Frequência por aluno</Typography>
                {resumoFrequencia.length === 0 ? (
                  <Typography color="text.secondary">Nenhuma frequência registrada ainda.</Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Aluno</TableCell>
                          <TableCell align="center">Registros</TableCell>
                          <TableCell align="center">Presenças</TableCell>
                          <TableCell align="center">Faltas</TableCell>
                          <TableCell align="center">% Frequência</TableCell>
                          <TableCell>Situação</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {resumoFrequencia.map((item) => (
                          <TableRow key={item.aluno.id} hover>
                            <TableCell>{item.aluno.nome}</TableCell>
                            <TableCell align="center">{item.total}</TableCell>
                            <TableCell align="center">{item.presencas}</TableCell>
                            <TableCell align="center">{item.faltas}</TableCell>
                            <TableCell align="center">{item.percentual === null ? '—' : `${item.percentual.toFixed(1)}%`}</TableCell>
                            <TableCell>
                              <Chip
                                label={item.situacao}
                                color={item.cor === 'success' ? 'success' : item.cor === 'warning' ? 'warning' : item.cor === 'error' ? 'error' : 'default'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Alerta: alunos com frequência abaixo de 75%</Typography>
                {resumoFrequencia.filter((item) => item.percentual !== null && item.percentual < 75).length === 0 ? (
                  <Typography color="text.secondary">Nenhum aluno abaixo de 75% de frequência. 🎉</Typography>
                ) : (
                  <Stack spacing={1}>
                    {resumoFrequencia
                      .filter((item) => item.percentual !== null && item.percentual < 75)
                      .map((item) => (
                        <Alert key={item.aluno.id} severity="error">
                          {item.aluno.nome} está com {item.percentual.toFixed(1)}% de frequência.
                        </Alert>
                      ))}
                  </Stack>
                )}
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Ranking de frequência da turma</Typography>
                {rankingFrequencia.length === 0 ? (
                  <Typography color="text.secondary">Sem dados para ranking.</Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>#</TableCell>
                          <TableCell>Aluno</TableCell>
                          <TableCell align="center">% Frequência</TableCell>
                          <TableCell>Situação</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rankingFrequencia.map((item, indice) => (
                          <TableRow key={item.aluno.id} hover>
                            <TableCell>{indice + 1}º</TableCell>
                            <TableCell>{item.aluno.nome}</TableCell>
                            <TableCell align="center">{item.percentual.toFixed(1)}%</TableCell>
                            <TableCell>
                              <Chip
                                label={item.situacao}
                                color={item.cor === 'success' ? 'success' : item.cor === 'warning' ? 'warning' : item.cor === 'error' ? 'error' : 'default'}
                                size="small"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
                  <Typography variant="h6">Registros de frequência</Typography>
                  <TextField size="small" label="Buscar registro" value={frequenciaBusca} onChange={(event) => setFrequenciaBusca(event.target.value)} />
                </Stack>

                {frequenciasFiltradas.length === 0 ? (
                  <Typography color="text.secondary">Nenhum registro cadastrado ainda.</Typography>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Aluno</TableCell>
                          <TableCell>Data</TableCell>
                          <TableCell>Presença</TableCell>
                          <TableCell align="right">Ações</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {frequenciasFiltradas.map((frequencia) => (
                          <TableRow key={frequencia.id} hover>
                            <TableCell>{frequencia.aluno?.nome || 'Aluno removido'}</TableCell>
                            <TableCell>{formatarData(frequencia.data_aula)}</TableCell>
                            <TableCell>
                              <Chip label={frequencia.presente ? 'Presente' : 'Ausente'} color={frequencia.presente ? 'success' : 'error'} size="small" />
                            </TableCell>
                            <TableCell align="right">
                              <Button size="small" onClick={() => editarFrequencia(frequencia)}>Editar</Button>
                              <Button size="small" color="error" onClick={() => excluirFrequencia(frequencia)}>Excluir</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </Box>
          ) : (
            <Paper variant="outlined" sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h6" gutterBottom>
                {menuItems.find((item) => item.key === view)?.label}
              </Typography>
              <Typography color="text.secondary">
                Selecione uma opção no menu para começar.
              </Typography>
            </Paper>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}

export default App;
