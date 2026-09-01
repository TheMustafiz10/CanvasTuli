

import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import Order from '../models/Order.js';
import Notification from '../models/Notification.js';
import { getIO } from '../config/socket.js';

const auctionTimers = new Map();

// ✅ Update auction status based on current time
export const updateAuctionStatus = async (auction) => {
  const now = new Date();
  const start = new Date(auction.startTime);
  const end = new Date(auction.endTime);
  
  let newStatus = auction.status;
  
  if (auction.status === 'cancelled') {
    return auction.status;
  }
  
  if (now < start) {
    newStatus = 'scheduled';
  } else if (now >= start && now <= end) {
    newStatus = 'live';
  } else if (now > end) {
    newStatus = 'ended';
  }
  
  if (newStatus !== auction.status) {
    auction.status = newStatus;
    await auction.save();
    
    // Broadcast status change
    const io = getIO();
    io.emit('auction-status-changed', {
      auctionId: auction._id,
      status: newStatus
    });
  }
  
  return newStatus;
};

// ✅ Update all auction statuses
export const updateAllAuctionStatuses = async () => {
  try {
    const auctions = await Auction.find({
      status: { $in: ['scheduled', 'live'] }
    });
    
    let updatedCount = 0;
    for (const auction of auctions) {
      const oldStatus = auction.status;
      const newStatus = await updateAuctionStatus(auction);
      if (oldStatus !== newStatus) {
        updatedCount++;
      }
    }
    
    return updatedCount;
  } catch (error) {
    console.error('Error updating auction statuses:', error);
    return 0;
  }
};

// ✅ Start auction timer with proper timezone handling
export const startAuctionTimer = (auction) => {
  // Clear existing timer if any
  if (auctionTimers.has(auction._id.toString())) {
    clearTimeout(auctionTimers.get(auction._id.toString()));
    auctionTimers.delete(auction._id.toString());
  }
  
  const now = new Date();
  const endTime = new Date(auction.endTime);
  const timeRemaining = endTime - now;
  
  // If auction is not live yet, schedule status update
  if (auction.status === 'scheduled') {
    const startTime = new Date(auction.startTime);
    const timeToStart = startTime - now;
    
    if (timeToStart > 0) {
      // Schedule auction to go live
      const timer = setTimeout(async () => {
        await updateAuctionStatus(auction);
        // Start the end timer if it's now live
        const updatedAuction = await Auction.findById(auction._id);
        if (updatedAuction && updatedAuction.status === 'live') {
          startAuctionTimer(updatedAuction);
        }
      }, timeToStart);
      
      auctionTimers.set(auction._id.toString(), timer);
      return;
    }
  }
  
  // If auction is live and hasn't ended
  if (auction.status === 'live' && timeRemaining > 0) {
    const timer = setTimeout(async () => {
      await endAuction(auction._id);
    }, timeRemaining);
    
    auctionTimers.set(auction._id.toString(), timer);
  } else if (timeRemaining <= 0 && auction.status === 'live') {
    // If time is up, end auction immediately
    endAuction(auction._id);
  }
};




//  End auction with proper timezone handling
export const endAuction = async (auctionId) => {
  try {
    const auction = await Auction.findById(auctionId)
      .populate('artworkId')
      .populate('artistId', 'fullName email');
    
    if (!auction) {
      console.error('Auction not found:', auctionId);
      return;
    }
    
    // Check if auction is already ended
    if (auction.status === 'ended' || auction.status === 'accepted' || auction.status === 'cancelled') {
      return;
    }

    // Update auction status to ended
    auction.status = 'ended';
    
    if (auction.highestBidderId) {
      auction.winnerId = auction.highestBidderId;
      auction.winningBid = auction.currentHighestBid;

      const highestBid = await Bid.findOne({ 
        auctionId: auction._id 
      }).sort({ amount: -1 });
      
      // Create order for the winner
      const order = new Order({
        auctionId: auction._id,
        winnerId: auction.winnerId,
        artworkId: auction.artworkId._id,
        bidId: highestBid?._id || null,
        amount: auction.winningBid,
        finalAmount: auction.winningBid,
        paymentStatus: 'pending'
      });
      await order.save();
      
      // Notify winner
      await Notification.create({
        userId: auction.winnerId,
        title: '🎉 You won the auction!',
        message: `Congratulations! You won "${auction.artworkId.title}" with a bid of $${auction.winningBid.toLocaleString()}`,
        type: 'won'
      });
      
      // Notify artist about sale
      await Notification.create({
        userId: auction.artistId._id,
        title: '💰 Artwork Sold!',
        message: `Your artwork "${auction.artworkId.title}" was sold for $${auction.winningBid.toLocaleString()}`,
        type: 'system'
      });
    }
    
    await auction.save();
    
    // Broadcast auction ended event
    const io = getIO();
    io.to(`auction-${auctionId}`).emit('auction-ended', {
      auctionId: auction._id,
      winnerId: auction.winnerId,
      winningBid: auction.winningBid,
      message: 'Auction has ended',
      status: 'ended'
    });
    
    // Broadcast to all users for listing update
    io.emit('auction-status-changed', {
      auctionId: auction._id,
      status: 'ended'
    });
    
    // Clear timer
    if (auctionTimers.has(auctionId.toString())) {
      clearTimeout(auctionTimers.get(auctionId.toString()));
      auctionTimers.delete(auctionId.toString());
    }
    
    console.log(`✅ Auction ${auctionId} ended successfully`);
  } catch (error) {
    console.error('Error ending auction:', error);
  }
};

// ✅ Extend auction time (anti-sniping)
export const extendAuction = async (auctionId, extensionTime = 30000) => {
  try {
    const auction = await Auction.findById(auctionId);
    
    if (!auction || auction.status !== 'live') {
      console.error('Cannot extend: Auction not live or not found');
      return false;
    }
    
    // Calculate new end time
    const currentEnd = new Date(auction.endTime);
    const newEnd = new Date(currentEnd.getTime() + extensionTime);
    
    auction.endTime = newEnd;
    await auction.save();
    
    // Reset timer
    if (auctionTimers.has(auctionId.toString())) {
      clearTimeout(auctionTimers.get(auctionId.toString()));
      auctionTimers.delete(auctionId.toString());
    }
    
    // Start new timer with extended time
    startAuctionTimer(auction);
    
    // Broadcast extension
    const io = getIO();
    io.to(`auction-${auctionId}`).emit('auction-extended', {
      auctionId,
      newEndTime: newEnd,
      extensionTime
    });
    
    console.log(`⏰ Auction ${auctionId} extended by ${extensionTime/1000} seconds`);
    return true;
  } catch (error) {
    console.error('Error extending auction:', error);
    return false;
  }
};

// ✅ Check for auctions that need status updates (run periodically)
export const checkAuctionStatuses = async () => {
  try {
    const now = new Date();
    
    // Find scheduled auctions that should be live
    const scheduledToLive = await Auction.find({
      status: 'scheduled',
      startTime: { $lte: now }
    });
    
    for (const auction of scheduledToLive) {
      await updateAuctionStatus(auction);
      // Start timer for this auction
      const updatedAuction = await Auction.findById(auction._id);
      if (updatedAuction && updatedAuction.status === 'live') {
        startAuctionTimer(updatedAuction);
      }
    }
    
    // Find live auctions that should be ended
    const liveToEnd = await Auction.find({
      status: 'live',
      endTime: { $lte: now }
    });
    
    for (const auction of liveToEnd) {
      await endAuction(auction._id);
    }
    
    return {
      scheduledToLive: scheduledToLive.length,
      liveToEnd: liveToEnd.length
    };
  } catch (error) {
    console.error('Error checking auction statuses:', error);
    return { scheduledToLive: 0, liveToEnd: 0 };
  }
};

// ✅ Initialize periodic status checking
let statusCheckInterval = null;

export const startStatusChecker = (intervalMs = 60000) => {
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval);
  }
  
  // Run immediately
  checkAuctionStatuses();
  
  // Run periodically
  statusCheckInterval = setInterval(checkAuctionStatuses, intervalMs);
  console.log(`🔄 Auction status checker started (interval: ${intervalMs/1000}s)`);
};

export const stopStatusChecker = () => {
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval);
    statusCheckInterval = null;
    console.log('🛑 Auction status checker stopped');
  }
};

// ✅ Clean up all timers
export const clearAllTimers = () => {
  for (const [key, timer] of auctionTimers) {
    clearTimeout(timer);
  }
  auctionTimers.clear();
  console.log('🧹 All auction timers cleared');
};