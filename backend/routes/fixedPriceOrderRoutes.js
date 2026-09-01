


// backend/src/routes/fixedPriceOrderRoutes.js
import express from 'express';
import { 
  createOrderFromCart,
  createFixedPriceCheckout,
  getOrderHistory,
  getOrderDetails,
  getArtistFixedSales
} from '../controllers/fixedPriceOrderController.js';
import { auth, roles } from '../middleware/auth.js';

const router = express.Router();



// Order routes
router.post('/create', auth, createOrderFromCart);
router.post('/checkout', auth, createFixedPriceCheckout);



// History routes
router.get('/history', auth, getOrderHistory);
router.get('/:orderId', auth, getOrderDetails);




// Artist sales route
router.get('/artist/sales', auth, roles('artist'), getArtistFixedSales);

export default router;