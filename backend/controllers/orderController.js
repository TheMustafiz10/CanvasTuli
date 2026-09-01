


// backend/src/controllers/orderController.js
import Order from '../models/Order.js';
import FixedPriceOrder from '../models/FixedPriceOrder.js';




// Get Auction Order History
export const getAuctionOrderHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const orders = await Order.find({ winnerId: userId })
      .populate('artworkId', 'title imageUrl')
      .populate('artistId', 'fullName email')
      .populate('auctionId', '_id status endTime')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching auction order history:', error);
    res.status(500).json({ error: error.message });
  }
};




// Get Auction Order Details
export const getAuctionOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;
    
    const order = await Order.findOne({ _id: orderId, winnerId: userId })
      .populate('artworkId', 'title imageUrl medium dimensions')
      .populate('artistId', 'fullName email')
      .populate('auctionId', '_id status endTime startTime');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error fetching auction order details:', error);
    res.status(500).json({ error: error.message });
  }
};




// Get Direct Purchase History (Fixed Price)
export const getDirectPurchaseHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const orders = await FixedPriceOrder.find({ userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error fetching direct purchase history:', error);
    res.status(500).json({ error: error.message });
  }
};