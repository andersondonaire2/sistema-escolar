import { Op } from 'sequelize';
import Auditoria from '../models/Auditoria.js';

export async function registrarAuditoria(evento) {
  try {
    await Auditoria.create({
      usuario_id: evento.usuario_id ?? null,
      usuario_nome: evento.usuario_nome || 'Não identificado',
      perfil: evento.perfil || 'desconhecido',
      operacao: evento.operacao,
      recurso: evento.recurso,
      recurso_id: evento.recurso_id ?? null,
      detalhes: evento.detalhes ? JSON.stringify(evento.detalhes) : null,
    });
  } catch (erro) {
    console.error(`Falha ao registrar auditoria: ${erro.message}`);
  }
}

function filtroData(valor, fimDoDia = false) {
  if (!valor) return undefined;
  const data = new Date(`${valor}${fimDoDia ? 'T23:59:59.999' : 'T00:00:00.000'}`);
  return Number.isNaN(data.getTime()) ? undefined : data;
}

async function listarAuditoria(req, res) {
  const where = {};
  const { usuario, operacao, recurso, inicio, fim } = req.query;

  if (usuario) {
    where.usuario_nome = { [Op.like]: `%${usuario}%` };
  }
  if (operacao) where.operacao = operacao;
  if (recurso) where.recurso = recurso;

  const dataInicio = filtroData(inicio);
  const dataFim = filtroData(fim, true);
  if (dataInicio || dataFim) {
    where.criado_em = {};
    if (dataInicio) where.criado_em[Op.gte] = dataInicio;
    if (dataFim) where.criado_em[Op.lte] = dataFim;
  }

  try {
    const eventos = await Auditoria.findAll({
      where,
      order: [['criado_em', 'DESC'], ['id', 'DESC']],
    });
    return res.status(200).json(eventos);
  } catch (erro) {
    return res.status(500).json({ erro: `Erro ao consultar auditoria: ${erro.message}` });
  }
}

export default { listarAuditoria };