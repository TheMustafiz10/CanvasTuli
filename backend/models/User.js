

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['customer', 'artist', 'admin'],
    default: 'customer'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  artistBio: String,
  artistPortfolio: String,
  artistName: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: Date
});



const User = mongoose.model('User', UserSchema);
export default User;