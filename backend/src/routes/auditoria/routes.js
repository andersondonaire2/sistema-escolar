import express from 'express';
import auditoriaController from '../../controllers/auditoriaController.js';

const routes = express.Router();

routes.get('/auditoria', (req, res, next) => {
  if (req.usuario?.perfil !== 'admin') {
    return res.status(403).json({ erro: 'Acesso restrito ao perfil admin.' });
  }
  return next();
}, auditoriaController.listarAuditoria);

export default routes;