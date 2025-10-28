import express from 'express';
import {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  exportData
} from '../controllers/leadsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Rota pública para criar lead (usado pelo quiz)
router.post('/', createLead);

// Rotas protegidas
router.get('/', authenticateToken, getAllLeads);
router.get('/export/:type', authenticateToken, exportData);
router.get('/:id', authenticateToken, getLeadById);
router.put('/:id', authenticateToken, updateLead);
router.delete('/:id', authenticateToken, deleteLead);

export default router;

