import Nota from '../models/Nota.js';
import Aluno from '../models/Aluno.js';
import { registrarAuditoria } from './auditoriaController.js';

async function listarNotas(req, res) {
  try {
    const notas = await Nota.findAll({
      include: [{ model: Aluno, as: 'aluno', attributes: ['id', 'nome', 'serie'] }],
      order: [['id', 'DESC']],
    });
    res.status(200).json(notas);
  } catch (erro) {
    res.status(500).json({ erro: `Erro ao listar notas: ${erro.message}` });
  }
}

async function cadastrarNota(req, res) {
  const { aluno_id, disciplina, bimestre, nota } = req.body;

  if (!aluno_id || !disciplina?.trim() || !bimestre?.trim() || nota === undefined || nota === null || Number.isNaN(Number(nota))) {
    return res.status(400).json({ erro: 'Aluno, disciplina, bimestre e nota são obrigatórios.' });
  }

  const valorNota = Number(nota);
  if (valorNota < 0 || valorNota > 10) {
    return res.status(400).json({ erro: 'A nota deve estar entre 0 e 10.' });
  }

  try {
    const aluno = await Aluno.findByPk(Number(aluno_id));
    if (!aluno) {
      return res.status(404).json({ erro: 'Aluno não encontrado.' });
    }

    const novaNota = await Nota.create({
      aluno_id: Number(aluno_id),
      disciplina: disciplina.trim(),
      bimestre: bimestre.trim(),
      nota: valorNota,
    });

    void registrarAuditoria({ usuario_id: req.usuario?.id, usuario_nome: req.usuario?.nome, perfil: req.usuario?.perfil, operacao: 'CRIACAO', recurso: 'NOTA', recurso_id: novaNota.id, detalhes: { aluno_id: novaNota.aluno_id, disciplina: novaNota.disciplina, bimestre: novaNota.bimestre } });
    res.status(201).json(novaNota);
  } catch (erro) {
    res.status(400).json({ erro: `Erro ao salvar nota: ${erro.message}` });
  }
}

async function editarNota(req, res) {
  const { aluno_id, disciplina, bimestre, nota } = req.body;

  if (!aluno_id || !disciplina?.trim() || !bimestre?.trim() || nota === undefined || nota === null || Number.isNaN(Number(nota))) {
    return res.status(400).json({ erro: 'Aluno, disciplina, bimestre e nota são obrigatórios.' });
  }

  const valorNota = Number(nota);
  if (valorNota < 0 || valorNota > 10) {
    return res.status(400).json({ erro: 'A nota deve estar entre 0 e 10.' });
  }

  try {
    const notaAtual = await Nota.findByPk(req.params.id);
    if (!notaAtual) {
      return res.status(404).json({ erro: 'Nota não encontrada.' });
    }

    const aluno = await Aluno.findByPk(Number(aluno_id));
    if (!aluno) {
      return res.status(404).json({ erro: 'Aluno não encontrado.' });
    }

    await notaAtual.update({
      aluno_id: Number(aluno_id),
      disciplina: disciplina.trim(),
      bimestre: bimestre.trim(),
      nota: valorNota,
    });

    void registrarAuditoria({ usuario_id: req.usuario?.id, usuario_nome: req.usuario?.nome, perfil: req.usuario?.perfil, operacao: 'EDICAO', recurso: 'NOTA', recurso_id: notaAtual.id, detalhes: { aluno_id: notaAtual.aluno_id, disciplina: notaAtual.disciplina, bimestre: notaAtual.bimestre } });
    res.status(200).json(notaAtual);
  } catch (erro) {
    res.status(400).json({ erro: `Erro ao editar nota: ${erro.message}` });
  }
}

async function excluirNota(req, res) {
  try {
    const nota = await Nota.findByPk(req.params.id);
    if (!nota) return res.status(404).json({ erro: 'Nota não encontrada.' });

    await nota.destroy();
    void registrarAuditoria({ usuario_id: req.usuario?.id, usuario_nome: req.usuario?.nome, perfil: req.usuario?.perfil, operacao: 'EXCLUSAO', recurso: 'NOTA', recurso_id: nota.id, detalhes: { aluno_id: nota.aluno_id, disciplina: nota.disciplina, bimestre: nota.bimestre } });
    res.status(204).send();
  } catch (erro) {
    res.status(400).json({ erro: `Erro ao excluir nota: ${erro.message}` });
  }
}

export default {
  listarNotas,
  cadastrarNota,
  editarNota,
  excluirNota,
};
