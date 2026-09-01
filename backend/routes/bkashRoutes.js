


import express from 'express';
import { createBkashPayment, executeBkashPayment } from '../services/bkashService.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();



// Initiate payment (authenticated)
router.post('/create', auth, async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    const { paymentUrl, paymentId } = await createBkashPayment(
      amount,
      orderId,
      req.user.id 
    );
    res.json({ success: true, paymentUrl, paymentId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





// bKash callback endpoint (no auth - called by bKash)
router.post('/callback', async (req, res) => {
  try {
    const { paymentID, status } = req.body;
    
    if (status === 'success') {
      // Execute payment
      const execution = await executeBkashPayment(paymentID);
      
      // Update your order in database
      await updateOrderStatus(execution);

      return res.redirect(`${process.env.FRONTEND_URL}/payment/success`);
    }
    
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
  } catch (error) {
    console.error('Callback error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failed`);
  }
});

export default router;