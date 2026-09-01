


import express from 'express';
import { 
  placeBid, 
  getBidHistory, 
  getUserBids,
  getBidCount,
  hasUserBid,
  getHighestBid,
  getArtistBids
} from '../controllers/bidController.js';
import { auth, roles } from '../middleware/auth.js';

const router = express.Router();


router.post('/place/:auctionId', auth, roles('customer'), placeBid); // Only customers can bid
router.get('/history/:auctionId', getBidHistory);
router.get('/my-bids', auth, getUserBids);
router.get('/count/:auctionId', getBidCount);
router.get('/has-bid/:auctionId', auth, hasUserBid);
router.get('/highest/:auctionId', getHighestBid);
router.get('/artist/bids', auth, roles('artist'), getArtistBids);

export default router;