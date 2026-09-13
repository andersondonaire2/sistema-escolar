import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Disciplina extends Model {}

Disciplina.init({
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  turma_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'turmas',
      key: 'id',
    },
  },
}, {
  sequelize,
  modelName: 'disciplina',
  tableName: 'disciplinas',
  timestamps: false,
});

export default Disciplina;
