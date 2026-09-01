



import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { getIO } from '../config/socket.js';




// Place Bid - Only customers can bid, artists cannot bid on their own auction
export const placeBid = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { amount } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;


    // ✅ Only customers can place bids
    if (userRole !== 'customer') {
      return res.status(403).json({ 
        error: 'Only customers can place bids' 
      });
    }

    // Get auction
    const auction = await Auction.findById(auctionId);
    
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    // ✅ Artist cannot bid on their own auction
    if (auction.artistId.toString() === userId.toString()) {
      return res.status(403).json({ 
        error: 'Artist cannot bid on their own auction' 
      });
    }

    // ✅ Validate auction status
    if (auction.status !== 'live') {
      return res.status(400).json({ error: 'Auction is not live' });
    }

    // ✅ Check if auction already accepted a bid
    if (auction.acceptedBidId || ['accepted', 'ended'].includes(auction.status)) {
      return res.status(400).json({ error: 'Auction already accepted a bid' });
    }

    // ✅ Check if auction ended
    if (new Date() > auction.endTime) {
      return res.status(400).json({ error: 'Auction has ended' });
    }

    // ✅ Validate bid amount
    const minimumBid = auction.currentHighestBid + auction.minimumBidIncrement;
    if (amount < minimumBid) {
      return res.status(400).json({ 
        error: `Bid must be at least ${minimumBid}` 
      });
    }

    // ✅ Prevent self-bidding
    if (auction.highestBidderId && auction.highestBidderId.toString() === userId.toString()) {
      return res.status(400).json({ error: 'You are already the highest bidder' });
    }

    // ✅ Create bid
    const bid = new Bid({
      auctionId,
      bidderId: userId,
      amount
    });

    // ✅ Update auction atomically
    const previousHighestBidder = auction.highestBidderId;
    auction.currentHighestBid = amount;
    auction.highestBidderId = userId;
    auction.totalBids += 1;
    
    // ✅ Save both auction and bid
    await auction.save();
    await bid.save();

    // Get bidder info
    const bidder = await User.findById(userId).select('fullName');

    // ✅ Notify previous highest bidder
    if (previousHighestBidder) {
      await Notification.create({
        userId: previousHighestBidder,
        title: 'You\'ve been outbid!',
        message: `A new bid of $${amount} has been placed on the auction`,
        type: 'outbid',
        data: { auctionId, newBid: amount }
      });
    }

    // ✅ Notify artist about new bid
    await Notification.create({
      userId: auction.artistId,
      title: 'New bid on your auction!',
      message: `A new bid of $${amount} has been placed on your artwork`,
      type: 'new_bid',
      data: { auctionId, bidder: bidder?.fullName || 'Anonymous', amount }
    });

    // ✅ Broadcast via Socket.IO
    try {
      const io = getIO();
      io.to(`auction-${auctionId}`).emit('new-bid', {
        bid: {
          _id: bid._id,
          amount,
          bidder: bidder?.fullName || 'Anonymous Collector',
          bidderId: userId,
          createdAt: bid.createdAt
        },
        auction: {
          currentHighestBid: amount,
          highestBidderId: userId,
          totalBids: auction.totalBids
        }
      });
    } catch (socketError) {
      console.warn('Socket broadcast failed:', socketError.message);
    }

    res.json({
      success: true,
      message: 'Bid placed successfully',
      bid,
      auction
    });
  } catch (error) {
    console.error('❌ Place bid error:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      error: error.message || 'Failed to place bid' 
    });
  }
};








// ✅ Get Bid History for a specific auction
export const getBidHistory = async (req, res) => {
  try {
    const { auctionId } = req.params;
    
    const bids = await Bid.find({ auctionId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('bidderId', 'fullName email');

    res.json({
      success: true,
      count: bids.length,
      bids
    });
  } catch (error) {
    console.error('Get bid history error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get bids placed by the current user
export const getUserBids = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const bids = await Bid.find({ bidderId: userId })
      .sort({ createdAt: -1 })
      .populate('auctionId', 'artworkId status currentHighestBid endTime acceptedBidId')
      .populate({
        path: 'auctionId',
        populate: {
          path: 'artworkId',
          select: 'title imageUrl'
        }
      });

    // Get active bids
    const activeBids = bids.filter(bid => {
      return bid.auctionId && bid.auctionId.status === 'live';
    });

    // Get won bids (auction ended and user is winner or bid accepted)
    const wonBids = bids.filter(bid => {
      return bid.auctionId && 
             (bid.auctionId.status === 'ended' || bid.auctionId.status === 'accepted') && 
             bid.auctionId.acceptedBidId &&
             bid.auctionId.acceptedBidId.toString() === bid._id.toString();
    });

    res.json({
      success: true,
      totalBids: bids.length,
      activeBids: activeBids.length,
      wonAuctions: wonBids.length,
      bids
    });
  } catch (error) {
    console.error('Get user bids error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get bid count for an auction
export const getBidCount = async (req, res) => {
  try {
    const { auctionId } = req.params;
    
    const count = await Bid.countDocuments({ auctionId });
    
    res.json({
      success: true,
      auctionId,
      bidCount: count
    });
  } catch (error) {
    console.error('Get bid count error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Check if user has bid on an auction
export const hasUserBid = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const userId = req.user._id;
    
    const bid = await Bid.findOne({ 
      auctionId, 
      bidderId: userId 
    });
    
    res.json({
      success: true,
      hasBid: !!bid,
      bid: bid || null
    });
  } catch (error) {
    console.error('Has user bid error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get highest bid for an auction
export const getHighestBid = async (req, res) => {
  try {
    const { auctionId } = req.params;
    
    const highestBid = await Bid.findOne({ auctionId })
      .sort({ amount: -1 })
      .populate('bidderId', 'fullName email');

    res.json({
      success: true,
      highestBid: highestBid || null
    });
  } catch (error) {
    console.error('Get highest bid error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get all bids for artist's auctions
export const getArtistBids = async (req, res) => {
  try {
    const artistId = req.user._id;
    
    // Get all auctions by this artist
    const auctions = await Auction.find({ artistId }).select('_id');
    const auctionIds = auctions.map(a => a._id);
    
    const bids = await Bid.find({ auctionId: { $in: auctionIds } })
      .sort({ createdAt: -1 })
      .populate('bidderId', 'fullName email')
      .populate('auctionId', 'artworkId status currentHighestBid')
      .populate({
        path: 'auctionId',
        populate: {
          path: 'artworkId',
          select: 'title imageUrl'
        }
      });

    res.json({
      success: true,
      count: bids.length,
      bids
    });
  } catch (error) {
    console.error('Get artist bids error:', error);
    res.status(500).json({ error: error.message });
  }
};