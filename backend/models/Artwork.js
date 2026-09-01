

import mongoose from 'mongoose';



const ArtworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/400x400'
  },
  images: {
    type: [String],
    default: []
  },
  medium: {
    type: String,
    default: ''
  },
  dimensions: {
    type: String,
    default: ''
  },
  year: {
    type: Number,
    default: null
  },
  category: {
    type: String,
    default: ''
  },
  isFixedPrice: {
    type: Boolean,
    default: false
  },
  fixedPrice: {
    type: Number,
    default: null
  },
  quantity: {
    type: Number,
    default: 0
  },
  soldQuantity: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'sold', 'out_of_stock', 'draft'],
    default: 'pending'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  viewsCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date,
    default: null
  }
});

// Indexes for faster queries
ArtworkSchema.index({ artistId: 1 });
ArtworkSchema.index({ status: 1 });
ArtworkSchema.index({ createdAt: -1 });
ArtworkSchema.index({ isFixedPrice: 1 });
ArtworkSchema.index({ category: 1 });

// Virtual for available quantity
ArtworkSchema.virtual('availableQuantity').get(function() {
  return this.quantity - (this.soldQuantity || 0);
});

// Virtual for in stock
ArtworkSchema.virtual('inStock').get(function() {
  return this.availableQuantity > 0;
});

// Virtual for formatted date
ArtworkSchema.virtual('formattedDate').get(function() {
  return this.createdAt ? new Date(this.createdAt).toLocaleDateString() : 'N/A';
});

// Ensure virtuals are included in JSON output
ArtworkSchema.set('toJSON', { virtuals: true });
ArtworkSchema.set('toObject', { virtuals: true });

const Artwork = mongoose.model('Artwork', ArtworkSchema);
export default Artwork;