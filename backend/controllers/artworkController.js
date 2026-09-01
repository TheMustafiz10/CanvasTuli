

// backend/src/controllers/artworkController.js
import Artwork from '../models/Artwork.js';
import Auction from '../models/Auction.js';
import User from '../models/User.js';

// ============================================
// CREATE AUCTION ARTWORK (Existing)
// ============================================
export const createArtwork = async (req, res) => {
  try {
    const {
      title,
      description,
      imageUrl,
      medium,
      dimensions,
      year,
      category
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const artwork = new Artwork({
      title,
      description: description || '',
      imageUrl,
      medium: medium || '',
      dimensions: dimensions || '',
      year: year || null,
      category: category || 'Uncategorized',
      artistId: req.user._id,
      status: 'pending',
      isFixedPrice: false
    });

    await artwork.save();
    res.status(201).json(artwork);
  } catch (error) {
    console.error('Create artwork error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// CREATE FIXED PRICE ARTWORK (NEW)
// ============================================
export const createFixedPriceArtwork = async (req, res) => {
  try {
    const {
      title,
      description,
      imageUrl,
      images,
      category,
      fixedPrice,
      quantity,
      medium,
      dimensions,
      year
    } = req.body;

    // Validate
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!fixedPrice || fixedPrice <= 0) {
      return res.status(400).json({ error: 'Valid fixed price is required' });
    }
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be at least 1' });
    }

    const artwork = new Artwork({
      title,
      description: description || '',
      imageUrl: imageUrl || 'https://via.placeholder.com/400x400',
      images: images || [],
      artistId: req.user._id,
      category: category || 'Uncategorized',
      medium: medium || '',
      dimensions: dimensions || '',
      year: year || null,
      isFixedPrice: true,
      fixedPrice: parseFloat(fixedPrice),
      quantity: parseInt(quantity),
      soldQuantity: 0,
      status: 'approved'
    });

    await artwork.save();

    res.status(201).json({
      success: true,
      message: 'Fixed price artwork created successfully',
      artwork
    });
  } catch (error) {
    console.error('Create fixed price artwork error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET ALL FIXED PRICE ARTWORKS (NEW)
// ============================================
export const getFixedPriceArtworks = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {
      isFixedPrice: true,
      status: 'approved'
    };

    // Only show available items (quantity > soldQuantity)
    filter.$expr = { $gt: ['$quantity', '$soldQuantity'] };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const artworks = await Artwork.find(filter)
      .populate('artistId', 'fullName email')
      .sort({ createdAt: -1 });

    // Add available quantity virtual
    const artworksWithAvailability = artworks.map(artwork => {
      const available = artwork.quantity - artwork.soldQuantity;
      return {
        ...artwork.toObject(),
        availableQuantity: available,
        inStock: available > 0
      };
    });

    res.json({
      success: true,
      count: artworksWithAvailability.length,
      artworks: artworksWithAvailability
    });
  } catch (error) {
    console.error('Get fixed price artworks error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET ALL FIXED PRICE CATEGORIES (NEW)
// ============================================
export const getFixedPriceCategories = async (req, res) => {
  try {
    const categories = await Artwork.distinct('category', {
      isFixedPrice: true,
      status: 'approved'
    });

    res.json({
      success: true,
      categories: categories.filter(c => c && c !== '')
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET ARTIST'S FIXED PRICE ARTWORKS (NEW)
// ============================================
export const getArtistFixedPriceArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.find({
      artistId: req.user._id,
      isFixedPrice: true
    }).sort({ createdAt: -1 });

    const artworksWithAvailability = artworks.map(artwork => {
      const available = artwork.quantity - (artwork.soldQuantity || 0);
      return {
        ...artwork.toObject(),
        availableQuantity: available,
        inStock: available > 0
      };
    });

    res.json({
      success: true,
      count: artworksWithAvailability.length,
      artworks: artworksWithAvailability
    });
  } catch (error) {
    console.error('Get artist fixed price artworks error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// UPDATE FIXED PRICE STOCK (NEW)
// ============================================
export const updateFixedPriceStock = async (req, res) => {
  try {
    const { artworkId } = req.params;
    const { quantity } = req.body;

    const artwork = await Artwork.findById(artworkId);

    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    if (artwork.artistId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!artwork.isFixedPrice) {
      return res.status(400).json({ error: 'Not a fixed price artwork' });
    }

    if (quantity < 0) {
      return res.status(400).json({ error: 'Quantity cannot be negative' });
    }

    artwork.quantity = quantity;
    if (artwork.soldQuantity >= artwork.quantity) {
      artwork.status = 'out_of_stock';
    } else {
      artwork.status = 'approved';
    }
    await artwork.save();

    res.json({
      success: true,
      message: 'Stock updated successfully',
      artwork
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET FIXED PRICE ARTWORK BY ID (NEW)
// ============================================
export const getFixedPriceArtworkById = async (req, res) => {
  try {
    const { artworkId } = req.params;

    const artwork = await Artwork.findById(artworkId)
      .populate('artistId', 'fullName email artistBio');

    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    if (!artwork.isFixedPrice) {
      return res.status(400).json({ error: 'Not a fixed price artwork' });
    }

    const available = artwork.quantity - (artwork.soldQuantity || 0);
    const response = {
      ...artwork.toObject(),
      availableQuantity: available,
      inStock: available > 0
    };

    res.json({
      success: true,
      artwork: response
    });
  } catch (error) {
    console.error('Get fixed price artwork by ID error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET ALL ARTWORKS (Existing - Updated)
// ============================================
export const getAllArtworks = async (req, res) => {
  try {
    const { category, artistId, status, type } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (artistId) filter.artistId = artistId;
    if (status) filter.status = status;

    // Filter by type: 'auction' or 'fixed'
    if (type === 'auction') {
      filter.isFixedPrice = false;
    } else if (type === 'fixed') {
      filter.isFixedPrice = true;
    }

    // Only show approved artworks to public
    if (!req.user || req.user.role !== 'admin') {
      filter.status = 'approved';
    }

    const artworks = await Artwork.find(filter)
      .populate('artistId', 'fullName email artistBio')
      .sort({ createdAt: -1 });

    res.json(artworks);
  } catch (error) {
    console.error('Get all artworks error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET ARTWORK BY ID (Existing - Updated)
// ============================================
export const getArtworkById = async (req, res) => {
  try {
    const { artworkId } = req.params;

    const artwork = await Artwork.findById(artworkId)
      .populate('artistId', 'fullName email artistBio artistPortfolio');

    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    // Increment view count (skip when the viewer is the artwork's own artist)
    const isOwner = req.user && artwork.artistId._id
      ? artwork.artistId._id.toString() === req.user._id.toString()
      : false;

    if (!isOwner) {
      artwork.viewsCount = (artwork.viewsCount || 0) + 1;
      await artwork.save();
    }

    // Add availability if fixed price
    const response = artwork.toObject();
    if (artwork.isFixedPrice) {
      response.availableQuantity = artwork.quantity - artwork.soldQuantity;
      response.inStock = response.availableQuantity > 0;
    }

    res.json(response);
  } catch (error) {
    console.error('Get artwork by ID error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET ARTIST'S ARTWORKS (Existing - Updated)
// ============================================
export const getArtistArtworks = async (req, res) => {
  try {
    const artworks = await Artwork.find({ artistId: req.user._id })
      .sort({ createdAt: -1 });

    // Add availability for fixed price artworks
    const artworksWithDetails = artworks.map(artwork => {
      const result = artwork.toObject();
      if (artwork.isFixedPrice) {
        result.availableQuantity = artwork.quantity - artwork.soldQuantity;
        result.inStock = result.availableQuantity > 0;
      }
      return result;
    });

    res.json(artworksWithDetails);
  } catch (error) {
    console.error('Get artist artworks error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// UPDATE ARTWORK (Existing - Updated)
// ============================================

// Fields an artist is allowed to change themselves.
// Anything not in this list (artistId, status, soldQuantity, isFixedPrice,
// viewsCount, isFeatured, approvedAt, etc.) is ignored even if sent.
const ARTWORK_UPDATABLE_FIELDS = [
  'title',
  'description',
  'imageUrl',
  'images',
  'medium',
  'dimensions',
  'year',
  'category',
  'fixedPrice',
  'quantity'
];

export const updateArtwork = async (req, res) => {
  try {
    const { artworkId } = req.params;

    const artwork = await Artwork.findById(artworkId);

    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    if (artwork.artistId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Don't allow updating sold artworks
    if (artwork.status === 'sold') {
      return res.status(400).json({ error: 'Cannot update sold artwork' });
    }

    // Whitelist: only copy over fields we explicitly allow
    const updates = {};
    for (const field of ARTWORK_UPDATABLE_FIELDS) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // If updating fixed price fields
    if (updates.fixedPrice !== undefined && updates.fixedPrice <= 0) {
      return res.status(400).json({ error: 'Price must be greater than 0' });
    }
    if (updates.quantity !== undefined && updates.quantity < 0) {
      return res.status(400).json({ error: 'Quantity cannot be negative' });
    }

    const updatedArtwork = await Artwork.findByIdAndUpdate(
      artworkId,
      updates,
      { new: true, runValidators: true }
    );

    res.json(updatedArtwork);
  } catch (error) {
    console.error('Update artwork error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// DELETE ARTWORK (Existing)
// ============================================
export const deleteArtwork = async (req, res) => {
  try {
    const { artworkId } = req.params;

    const artwork = await Artwork.findById(artworkId);

    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    if (artwork.artistId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Check if artwork has active auction
    const activeAuction = await Auction.findOne({
      artworkId,
      status: { $in: ['scheduled', 'live'] }
    });

    if (activeAuction) {
      return res.status(400).json({
        error: 'Cannot delete artwork with active auction'
      });
    }

    await Artwork.findByIdAndDelete(artworkId);
    res.json({ message: 'Artwork deleted successfully' });
  } catch (error) {
    console.error('Delete artwork error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// APPROVE ARTWORK (Admin only)
// ============================================
export const approveArtwork = async (req, res) => {
  try {
    const { artworkId } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        error: 'Status must be either "approved" or "rejected"'
      });
    }

    const artwork = await Artwork.findById(artworkId);

    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    artwork.status = status;
    if (status === 'approved') {
      artwork.approvedAt = new Date();
    }
    await artwork.save();

    res.json({
      message: `Artwork ${status} successfully`,
      artwork
    });
  } catch (error) {
    console.error('Approve artwork error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET FEATURED ARTWORKS (Existing)
// ============================================
export const getFeaturedArtworks = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const artworks = await Artwork.find({
      status: 'approved',
      isFeatured: true
    })
      .populate('artistId', 'fullName')
      .limit(parseInt(limit))
      .sort({ viewsCount: -1, createdAt: -1 });

    res.json(artworks);
  } catch (error) {
    console.error('Get featured artworks error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// TOGGLE FEATURED (Admin only)
// ============================================
export const toggleFeatured = async (req, res) => {
  try {
    const { artworkId } = req.params;

    const artwork = await Artwork.findById(artworkId);

    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    artwork.isFeatured = !artwork.isFeatured;
    await artwork.save();

    res.json({
      message: `Artwork ${artwork.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      isFeatured: artwork.isFeatured
    });
  } catch (error) {
    console.error('Toggle featured error:', error);
    res.status(500).json({ error: error.message });
  }
};



// ============================================
// MARK AS SOLD (Existing - Updated)
// ============================================
// NOTE: intended for one-off / auction-style artworks (quantity === 1).
// For fixed-price items with quantity > 1, increment soldQuantity via
// your order/checkout flow instead of calling this.
export const markAsSold = async (req, res) => {
  try {
    const { artworkId } = req.params;

    const artwork = await Artwork.findById(artworkId);

    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found' });
    }

    if (artwork.artistId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (artwork.isFixedPrice && artwork.quantity > 1) {
      return res.status(400).json({
        error: 'This is a multi-quantity fixed price item. Update soldQuantity via checkout instead of marking the whole listing as sold.'
      });
    }

    artwork.status = 'sold';
    if (artwork.isFixedPrice) {
      artwork.soldQuantity = artwork.quantity;
    }
    await artwork.save();

    res.json({ message: 'Artwork marked as sold', artwork });
  } catch (error) {
    console.error('Mark as sold error:', error);
    res.status(500).json({ error: error.message });
  }
};