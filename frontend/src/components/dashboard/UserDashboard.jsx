







import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import fallbackArtworkImage from '../../assets/hero.png';
import { 
  Heart, 
  ShoppingBag, 
  Award, 
  Clock, 
  DollarSign,
  Eye,
  LogOut,
  Settings,
  Bell,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShoppingCart,
  Package,
  CreditCard
} from 'lucide-react';
import './CSS/UserDashboard.css';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBids: 0,
    activeBids: 0,
    wonAuctions: 0,
    pendingPayments: 0,
    cartItems: 0,
    purchases: 0
  });
  const [recentBids, setRecentBids] = useState([]);
  const [wonAuctions, setWonAuctions] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!socket) return undefined;

    const refreshDashboard = () => {
      fetchUserData();
    };

    socket.on('bid-accepted', refreshDashboard);
    socket.on('auction-status-changed', refreshDashboard);
    socket.on('payment-completed', refreshDashboard);
    socket.on('fixed-price-payment-completed', refreshDashboard);

    return () => {
      socket.off('bid-accepted', refreshDashboard);
      socket.off('auction-status-changed', refreshDashboard);
      socket.off('payment-completed', refreshDashboard);
      socket.off('fixed-price-payment-completed', refreshDashboard);
    };
  }, [socket]);

  const fetchUserData = async () => {
    try {
      // ✅ Use Promise.allSettled to handle individual failures
      const results = await Promise.allSettled([
        api.get('/dashboard/user'),
        api.get('/dashboard/user/bids'),
        api.get('/dashboard/user/won'),
        api.get('/dashboard/user/pending-payments'),
        api.get('/dashboard/user/notifications'),
        api.get('/cart'),
        api.get('/orders/fixed/history'),
        api.get('/payments/history')
      ]);

      // ✅ Dashboard
      if (results[0].status === 'fulfilled') {
        const data = results[0].value.data;
        setStats(prev => ({
          ...prev,
          totalBids: data.stats?.totalBids || 0,
          activeBids: data.stats?.activeBids || 0,
          wonAuctions: data.stats?.wonAuctions || 0,
          pendingPayments: data.stats?.pendingPayments || 0
        }));
        setRecentBids(data.recentBids || []);
      }

      // ✅ Bids
      if (results[1].status === 'fulfilled') {
        // Handle bids data
        setRecentBids(results[1].value.data.bids || []);
      }

      // ✅ Won Auctions
      if (results[2].status === 'fulfilled') {
        setWonAuctions(results[2].value.data.auctions || []);
      }

      // ✅ Pending Payments
      if (results[3].status === 'fulfilled') {
        setPendingPayments(results[3].value.data.auctionOrders || []);
      }

      // ✅ Notifications
      if (results[4].status === 'fulfilled') {
        setNotifications(results[4].value.data.notifications || []);
      }

      // ✅ Cart
      if (results[5].status === 'fulfilled') {
        const cartData = results[5].value.data;
        setCartItems(cartData.cart?.items || []);
        setStats(prev => ({
          ...prev,
          cartItems: cartData.cart?.items?.length || 0
        }));
      }

      // ✅ Purchases (Fixed Price Orders)
      if (results[6].status === 'fulfilled') {
        const purchasesData = results[6].value.data;
        const fixedPurchases = purchasesData.orders || [];
        const auctionPurchases = results[7].status === 'fulfilled'
          ? (Array.isArray(results[7].value.data) ? results[7].value.data : results[7].value.data.orders || [])
          : [];
        const normalizedAuctionPurchases = auctionPurchases.map(order => ({
          ...order,
          totalAmount: order.finalAmount,
          items: [{
            title: order.artworkId?.title || 'Auction artwork',
            artworkId: order.artworkId,
            quantity: 1,
            price: order.finalAmount,
            subtotal: order.finalAmount
          }]
        }));
        const allPurchases = [...fixedPurchases, ...normalizedAuctionPurchases]
          .sort((first, second) => {
            const paidOrder = Number(second.paymentStatus === 'paid') - Number(first.paymentStatus === 'paid');
            if (paidOrder !== 0) return paidOrder;
            return new Date(second.paidAt || second.createdAt) - new Date(first.paidAt || first.createdAt);
          });
        setPurchases(allPurchases);
        setStats(prev => ({
          ...prev,
          purchases: allPurchases.length
        }));
      } else if (results[7].status === 'fulfilled') {
        const auctionPurchases = Array.isArray(results[7].value.data)
          ? results[7].value.data
          : results[7].value.data.orders || [];
        setPurchases(auctionPurchases.map(order => ({
          ...order,
          totalAmount: order.finalAmount,
          items: [{
            title: order.artworkId?.title || 'Auction artwork',
            artworkId: order.artworkId,
            quantity: 1,
            price: order.finalAmount,
            subtotal: order.finalAmount
          }]
        })));
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      live: { icon: <Clock size={14} />, class: 'badge-live', text: '🔴 Live' },
      ended: { icon: <CheckCircle size={14} />, class: 'badge-ended', text: '✅ Ended' },
      pending: { icon: <AlertCircle size={14} />, class: 'badge-pending', text: '⏳ Pending' },
      paid: { icon: <CheckCircle size={14} />, class: 'badge-paid', text: '✅ Paid' },
      accepted: { icon: <CheckCircle size={14} />, class: 'badge-accepted', text: '✅ Accepted' },
      cancelled: { icon: <XCircle size={14} />, class: 'badge-cancelled', text: '❌ Cancelled' }
    };
    return badges[status] || { icon: null, class: 'badge-default', text: status };
  };

  const handleExplore = () => {
    navigate('/bidding');
  };

  const handleViewCart = () => {
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="user-dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="user-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>👋 Welcome back, {user?.fullName}</h1>
          <p>Track your bids, won auctions, and payments</p>
        </div>
        <div className="header-right">
          <button className="btn-notifications" onClick={() => setActiveTab('notifications')}>
            <Bell size={20} />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="notification-dot">{notifications.filter(n => !n.isRead).length}</span>
            )}
          </button>
          <button className="btn-settings">
            <Settings size={20} />
          </button>
          <button className="btn-logout" onClick={logout}>
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card" onClick={handleExplore} style={{ cursor: 'pointer' }}>
          <div className="stat-icon blue">
            <ShoppingBag size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalBids}</span>
            <span className="stat-label">Total Bids</span>
          </div>
        </div>
        <div className="stat-card" onClick={handleExplore} style={{ cursor: 'pointer' }}>
          <div className="stat-icon green">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.activeBids}</span>
            <span className="stat-label">Active Bids</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('won')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon purple">
            <Award size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.wonAuctions}</span>
            <span className="stat-label">Won Auctions</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('payments')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon orange">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.pendingPayments}</span>
            <span className="stat-label">Pending Payments</span>
          </div>
        </div>
        <div className="stat-card" onClick={handleViewCart} style={{ cursor: 'pointer' }}>
          <div className="stat-icon teal">
            <ShoppingCart size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.cartItems}</span>
            <span className="stat-label">Cart Items</span>
          </div>
        </div>
        <div className="stat-card" onClick={() => setActiveTab('purchases')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon pink">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.purchases}</span>
            <span className="stat-label">My Purchases</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'bids' ? 'active' : ''}`}
          onClick={() => setActiveTab('bids')}
        >
          My Bids
        </button>
        <button 
          className={`tab-btn ${activeTab === 'won' ? 'active' : ''}`}
          onClick={() => setActiveTab('won')}
        >
          Won Auctions
        </button>
        <button 
          className={`tab-btn ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          Payments
        </button>
        <button 
          className={`tab-btn ${activeTab === 'cart' ? 'active' : ''}`}
          onClick={() => setActiveTab('cart')}
        >
          <ShoppingCart size={16} />
          My Cart
          {stats.cartItems > 0 && <span className="tab-badge">{stats.cartItems}</span>}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'purchases' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchases')}
        >
          <Package size={16} />
          My Purchases
        </button>
        <button 
          className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={16} />
          Notifications
          {notifications.filter(n => !n.isRead).length > 0 && (
            <span className="tab-badge">{notifications.filter(n => !n.isRead).length}</span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="overview-grid">
              <div className="recent-bids">
                <h3>Recent Bids</h3>
                {recentBids.length === 0 ? (
                  <p className="no-data">You haven't placed any bids yet</p>
                ) : (
                  <div className="bid-list">
                    {recentBids.slice(0, 5).map((bid, index) => (
                      <div key={index} className="bid-item">
                        <img src={bid.auctionId?.artworkId?.imageUrl || 'https://via.placeholder.com/50'} alt="Artwork" />
                        <div className="bid-info">
                          <h4>{bid.auctionId?.artworkId?.title || 'Untitled'}</h4>
                          <p>${bid.amount?.toLocaleString()}</p>
                        </div>
                        <span className={`bid-status ${bid.auctionId?.status === 'live' ? 'active' : 'ended'}`}>
                          {bid.auctionId?.status === 'live' ? 'Active' : 'Ended'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <button className="btn-view-all" onClick={handleExplore}>
                  Explore Auctions
                </button>
              </div>

              <div className="notifications-panel">
                <h3>Notifications</h3>
                {notifications.length === 0 ? (
                  <p className="no-data">No notifications</p>
                ) : (
                  <div className="notification-list">
                    {notifications.slice(0, 5).map((notif, index) => (
                      <div key={index} className={`notification-item ${!notif.isRead ? 'unread' : ''}`}>
                        <div className="notification-icon">
                          {notif.type === 'won' && <Award size={16} />}
                          {notif.type === 'outbid' && <AlertCircle size={16} />}
                          {notif.type === 'system' && <Bell size={16} />}
                        </div>
                        <div className="notification-content">
                          <p>{notif.message}</p>
                          <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bids' && (
          <div className="bids-content">
            {recentBids.length === 0 ? (
              <div className="empty-state">
                <ShoppingBag size={48} />
                <h3>No Bids Placed</h3>
                <p>Start exploring auctions and place your first bid</p>
                <button className="btn-explore" onClick={handleExplore}>Explore Auctions</button>
              </div>
            ) : (
              <div className="bids-table-container">
                <table className="bids-table">
                  <thead>
                    <tr>
                      <th>Artwork</th>
                      <th>Your Bid</th>
                      <th>Current Highest</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBids.map((bid, index) => (
                      <tr key={index}>
                        <td>
                          <div className="bid-artwork">
                            <img src={bid.auctionId?.artworkId?.imageUrl || 'https://via.placeholder.com/40'} alt="" />
                            <span>{bid.auctionId?.artworkId?.title || 'Untitled'}</span>
                          </div>
                        </td>
                        <td>${bid.amount?.toLocaleString()}</td>
                        <td>${bid.auctionId?.currentHighestBid?.toLocaleString() || 'N/A'}</td>
                        <td>
                          <span className={`status-badge ${bid.paymentStatus === 'paid' ? 'paid' : (bid.auctionId?.status === 'live' ? 'live' : 'ended')}`}>
                            {bid.paymentStatus === 'paid' ? 'Paid' : (bid.auctionId?.status === 'live' ? 'Active' : 'Ended')}
                          </span>
                        </td>
                        <td>
                          {bid.paymentStatus === 'paid' ? (
                            <button className="btn-view-bid" disabled>Paid</button>
                          ) : bid.auctionId?.status === 'live' && (
                            <button className="btn-view-bid" onClick={() => navigate(`/auction/${bid.auctionId._id}`)}>
                              View Auction
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'won' && (
          <div className="won-content">
            {wonAuctions.length === 0 ? (
              <div className="empty-state">
                <Award size={48} />
                <h3>No Won Auctions</h3>
                <p>You haven't won any auctions yet. Keep bidding!</p>
                <button className="btn-explore" onClick={handleExplore}>Explore Auctions</button>
              </div>
            ) : (
              <div className="won-grid">
                {wonAuctions.map((auction, index) => {
                  const paymentStatus = auction.paymentStatus || 'pending';
                  return (
                    <div key={index} className="won-card">
                      <img src={auction.artworkId?.imageUrl || 'https://via.placeholder.com/300'} alt="" />
                      <div className="won-card-content">
                        <h4>{auction.artworkId?.title || 'Untitled'}</h4>
                        <p className="won-artist">by {auction.artistId?.fullName || 'Unknown'}</p>
                        <div className="won-price">${auction.winningBid?.toLocaleString()}</div>
                        <div className={`badge ${paymentStatus === 'paid' ? 'badge-paid' : 'badge-pending'}`}>
                          {paymentStatus === 'paid' ? 'Paid' : '⏳ Pending Payment'}
                        </div>
                        {paymentStatus === 'paid' ? (
                          <button className="btn-pay-now" disabled>Paid</button>
                        ) : paymentStatus === 'pending' && (
                          <button className="btn-pay-now" onClick={() => navigate(`/payment/${auction.orderId || auction._id}`)}>
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}


        {activeTab === 'payments' && (
          <div className="payments-content">
            {pendingPayments.length === 0 && wonAuctions.length === 0 ? (
              <div className="empty-state">
                <DollarSign size={48} />
                <h3>No Payment History</h3>
                <p>Your payment history will appear here</p>
              </div>
            ) : (
              <table className="payments-table">
                <thead>
                  <tr>
                    <th>Artwork</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {wonAuctions.map((auction, index) => (
                    <tr key={index}>
                      <td>{auction.artworkId?.title || 'Untitled'}</td>
                      <td>${auction.winningBid?.toLocaleString()}</td>
                      <td>{new Date(auction.endTime).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${auction.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
                          {auction.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                        </span>
                      </td>
                      <td>
                        {auction.paymentStatus === 'paid' ? (
                          <button className="btn-pay-now" disabled>Paid</button>
                        ) : (
                          <button className="btn-pay-now" onClick={() => navigate(`/payment/${auction.orderId || auction._id}`)}>
                            Pay Now
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="cart-tab-content">
            {cartItems.length === 0 ? (
              <div className="empty-state">
                <ShoppingCart size={48} />
                <h3>Your cart is empty</h3>
                <p>Browse our collection and add some amazing artworks!</p>
                <button className="btn-explore" onClick={() => navigate('/collections')}>
                  Browse Artworks
                </button>
              </div>
            ) : (
              <div className="cart-items-grid">
                {cartItems.map((item) => (
                  <div key={item._id} className="cart-item-card">
                    <img src={item.imageUrl || 'https://via.placeholder.com/100'} alt={item.title} />
                    <div className="cart-item-info">
                      <h4>{item.title}</h4>
                      <p>Price: ${item.price}</p>
                      <p>Quantity: {item.quantity}</p>
                      <p>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <button className="btn-view-cart" onClick={handleViewCart}>
                      View Cart
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'purchases' && (
          <div className="purchases-tab-content">
            {purchases.length === 0 ? (
              <div className="empty-state">
                <Package size={48} />
                <h3>No purchases yet</h3>
                <p>Your purchased artworks will appear here</p>
                <button className="btn-explore" onClick={() => navigate('/collections')}>
                  Browse Artworks
                </button>
              </div>
            ) : (
              <div className="purchases-grid">
                {purchases.map((order) => (
                  <div key={order._id} className="purchase-card">
                    <div className="purchase-header">
                      <span className="order-id">Order #{order._id.slice(-8)}</span>
                      <span className={`purchase-status ${order.paymentStatus}`}>
                        {order.paymentStatus === 'paid' ? '✅ Paid' : '⏳ Pending'}
                      </span>
                    </div>
                    <div className="purchase-items">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="purchase-item">
                          <img src={item.artwork?.imageUrl || item.artworkId?.imageUrl || fallbackArtworkImage} alt={item.title} />
                          <div className="purchase-item-info">
                            <h4>{item.title}</h4>
                            <p>Qty: {item.quantity} × ${(item.price ?? 0).toFixed(2)} = ${(item.subtotal ?? 0).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="purchase-footer">
                      <span>Total: ${(order.totalAmount ?? order.finalAmount ?? 0).toFixed(2)}</span>
                      <span>Paid: {order.paidAt ? new Date(order.paidAt).toLocaleDateString() : 'N/A'}</span>
                      <span>Method: {order.paymentMethod || 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="notifications-full">
            {notifications.length === 0 ? (
              <div className="empty-state">
                <Bell size={48} />
                <h3>No notifications</h3>
                <p>You're all caught up!</p>
              </div>
            ) : (
              <div className="notification-list-full">
                {notifications.map((notif, index) => (
                  <div key={index} className={`notification-item-full ${!notif.isRead ? 'unread' : ''}`}>
                    <div className="notification-icon">
                      {notif.type === 'won' && <Award size={20} />}
                      {notif.type === 'outbid' && <AlertCircle size={20} />}
                      {notif.type === 'system' && <Bell size={20} />}
                    </div>
                    <div className="notification-content-full">
                      <p>{notif.message}</p>
                      <span>{new Date(notif.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;



