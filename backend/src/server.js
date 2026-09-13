import express from 'express';
import cors from 'cors';
import sequelize from './config/database.js';
import Aluno from './models/Aluno.js';
import Turma from './models/Turma.js';
import Disciplina from './models/Disciplina.js';
import Nota from './models/Nota.js';
import Frequencia from './models/Frequencia.js';
import Usuario from './models/Usuario.js';
import Professor from './models/Professor.js';
import authController from './controllers/authController.js';
import routes from './routes/index.js';

const app = express();
const PORT = Number(process.env.PORT || 3000);
const DB_RETRY_DELAY_MS = Number(process.env.DB_RETRY_DELAY_MS || 5000);
const DB_SYNC_FORCE = String(process.env.DB_SYNC_FORCE || 'false').toLowerCase() === 'true';
const DB_SYNC_ALTER = String(process.env.DB_SYNC_ALTER || 'true').toLowerCase() === 'true';

Turma.hasMany(Aluno, { foreignKey: 'turma_id', as: 'alunos' });
Aluno.belongsTo(Turma, { foreignKey: 'turma_id', as: 'turma' });
Turma.hasMany(Disciplina, { foreignKey: 'turma_id', as: 'disciplinas' });
Disciplina.belongsTo(Turma, { foreignKey: 'turma_id', as: 'turma' });
Aluno.hasMany(Nota, { foreignKey: 'aluno_id', as: 'notas' });
Nota.belongsTo(Aluno, { foreignKey: 'aluno_id', as: 'aluno' });
Aluno.hasMany(Frequencia, { foreignKey: 'aluno_id', as: 'frequencias' });
Frequencia.belongsTo(Aluno, { foreignKey: 'aluno_id', as: 'aluno' });

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas principais do sistema. Novos modulos entram no routes/index.js.
app.use(routes);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Mantem o servidor HTTP no ar e tenta reconectar ao banco sem encerrar o processo.
async function connectDatabaseWithRetry() {
  while (true) {
    try {
      await sequelize.authenticate();
      console.log('Conexao com o banco de dados estabelecida com sucesso!');

      await sequelize.query("SET SESSION sql_mode = REPLACE(REPLACE(@@sql_mode, 'NO_ZERO_DATE', ''), 'NO_ZERO_IN_DATE', '')");
      await sequelize.sync({ force: DB_SYNC_FORCE, alter: DB_SYNC_ALTER });
      console.log('Banco de dados sincronizado com sucesso!');
      await authController.criarProfessorPadrao();
      console.log('Credenciais padrão inicializadas com sucesso!');
      return;
    } catch (error) {
      console.error('Falha ao conectar no banco. Nova tentativa em alguns segundos.');
      console.error(error.message);
      await delay(DB_RETRY_DELAY_MS);
    }
  }
}

async function startServer() {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });

  await connectDatabaseWithRetry();
}

startServer().catch((error) => {
  console.error('Erro inesperado ao iniciar o servidor:', error);
});