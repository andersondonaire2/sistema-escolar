import 'dotenv/config';
import bcrypt from 'bcryptjs';
import sequelize from '../src/config/database.js';
import Aluno from '../src/models/Aluno.js';
import Turma from '../src/models/Turma.js';
import Disciplina from '../src/models/Disciplina.js';
import Nota from '../src/models/Nota.js';
import Frequencia from '../src/models/Frequencia.js';
import Professor from '../src/models/Professor.js';

const ano = new Date().getFullYear();
const senhaDemo = await bcrypt.hash('123456', 10);
const nomesAlunos = [
  'Ana Souza', 'Bruno Lima', 'Carla Mendes', 'Diego Alves', 'Elisa Rocha',
  'Felipe Costa', 'Gabriela Martins', 'Henrique Silva', 'Isabela Freitas', 'Joao Oliveira',
];
const nomesProfessores = [
  'Marcos Almeida', 'Patricia Nunes', 'Rafael Castro',
  'Luciana Barros', 'Eduardo Moraes', 'Camila Araujo',
  'Andre Ribeiro', 'Juliana Cardoso', 'Sergio Teixeira',
];
const disciplinasPorTurma = ['Matematica', 'Lingua Portuguesa', 'Biologia'];
const turmasSeed = [
  { nome: '1o Ano A - Demo', serie: '1o Ano do Ensino Medio' },
  { nome: '2o Ano A - Demo', serie: '2o Ano do Ensino Medio' },
  { nome: '3o Ano A - Demo', serie: '3o Ano do Ensino Medio' },
];

function dataAula(diasAtras) {
  const data = new Date();
  data.setDate(data.getDate() - diasAtras);
  return data.toISOString().slice(0, 10);
}

async function findOrCreateTurma(dados) {
  const [turma] = await Turma.findOrCreate({
    where: { nome: dados.nome, ano },
    defaults: { ...dados, ano },
  });
  return turma;
}

async function main() {
  await sequelize.authenticate();
  await sequelize.sync();

  const turmas = [];
  const disciplinas = [];
  const alunos = [];

  for (const turmaDados of turmasSeed) {
    const turma = await findOrCreateTurma(turmaDados);
    turmas.push(turma);

    for (const nomeDisciplina of disciplinasPorTurma) {
      const [disciplina] = await Disciplina.findOrCreate({
        where: { nome: `${nomeDisciplina} - ${turma.nome}`, turma_id: turma.id },
        defaults: { nome: `${nomeDisciplina} - ${turma.nome}`, turma_id: turma.id },
      });
      disciplinas.push(disciplina);
    }

    for (let indice = 0; indice < nomesAlunos.length; indice += 1) {
      const numero = String(indice + 1).padStart(2, '0');
      const [aluno] = await Aluno.findOrCreate({
        where: { email: `demo_${turma.id}_${numero}@escola.test` },
        defaults: {
          nome: nomesAlunos[indice],
          email: `demo_${turma.id}_${numero}@escola.test`,
          data_nascimento: `${2008 + (turma.id % 3)}-${String((indice % 9) + 1).padStart(2, '0')}-15`,
          serie: turmaDados.serie,
          turma_id: turma.id,
          cpf: `900.${String(turma.id).padStart(3, '0')}.${numero}-00`,
          telefone: `(11) 98888-${String(1000 + indice).slice(-4)}`,
          endereco: `Rua Demo, ${100 + indice} - Sao Paulo`,
        },
      });
      alunos.push(aluno);
    }
  }

  for (let indice = 0; indice < disciplinas.length; indice += 1) {
    const disciplina = disciplinas[indice];
    await Professor.findOrCreate({
      where: { usuario: `demo_prof_${indice + 1}` },
      defaults: {
        nome: nomesProfessores[indice],
        usuario: `demo_prof_${indice + 1}`,
        senha: senhaDemo,
        disciplina_id: disciplina.id,
      },
    });
  }

  for (const aluno of alunos) {
    const disciplinasAluno = disciplinas.filter((disciplina) => disciplina.turma_id === aluno.turma_id);
    for (const disciplina of disciplinasAluno) {
      for (const bimestre of ['1o Bimestre', '2o Bimestre']) {
        await Nota.findOrCreate({
          where: { aluno_id: aluno.id, disciplina: disciplina.nome, bimestre },
          defaults: {
            aluno_id: aluno.id,
            disciplina: disciplina.nome,
            bimestre,
            nota: 5 + ((aluno.id + disciplina.id + bimestre.length) % 6) / 2,
          },
        });
      }
    }

    for (const diasAtras of [1, 2, 3, 4, 5]) {
      await Frequencia.findOrCreate({
        where: { aluno_id: aluno.id, data_aula: dataAula(diasAtras) },
        defaults: {
          aluno_id: aluno.id,
          data_aula: dataAula(diasAtras),
          presente: (aluno.id + diasAtras) % 5 !== 0,
        },
      });
    }
  }

  console.log(JSON.stringify({
    turmas: turmas.length,
    alunos: alunos.length,
    disciplinas: disciplinas.length,
    professores: disciplinas.length,
    notas: alunos.length * disciplinasPorTurma.length * 2,
    frequencias: alunos.length * 5,
    senhaProfessores: '123456',
  }, null, 2));
}

try {
  await main();
} finally {
  await sequelize.close();
}
