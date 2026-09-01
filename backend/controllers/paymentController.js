

// backend/src/controllers/paymentController.js
import Stripe from 'stripe';
import Order from '../models/Order.js';
import FixedPriceOrder from '../models/FixedPriceOrder.js';
import Auction from '../models/Auction.js';
import Artwork from '../models/Artwork.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Cart from '../models/Cart.js';
import { getIO } from '../config/socket.js';
import bkashService from '../services/bkashService.js';



// Initialize Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn('STRIPE_SECRET_KEY is missing. Payment features will be disabled.');
}

// const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
//   apiVersion: '2023-10-16',
// }) : null;

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;





// ============================================
// CREATE PAYMENT INTENT (Auction)
// ============================================
export const createPaymentIntent = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ 
        error: 'Payment service unavailable. Stripe not configured.' 
      });
    }

    const { orderId } = req.body;
    
    const order = await Order.findById(orderId)
      .populate('auctionId')
      .populate('winnerId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.winnerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({ error: 'Order already processed' });
    }

    if (order.auctionId.status !== 'ended' && order.auctionId.status !== 'accepted') {
      return res.status(400).json({ error: 'Auction not ready for payment' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.finalAmount * 100),
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        auctionId: order.auctionId._id.toString(),
        userId: req.user._id.toString(),
        type: 'auction'
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Payment intent error:', error);
    res.status(500).json({ error: error.message });
  }
};






// ============================================
// CREATE STRIPE CHECKOUT (Auction)
// ============================================
export const createStripeCheckout = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ 
        error: 'Payment service unavailable. Stripe not configured.' 
      });
    }

    const { orderId } = req.body;
    let order = null;

    if (orderId && /^[0-9a-fA-F]{24}$/.test(orderId)) {
      order = await Order.findById(orderId)
        .populate('auctionId')
        .populate('winnerId')
        .populate('artworkId');
    }

    if (!order && orderId && /^[0-9a-fA-F]{24}$/.test(orderId)) {
      const auction = await Auction.findById(orderId)
        .populate('artworkId')
        .populate('winnerId');

      if (auction && auction.winnerId && auction.winningBid != null) {
        if (auction.winnerId._id.toString() !== req.user._id.toString()) {
          return res.status(403).json({ error: 'Unauthorized' });
        }

        const amount = Number(auction.winningBid);
        const platformFee = Math.round(amount * 0.05 * 100) / 100;
        order = await Order.findOneAndUpdate(
          { auctionId: auction._id, winnerId: auction.winnerId._id },
          {
            $setOnInsert: {
              auctionId: auction._id,
              winnerId: auction.winnerId._id,
              artworkId: auction.artworkId._id,
              amount,
              finalAmount: amount,
              platformFee,
              artistAmount: amount - platformFee,
              paymentStatus: 'pending'
            }
          },
          { new: true, upsert: true }
        )
          .populate('auctionId')
          .populate('winnerId')
          .populate('artworkId');
      }
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.winnerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({ error: 'Order already processed' });
    }

    if (order.auctionId.status !== 'accepted' && order.auctionId.status !== 'ended') {
      return res.status(400).json({ error: 'Auction not ready for payment' });
    }

    const platformFee = order.platformFee || Math.round(order.finalAmount * 0.05 * 100) / 100;
    const artistAmount = order.finalAmount - platformFee;




    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: order.artworkId.title || 'Artwork',
              description: `Auction #${order.auctionId._id}`,
              images: order.artworkId.imageUrl ? [order.artworkId.imageUrl] : []
            },
            unit_amount: Math.round(order.finalAmount * 100)
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?session_id={CHECKOUT_SESSION_ID}&type=auction`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/cancel`,
      metadata: {
        orderId: order._id.toString(),
        auctionId: order.auctionId._id.toString(),
        userId: req.user._id.toString(),
        platformFee: platformFee.toString(),
        artistAmount: artistAmount.toString(),
        type: 'auction'
      }
    });



    order.stripeSessionId = session.id;
    order.platformFee = platformFee;
    order.artistAmount = artistAmount;
    await order.save();

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message });
  }
};






// ============================================
// CREATE FIXED PRICE CHECKOUT (NEW)
// ============================================
export const createFixedPriceCheckout = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ 
        error: 'Payment service unavailable. Stripe not configured.' 
      });
    }

    const { orderId } = req.body;
    
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
        userId: req.user._id.toString(),
        platformFee: order.platformFee.toString()
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
    console.error('Fixed price checkout error:', error);
    res.status(500).json({ error: error.message });
  }
};





// ============================================
// HANDLE STRIPE WEBHOOK
// ============================================
export const handleStripeWebhook = async (req, res) => {
  if (!stripe) {
    return res.status(503).json({ 
      error: 'Payment service unavailable. Stripe not configured.' 
    });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orderId = session.metadata.orderId;
        const type = session.metadata.type || 'auction';

        if (type === 'fixed' || type === 'fixed_price') {
          // Handle fixed price payment
          await handleFixedPricePayment(session);
        } else {
          // Handle auction payment
          await handleAuctionPayment(session);
        }
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        console.log(`Payment succeeded: ${paymentIntent.id}`);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        console.log(`❌ Payment failed: ${paymentIntent.id}`);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Confirm the Stripe redirect on the client when the webhook has not arrived yet.
export const confirmStripePayment = async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({ error: 'Payment service unavailable. Stripe not configured.' });
    }

    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ error: 'Stripe session ID is required' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Stripe payment is not completed' });
    }

    const metadataUserId = session.metadata?.userId;
    if (metadataUserId && metadataUserId !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const type = session.metadata?.type || 'auction';
    if (type === 'fixed' || type === 'fixed_price') {
      await handleFixedPricePayment(session);
    } else {
      await handleAuctionPayment(session);
    }

    res.json({ success: true, paymentStatus: 'paid' });
  } catch (error) {
    console.error('Stripe payment confirmation error:', error);
    res.status(500).json({ error: error.message });
  }
};




// ============================================
// HANDLE AUCTION PAYMENT (Webhook Helper)
// ============================================
const handleAuctionPayment = async (session) => {
  try {
    const orderId = session.metadata.orderId;
    
    const order = await Order.findById(orderId)
      .populate('winnerId', 'fullName email')
      .populate({
        path: 'auctionId',
        populate: [
          { path: 'artworkId', select: 'title imageUrl' },
          { path: 'artistId', select: 'fullName' }
        ]
      });
    if (!order) return;

    if (order.paymentStatus === 'paid') return;

    order.paymentStatus = 'paid';
    order.paidAt = new Date();
    order.stripePaymentIntentId = session.payment_intent;
    order.paymentMethod = 'stripe';
    order.paymentMethod = 'stripe';
    
    if (!order.platformFee) {
      const PLATFORM_FEE_PERCENTAGE = 0.05;
      order.platformFee = Math.round(order.finalAmount * PLATFORM_FEE_PERCENTAGE * 100) / 100;
    }
    if (!order.artistAmount) {
      order.artistAmount = order.finalAmount - order.platformFee;
    }
    
    await order.save();

    const artwork = await Artwork.findById(order.artworkId);
    if (artwork) {
      artwork.status = 'sold';
      await artwork.save();
    }

    await Notification.create({
      userId: order.winnerId,
      title: 'Payment Successful! ✅',
      message: `Your auction payment has been confirmed. Platform fee: $${order.platformFee}`,
      type: 'payment_success'
    });

    const auction = await Auction.findById(order.auctionId);
    if (auction && auction.artistId) {
      await Notification.create({
        userId: auction.artistId,
        title: 'Artwork Sold! 💰',
        message: `Your artwork has been purchased for $${order.finalAmount}. Platform fee: $${order.platformFee}`,
        type: 'artwork_sold'
      });
    }

    const io = getIO();
    io.emit('payment-completed', {
      orderId: order._id,
      auctionId: order.auctionId,
      artworkId: order.artworkId,
      amount: order.finalAmount,
      type: 'auction'
    });

  } catch (error) {
    console.error('Handle auction payment error:', error);
  }
};






// ============================================
// HANDLE FIXED PRICE PAYMENT (Webhook Helper)
// ============================================
const handleFixedPricePayment = async (session) => {
  try {
    const orderId = session.metadata.orderId;
    
    const order = await FixedPriceOrder.findById(orderId);
    if (!order) return;

    if (order.paymentStatus === 'paid') return;

    order.paymentStatus = 'paid';
    order.paidAt = new Date();
    order.stripePaymentIntentId = session.payment_intent;
    order.paymentMethod = 'stripe';
    await order.save();

    // Update inventory
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
      message: `Your purchase of ${order.items.length} item(s) has been confirmed. Platform fee: $${order.platformFee}`,
      type: 'payment_success'
    });




    // Notify artists
    for (const item of order.items) {
      const artwork = await Artwork.findById(item.artworkId).populate('artistId');
      if (artwork && artwork.artistId) {
        const earnings = (item.price * item.quantity) - (item.price * item.quantity * 0.05);
        await Notification.create({
          userId: artwork.artistId._id,
          title: 'Artwork Sold! 💰',
          message: `Your artwork "${item.title}" was sold. Earnings: $${earnings.toFixed(2)}`,
          type: 'artwork_sold'
        });
      }
    }





    const io = getIO();
    io.emit('fixed-price-payment-completed', {
      orderId: order._id,
      userId: order.userId,
      total: order.totalAmount,
      items: order.items.length
    });

  } catch (error) {
    console.error('Handle fixed price payment error:', error);
  }
};












// ============================================
// BKASH PAYMENT FUNCTIONS
// ============================================


// backend/src/controllers/paymentController.js

// ✅ Add these helper functions at the top of the file

// Get bKash Token
const getBkashToken = async () => {
  try {
    console.log('🔑 Getting bKash token...');

    const response = await fetch(`${getBkashBaseUrl()}/tokenized/checkout/token/grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-APP-Key': process.env.BKASH_APP_KEY
      },
      body: JSON.stringify({
        app_key: process.env.BKASH_APP_KEY,
        app_secret: process.env.BKASH_APP_SECRET
      })
    });

    const data = await response.json();

    if (!response.ok || !data.id_token) {
      console.error('bKash token error:', data);
      throw new Error(data.errorMessage || 'Failed to get bKash token');
    }

    console.log('✅ bKash token obtained successfully');
    return data.id_token;
  } catch (error) {
    console.error('❌ bKash token error:', error.message);
    throw new Error('Unable to authenticate with bKash');
  }
};

// Get bKash Base URL
const getBkashBaseUrl = () => {
  return process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v2';
};

// Complete bKash Order
const completeBkashOrder = async (order, transactionId) => {
  try {
    console.log('✅ Completing bKash order:', order._id);

    order.paymentStatus = 'paid';
    order.paidAt = new Date();
    order.paymentMethod = 'bkash';
    order.bKashTransactionId = transactionId;
    await order.save();

    // Update artwork status if auction order
    if (order.artworkId) {
      const artwork = await Artwork.findById(order.artworkId);
      if (artwork) {
        artwork.status = 'sold';
        await artwork.save();
      }
    }

    // Update auction if auction order
    if (order.auctionId) {
      const auction = await Auction.findById(order.auctionId);
      if (auction) {
        auction.status = 'ended';
        await auction.save();
      }
    }

    // Notify user
    await Notification.create({
      userId: order.winnerId || order.userId,
      title: 'Payment Successful! ✅',
      message: `Your bKash payment has been confirmed.`,
      type: 'payment_success'
    });

    console.log('✅ bKash order completed:', order._id);
  } catch (error) {
    console.error('❌ Error completing bKash order:', error);
    throw error;
  }
};

// ============================================
// CREATE BKASH PAYMENT
// ============================================
export const createBkashPayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    let order = await Order.findById(orderId).populate('winnerId');
    let orderType = 'auction';

    if (!order) {
      order = await FixedPriceOrder.findById(orderId);
      orderType = 'fixed_price';
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const ownerId = orderType === 'auction' ? order.winnerId?._id : order.userId;
    if (!ownerId || ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (order.paymentStatus !== 'pending') {
      return res.status(400).json({ error: 'Order already processed' });
    }

    // Get bKash token
    const idToken = await getBkashToken();

    // Set callback URL
    const callbackUrl = process.env.BKASH_CALLBACK_URL ||
      `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/bkash/callback`;

    // Calculate amount
    const amount = Number(orderType === 'auction' ? order.finalAmount : order.totalAmount);

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    console.log('📤 Creating bKash payment:', {
      amount: amount.toFixed(2),
      orderId: order._id,
      callbackUrl
    });

    // Create payment
    const createResponse = await fetch(`${getBkashBaseUrl()}/tokenized/checkout/create`, {
      method: 'POST',
      headers: {
        Authorization: idToken,
        'X-App-Key': process.env.BKASH_APP_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        mode: '0011',
        payerReference: req.user._id.toString(),
        callbackURL: callbackUrl,
        amount: amount.toFixed(2),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: `CT-${order._id.toString().slice(-8)}`
      })
    });

    const payment = await createResponse.json();

    console.log('📥 bKash create response:', {
      status: createResponse.status,
      hasPaymentId: !!payment.paymentID,
      hasUrl: !!payment.bkashURL
    });

    const paymentUrl = payment.bkashURL || payment.paymentURL || payment.paymentUrl;

    if (!createResponse.ok || !payment.paymentID || !paymentUrl) {
      console.error('bKash create payment error:', payment);
      throw new Error(payment.statusMessage || payment.errorMessage || 'Unable to create bKash payment');
    }

    // Store payment ID in order
    order.bKashTransactionId = payment.paymentID;
    order.paymentMethod = 'bkash';
    await order.save();

    res.json({
      success: true,
      paymentId: payment.paymentID,
      paymentUrl,
      orderType
    });

  } catch (error) {
    console.error('❌ bKash payment error:', error);
    res.status(500).json({ error: error.message || 'Failed to create bKash payment' });
  }
};

// ============================================
// HANDLE BKASH CALLBACK
// ============================================
export const handleBkashCallback = async (req, res) => {
  try {
    // Get parameters from query or body
    const paymentId = req.query.paymentID || req.body.paymentID || req.body.paymentId;
    const status = req.query.status || req.body.status || req.query.paymentStatus;

    console.log('📥 bKash callback received:', { paymentId, status });

    // If payment is successful, execute it
    if (paymentId && (status === 'success' || status === 'completed')) {
      try {
        const idToken = await getBkashToken();

        // Execute payment
        const executeResponse = await fetch(`${getBkashBaseUrl()}/tokenized/checkout/execute`, {
          method: 'POST',
          headers: {
            Authorization: idToken,
            'X-App-Key': process.env.BKASH_APP_KEY,
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({ paymentID: paymentId })
        });

        const execution = await executeResponse.json();

        console.log('📥 bKash execution response:', {
          status: executeResponse.status,
          transactionStatus: execution.transactionStatus,
          trxID: execution.trxID
        });

        if (!executeResponse.ok || execution.transactionStatus !== 'Completed') {
          throw new Error(execution.statusMessage || execution.errorMessage || 'bKash payment was not completed');
        }

        const transactionId = execution.trxID || paymentId;

        // Find and update order
        let order = await Order.findOne({ bKashTransactionId: paymentId });
        if (order) {
          await completeBkashOrder(order, transactionId);
        } else {
          let fixedOrder = await FixedPriceOrder.findOne({ bKashTransactionId: paymentId });
          if (fixedOrder) {
            await completeBkashOrder(fixedOrder, transactionId);
          } else {
            console.warn('⚠️ No order found for bKash payment:', paymentId);
          }
        }

      } catch (error) {
        console.error('❌ bKash execution error:', error);
      }
    }

    // Redirect to frontend
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (status === 'success' || status === 'completed') {
      return res.redirect(`${frontendUrl}/payment/success?type=bkash&payment_id=${encodeURIComponent(paymentId || '')}`);
    }

    return res.redirect(`${frontendUrl}/payment/cancel?type=bkash`);

  } catch (error) {
    console.error('❌ bKash callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/payment/failed?type=bkash`);
  }
};








// const getBkashBaseUrl = () => (
//   process.env.BKASH_BASE_URL ||
//   (process.env.BKASH_ENVIRONMENT === 'production'
//     ? 'https://tokenized.pay.bka.sh/v1.2.0-beta'
//     : 'https://tokenized.sandbox.bka.sh/v1.2.0-beta')
// ).replace(/\/$/, '');

// const getBkashToken = async () => {
//   const credentials = Buffer.from(
//     `${process.env.BKASH_APP_KEY}:${process.env.BKASH_APP_SECRET}`
//   ).toString('base64');

//   const response = await fetch(`${getBkashBaseUrl()}/tokenized/checkout/token/grant`, {
//     method: 'POST',
//     headers: {
//       Authorization: `Basic ${credentials}`,
//       'Content-Type': 'application/json',
//       Accept: 'application/json'
//     },
//     body: JSON.stringify({
//       app_key: process.env.BKASH_APP_KEY,
//       app_secret: process.env.BKASH_APP_SECRET,
//       username: process.env.BKASH_USERNAME,
//       password: process.env.BKASH_PASSWORD
//     })
//   });

//   const data = await response.json();
//   if (!response.ok || !data.id_token) {
//     throw new Error(data.statusMessage || data.errorMessage || 'Unable to authenticate with bKash');
//   }
//   return data.id_token;
// };

// const completeBkashOrder = async (order, transactionId) => {
//   if (order.paymentStatus === 'paid') return;

//   order.paymentStatus = 'paid';
//   order.paidAt = new Date();
//   order.bKashTransactionId = transactionId || order.bKashTransactionId;
//   await order.save();

//   if (order.constructor.modelName === 'Order') {
//     const artwork = await Artwork.findById(order.artworkId);
//     if (artwork) {
//       artwork.status = 'sold';
//       await artwork.save();
//     }
//     await Notification.create({
//       userId: order.winnerId,
//       title: 'Payment Successful!',
//       message: `Your auction payment of $${order.finalAmount} has been confirmed.`,
//       type: 'payment_success'
//     });
//   } else {
//     for (const item of order.items) {
//       const artwork = await Artwork.findById(item.artworkId);
//       if (artwork) {
//         artwork.soldQuantity = (artwork.soldQuantity || 0) + item.quantity;
//         if (artwork.soldQuantity >= artwork.quantity) artwork.status = 'out_of_stock';
//         await artwork.save();
//       }
//     }
//     await Cart.findOneAndDelete({ userId: order.userId });
//     await Notification.create({
//       userId: order.userId,
//       title: 'Purchase Successful!',
//       message: `Your bKash payment of BDT ${order.totalAmount} has been confirmed.`,
//       type: 'payment_success'
//     });
//   }

//   getIO().emit('payment-completed', {
//     orderId: order._id,
//     type: order instanceof Order ? 'auction' : 'fixed_price',
//     paymentMethod: 'bkash'
//   });
// };





// export const createBkashPayment = async (req, res) => {
//   try {
//     const { orderId } = req.body;
//     let order = await Order.findById(orderId).populate('winnerId');
//     let orderType = 'auction';

//     if (!order) {
//       order = await FixedPriceOrder.findById(orderId);
//       orderType = 'fixed_price';
//     }

//     if (!order) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     const ownerId = orderType === 'auction' ? order.winnerId?._id : order.userId;
//     if (!ownerId || ownerId.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ error: 'Unauthorized' });
//     }

//     if (order.paymentStatus !== 'pending') {
//       return res.status(400).json({ error: 'Order already processed' });
//     }

//     const idToken = await getBkashToken();
//     const callbackUrl = process.env.BKASH_CALLBACK_URL ||
//       `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/bkash/callback`;
//     const amount = Number(orderType === 'auction' ? order.finalAmount : order.totalAmount);
//     const createResponse = await fetch(`${getBkashBaseUrl()}/tokenized/checkout/create`, {
//       method: 'POST',
//       headers: {
//         Authorization: idToken,
//         'X-App-Key': process.env.BKASH_APP_KEY,
//         'Content-Type': 'application/json',
//         Accept: 'application/json'
//       },
//       body: JSON.stringify({
//         mode: '0011',
//         payerReference: req.user._id.toString(),
//         callbackURL: callbackUrl,
//         amount: amount.toFixed(2),
//         currency: 'BDT',
//         intent: 'sale',
//         merchantInvoiceNumber: `CT-${order._id}`
//       })
//     });
//     const payment = await createResponse.json();
//     const paymentUrl = payment.bkashURL || payment.paymentURL || payment.paymentUrl;
//     if (!createResponse.ok || !payment.paymentID || !paymentUrl) {
//       throw new Error(payment.statusMessage || payment.errorMessage || 'Unable to create bKash payment');
//     }

//     order.bKashTransactionId = payment.paymentID;
//     order.paymentMethod = 'bkash';
//     await order.save();

//     res.json({
//       success: true,
//       paymentId: payment.paymentID,
//       paymentUrl,
//       orderType
//     });
//   } catch (error) {
//     console.error('bKash payment error:', error);
//     res.status(500).json({ error: error.message });
//   }
// };

// export const handleBkashCallback = async (req, res) => {
//   try {
//     const paymentId = req.query.paymentID || req.body.paymentID || req.body.paymentId;
//     const status = req.query.status || req.body.status;
//     const idToken = await getBkashToken();

//     let transactionId = req.query.trxID || req.body.trxID || null;
//     if (paymentId && status === 'success') {
//       const executeResponse = await fetch(`${getBkashBaseUrl()}/tokenized/checkout/execute`, {
//         method: 'POST',
//         headers: {
//           Authorization: idToken,
//           'X-App-Key': process.env.BKASH_APP_KEY,
//           'Content-Type': 'application/json',
//           Accept: 'application/json'
//         },
//         body: JSON.stringify({ paymentID: paymentId })
//       });
//       const execution = await executeResponse.json();
//       if (!executeResponse.ok || execution.transactionStatus !== 'Completed') {
//         throw new Error(execution.statusMessage || execution.errorMessage || 'bKash payment was not completed');
//       }
//       transactionId = execution.trxID || transactionId;

//       const auctionOrder = await Order.findOne({ bKashTransactionId: paymentId });
//       const fixedOrder = auctionOrder ? null : await FixedPriceOrder.findOne({ bKashTransactionId: paymentId });
//       const order = auctionOrder || fixedOrder;
//       if (order) {
//         await completeBkashOrder(order, transactionId || paymentId);
//       }
//     }

//     const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
//     if (status === 'success') {
//       return res.redirect(`${frontendUrl}/payment/success?type=bkash&payment_id=${encodeURIComponent(paymentId || '')}`);
//     }
//     return res.redirect(`${frontendUrl}/payment/cancel?type=bkash`);
//   } catch (error) {
//     console.error('bKash callback error:', error);
//     res.status(500).json({ error: error.message });
//   }
// };





// ============================================
// PAYMENT VERIFICATION FUNCTIONS
// ============================================
export const verifyPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('winnerId', 'fullName email')
      .populate('artworkId', 'title imageUrl')
      .populate('auctionId');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.winnerId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      order,
      isPaid: order.paymentStatus === 'paid'
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: error.message });
  }
};





export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    let order = null;

    if (orderId && /^[0-9a-fA-F]{24}$/.test(orderId)) {
      order = await Order.findById(orderId)
      .populate('winnerId', 'fullName email')
      .populate({
        path: 'auctionId',
        populate: [
          { path: 'artworkId', select: 'title imageUrl' },
          { path: 'artistId', select: 'fullName' }
        ]
      });
    }

    if (!order && orderId && /^[0-9a-fA-F]{24}$/.test(orderId)) {
      order = await Order.findOne({ auctionId: orderId })
        .populate('winnerId', 'fullName email')
        .populate({
          path: 'auctionId',
          populate: [
            { path: 'artworkId', select: 'title imageUrl' },
            { path: 'artistId', select: 'fullName' }
          ]
        });
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.winnerId._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      ...order.toObject(),
      orderId: order._id,
      paymentStatus: order.paymentStatus,
      paidAt: order.paidAt,
      amount: order.finalAmount
    });
  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({ error: error.message });
  }
};






export const getPaymentHistory = async (req, res) => {
  try {
    const orders = await Order.find({ winnerId: req.user._id })
      .populate('artworkId', 'title imageUrl')
      .populate('auctionId', 'status endTime')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ error: error.message });
  }
};


