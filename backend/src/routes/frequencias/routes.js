import express from 'express';
import frequenciaController from '../../controllers/frequenciaController.js';

const routes = express.Router();

routes.get('/frequencias', frequenciaController.listarFrequencias);
routes.post('/frequencias/chamada', frequenciaController.cadastrarChamada);
routes.post('/frequencias', frequenciaController.cadastrarFrequencia);
routes.put('/frequencias/:id', frequenciaController.editarFrequencia);
routes.delete('/frequencias/:id', frequenciaController.excluirFrequencia);
routes.get('/frequencias/resumo', frequenciaController.resumoFrequencia);
routes.get('/frequencias/ranking', frequenciaController.rankingFrequencia);

export default routes;
