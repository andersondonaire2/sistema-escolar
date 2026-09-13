import { Op } from 'sequelize';
import Frequencia from '../models/Frequencia.js';
import Aluno from '../models/Aluno.js';
import Disciplina from '../models/Disciplina.js';
import Professor from '../models/Professor.js';

async function listarFrequencias(req, res) {
  try {
    const frequencias = await Frequencia.findAll({
      include: [{ model: Aluno, as: 'aluno', attributes: ['id', 'nome', 'serie'] }],
      order: [['data_aula', 'DESC']],
    });
    res.status(200).json(frequencias);
  } catch (erro) {
    res.status(500).json({ erro: `Erro ao listar frequências: ${erro.message}` });
  }
}

async function cadastrarChamada(req, res) {
  const { disciplina_id, plano_aula, data_aula, quantidade_aulas, faltas = [] } = req.body;
  const quantidade = Number(quantidade_aulas);

  if (!disciplina_id || !data_aula || !Number.isInteger(quantidade) || quantidade < 1 || quantidade > 10) {
    return res.status(400).json({ erro: 'Disciplina, data e quantidade de aulas válida são obrigatórias.' });
  }

  try {
    const disciplina = await Disciplina.findByPk(Number(disciplina_id));
    if (!disciplina) return res.status(404).json({ erro: 'Disciplina não encontrada.' });

    if (req.usuario?.perfil === 'professor') {
      const professor = await Professor.findByPk(req.usuario.id);
      if (!professor || Number(professor.disciplina_id) !== Number(disciplina.id)) {
        return res.status(403).json({ erro: 'Você só pode lançar chamada da sua disciplina.' });
      }
    }

    const alunos = await Aluno.findAll({ where: { turma_id: disciplina.turma_id } });
    if (!alunos.length) return res.status(400).json({ erro: 'A turma desta disciplina não possui alunos.' });

    const faltasPorAluno = new Map(faltas.map((item) => [Number(item.aluno_id), new Set(item.aulas || [])]));
    const registros = [];
    for (const aluno of alunos) {
      const aulasComFalta = faltasPorAluno.get(Number(aluno.id)) || new Set();
      for (let numeroAula = 1; numeroAula <= quantidade; numeroAula += 1) {
        registros.push({
          aluno_id: aluno.id,
          disciplina_id: disciplina.id,
          data_aula,
          plano_aula: plano_aula?.trim() || null,
          quantidade_aulas: quantidade,
          numero_aula: numeroAula,
          presente: !aulasComFalta.has(numeroAula),
        });
      }
    }

    await Frequencia.bulkCreate(registros);
    return res.status(201).json({ disciplina, quantidade_aulas: quantidade, registros: registros.length });
  } catch (erro) {
    if (erro.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ erro: 'Já existe uma chamada para algum aluno, data e aula informados.' });
    }
    return res.status(400).json({ erro: `Erro ao salvar chamada: ${erro.message}` });
  }
}

async function cadastrarFrequencia(req, res) {
  const { aluno_id, data_aula, presente } = req.body;

  if (!aluno_id || !data_aula) {
    return res.status(400).json({ erro: 'Aluno e data são obrigatórios.' });
  }

  const presenteBool = presente !== undefined ? Boolean(presente) : true;

  try {
    const aluno = await Aluno.findByPk(Number(aluno_id));
    if (!aluno) {
      return res.status(404).json({ erro: 'Aluno não encontrado.' });
    }

    const jaExiste = await Frequencia.findOne({
      where: {
        aluno_id: Number(aluno_id),
        data_aula: data_aula,
      },
    });

    if (jaExiste) {
      return res.status(409).json({ erro: 'Já existe um registro de frequência para este aluno nesta data.' });
    }

    const novaFrequencia = await Frequencia.create({
      aluno_id: Number(aluno_id),
      data_aula: data_aula,
      presente: presenteBool,
    });

    res.status(201).json(novaFrequencia);
  } catch (erro) {
    res.status(400).json({ erro: `Erro ao salvar frequência: ${erro.message}` });
  }
}

async function editarFrequencia(req, res) {
  const { aluno_id, data_aula, presente } = req.body;

  if (!aluno_id || !data_aula) {
    return res.status(400).json({ erro: 'Aluno e data são obrigatórios.' });
  }

  try {
    const frequencia = await Frequencia.findByPk(req.params.id);
    if (!frequencia) {
      return res.status(404).json({ erro: 'Registro de frequência não encontrado.' });
    }

    const aluno = await Aluno.findByPk(Number(aluno_id));
    if (!aluno) {
      return res.status(404).json({ erro: 'Aluno não encontrado.' });
    }

    const jaExiste = await Frequencia.findOne({
      where: {
        aluno_id: Number(aluno_id),
        data_aula: data_aula,
        id: { [Op.ne]: Number(frequencia.id) },
      },
    });

    if (jaExiste) {
      return res.status(409).json({ erro: 'Já existe um registro de frequência para este aluno nesta data.' });
    }

    await frequencia.update({
      aluno_id: Number(aluno_id),
      data_aula: data_aula,
      presente: presente !== undefined ? Boolean(presente) : frequencia.presente,
    });

    res.status(200).json(frequencia);
  } catch (erro) {
    res.status(400).json({ erro: `Erro ao editar frequência: ${erro.message}` });
  }
}

async function excluirFrequencia(req, res) {
  try {
    const frequencia = await Frequencia.findByPk(req.params.id);
    if (!frequencia) return res.status(404).json({ erro: 'Registro de frequência não encontrado.' });

    await frequencia.destroy();
    res.status(204).send();
  } catch (erro) {
    res.status(400).json({ erro: `Erro ao excluir frequência: ${erro.message}` });
  }
}

function classificarFrequencia(percentual) {
  if (percentual === null || Number.isNaN(percentual)) return 'Sem registros';
  if (percentual < 75) return 'Risco de Reprovação';
  if (percentual < 90) return 'Atenção';
  return 'Frequência Boa';
}

function corSituacao(percentual) {
  if (percentual === null || Number.isNaN(percentual)) return 'gray';
  if (percentual < 75) return 'error';
  if (percentual < 90) return 'warning';
  return 'success';
}

async function resumoFrequencia(req, res) {
  try {
    const alunos = await Aluno.findAll({ order: [['nome', 'ASC']] });
    const frequencias = await Frequencia.findAll();

    const resumo = alunos.map((aluno) => {
      const registrosAluno = frequencias.filter((registro) => Number(registro.aluno_id) === Number(aluno.id));
      const total = registrosAluno.length;
      const presencas = registrosAluno.filter((registro) => registro.presente).length;
      const faltas = total - presencas;
      const percentual = total ? (presencas / total) * 100 : null;

      return {
        aluno,
        total,
        presencas,
        faltas,
        percentual,
        situacao: classificarFrequencia(percentual),
        cor: corSituacao(percentual),
      };
    });

    res.status(200).json(resumo);
  } catch (erro) {
    res.status(500).json({ erro: `Erro ao calcular resumo de frequência: ${erro.message}` });
  }
}

async function rankingFrequencia(req, res) {
  try {
    const alunos = await Aluno.findAll();
    const frequencias = await Frequencia.findAll();

    const ranking = alunos
      .map((aluno) => {
        const registrosAluno = frequencias.filter((registro) => Number(registro.aluno_id) === Number(aluno.id));
        const total = registrosAluno.length;
        const presencas = registrosAluno.filter((registro) => registro.presente).length;
        return {
          aluno,
          total,
          presencas,
          percentual: total ? (presencas / total) * 100 : null,
          situacao: classificarFrequencia(total ? (presencas / total) * 100 : null),
          cor: corSituacao(total ? (presencas / total) * 100 : null),
        };
      })
      .filter((item) => item.percentual !== null)
      .sort((a, b) => b.percentual - a.percentual);

    res.status(200).json(ranking);
  } catch (erro) {
    res.status(500).json({ erro: `Erro ao calcular ranking de frequência: ${erro.message}` });
  }
}

export default {
  listarFrequencias,
  cadastrarFrequencia,
  cadastrarChamada,
  editarFrequencia,
  excluirFrequencia,
  resumoFrequencia,
  rankingFrequencia,
};
