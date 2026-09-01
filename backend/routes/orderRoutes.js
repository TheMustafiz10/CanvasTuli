


// backend/src/routes/orderRoutes.js
import express from 'express';
import { 
  getAuctionOrderHistory,
  getAuctionOrderDetails,
  getDirectPurchaseHistory
} from '../controllers/orderController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Auction order routes
router.get('/auction/history', auth, getAuctionOrderHistory);
router.get('/auction/order/:orderId', auth, getAuctionOrderDetails);

// Direct purchase routes (Fixed Price)
router.get('/direct/history', auth, getDirectPurchaseHistory);

export default router;