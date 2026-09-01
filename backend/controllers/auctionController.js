


import Auction from '../models/Auction.js';
import Artwork from '../models/Artwork.js';
import Bid from '../models/Bid.js';
import Order from '../models/Order.js';
import Notification from '../models/Notification.js';
import { startAuctionTimer } from '../services/auctionService.js';
import { getIO } from '../config/socket.js';

// ============================================
// CREATE AUCTION
// ============================================
export const createAuction = async (req, res) => {
  try {
    const {
      artworkId,
      startingPrice,
      minimumBidIncrement,
      startTime,
      endTime
    } = req.body;

    // ✅ Validate required fields
    if (!artworkId || !startingPrice || !startTime || !endTime) {
      return res.status(400).json({ 
        error: 'Missing required fields: artworkId, startingPrice, startTime, endTime' 
      });
    }

    // ✅ Verify artwork belongs to artist
    const artwork = await Artwork.findOne({ 
      _id: artworkId, 
      artistId: req.user._id 
    });

    if (!artwork) {
      return res.status(404).json({ error: 'Artwork not found or unauthorized' });
    }

    // ✅ Validate dates
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();

    if (isNaN(start) || isNaN(end)) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    // ✅ Check: End time must be after start time
    if (end <= start) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    // ✅ Validate price
    if (startingPrice <= 0) {
      return res.status(400).json({ error: 'Starting price must be greater than 0' });
    }

    // ✅ Auto-calculate status based on time
    let status = 'scheduled';
    if (start <= now && end > now) {
      status = 'live';
    } else if (start <= now && end <= now) {
      status = 'ended';
    }

    const auction = new Auction({
      artworkId,
      artistId: req.user._id,
      startingPrice: parseFloat(startingPrice),
      currentHighestBid: parseFloat(startingPrice),
      minimumBidIncrement: parseFloat(minimumBidIncrement) || 50,
      startTime: start,
      endTime: end,
      status: status
    });

    await auction.save();

    // ✅ Populate artwork and artist for response
    const populatedAuction = await Auction.findById(auction._id)
      .populate('artworkId')
      .populate('artistId', 'fullName email');

    // ✅ Emit socket event for real-time updates
    try {
      const io = getIO();
      io.emit('auction-created', {
        auctionId: auction._id,
        status: auction.status,
        artworkTitle: artwork.title,
        artistName: req.user.fullName
      });
    } catch (socketError) {
      console.warn('Socket emit failed:', socketError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Auction created successfully',
      auction: populatedAuction
    });

  } catch (error) {
    console.error('Create auction error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create auction' 
    });
  }
};

// ============================================
// START AUCTION
// ============================================
export const startAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    if (auction.artistId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (auction.status !== 'scheduled') {
      return res.status(400).json({ error: 'Auction cannot be started' });
    }

    auction.status = 'live';
    auction.startTime = new Date();
    await auction.save();

    // Start auction timer
    startAuctionTimer(auction);

    // ✅ Emit socket event
    const io = getIO();
    io.emit('auction-status-changed', {
      auctionId: auction._id,
      status: 'live'
    });

    res.json({ 
      success: true, 
      message: 'Auction started', 
      auction 
    });
  } catch (error) {
    console.error('Start auction error:', error);
    res.status(500).json({ error: error.message });
  }
};









// ============================================
// ACCEPT BID (Artist accepts a bid)
// ============================================

export const acceptBid = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { bidId } = req.body;
    const userId = req.user._id;

    if (!bidId) {
      return res.status(400).json({ error: 'bidId is required' });
    }



    // Only artist can accept bids
    const auction = await Auction.findById(auctionId)
      .populate('artworkId')
      .populate('artistId', 'fullName email');

    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    // ✅ Verify the user is the artist
    if (auction.artistId._id.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Only the artist can accept bids' });
    }

    // ✅ Find the bid
    const bid = await Bid.findById(bidId).populate('bidderId', 'fullName email');

    if (!bid) {
      return res.status(404).json({ error: 'Bid not found' });
    }

    if (bid.auctionId.toString() !== auctionId) {
      return res.status(400).json({ error: 'Bid does not belong to this auction' });
    }

    const existingOrder = await Order.findOne({ auctionId: auction._id });
    if (existingOrder) {
      if (!existingOrder.bidId || existingOrder.bidId.toString() !== bid._id.toString()) {
        return res.status(400).json({ error: 'Auction already accepted a different bid' });
      }
      return res.json({
        success: true,
        message: 'Bid was already accepted',
        auction,
        order: existingOrder,
        platformFee: existingOrder.platformFee
      });
    }

    // ✅ Check if auction already accepted a different bid
    if (auction.acceptedBidId && auction.acceptedBidId.toString() !== bid._id.toString()) {
      return res.status(400).json({ error: 'Auction already accepted a bid' });
    }

    // ✅ Update auction
    auction.status = 'accepted';
    auction.acceptedBidId = bid._id;
    auction.acceptedByArtist = true;
    auction.winnerId = bid.bidderId._id;
    auction.winningBid = bid.amount;
    auction.endTime = new Date(); // End auction immediately
    await auction.save();

    // ✅ Mark bid as accepted
    bid.isAccepted = true;
    bid.acceptedAt = new Date();
    await bid.save();

    // ✅ Calculate platform fee (5%)
    const PLATFORM_FEE_PERCENTAGE = 0.05;
    const platformFee = Math.round(bid.amount * PLATFORM_FEE_PERCENTAGE * 100) / 100;
    const artistAmount = bid.amount - platformFee;

    // ✅ Create order
    const amount = Number(bid.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({ error: 'Bid amount is invalid' });
    }

    const order = new Order({
      auctionId: auction._id,
      winnerId: bid.bidderId._id,
      artworkId: auction.artworkId._id,
      bidId: bid._id,
      amount,
      finalAmount: amount,
      platformFee,
      artistAmount,
      paymentStatus: 'pending'
    });
    await order.save();

    // ✅ Notify winner
    await Notification.create({
      userId: bid.bidderId._id,
      title: 'You won the auction!',
      message: `You won "${auction.artworkId.title}" with a bid of $${amount.toLocaleString()}. Complete your payment to receive the artwork.`,
      type: 'bid_accepted',
      data: { auctionId, orderId: order._id, amount: bid.amount }
    });

    // ✅ Notify other bidders
    const otherBids = await Bid.find({ 
      auctionId, 
      _id: { $ne: bid._id } 
    }).distinct('bidderId');

    for (const bidderId of otherBids) {
      await Notification.create({
        userId: bidderId,
        title: 'Auction ended',
        message: `The auction for "${auction.artworkId.title}" has ended. The artist accepted a bid.`,
        type: 'auction_ended',
        data: { auctionId }
      });
    }



    // Broadcast via Socket.IO
    const io = getIO();
    io.to(`auction-${auctionId}`).emit('bid-accepted', {
      auctionId: auction._id,
      acceptedBid: {
        _id: bid._id,
        amount: bid.amount,
        bidder: bid.bidderId.fullName,
        bidderId: bid.bidderId._id
      },
      orderId: order._id,
      message: 'A bid has been accepted!'
    });

    // ✅ Also broadcast to all users for live updates
    io.emit('auction-status-changed', {
      auctionId: auction._id,
      status: 'accepted'
    });

    res.json({
      success: true,
      message: 'Bid accepted successfully',
      auction,
      order,
      platformFee
    });
  } catch (error) {
    console.error('Accept bid error:', error);
    res.status(500).json({ error: error.message });
  }
};








// ============================================
// GET ACTIVE AUCTION
// ============================================
export const getActiveAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const auction = await Auction.findById(auctionId)
      .populate('artworkId')
      .populate('artistId', 'fullName')
      .populate('highestBidderId', 'fullName');

    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    const bids = await Bid.find({ auctionId })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('bidderId', 'fullName');

    res.json({
      auction,
      recentBids: bids,
      bidCount: await Bid.countDocuments({ auctionId })
    });
  } catch (error) {
    console.error('Get active auction error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET ALL AUCTIONS
// ============================================
export const getAllAuctions = async (req, res) => {
  try {
    const { status, artistId } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (artistId) filter.artistId = artistId;

    const auctions = await Auction.find(filter)
      .populate('artworkId')
      .populate('artistId', 'fullName')
      .sort({ createdAt: -1 });

    res.json(auctions);
  } catch (error) {
    console.error('Get all auctions error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET ARTIST AUCTIONS
// ============================================
export const getArtistAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ artistId: req.user._id })
      .populate('artworkId')
      .sort({ createdAt: -1 });

    res.json(auctions);
  } catch (error) {
    console.error('Get artist auctions error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// UPDATE AUCTION
// ============================================
export const updateAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const updates = req.body;

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    if (auction.artistId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (auction.status === 'live') {
      return res.status(400).json({ error: 'Cannot update live auction' });
    }

    const updatedAuction = await Auction.findByIdAndUpdate(
      auctionId,
      updates,
      { new: true, runValidators: true }
    );

    res.json(updatedAuction);
  } catch (error) {
    console.error('Update auction error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// CANCEL AUCTION
// ============================================
export const cancelAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    if (auction.artistId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (auction.status === 'ended') {
      return res.status(400).json({ error: 'Cannot cancel ended auction' });
    }

    auction.status = 'cancelled';
    await auction.save();

    // ✅ Emit socket event
    const io = getIO();
    io.emit('auction-status-changed', {
      auctionId: auction._id,
      status: 'cancelled'
    });

    res.json({ 
      success: true, 
      message: 'Auction cancelled successfully', 
      auction 
    });
  } catch (error) {
    console.error('Cancel auction error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// GET AUCTION WINNER
// ============================================
export const getAuctionWinner = async (req, res) => {
  try {
    const { auctionId } = req.params;
    
    const auction = await Auction.findById(auctionId)
      .populate('winnerId', 'fullName email')
      .populate('artworkId', 'title imageUrl');

    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    res.json({
      success: true,
      winner: auction.winnerId,
      winningBid: auction.winningBid,
      artwork: auction.artworkId,
      status: auction.status
    });
  } catch (error) {
    console.error('Get auction winner error:', error);
    res.status(500).json({ error: error.message });
  }
};