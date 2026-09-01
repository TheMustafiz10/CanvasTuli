

// backend/src/controllers/fixedPriceOrderController.js
import Stripe from 'stripe';
import FixedPriceOrder from '../models/FixedPriceOrder.js';
import Artwork from '../models/Artwork.js';
import Cart from '../models/Cart.js';
import Notification from '../models/Notification.js';
import { getIO } from '../config/socket.js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

// ✅ Create Order from Cart
export const createOrderFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const cart = await Cart.findOne({ userId })
      .populate('items.artworkId', 'title imageUrl fixedPrice quantity soldQuantity artistId');
    
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }
    
    let subtotal = 0;
    const orderItems = [];
    
    for (const item of cart.items) {
      const artwork = item.artworkId;
      if (!artwork) {
        continue;
      }
      
      const available = artwork.quantity - (artwork.soldQuantity || 0);
      
      if (item.quantity > available) {
        return res.status(400).json({ 
          error: `${artwork.title}: Only ${available} units available` 
        });
      }
      
      const subtotalItem = item.price * item.quantity;
      subtotal += subtotalItem;
      
      orderItems.push({
        artworkId: artwork._id,
        title: artwork.title,
        quantity: item.quantity,
        price: item.price,
        subtotal: subtotalItem,
        artistId: artwork.artistId
      });
    }
    
    const platformFee = Math.round(subtotal * 0.05 * 100) / 100;
    const totalAmount = subtotal + platformFee;
    
    const order = new FixedPriceOrder({
      userId,
      items: orderItems,
      subtotal,
      platformFee,
      totalAmount,
      paymentStatus: 'pending',
      orderStatus: 'pending'
    });
    
    await order.save();
    
    res.json({
      success: true,
      order,
      subtotal,
      platformFee,
      totalAmount
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Process Payment (Stripe Checkout)
export const createFixedPriceCheckout = async (req, res) => {
  try {
    const { orderId } = req.body;
    
    if (!stripe) {
      return res.status(503).json({ 
        error: 'Payment service unavailable. Stripe not configured.' 
      });
    }
    
    const order = await FixedPriceOrder.findById(orderId)
      .populate('items.artworkId', 'title imageUrl');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({ error: 'Order already processed' });
    }
    
    const lineItems = order.items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title || 'Artwork',
          images: item.artworkId?.imageUrl ? [item.artworkId.imageUrl] : []
        },
        unit_amount: Math.round(item.price * 100)
      },
      quantity: item.quantity
    }));
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=fixed`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/cart`,
      metadata: {
        orderId: order._id.toString(),
        type: 'fixed_price',
        userId: req.user._id.toString()
      }
    });
    
    order.stripeSessionId = session.id;
    await order.save();
    
    res.json({ 
      success: true, 
      sessionId: session.id, 
      url: session.url 
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Order History (My Purchases)
export const getOrderHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, limit = 50 } = req.query;
    
    const filter = { userId };
    if (status) {
      filter.paymentStatus = status;
    }
    
    const orders = await FixedPriceOrder.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    
    // Add artwork details to each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const orderObj = order.toObject();
        const itemsWithDetails = await Promise.all(
          orderObj.items.map(async (item) => {
            const artwork = await Artwork.findById(item.artworkId)
              .select('title imageUrl artistId')
              .populate('artistId', 'fullName');
            return {
              ...item,
              artwork
            };
          })
        );
        return {
          ...orderObj,
          items: itemsWithDetails
        };
      })
    );
    
    res.json({
      success: true,
      count: ordersWithDetails.length,
      orders: ordersWithDetails
    });
  } catch (error) {
    console.error('Get order history error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get Order Details
export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;
    
    const order = await FixedPriceOrder.findOne({ _id: orderId, userId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Get artwork details for each item
    const orderObj = order.toObject();
    const itemsWithDetails = await Promise.all(
      orderObj.items.map(async (item) => {
        const artwork = await Artwork.findById(item.artworkId)
          .select('title imageUrl artistId')
          .populate('artistId', 'fullName');
        return {
          ...item,
          artwork
        };
      })
    );
    
    res.json({
      success: true,
      order: {
        ...orderObj,
        items: itemsWithDetails
      }
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ Confirm Fixed Price Payment (Webhook handler)
export const handleFixedPricePayment = async (session) => {
  try {
    const orderId = session.metadata.orderId;
    
    const order = await FixedPriceOrder.findById(orderId);
    if (!order) {
      console.error('Order not found for payment:', orderId);
      return;
    }
    
    // Update order
    order.paymentStatus = 'paid';
    order.paidAt = new Date();
    order.stripePaymentIntentId = session.payment_intent;
    order.paymentMethod = 'stripe';
    await order.save();
    
    // Update inventory for each item
    for (const item of order.items) {
      const artwork = await Artwork.findById(item.artworkId);
      if (artwork) {
        artwork.soldQuantity = (artwork.soldQuantity || 0) + item.quantity;
        if (artwork.soldQuantity >= artwork.quantity) {
          artwork.status = 'out_of_stock';
        }
        await artwork.save();
      }
    }
    
    // Clear cart
    await Cart.findOneAndDelete({ userId: order.userId });
    
    // Notify buyer
    await Notification.create({
      userId: order.userId,
      title: 'Purchase Successful! ✅',
      message: `Your purchase of ${order.items.length} item(s) has been confirmed. Platform fee: $${order.platformFee.toFixed(2)}`,
      type: 'payment_success'
    });
    
    // Notify artists for each item
    const artistIds = new Set();
    for (const item of order.items) {
      const artwork = await Artwork.findById(item.artworkId).populate('artistId');
      if (artwork && artwork.artistId && !artistIds.has(artwork.artistId._id.toString())) {
        artistIds.add(artwork.artistId._id.toString());
        const earnings = (item.price * item.quantity) - (item.price * item.quantity * 0.05);
        await Notification.create({
          userId: artwork.artistId._id,
          title: 'Artwork Sold! 💰',
          message: `Your artwork "${item.title}" was sold. Earnings: $${earnings.toFixed(2)}`,
          type: 'artwork_sold'
        });
      }
    }
    
    // Broadcast via Socket.IO
    const io = getIO();
    io.emit('fixed-price-payment-completed', {
      orderId: order._id,
      userId: order.userId,
      total: order.totalAmount,
      items: order.items.length
    });
    
    console.log(`✅ Fixed price payment completed: Order ${order._id}`);
    
  } catch (error) {
    console.error('Handle fixed price payment error:', error);
  }
};

// ✅ Get Artist Sales (for Artist Dashboard)
export const getArtistFixedSales = async (req, res) => {
  try {
    const artistId = req.user._id;
    
    // Find all orders that contain items from this artist
    const orders = await FixedPriceOrder.find({ paymentStatus: 'paid' })
      .populate('items.artworkId', 'title imageUrl artistId')
      .sort({ createdAt: -1 });
    
    let totalSales = 0;
    let totalPlatformFee = 0;
    let totalItems = 0;
    const salesData = [];
    
    for (const order of orders) {
      let orderTotal = 0;
      const orderItems = [];
      
      for (const item of order.items) {
        const itemArtistId = item.artistId || item.artworkId?.artistId;
        if (itemArtistId && itemArtistId.toString() === artistId.toString()) {
          const itemTotal = item.price * item.quantity;
          orderTotal += itemTotal;
          totalItems += item.quantity;
          
          const artwork = item.artworkId?._id
            ? item.artworkId
            : await Artwork.findById(item.artworkId).select('title imageUrl');
          orderItems.push({
            ...item.toObject(),
            artwork
          });
        }
      }
      
      if (orderTotal > 0) {
        const fee = orderTotal * 0.05;
        totalSales += orderTotal;
        totalPlatformFee += fee;
        
        salesData.push({
          orderId: order._id,
          orderTotal,
          platformFee: fee,
          artistEarnings: orderTotal - fee,
          items: orderItems,
          buyerId: order.userId,
          paidAt: order.paidAt,
          paymentMethod: order.paymentMethod
        });
      }
    }
    
    res.json({
      success: true,
      stats: {
        totalSales: Math.round(totalSales * 100) / 100,
        totalPlatformFee: Math.round(totalPlatformFee * 100) / 100,
        netEarnings: Math.round((totalSales - totalPlatformFee) * 100) / 100,
        totalItems,
        totalOrders: salesData.length
      },
      sales: salesData
    });
  } catch (error) {
    console.error('Get artist fixed sales error:', error);
    res.status(500).json({ error: error.message });
  }
};