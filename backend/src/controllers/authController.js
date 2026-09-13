import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Usuario from '../models/Usuario.js';
import Professor from '../models/Professor.js';
import Disciplina from '../models/Disciplina.js';
import Turma from '../models/Turma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'escola-secret-key';

function gerarToken(usuario) {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      perfil: usuario.perfil,
      nome: usuario.nome,
    },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

async function login(req, res) {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas.' });
    }

    const token = gerarToken(usuario);
    return res.status(200).json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    });
  } catch (erro) {
    return res.status(500).json({ erro: `Erro ao autenticar: ${erro.message}` });
  }
}

async function loginProfessor(req, res) {
  const { usuario, senha } = req.body;

  if (!usuario || !senha) {
    return res.status(400).json({ erro: 'Usuário e senha são obrigatórios.' });
  }

  try {
    const professor = await Professor.findOne({
      where: { usuario },
      include: [{ model: Disciplina, as: 'disciplina', attributes: ['id', 'nome', 'turma_id'] }],
    });

    if (!professor) {
      return res.status(401).json({ erro: 'Professor não encontrado.' });
    }

    const senhaValida = await bcrypt.compare(senha, professor.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Senha incorreta.' });
    }

    const token = jwt.sign({
      id: professor.id,
      nome: professor.nome,
      usuario: professor.usuario,
      perfil: 'professor',
    }, JWT_SECRET, { expiresIn: '8h' });

    return res.status(200).json({
      token,
      professor: {
        id: professor.id,
        nome: professor.nome,
        usuario: professor.usuario,
        disciplina_id: professor.disciplina_id,
        disciplina: professor.disciplina,
      },
    });
  } catch (erro) {
    return res.status(500).json({ erro: `Erro ao autenticar professor: ${erro.message}` });
  }
}

async function listarProfessores(req, res) {
  try {
    const professores = await Professor.findAll({
      include: [{ model: Disciplina, as: 'disciplina', attributes: ['id', 'nome', 'turma_id'] }],
      order: [['nome', 'ASC']],
    });
    return res.status(200).json(professores);
  } catch (erro) {
    return res.status(500).json({ erro: `Erro ao listar professores: ${erro.message}` });
  }
}

async function criarProfessorPadrao() {
  const usuarioAdmin = await Usuario.findOne({ where: { email: 'admin@escola.com' } });
  if (!usuarioAdmin) {
    const senhaHash = await bcrypt.hash('123456', 10);
    await Usuario.create({
      nome: 'Administrador',
      email: 'admin@escola.com',
      senha: senhaHash,
      perfil: 'admin',
    });
  }

  let turmaPadrao = await Turma.findOne({ where: { nome: '3º Ano A' } });
  if (!turmaPadrao) {
    turmaPadrao = await Turma.create({
      nome: '3º Ano A',
      serie: '3º Ano',
      ano: new Date().getFullYear(),
    });
  }

  let disciplinaPadrao = await Disciplina.findOne({
    where: { nome: 'Matemática', turma_id: turmaPadrao.id },
  });
  if (!disciplinaPadrao) {
    disciplinaPadrao = await Disciplina.create({
      nome: 'Matemática',
      turma_id: turmaPadrao.id,
    });
  }

  const professorPadrao = await Professor.findOne({ where: { usuario: 'maria' } });
  if (!professorPadrao) {
    const senhaHash = await bcrypt.hash('123456', 10);
    await Professor.create({
      nome: 'Maria Souza',
      usuario: 'maria',
      senha: senhaHash,
      disciplina_id: disciplinaPadrao.id,
    });
  } else if (!professorPadrao.disciplina_id) {
    await professorPadrao.update({ disciplina_id: disciplinaPadrao.id });
  }
}

export default {
  login,
  loginProfessor,
  listarProfessores,
  criarProfessorPadrao,
  gerarToken,
};
