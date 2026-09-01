


import Order from '../models/Order.js';
import FixedPriceOrder from '../models/FixedPriceOrder.js'; 
import Auction from '../models/Auction.js';
import Artwork from '../models/Artwork.js';
import Bid from '../models/Bid.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';




// ============================================
// USER DASHBOARD (Customer)
// ============================================

export const getUserDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's bids
    const userBids = await Bid.find({ bidderId: userId })
      .populate({
        path: 'auctionId',
        populate: {
          path: 'artworkId',
          select: 'title imageUrl'
        }
      })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get active bids
    const activeBids = await Bid.find({ 
      bidderId: userId 
    }).populate({
      path: 'auctionId',
      match: { status: 'live' }
    });

    // Get won auctions
    const wonAuctions = await Auction.find({
      winnerId: userId,
      status: { $in: ['ended', 'accepted'] }
    })
      .populate('artworkId', 'title imageUrl')
      .populate('artistId', 'fullName');

    // Get pending payments (won but not paid)
    const pendingPayments = await Order.find({
      winnerId: userId,
      paymentStatus: 'pending'
    }).populate('artworkId', 'title imageUrl');

    // Get notifications
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalBids: userBids.length,
        activeBids: activeBids.length,
        wonAuctions: wonAuctions.length,
        pendingPayments: pendingPayments.length
      },
      recentBids: userBids,
      wonAuctions,
      pendingPayments,
      notifications
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyBids = async (req, res) => {
  try {
    const userId = req.user._id;
    const { status } = req.query; // 'active', 'won', 'lost'

    let filter = { bidderId: userId };
    
    const bids = await Bid.find(filter)
      .populate({
        path: 'auctionId',
        populate: {
          path: 'artworkId',
          select: 'title imageUrl artistId'
        }
      })
      .sort({ createdAt: -1 });

    const auctionIds = bids.filter(bid => bid.auctionId).map(bid => bid.auctionId._id);
    const orders = await Order.find({ winnerId: userId, auctionId: { $in: auctionIds } })
      .select('auctionId paymentStatus _id paidAt');
    const orderByAuction = new Map(orders.map(order => [order.auctionId.toString(), order]));
    const bidsWithPayment = bids.map(bid => {
      const order = bid.auctionId ? orderByAuction.get(bid.auctionId._id.toString()) : null;
      return {
        ...bid.toObject(),
        paymentStatus: order?.paymentStatus || 'pending',
        orderId: order?._id || null,
        paidAt: order?.paidAt || null
      };
    });

    // Filter by status
    let filteredBids = bidsWithPayment;
    if (status === 'active') {
      filteredBids = bids.filter(bid => 
        bid.auctionId && bid.auctionId.status === 'live'
      );
    } else if (status === 'won') {
      filteredBids = bids.filter(bid => 
        bid.auctionId && 
        bid.auctionId.status === 'ended' &&
        bid.auctionId.winnerId &&
        bid.auctionId.winnerId.toString() === userId.toString()
      );
    } else if (status === 'lost') {
      filteredBids = bids.filter(bid => 
        bid.auctionId && 
        bid.auctionId.status === 'ended' &&
        (!bid.auctionId.winnerId || 
         bid.auctionId.winnerId.toString() !== userId.toString())
      );
    }

    res.json({
      success: true,
      count: filteredBids.length,
      bids: filteredBids
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getWonAuctions = async (req, res) => {
  try {
    const userId = req.user._id;

    const wonAuctions = await Auction.find({
      winnerId: userId,
      status: { $in: ['ended', 'accepted'] }
    })
      .populate('artworkId', 'title imageUrl description')
      .populate('artistId', 'fullName')
      .sort({ endTime: -1 });

    // Get payment status for each
    const auctionsWithPayment = await Promise.all(
      wonAuctions.map(async (auction) => {
        let order = await Order.findOne({
          auctionId: auction._id,
          winnerId: userId
        });

        if (!order && auction.winningBid != null && auction.artworkId?._id) {
          const amount = Number(auction.winningBid);
          const platformFee = Math.round(amount * 0.05 * 100) / 100;
          order = await Order.create({
            auctionId: auction._id,
            winnerId: userId,
            artworkId: auction.artworkId._id,
            amount,
            finalAmount: amount,
            platformFee,
            artistAmount: amount - platformFee,
            paymentStatus: 'pending'
          });
        }

        return {
          ...auction.toObject(),
          paymentStatus: order ? order.paymentStatus : 'pending',
          orderId: order ? order._id : null
        };
      })
    );

    res.json({
      success: true,
      count: auctionsWithPayment.length,
      auctions: auctionsWithPayment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20, unreadOnly = false } = req.query;

    const filter = { userId };
    if (unreadOnly === 'true') {
      filter.isRead = false;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: notifications.length,
      unreadCount: await Notification.countDocuments({ userId, isRead: false }),
      notifications
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findOne({
      _id: id,
      userId
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// ARTIST DASHBOARD
// ============================================

export const getArtistDashboard = async (req, res) => {
  try {
    const artistId = req.user._id;

    // Get artist's artworks
    const artworks = await Artwork.find({ artistId });
    const totalArtworks = artworks.length;
    const soldArtworks = artworks.filter(a => a.status === 'sold').length;

    // Get artist's auctions
    const auctions = await Auction.find({ artistId });
    const liveAuctions = auctions.filter(a => a.status === 'live').length;
    const endedAuctions = auctions.filter(a => a.status === 'ended').length;
    const totalAuctions = auctions.length;

    // Get total earnings from sold artworks
    const soldOrders = await Order.find({ paymentStatus: 'paid' })
      .populate({
        path: 'auctionId',
        match: { artistId }
      });

    const auctionEarnings = soldOrders
      .filter(order => order.auctionId)
      .reduce((sum, order) => sum + (order.artistAmount || order.finalAmount), 0);

    const fixedOrders = await FixedPriceOrder.find({ paymentStatus: 'paid' })
      .populate('items.artworkId', 'title artistId');
    const fixedEarnings = fixedOrders.reduce((sum, order) => sum + order.items
      .filter(item => (item.artistId || item.artworkId?.artistId)?.toString() === artistId.toString())
      .reduce((itemSum, item) => itemSum + (item.price * item.quantity * 0.95), 0), 0);

    // Get recent sales
    const recentSales = await Order.find({})
      .populate({
        path: 'auctionId',
        match: { artistId },
        populate: {
          path: 'artworkId',
          select: 'title imageUrl'
        }
      })
      .sort({ createdAt: -1 })
      .limit(5);

    // Filter out null auctions
    const filteredSales = recentSales.filter(order => order.auctionId);

    // Get active bidders count
    const activeBidders = await Bid.distinct('bidderId', {
      auctionId: { $in: auctions.filter(a => a.status === 'live').map(a => a._id) }
    });

    res.json({
      success: true,
      stats: {
        totalArtworks,
        soldArtworks,
        totalAuctions,
        liveAuctions,
        endedAuctions,
        earnings: auctionEarnings + fixedEarnings,
        activeBidders: activeBidders.length
      },
      recentSales: filteredSales
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSalesAnalytics = async (req, res) => {
  try {
    const artistId = req.user._id;

    // Get all auctions by artist
    const auctions = await Auction.find({ artistId, status: 'ended' });

    // Get all orders for these auctions
    const orders = await Order.find({
      auctionId: { $in: auctions.map(a => a._id) },
      paymentStatus: 'paid'
    }).populate('artworkId', 'title imageUrl');

    // Calculate total sales
    const totalSales = orders.reduce((sum, order) => sum + order.finalAmount, 0);

    // Monthly sales
    const monthlySales = {};
    orders.forEach(order => {
      const month = order.paidAt ? new Date(order.paidAt).toISOString().slice(0, 7) : 'unknown';
      monthlySales[month] = (monthlySales[month] || 0) + order.finalAmount;
    });

    // Top selling artworks
    const artworkSales = {};
    orders.forEach(order => {
      const key = order.artworkId.toString();
      artworkSales[key] = (artworkSales[key] || 0) + 1;
    });

    const topArtworks = Object.entries(artworkSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    res.json({
      success: true,
      analytics: {
        totalSales,
        totalOrders: orders.length,
        monthlySales,
        topArtworks,
        averageOrderValue: orders.length > 0 ? totalSales / orders.length : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getArtistEarnings = async (req, res) => {
  try {
    const artistId = req.user._id;

    // Get all orders for artist's auctions
    const auctions = await Auction.find({ artistId });
    const orders = await Order.find({
      auctionId: { $in: auctions.map(a => a._id) },
      paymentStatus: 'paid'
    }).populate('artworkId', 'title imageUrl');

    const fixedOrders = await FixedPriceOrder.find({ paymentStatus: 'paid' })
      .populate('items.artworkId', 'title artistId')
      .sort({ paidAt: -1 });

    const history = orders.map(order => ({
      id: order._id,
      type: 'auction',
      amount: order.finalAmount,
      platformFee: order.platformFee || 0,
      earnings: order.artistAmount || (order.finalAmount - (order.platformFee || 0)),
      paymentStatus: order.paymentStatus,
      paidAt: order.paidAt,
      artworkId: order.artworkId
    }));

    fixedOrders.forEach(order => order.items
      .filter(item => (item.artistId || item.artworkId?.artistId)?.toString() === artistId.toString())
      .forEach(item => {
        const amount = item.price * item.quantity;
        const platformFee = amount * 0.05;
        history.push({
          id: `${order._id}-${item._id}`,
          type: 'fixed_price',
          amount,
          platformFee,
          earnings: amount - platformFee,
          paymentStatus: order.paymentStatus,
          paidAt: order.paidAt,
          artworkId: item.artworkId,
          title: item.title,
          quantity: item.quantity
        });
      }));

    history.sort((first, second) => new Date(second.paidAt || 0) - new Date(first.paidAt || 0));

    const totalEarnings = history.reduce((sum, sale) => sum + sale.amount, 0);

    // Platform commission (example: 10%)
    const commissionRate = 0.10;
    const platformCommission = history.reduce((sum, sale) => sum + sale.platformFee, 0);
    const netEarnings = history.reduce((sum, sale) => sum + sale.earnings, 0);

    res.json({
      success: true,
      earnings: {
        totalEarnings,
        platformCommission,
        netEarnings,
        commissionRate: commissionRate * 100 + '%',
        paidOrders: history.length,
        history,
        totalSales: totalEarnings,
        fixedPaidOrders: fixedOrders.length,
        pendingOrders: await Order.countDocuments({
          auctionId: { $in: auctions.map(a => a._id) },
          paymentStatus: 'pending'
        })
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================
// ADMIN DASHBOARD
// ============================================

export const getAdminDashboard = async (req, res) => {
  try {
    // User stats
    const totalUsers = await User.countDocuments();
    const totalArtists = await User.countDocuments({ role: 'artist' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    // Artwork stats
    const directSaleFilter = {
      $or: [
        { isFixedPrice: true },
        { fixedPrice: { $gt: 0 } }
      ]
    };
    const totalArtworks = await Artwork.countDocuments(directSaleFilter);
    const pendingArtworks = await Artwork.countDocuments({ ...directSaleFilter, status: 'pending' });
    const approvedArtworks = await Artwork.countDocuments({ ...directSaleFilter, status: 'approved' });
    const soldArtworks = await Artwork.countDocuments({
      ...directSaleFilter,
      soldQuantity: { $gt: 0 }
    });

    // Auction stats
    const totalAuctions = await Auction.countDocuments();
    const liveAuctions = await Auction.countDocuments({ status: 'live' });
    const endedAuctions = await Auction.countDocuments({ status: 'ended' });
    const scheduledAuctions = await Auction.countDocuments({ status: 'scheduled' });
    const acceptedAuctions = await Auction.countDocuments({ status: 'accepted' });
    const cancelledAuctions = await Auction.countDocuments({ status: 'cancelled' });

    // Order stats
    const [auctionOrderStats, fixedOrderStats] = await Promise.all([
      Order.aggregate([
        { $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] } },
          paid: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] } },
          revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$finalAmount', 0] } },
          fees: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$platformFee', 0] } }
        } }
      ]),
      FixedPriceOrder.aggregate([
        { $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] } },
          paid: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] } },
          revenue: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$totalAmount', 0] } },
          fees: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$platformFee', 0] } }
        } }
      ])
    ]);

    const auctionStats = auctionOrderStats[0] || { total: 0, pending: 0, paid: 0, revenue: 0, fees: 0 };
    const fixedStats = fixedOrderStats[0] || { total: 0, pending: 0, paid: 0, revenue: 0, fees: 0 };
    const totalOrders = auctionStats.total + fixedStats.total;
    const pendingPayments = auctionStats.pending + fixedStats.pending;
    const completedPayments = auctionStats.paid + fixedStats.paid;
    const totalRevenue = Number(auctionStats.revenue || 0) + Number(fixedStats.revenue || 0);
    const platformFeeRevenue = Number(auctionStats.fees || 0);
    const fixedPriceRevenue = Number(fixedStats.revenue || 0);
    const fixedPriceFees = Number(fixedStats.fees || 0);
    const auctionArtworksSold = auctionStats.paid;

    const paidAuctionOrders = await Order.find({ paymentStatus: 'paid' }).select('finalAmount platformFee paidAt createdAt');
    const paidFixedOrders = await FixedPriceOrder.find({ paymentStatus: 'paid' }).select('totalAmount platformFee paidAt createdAt');
    const dailyRevenue = new Map();
    [...paidAuctionOrders.map(order => ({
      amount: order.finalAmount,
      platformFee: order.platformFee,
      date: order.paidAt || order.createdAt
    })), ...paidFixedOrders.map(order => ({
      amount: order.totalAmount,
      platformFee: order.platformFee,
      date: order.paidAt || order.createdAt
    }))].forEach(payment => {
      const date = new Date(payment.date).toISOString().slice(0, 10);
      const current = dailyRevenue.get(date) || { date, amount: 0, platformFee: 0 };
      current.amount += Number(payment.amount || 0);
      current.platformFee += Number(payment.platformFee || 0);
      dailyRevenue.set(date, current);
    });

    const earnings = {
      daily: [...dailyRevenue.values()].sort((first, second) => first.date.localeCompare(second.date)),
      totalEarnings: totalRevenue,
      totalPlatformFees: platformFeeRevenue + fixedPriceFees
    };

    // Recent activity
    const recentAuctionOrders = await Order.find()
      .populate('winnerId', 'fullName email')
      .populate('artworkId', 'title')
      .sort({ createdAt: -1 })
      .limit(5);
    const recentFixedOrders = await FixedPriceOrder.find()
      .sort({ createdAt: -1 })
      .limit(5);
    const recentOrders = [...recentAuctionOrders, ...recentFixedOrders]
      .map(order => ({
        ...order.toObject(),
        finalAmount: order.finalAmount ?? order.totalAmount
      }))
      .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
      .slice(0, 5);

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5);

    const recentAuctions = await Auction.find()
      .populate('artworkId', 'title')
      .populate('artistId', 'fullName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          artists: totalArtists,
          customers: totalCustomers,
          newToday: newUsersToday
        },
        artworks: {
          total: totalArtworks,
          directSale: totalArtworks,
          pending: pendingArtworks,
          approved: approvedArtworks,
          sold: soldArtworks,
          auctionSold: auctionArtworksSold
        },
        auctions: {
          total: totalAuctions,
          live: liveAuctions,
          ended: endedAuctions,
          scheduled: scheduledAuctions,
          accepted: acceptedAuctions,
          cancelled: cancelledAuctions
        },
        orders: {
          total: totalOrders,
          pendingPayments,
          completedPayments,
          totalRevenue,
          platformFeeRevenue,
          artistEarnings: totalRevenue - platformFeeRevenue - fixedPriceFees
        },
        fixedPrice: {
          total: fixedStats.total,
          sold: fixedStats.paid,
          revenue: fixedPriceRevenue,
          platformFee: fixedPriceFees
        },
        auctionFees: {
          total: auctionStats.total,
          pending: auctionStats.pending,
          collected: platformFeeRevenue
        }
      },
      earnings,
      recentActivity: {
        orders: recentOrders,
        users: recentUsers,
        auctions: recentAuctions
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




export const getRecentOrders = async (req, res) => {
  try {
    const { limit = 20, status } = req.query;

    const filter = {};
    if (status) filter.paymentStatus = status;

    const orders = await Order.find(filter)
      .populate('winnerId', 'fullName email')
      .populate('artworkId', 'title imageUrl')
      .populate('auctionId', 'status endTime')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const { role, isVerified } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isVerified !== undefined) filter.isVerified = isVerified === 'true';

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user status (Admin)
export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isVerified, role } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (isVerified !== undefined) user.isVerified = isVerified;
    if (role) user.role = role;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};















export const getPendingPayments = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get pending payments from auction orders
    const pendingAuctionOrders = await Order.find({
      winnerId: userId,
      paymentStatus: 'pending'
    }).populate('artworkId', 'title imageUrl');

    // Get pending payments from fixed price orders
    const pendingFixedOrders = await FixedPriceOrder.find({
      userId: userId,
      paymentStatus: 'pending'
    }).populate('items.artworkId', 'title imageUrl');

    res.json({
      success: true,
      auctionOrders: pendingAuctionOrders,
      fixedOrders: pendingFixedOrders,
      total: pendingAuctionOrders.length + pendingFixedOrders.length
    });
  } catch (error) {
    console.error('Error fetching pending payments:', error);
    res.status(500).json({ error: error.message });
  }
};