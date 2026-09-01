



import express from 'express';
import { 
  createAuction, 
  startAuction, 
  getActiveAuction,
  getAllAuctions,
  getArtistAuctions,
  updateAuction,
  cancelAuction,
  acceptBid,           
  getAuctionWinner    
} from '../controllers/auctionController.js';
import { auth, roles } from '../middleware/auth.js';

const router = express.Router();




// Public routes (view auctions)
router.get('/', getAllAuctions);
router.get('/:auctionId', getActiveAuction);
router.get('/:auctionId/winner', getAuctionWinner);




// Artist routes (create and manage auctions)
router.post('/create', auth, roles('artist', 'admin'), createAuction);
router.put('/:auctionId/start', auth, roles('artist', 'admin'), startAuction);
router.put('/:auctionId/update', auth, roles('artist', 'admin'), updateAuction);
router.put('/:auctionId/cancel', auth, roles('artist', 'admin'), cancelAuction);
router.put('/:auctionId/accept-bid', auth, roles('artist', 'admin'), acceptBid); // ✅ New
router.get('/artist/my-auctions', auth, roles('artist'), getArtistAuctions);

export default router;