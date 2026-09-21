import express from 'express';
import alunosRoutes from './alunos/routes.js';
import turmasRoutes from './turmas/routes.js';
import disciplinasRoutes from './disciplinas/routes.js';
import boletimRoutes from './boletim/routes.js';
import frequenciasRoutes from './frequencias/routes.js';
import authRoutes from './auth/routes.js';
import auditoriaRoutes from './auditoria/routes.js';
import { autenticar } from '../middleware/authMiddleware.js';

const routes = express.Router();

routes.use(authRoutes);
routes.use(autenticar);
routes.use(auditoriaRoutes);
routes.use(alunosRoutes);
routes.use(turmasRoutes);
routes.use(disciplinasRoutes);
routes.use(boletimRoutes);
routes.use(frequenciasRoutes);

export default routes;
