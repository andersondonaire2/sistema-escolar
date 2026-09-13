// backend/src/models/Aluno.js
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js'; // Você criará este arquivo de conexão

class Aluno extends Model { }

Aluno.init({
    nome: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    data_nascimento: { type: DataTypes.DATEONLY },
    serie: { type: DataTypes.STRING },
    turma_id: { type: DataTypes.INTEGER, allowNull: true },

    // Campos do Boss Challenge [5]
    cpf: { type: DataTypes.STRING(14), unique: true },
    telefone: { type: DataTypes.STRING },
    endereco: { type: DataTypes.TEXT }
}, { sequelize, modelName: 'aluno', timestamps: false });

export default Aluno;