import { Router } from 'express';
import { acceptListing, createTakover, rejectListing, proceedTakeover, getTakeoverById, findTakeover } from '../controllers/takeoverattemptsController';
import { authMiddleware } from "../middleware/authMiddlware";

const router = Router();

router.post('/', authMiddleware, createTakover);
router.get('/:id', authMiddleware, getTakeoverById);
router.post('/proceed', authMiddleware, proceedTakeover);
router.post("/accept/:id", authMiddleware, acceptListing);
router.post("/reject/:id", authMiddleware, rejectListing);
router.post("/findtakeover", authMiddleware, findTakeover);

export default router;