import { Router } from 'express';
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
  updateStatus,
  getSummary,
} from '../controllers/promotionController';

const router = Router();

router.get('/summary', getSummary);
router.get('/', getPromotions);
router.post('/', createPromotion);
router.put('/:id', updatePromotion);
router.delete('/:id', deletePromotion);
router.patch('/:id/status', updateStatus);

export default router;
