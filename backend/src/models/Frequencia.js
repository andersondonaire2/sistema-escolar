import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

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
  data_aula: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  presente: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  sequelize,
  modelName: 'frequencia',
  tableName: 'frequencias',
  timestamps: false,
});

export default Frequencia;
