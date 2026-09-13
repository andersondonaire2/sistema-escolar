import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Nota extends Model {}

Nota.init({
  aluno_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'alunos',
      key: 'id',
    },
  },
  disciplina: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  bimestre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  nota: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 10,
    },
  },
}, {
  sequelize,
  modelName: 'nota',
  tableName: 'notas',
  timestamps: false,
});

export default Nota;
