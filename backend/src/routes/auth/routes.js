import express from 'express';
import authController from '../../controllers/authController.js';

const routes = express.Router();

routes.post('/login', authController.login);
routes.post('/professores/login', authController.loginProfessor);
routes.get('/professores', authController.listarProfessores);

export default routes;
