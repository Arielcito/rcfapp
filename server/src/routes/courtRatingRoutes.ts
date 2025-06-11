import { Router } from 'express';
import { CourtRatingController } from '../controllers/courtRatingController';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const courtRatingController = new CourtRatingController();

// Rutas GET
router.get('/pending', authenticateToken, courtRatingController.getPendingRatings);
router.get('/cancha/:canchaId', authenticateToken, courtRatingController.getCourtRatingsByCancha);
router.get('/cancha/:canchaId/summary', authenticateToken, courtRatingController.getCourtRatingSummary);
router.get('/reserva/:reservaId', authenticateToken, courtRatingController.getCourtRatingByReserva);
router.get('/user/reserva/:reservaId', authenticateToken, courtRatingController.getUserCourtRatingForReserva);
router.get('/:id', authenticateToken, courtRatingController.getCourtRatingById);

// Rutas POST
router.post('/', authenticateToken, courtRatingController.createCourtRating);

export default router; 