import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
import Disciplina from './Disciplina.js';

class Professor extends Model {}

Professor.init({
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  usuario: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  disciplina_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'disciplinas',
      key: 'id',
    },
  },
}, {
  sequelize,
  modelName: 'professor',
  tableName: 'professores',
  timestamps: false,
});

Professor.belongsTo(Disciplina, { foreignKey: 'disciplina_id', as: 'disciplina' });
Disciplina.hasMany(Professor, { foreignKey: 'disciplina_id', as: 'professores' });

export default Professor;
