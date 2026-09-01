


// backend/src/models/Notification.js
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'bid', 
      'outbid', 
      'won', 
      'lost', 
      'system',
      'new_bid',        // ✅ Add this
      'bid_accepted',   // ✅ Add this
      'auction_ended',  // ✅ Add this
      'payment_success',// ✅ Add this
      'artwork_sold'    // ✅ Add this
    ],
    default: 'system'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;