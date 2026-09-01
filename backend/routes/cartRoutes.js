


import express from 'express';
import { 
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount
} from '../controllers/cartController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, getCart);
router.get('/count', auth, getCartCount);
router.post('/add', auth, addToCart);
router.put('/item/:itemId', auth, updateCartItem);
router.delete('/item/:itemId', auth, removeFromCart);
router.delete('/clear', auth, clearCart);

export default router;