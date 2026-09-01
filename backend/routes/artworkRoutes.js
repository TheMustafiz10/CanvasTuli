
// backend/src/routes/artworkRoutes.js
import express from 'express';
import { 
  createArtwork, 
  getAllArtworks, 
  getArtworkById,
  updateArtwork,
  deleteArtwork,
  getArtistArtworks,
  approveArtwork,
  getFeaturedArtworks,
  toggleFeatured,
  markAsSold,

  createFixedPriceArtwork,
  getFixedPriceArtworks,
  getArtistFixedPriceArtworks,
  updateFixedPriceStock,
  getFixedPriceArtworkById,
  getFixedPriceCategories  
} from '../controllers/artworkController.js';
import { auth, roles } from '../middleware/auth.js';

const router = express.Router();




// ============================================
// PUBLIC ROUTES
// ============================================
router.get('/', getAllArtworks);
router.get('/featured', getFeaturedArtworks);




// Fixed price routes
router.get('/fixed-price', getFixedPriceArtworks);
router.get('/fixed-price/categories', getFixedPriceCategories);  
router.get('/fixed-price/:artworkId', getFixedPriceArtworkById);
router.get('/:artworkId', getArtworkById);





// ============================================
// ARTIST ROUTES (Protected)
// ============================================
// Auction Artworks
router.post('/create', auth, roles('artist', 'admin'), createArtwork);
router.put('/:artworkId/update', auth, roles('artist', 'admin'), updateArtwork);
router.delete('/:artworkId/delete', auth, roles('artist', 'admin'), deleteArtwork);
router.put('/:artworkId/sold', auth, roles('artist', 'admin'), markAsSold);
router.get('/artist/my-artworks', auth, roles('artist'), getArtistArtworks);




// Fixed Price Artworks
router.post('/create-fixed', auth, roles('artist', 'admin'), createFixedPriceArtwork);
router.get('/artist/fixed-price', auth, roles('artist'), getArtistFixedPriceArtworks);
router.put('/:artworkId/update-stock', auth, roles('artist', 'admin'), updateFixedPriceStock);






// ============================================
// ADMIN ROUTES (Protected)
// ============================================
router.put('/:artworkId/approve', auth, roles('admin'), approveArtwork);
router.put('/:artworkId/feature', auth, roles('admin'), toggleFeatured);

export default router;