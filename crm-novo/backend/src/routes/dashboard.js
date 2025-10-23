import express from 'express';
import { getStats } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas são protegidas
router.use(authenticateToken);

router.get('/stats', getStats);

export default router;

