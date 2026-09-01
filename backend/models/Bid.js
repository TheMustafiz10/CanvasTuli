

// backend/src/models/Bid.js
import mongoose from 'mongoose';

const BidSchema = new mongoose.Schema({
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },
  bidderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  isAccepted: {
    type: Boolean,
    default: false
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  isAutoBid: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

BidSchema.index({ auctionId: 1, createdAt: -1 });
BidSchema.index({ bidderId: 1 });
BidSchema.index({ isAccepted: 1 });

const Bid = mongoose.model('Bid', BidSchema);
export default Bid;