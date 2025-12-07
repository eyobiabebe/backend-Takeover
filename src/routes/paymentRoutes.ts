import { Router } from 'express';
import { createListingPayment, createTekeoverPayment ,  createListingIntent,
  createTakeoverIntent,} from '../controllers/paymentController';

const router = Router();

router.post('/create-takeover-checkout', createTekeoverPayment);
router.post('/create-listing-checkout', createListingPayment);

// 📱 Mobile (React Native – Stripe PaymentIntents)
router.post('/create-takeover-intent', createTakeoverIntent);
router.post('/create-listing-intent', createListingIntent);

export default router;
