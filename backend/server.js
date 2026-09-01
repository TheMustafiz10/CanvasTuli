

import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import http from 'http';
import cron from 'node-cron';



import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';
import { startStatusChecker } from './services/auctionService.js';


// Routes
import authRoutes from './routes/authRoutes.js';
import auctionRoutes from './routes/auctionRoutes.js';
import bidRoutes from './routes/bidRoutes.js';
import artworkRoutes from './routes/artworkRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import fixedPriceOrderRoutes from './routes/fixedPriceOrderRoutes.js';
import orderRoutes from './routes/orderRoutes.js';



const app = express();
const server = http.createServer(app);




// Initialize Socket.IO
const io = initSocket(server);

// Connect to Database
connectDB();

startStatusChecker(60000);



// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));




// Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));




// Compression
app.use(compression());
app.use(morgan('dev'));



app.use('/api/payments/stripe-webhook', express.raw({ type: 'application/json' }));


app.use(express.json());


// Routes (register payment routes AFTER the webhook route)
app.use('/api/cart', cartRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/orders/fixed', fixedPriceOrderRoutes);
app.use('/api/orders', orderRoutes);






// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});



// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({ 
    error: err.message || 'Something went wrong' 
  });
});



// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});



// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 CORS enabled for: http://localhost:5173`);
});

export default app;