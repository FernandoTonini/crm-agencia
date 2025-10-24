import express from 'express';
import {
  getAllContracts,
  getContractById,
  createContract,
  updateContract,
  deleteContract,
  getContractsNearRenewal,
  getServiceStats
} from '../controllers/contractsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas são protegidas
router.use(authenticateToken);

router.get('/', getAllContracts);
router.get('/renewals', getContractsNearRenewal);
router.get('/services/stats', getServiceStats);
router.get('/:id', getContractById);
router.post('/', createContract);
router.put('/:id', updateContract);
router.delete('/:id', deleteContract);

export default router;

