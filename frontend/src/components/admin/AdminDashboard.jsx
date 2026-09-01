


// // src/components/admin/AdminDashboard.jsx

// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import api from '../../services/api';
// import { Gavel } from 'lucide-react'; 
// import { 
//   Users, 
//   Palette, 
//   DollarSign, 
//   TrendingUp, 
//   ShoppingBag, 
//   Award,
//   Clock,
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   BarChart3,
//   Package,
//   CreditCard,
//   ArrowUp,
//   ArrowDown,
//   Eye,
//   Settings,
//   LogOut,
//   Calendar,
//   FileText,
//   UserCheck,
//   UserX,
//   Activity
// } from 'lucide-react';
// import './CSS/AdminDashboard.css';

// const AdminDashboard = () => {
//   const { user, logout } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [stats, setStats] = useState({
//     users: {
//       total: 0,
//       artists: 0,
//       customers: 0,
//       newToday: 0
//     },
//     artworks: {
//       total: 0,
//       pending: 0,
//       approved: 0,
//       sold: 0,
//       outOfStock: 0
//     },
//     auctions: {
//       total: 0,
//       live: 0,
//       ended: 0,
//       scheduled: 0,
//       cancelled: 0,
//       accepted: 0
//     },
//     orders: {
//       total: 0,
//       pendingPayments: 0,
//       completedPayments: 0,
//       totalRevenue: 0,
//       platformFeeRevenue: 0,
//       artistEarnings: 0
//     },
//     fixedPrice: {
//       total: 0,
//       sold: 0,
//       revenue: 0,
//       platformFee: 0
//     }
//   });
  
//   const [recentActivity, setRecentActivity] = useState({
//     orders: [],
//     users: [],
//     auctions: []
//   });
  
//   const [earningsData, setEarningsData] = useState({
//     daily: [],
//     weekly: [],
//     monthly: [],
//     totalEarnings: 0
//   });

//   const [timeRange, setTimeRange] = useState('weekly');

//   useEffect(() => {
//     fetchAdminData();
//   }, []);

//   const fetchAdminData = async () => {
//     try {
//       const response = await api.get('/dashboard/admin');
      
//       setStats(response.data.stats);
//       setRecentActivity(response.data.recentActivity);
//       setEarningsData(response.data.earnings || earningsData);
      
//     } catch (error) {
//       console.error('Error fetching admin data:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount);
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       live: '#27ae60',
//       ended: '#3498db',
//       scheduled: '#f39c12',
//       cancelled: '#e74c3c',
//       accepted: '#2ecc71',
//       pending: '#f39c12',
//       paid: '#27ae60',
//       completed: '#27ae60',
//       approved: '#27ae60',
//       rejected: '#e74c3c',
//       sold: '#2980b9',
//       out_of_stock: '#e74c3c'
//     };
//     return colors[status] || '#95a5a6';
//   };

//   const getStatusIcon = (status) => {
//     const icons = {
//       live: <Activity size={14} />,
//       ended: <CheckCircle size={14} />,
//       scheduled: <Clock size={14} />,
//       cancelled: <XCircle size={14} />,
//       accepted: <CheckCircle size={14} />,
//       pending: <AlertCircle size={14} />,
//       paid: <CheckCircle size={14} />,
//       approved: <CheckCircle size={14} />,
//       rejected: <XCircle size={14} />
//     };
//     return icons[status] || <AlertCircle size={14} />;
//   };

//   if (loading) {
//     return (
//       <div className="admin-loading">
//         <div className="spinner"></div>
//         <p>Loading dashboard...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="admin-dashboard">
//       {/* Header */}
//       <div className="admin-header">
//         <div className="admin-header-left">
//           <h1>Admin Dashboard</h1>
//           <p>Welcome back, {user?.fullName}</p>
//         </div>
//         <div className="admin-header-right">
//           <span className="admin-badge">🔒 Admin</span>
//           <button className="btn-settings" onClick={() => {}}>
//             <Settings size={20} />
//           </button>
//           <button className="btn-logout" onClick={logout}>
//             <LogOut size={20} />
//           </button>
//         </div>
//       </div>

//       {/* Stats Grid */}
//       <div className="stats-grid">
//         <div className="stat-card">
//           <div className="stat-icon blue">
//             <Users size={24} />
//           </div>
//           <div className="stat-info">
//             <span className="stat-value">{stats.users.total}</span>
//             <span className="stat-label">Total Users</span>
//           </div>
//           <div className="stat-change positive">
//             <ArrowUp size={14} />
//             {stats.users.newToday} new today
//           </div>
//         </div>

//         <div className="stat-card">
//           <div className="stat-icon purple">
//             <Users size={24} />
//           </div>
//           <div className="stat-info">
//             <span className="stat-value">{stats.users.artists}</span>
//             <span className="stat-label">Artists</span>
//           </div>
//         </div>

//         <div className="stat-card">
//           <div className="stat-icon green">
//             <Palette size={24} />
//           </div>
//           <div className="stat-info">
//             <span className="stat-value">{stats.artworks.total}</span>
//             <span className="stat-label">Total Artworks</span>
//           </div>
//         </div>

//         <div className="stat-card">
//           <div className="stat-icon orange">
//             <Package size={24} />
//           </div>
//           <div className="stat-info">
//             <span className="stat-value">{stats.artworks.sold}</span>
//             <span className="stat-label">Artworks Sold</span>
//           </div>
//         </div>

//         <div className="stat-card">
//           <div className="stat-icon red">
//             <DollarSign size={24} />
//           </div>
//           <div className="stat-info">
//             <span className="stat-value">{formatCurrency(stats.orders.totalRevenue)}</span>
//             <span className="stat-label">Total Revenue</span>
//           </div>
//         </div>

//         <div className="stat-card">
//           <div className="stat-icon gold">
//             <TrendingUp size={24} />
//           </div>
//           <div className="stat-info">
//             <span className="stat-value">{formatCurrency(stats.orders.platformFeeRevenue)}</span>
//             <span className="stat-label">Platform Fees</span>
//           </div>
//         </div>
//       </div>

//       {/* Charts Section */}
//       <div className="charts-grid">
//         <div className="chart-card">
//           <h3>Revenue Overview</h3>
//           <div className="chart-placeholder">
//             <div className="chart-bar-container">
//               {earningsData.daily && earningsData.daily.slice(-7).map((day, index) => (
//                 <div key={index} className="chart-bar-wrapper">
//                   <div 
//                     className="chart-bar" 
//                     style={{ 
//                       height: `${(day.amount / Math.max(...earningsData.daily.map(d => d.amount), 1)) * 100}%` 
//                     }}
//                   ></div>
//                   <span className="chart-label">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="chart-card">
//           <h3>Platform Fee Collection</h3>
//           <div className="chart-placeholder">
//             <div className="chart-bar-container">
//               {earningsData.weekly && earningsData.weekly.slice(-7).map((week, index) => (
//                 <div key={index} className="chart-bar-wrapper">
//                   <div 
//                     className="chart-bar fee-bar" 
//                     style={{ 
//                       height: `${(week.platformFee / Math.max(...earningsData.weekly.map(w => w.platformFee), 1)) * 100}%` 
//                     }}
//                   ></div>
//                   <span className="chart-label">Week {index + 1}</span>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Auction & Order Stats */}
//       <div className="stats-grid-2">
//         <div className="stat-card-large">
//           <h3>Auctions</h3>
//           <div className="sub-stats">
//             <div className="sub-stat">
//               <span className="sub-value">{stats.auctions.total}</span>
//               <span className="sub-label">Total</span>
//             </div>
//             <div className="sub-stat">
//               <span className="sub-value" style={{ color: '#27ae60' }}>{stats.auctions.live}</span>
//               <span className="sub-label">Live</span>
//             </div>
//             <div className="sub-stat">
//               <span className="sub-value" style={{ color: '#3498db' }}>{stats.auctions.ended}</span>
//               <span className="sub-label">Ended</span>
//             </div>
//             <div className="sub-stat">
//               <span className="sub-value" style={{ color: '#f39c12' }}>{stats.auctions.scheduled}</span>
//               <span className="sub-label">Scheduled</span>
//             </div>
//             <div className="sub-stat">
//               <span className="sub-value" style={{ color: '#2ecc71' }}>{stats.auctions.accepted}</span>
//               <span className="sub-label">Accepted</span>
//             </div>
//             <div className="sub-stat">
//               <span className="sub-value" style={{ color: '#e74c3c' }}>{stats.auctions.cancelled}</span>
//               <span className="sub-label">Cancelled</span>
//             </div>
//           </div>
//         </div>

//         <div className="stat-card-large">
//           <h3>Orders & Payments</h3>
//           <div className="sub-stats">
//             <div className="sub-stat">
//               <span className="sub-value">{stats.orders.total}</span>
//               <span className="sub-label">Total Orders</span>
//             </div>
//             <div className="sub-stat">
//               <span className="sub-value" style={{ color: '#f39c12' }}>{stats.orders.pendingPayments}</span>
//               <span className="sub-label">Pending</span>
//             </div>
//             <div className="sub-stat">
//               <span className="sub-value" style={{ color: '#27ae60' }}>{stats.orders.completedPayments}</span>
//               <span className="sub-label">Completed</span>
//             </div>
//             <div className="sub-stat">
//               <span className="sub-value" style={{ color: '#2ecc71' }}>{formatCurrency(stats.orders.platformFeeRevenue)}</span>
//               <span className="sub-label">Platform Fees</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Recent Activity */}
//       <div className="recent-activity">
//         <h3>Recent Activity</h3>
//         <div className="activity-grid">
//           <div className="activity-list">
//             <h4>Recent Orders</h4>
//             {recentActivity.orders && recentActivity.orders.length > 0 ? (
//               recentActivity.orders.slice(0, 5).map((order, index) => (
//                 <div key={index} className="activity-item">
//                   <div className="activity-icon" style={{ background: 'rgba(46, 204, 113, 0.1)' }}>
//                     <CreditCard size={16} color="#27ae60" />
//                   </div>
//                   <div className="activity-content">
//                     <span className="activity-text">Order #{order._id?.slice(-8)}</span>
//                     <span className="activity-detail">${order.finalAmount?.toFixed(2)}</span>
//                     <span className={`activity-status ${order.paymentStatus}`}>
//                       {order.paymentStatus}
//                     </span>
//                   </div>
//                   <span className="activity-time">{new Date(order.createdAt).toLocaleDateString()}</span>
//                 </div>
//               ))
//             ) : (
//               <p className="no-activity">No recent orders</p>
//             )}
//           </div>

//           <div className="activity-list">
//             <h4>Recent Users</h4>
//             {recentActivity.users && recentActivity.users.length > 0 ? (
//               recentActivity.users.slice(0, 5).map((user, index) => (
//                 <div key={index} className="activity-item">
//                   <div className="activity-icon" style={{ background: 'rgba(52, 152, 219, 0.1)' }}>
//                     <UserCheck size={16} color="#2980b9" />
//                   </div>
//                   <div className="activity-content">
//                     <span className="activity-text">{user.fullName}</span>
//                     <span className="activity-detail">{user.email}</span>
//                     <span className={`activity-role ${user.role}`}>{user.role}</span>
//                   </div>
//                   <span className="activity-time">{new Date(user.createdAt).toLocaleDateString()}</span>
//                 </div>
//               ))
//             ) : (
//               <p className="no-activity">No recent users</p>
//             )}
//           </div>

//           <div className="activity-list">
//             <h4>Recent Auctions</h4>
//             {recentActivity.auctions && recentActivity.auctions.length > 0 ? (
//               recentActivity.auctions.slice(0, 5).map((auction, index) => (
//                 <div key={index} className="activity-item">
//                   <div className="activity-icon" style={{ background: 'rgba(243, 156, 18, 0.1)' }}>
//                     <Gavel size={16} color="#f39c12" />
//                   </div>
//                   <div className="activity-content">
//                     <span className="activity-text">{auction.artworkId?.title || 'Untitled'}</span>
//                     <span className="activity-detail">${auction.currentHighestBid?.toFixed(2)}</span>
//                     <span className={`activity-status ${auction.status}`}>
//                       {auction.status}
//                     </span>
//                   </div>
//                   <span className="activity-time">{new Date(auction.createdAt).toLocaleDateString()}</span>
//                 </div>
//               ))
//             ) : (
//               <p className="no-activity">No recent auctions</p>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Quick Actions */}
//       <div className="quick-actions">
//         <h3>Quick Actions</h3>
//         <div className="action-buttons">
//           <button className="action-btn">
//             <Users size={20} />
//             Manage Users
//           </button>
//           <button className="action-btn">
//             <Palette size={20} />
//             Approve Artworks
//           </button>
//           <button className="action-btn">
//             <FileText size={20} />
//             View Reports
//           </button>
//           <button className="action-btn">
//             <Settings size={20} />
//             Platform Settings
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;
















import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { 
  Users, 
  Palette, 
  DollarSign, 
  TrendingUp, 
  ShoppingBag, 
  Award,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Package,
  CreditCard,
  ArrowUp,
  ArrowDown,
  Eye,
  Settings,
  LogOut,
  Calendar,
  FileText,
  UserCheck,
  UserX,
  Activity,
  Gavel
} from 'lucide-react';
import './CSS/AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: {
      total: 0,
      artists: 0,
      customers: 0,
      newToday: 0
    },
    artworks: {
      total: 0,
      pending: 0,
      approved: 0,
      sold: 0,
      outOfStock: 0
    },
    auctions: {
      total: 0,
      live: 0,
      ended: 0,
      scheduled: 0,
      cancelled: 0,
      accepted: 0
    },
    orders: {
      total: 0,
      pendingPayments: 0,
      completedPayments: 0,
      totalRevenue: 0,
      platformFeeRevenue: 0,
      artistEarnings: 0
    },
    fixedPrice: {
      total: 0,
      sold: 0,
      revenue: 0,
      platformFee: 0
    },

    auctionFees: {
      total: 0,
      pending: 0,
      collected: 0
    }
  });
  
  const [recentActivity, setRecentActivity] = useState({
    orders: [],
    users: [],
    auctions: []
  });
  
  const [earningsData, setEarningsData] = useState({
    daily: [],
    weekly: [],
    monthly: [],
    totalEarnings: 0
  });

  const [timeRange, setTimeRange] = useState('weekly');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const response = await api.get('/dashboard/admin');
      
      setStats(response.data.stats);
      setRecentActivity(response.data.recentActivity);
      setEarningsData(response.data.earnings || earningsData);
      
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const getStatusColor = (status) => {
    const colors = {
      live: '#27ae60',
      ended: '#3498db',
      scheduled: '#f39c12',
      cancelled: '#e74c3c',
      accepted: '#2ecc71',
      pending: '#f39c12',
      paid: '#27ae60',
      completed: '#27ae60',
      approved: '#27ae60',
      rejected: '#e74c3c',
      sold: '#2980b9',
      out_of_stock: '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };


  const getStatusIcon = (status) => {
    const icons = {
      live: <Activity size={14} />,
      ended: <CheckCircle size={14} />,
      scheduled: <Clock size={14} />,
      cancelled: <XCircle size={14} />,
      accepted: <CheckCircle size={14} />,
      pending: <AlertCircle size={14} />,
      paid: <CheckCircle size={14} />,
      approved: <CheckCircle size={14} />,
      rejected: <XCircle size={14} />
    };
    return icons[status] || <AlertCircle size={14} />;
  };

  const showAuctionStats = () => {
    document.getElementById('auction-stats')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }





  // Calculate total platform fee from both auctions and fixed price
  const totalPlatformFees = (stats.orders?.platformFeeRevenue || 0) + (stats.fixedPrice?.platformFee || 0);

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-left">
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {user?.fullName}</p>
        </div>
        <div className="admin-header-right">
          <span className="admin-badge">🔒 Admin</span>
          <button className="btn-settings" onClick={() => {}}>
            <Settings size={20} />
          </button>
          <button className="btn-logout" onClick={logout}>
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.users?.total || 0}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-change positive">
            <ArrowUp size={14} />
            {stats.users?.newToday || 0} new today
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.users?.artists || 0}</span>
            <span className="stat-label">Artists</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <Palette size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.artworks?.directSale ?? stats.artworks?.total ?? 0}</span>
            <span className="stat-label">Total Artworks</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.artworks?.sold || 0}</span>
            <span className="stat-label">Artworks Sold</span>
          </div>
        </div>

        <div
          className="stat-card"
          role="button"
          tabIndex={0}
          title="View auction details"
          onClick={showAuctionStats}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') showAuctionStats();
          }}
          style={{ cursor: 'pointer' }}
        >
          <div className="stat-icon blue">
            <Gavel size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.artworks?.auctionSold || 0}</span>
            <span className="stat-label">Auction Artworks Sold</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatCurrency(stats.orders?.totalRevenue || 0)}</span>
            <span className="stat-label">Total Sales</span>
          </div>
        </div>




        {/* Platform Fee Card - Shows combined platform fees */}
        <div className="stat-card platform-fee-card">
          <div className="stat-icon gold">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatCurrency(totalPlatformFees)}</span>
            <span className="stat-label">Total Platform Fees</span>
          </div>
          <div className="stat-detail">
            <span>From Auctions: {formatCurrency(stats.orders?.platformFeeRevenue || 0)}</span>
            <span>From Direct: {formatCurrency(stats.fixedPrice?.platformFee || 0)}</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Revenue Overview</h3>
          <div className="chart-placeholder">
            <div className="chart-bar-container">
              {earningsData.daily && earningsData.daily.length > 0 ? (
                earningsData.daily.slice(-7).map((day, index) => (
                  <div key={index} className="chart-bar-wrapper">
                    <div 
                      className="chart-bar" 
                      style={{ 
                        height: `${(day.amount / Math.max(...earningsData.daily.map(d => d.amount), 1)) * 100}%` 
                      }}
                    ></div>
                    <span className="chart-label">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  </div>
                ))
              ) : (
                <p className="no-data">No revenue data available</p>
              )}
            </div>
          </div>
          <div className="chart-total">
            Total: {formatCurrency(earningsData.totalEarnings || 0)}
          </div>
        </div>

        <div className="chart-card">
          <h3>Platform Fee Collection</h3>
          <div className="chart-placeholder">
            <div className="chart-bar-container">
              {earningsData.daily && earningsData.daily.length > 0 ? (
                earningsData.daily.slice(-7).map((day, index) => (
                  <div key={index} className="chart-bar-wrapper">
                    <div 
                      className="chart-bar fee-bar" 
                      style={{ 
                        height: `${((day.platformFee || 0) / Math.max(...earningsData.daily.map(d => d.platformFee || 0), 1)) * 100}%`
                      }}
                    ></div>
                    <span className="chart-label">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  </div>
                ))
              ) : (
                <p className="no-data">No fee data available</p>
              )}
            </div>
          </div>
          <div className="chart-total">
            Total Fees: {formatCurrency(totalPlatformFees)}
          </div>
        </div>
      </div>

      {/* Auction & Order Stats */}
      <div className="stats-grid-2">
        {/* ✅ Updated Auction Stats with all statuses */}
        <div className="stat-card-large" id="auction-stats">
          <h3>Auctions</h3>
          <div className="sub-stats">
            <div className="sub-stat">
              <span className="sub-value">{stats.auctions?.total || 0}</span>
              <span className="sub-label">Total</span>
            </div>
            <div className="sub-stat">
              <span className="sub-value" style={{ color: '#27ae60' }}>{stats.auctions?.live || 0}</span>
              <span className="sub-label">Live</span>
            </div>
            <div className="sub-stat">
              <span className="sub-value" style={{ color: '#3498db' }}>{stats.auctions?.ended || 0}</span>
              <span className="sub-label">Ended</span>
            </div>
            <div className="sub-stat">
              <span className="sub-value" style={{ color: '#f39c12' }}>{stats.auctions?.scheduled || 0}</span>
              <span className="sub-label">Scheduled</span>
            </div>
            <div className="sub-stat">
              <span className="sub-value" style={{ color: '#2ecc71' }}>{stats.auctions?.accepted || 0}</span>
              <span className="sub-label">Accepted</span>
            </div>
            <div className="sub-stat">
              <span className="sub-value" style={{ color: '#e74c3c' }}>{stats.auctions?.cancelled || 0}</span>
              <span className="sub-label">Cancelled</span>
            </div>
          </div>
          {/* ✅ Platform Fee from Auctions */}
          <div className="auction-fees">
            <span className="fee-label">Platform Fees from Auctions:</span>
            <span className="fee-amount">{formatCurrency(stats.orders?.platformFeeRevenue || 0)}</span>
          </div>
        </div>

        {/* ✅ Updated Orders & Payments */}
        <div className="stat-card-large">
          <h3>Orders & Payments</h3>
          <div className="sub-stats">
            <div className="sub-stat">
              <span className="sub-value">{stats.orders?.total || 0}</span>
              <span className="sub-label">Total Orders</span>
            </div>
            <div className="sub-stat">
              <span className="sub-value" style={{ color: '#f39c12' }}>{stats.orders?.pendingPayments || 0}</span>
              <span className="sub-label">Pending</span>
            </div>
            <div className="sub-stat">
              <span className="sub-value" style={{ color: '#27ae60' }}>{stats.orders?.completedPayments || 0}</span>
              <span className="sub-label">Completed</span>
            </div>
            <div className="sub-stat">
              <span className="sub-value" style={{ color: '#2ecc71' }}>{formatCurrency(stats.orders?.platformFeeRevenue || 0)}</span>
              <span className="sub-label">Platform Fees</span>
            </div>
          </div>
          {/* ✅ Total Platform Fee from Auctions */}
          <div className="auction-fees">
            <span className="fee-label">Total Platform Revenue:</span>
            <span className="fee-amount">{formatCurrency(totalPlatformFees)}</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-grid">
          <div className="activity-list">
            <h4>Recent Orders</h4>
            {recentActivity.orders && recentActivity.orders.length > 0 ? (
              recentActivity.orders.slice(0, 5).map((order, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon" style={{ background: 'rgba(46, 204, 113, 0.1)' }}>
                    <CreditCard size={16} color="#27ae60" />
                  </div>
                  <div className="activity-content">
                    <span className="activity-text">Order #{order._id?.slice(-8)}</span>
                    <span className="activity-detail">${order.finalAmount?.toFixed(2)}</span>
                    <span className={`activity-status ${order.paymentStatus}`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                  <span className="activity-time">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
              ))
            ) : (
              <p className="no-activity">No recent orders</p>
            )}
          </div>

          <div className="activity-list">
            <h4>Recent Users</h4>
            {recentActivity.users && recentActivity.users.length > 0 ? (
              recentActivity.users.slice(0, 5).map((user, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon" style={{ background: 'rgba(52, 152, 219, 0.1)' }}>
                    <UserCheck size={16} color="#2980b9" />
                  </div>
                  <div className="activity-content">
                    <span className="activity-text">{user.fullName}</span>
                    <span className="activity-detail">{user.email}</span>
                    <span className={`activity-role ${user.role}`}>{user.role}</span>
                  </div>
                  <span className="activity-time">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              ))
            ) : (
              <p className="no-activity">No recent users</p>
            )}
          </div>

          <div className="activity-list">
            <h4>Recent Auctions</h4>
            {recentActivity.auctions && recentActivity.auctions.length > 0 ? (
              recentActivity.auctions.slice(0, 5).map((auction, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-icon" style={{ background: 'rgba(243, 156, 18, 0.1)' }}>
                    <Gavel size={16} color="#f39c12" />
                  </div>
                  <div className="activity-content">
                    <span className="activity-text">{auction.artworkId?.title || 'Untitled'}</span>
                    <span className="activity-detail">${auction.currentHighestBid?.toFixed(2)}</span>
                    <span className={`activity-status ${auction.status}`}>
                      {auction.status}
                    </span>
                  </div>
                  <span className="activity-time">{new Date(auction.createdAt).toLocaleDateString()}</span>
                </div>
              ))
            ) : (
              <p className="no-activity">No recent auctions</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="action-buttons">
          <button className="action-btn">
            <Users size={20} />
            Manage Users
          </button>
          <button className="action-btn">
            <Palette size={20} />
            Approve Artworks
          </button>
          <button className="action-btn">
            <FileText size={20} />
            View Reports
          </button>
          <button className="action-btn">
            <Settings size={20} />
            Platform Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;