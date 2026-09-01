

import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin123';

export const register = async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      fullName,
      role: role || 'customer'
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email?.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      let admin = await User.findOne({ email: ADMIN_EMAIL });
      if (!admin) {
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        admin = await User.create({
          email: ADMIN_EMAIL,
          password: hashedPassword,
          fullName: 'System Admin',
          role: 'admin',
          isVerified: true
        });
      } else if (admin.role !== 'admin') {
        admin.role = 'admin';
        admin.password = await bcrypt.hash(ADMIN_PASSWORD, 10);
        await admin.save();
      }

      admin.lastLogin = new Date();
      await admin.save();

      const token = jwt.sign(
        { userId: admin._id, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Login successful',
        user: {
          id: admin._id,
          email: admin.email,
          fullName: admin.fullName,
          role: admin.role,
          isVerified: admin.isVerified
        },
        token
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPublicArtists = async (req, res) => {
  try {
    const artists = await User.find({ role: 'artist' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: artists.length,
      users: artists
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};