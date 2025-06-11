import express from 'express';
import * as deporteController from '../controllers/deporteController';

const router = express.Router();

router.get('/', deporteController.getDeportes);
router.get('/:id', deporteController.getDeporteById);

export default router; 