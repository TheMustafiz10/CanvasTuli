


import express from 'express';
import { 
  createPaymentIntent,
  createStripeCheckout,
  handleStripeWebhook,
  createBkashPayment,
  handleBkashCallback,
  verifyPayment,
  getPaymentStatus,
  getPaymentHistory,
  createFixedPriceCheckout,
  confirmStripePayment,
} from '../controllers/paymentController.js';
import { auth, roles } from '../middleware/auth.js';

const router = express.Router();



// Stripe webhook
router.post('/stripe-webhook', handleStripeWebhook);

router.post('/create-payment-intent', auth, createPaymentIntent);
router.post('/create-checkout-session', auth, createStripeCheckout);
router.post('/fixed-price-checkout', auth, createFixedPriceCheckout); 
router.post('/confirm-stripe-payment', auth, confirmStripePayment);



// bKash routes
router.post('/bkash/create', auth, createBkashPayment);
router.post('/bkash/callback', handleBkashCallback);
router.get('/bkash/callback', handleBkashCallback);





// Payment verification routes
router.get('/verify/:orderId', auth, verifyPayment);
router.get('/status/:orderId', auth, getPaymentStatus);
router.get('/history', auth, getPaymentHistory);

export default router;