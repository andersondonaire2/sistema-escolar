import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import Disciplina from './Disciplina.js';

class Frequencia extends Model {}

Frequencia.init({
  aluno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'alunos',
      key: 'id',
    },
  },
  disciplina_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'disciplinas',
      key: 'id',
    },
  },
  data_aula: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  presente: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  plano_aula: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  quantidade_aulas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: { min: 1 },
  },
  numero_aula: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: { min: 1 },
  },
}, {
  sequelize,
  modelName: 'frequencia',
  tableName: 'frequencias',
  timestamps: false,
  indexes: [{
    name: 'uq_frequencias_aluno_data_aula',
    unique: true,
    fields: ['aluno_id', 'data_aula', 'numero_aula'],
  }],
});

Frequencia.belongsTo(Disciplina, { foreignKey: 'disciplina_id', as: 'disciplina' });
Disciplina.hasMany(Frequencia, { foreignKey: 'disciplina_id', as: 'frequencias' });

export default Frequencia;
