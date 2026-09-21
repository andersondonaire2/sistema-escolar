import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Auditoria extends Model {}

Auditoria.init({
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  usuario_nome: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  perfil: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  operacao: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  recurso: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  recurso_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  detalhes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  criado_em: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'auditoria',
  tableName: 'auditoria',
  timestamps: false,
  indexes: [
    { name: 'idx_auditoria_criado_em', fields: ['criado_em'] },
    { name: 'idx_auditoria_operacao', fields: ['operacao'] },
    { name: 'idx_auditoria_recurso', fields: ['recurso'] },
  ],
});

export default Auditoria;