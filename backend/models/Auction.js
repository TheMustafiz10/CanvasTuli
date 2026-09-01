

import mongoose from 'mongoose';

const AuctionSchema = new mongoose.Schema({
  artworkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artwork',
    required: true
  },
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentHighestBid: {
    type: Number,
    default: 0
  },
  minimumBidIncrement: {
    type: Number,
    default: 50
  },
  highestBidderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  acceptedBidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid',
    default: null
  },
  acceptedByArtist: {
    type: Boolean,
    default: false
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'live', 'ended', 'cancelled', 'accepted'],
    default: 'scheduled'
  },
  totalBids: {
    type: Number,
    default: 0
  },
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  winningBid: {
    type: Number,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Virtual field for calculated status based on current time
AuctionSchema.virtual('calculatedStatus').get(function() {
  const now = new Date();
  const start = new Date(this.startTime);
  const end = new Date(this.endTime);
  
  // If explicitly cancelled or ended, keep those statuses
  if (this.status === 'cancelled') return 'cancelled';
  if (this.status === 'ended') return 'ended';
  if (this.status === 'accepted') return 'accepted';
  
  // Calculate status based on time
  if (now < start) return 'scheduled';
  if (now >= start && now <= end) return 'live';
  if (now > end) return 'ended';
  
  return this.status || 'scheduled';
});

// Method to update status based on current time
AuctionSchema.methods.updateStatus = function() {
  const calculatedStatus = this.calculatedStatus;
  if (this.status !== calculatedStatus) {
    this.status = calculatedStatus;
    return true; // Status changed
  }
  return false; // Status unchanged
};

// Static method to update all auction statuses
AuctionSchema.statics.updateAllStatuses = async function() {
  const auctions = await this.find({ 
    status: { $in: ['scheduled', 'live'] } 
  });
  
  let updatedCount = 0;
  for (const auction of auctions) {
    if (auction.updateStatus()) {
      await auction.save();
      updatedCount++;
    }
  }
  return updatedCount;
};

// Ensure virtuals are included in JSON output
AuctionSchema.set('toJSON', { virtuals: true });
AuctionSchema.set('toObject', { virtuals: true });

// Indexes for performance
AuctionSchema.index({ status: 1, endTime: 1 });
AuctionSchema.index({ artistId: 1 });
AuctionSchema.index({ artworkId: 1 });
AuctionSchema.index({ startTime: 1 });
AuctionSchema.index({ endTime: 1 });

const Auction = mongoose.model('Auction', AuctionSchema);
export default Auction;