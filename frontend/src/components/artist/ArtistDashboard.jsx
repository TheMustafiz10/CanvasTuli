







// import React, { useState, useEffect } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import api from '../../services/api';
// import { 
//   Plus, 
//   Edit, 
//   Trash2, 
//   Eye, 
//   DollarSign, 
//   Users, 
//   Calendar, 
//   TrendingUp,
//   Clock,
//   CheckCircle,
//   XCircle,
//   AlertCircle,
//   Package,
//   BarChart3,
//   Settings,
//   LogOut,
//   X,
//   Play,
//   Upload,
//   Image,
//   Link2,
//   ShoppingCart,
//   ShoppingBag
// } from 'lucide-react';
// import CreateAuction from './CreateAuction';
// import AddArtworkModal from './AddArtworkModal';
// import './CSS/ArtistDashboard.css';

// const ArtistDashboard = () => {
//   const { user, logout } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [loadingCreate, setLoadingCreate] = useState(false);
//   const [uploadingImage, setUploadingImage] = useState(false);
//   const [createSuccess, setCreateSuccess] = useState(false);
//   const [showCreateAuction, setShowCreateAuction] = useState(false);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [showAddArtwork, setShowAddArtwork] = useState(false);
//   const [imageFile, setImageFile] = useState(null);
  
//   const [stats, setStats] = useState({
//     totalArtworks: 0,
//     soldArtworks: 0,
//     totalAuctions: 0,
//     liveAuctions: 0,
//     endedAuctions: 0,
//     earnings: 0,
//     activeBidders: 0
//   });
//   const [recentSales, setRecentSales] = useState([]);
//   const [auctions, setAuctions] = useState([]);
//   const [artworks, setArtworks] = useState([]);
//   const [cartItems, setCartItems] = useState([]);
//   const [purchases, setPurchases] = useState([]);
//   const [activeTab, setActiveTab] = useState('overview');
//   const [fixedPriceArtworks, setFixedPriceArtworks] = useState([]);

//   // Artwork Types
//   const artworkTypes = [
//     'Painting',
//     'Sculpture',
//     'Photography',
//     'Digital Art',
//     'Sketches',
//     'Calligraphy',
//     'Mixed Media',
//     'Prints',
//     'Handcrafted',
//     'Other'
//   ];

//   // Create Auction Form State
//   const [auctionForm, setAuctionForm] = useState({
//     title: '',
//     description: '',
//     artworkType: '',
//     imageUrl: '',
//     startingPrice: '',
//     minimumBidIncrement: 50,
//     startTime: '',
//     endTime: ''
//   });

//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchArtistData();
//     fetchCartAndPurchases();
//   }, []);



// const fetchArtistData = async () => {
//   try {
//     const results = await Promise.allSettled([
//       api.get('/dashboard/artist'),
//       api.get('/auctions/artist/my-auctions'),
//       api.get('/artworks/artist/my-artworks'),
//       api.get('/artworks/artist/fixed-price') 
//     ]);
    

//     // Handle Dashboard/Stats
//     if (results[0].status === 'fulfilled') {
//       const data = results[0].value.data;
//       setStats(data.stats || {
//         totalArtworks: 0,
//         soldArtworks: 0,
//         totalAuctions: 0,
//         liveAuctions: 0,
//         endedAuctions: 0,
//         earnings: 0,
//         activeBidders: 0
//       });
//       setRecentSales(data.recentSales || []);
//     } else {
//       console.warn('Stats fetch failed:', results[0].reason?.message);
//       setStats({
//         totalArtworks: 0,
//         soldArtworks: 0,
//         totalAuctions: 0,
//         liveAuctions: 0,
//         endedAuctions: 0,
//         earnings: 0,
//         activeBidders: 0
//       });
//       setRecentSales([]);
//     }
    
//     // Handle Auctions
//     if (results[1].status === 'fulfilled') {
//       const data = results[1].value.data;
//       setAuctions(data.auctions || data || []);
//     } else {
//       console.warn('Auctions fetch failed:', results[1].reason?.message);
//       setAuctions([]);
//     }
    
//     // Handle Artworks (Auction type)
//     if (results[2].status === 'fulfilled') {
//       const data = results[2].value.data;
//       setArtworks(data.artworks || data || []);
//     } else {
//       console.warn('Artworks fetch failed:', results[2].reason?.message);
//       setArtworks([]);
//     }
    
//     // Handle Fixed Price Artworks
//     if (results[3].status === 'fulfilled') {
//       const data = results[3].value.data;
//       // Check if data is array or has artworks property
//       if (Array.isArray(data)) {
//         setFixedPriceArtworks(data);
//       } else if (data.artworks && Array.isArray(data.artworks)) {
//         setFixedPriceArtworks(data.artworks);
//       } else {
//         setFixedPriceArtworks([]);
//       }
//     } else {
//       console.warn('Fixed price artworks fetch failed:', results[3].reason?.message);
//       setFixedPriceArtworks([]);
//     }
    
//   } catch (error) {
//     console.error('Error fetching artist data:', error);
//     // Set default values on error
//     setStats({
//       totalArtworks: 0,
//       soldArtworks: 0,
//       totalAuctions: 0,
//       liveAuctions: 0,
//       endedAuctions: 0,
//       earnings: 0,
//       activeBidders: 0
//     });
//     setAuctions([]);
//     setArtworks([]);
//     setFixedPriceArtworks([]);
//     setRecentSales([]);
//   } finally {
//     setLoading(false);
//   }
// };





//   const fetchCartAndPurchases = async () => {
//     try {
//       // Use Promise.allSettled to handle individual failures
//       const results = await Promise.allSettled([
//         api.get('/cart'),
//         api.get('/orders/fixed/history')
//       ]);
      
//       // ✅ Handle cart response
//       if (results[0].status === 'fulfilled') {
//         const cartData = results[0].value.data;
//         setCartItems(cartData.cart?.items || []);
//       } else {
//         console.warn('Cart fetch failed:', results[0].reason?.message || 'Unknown error');
//         setCartItems([]);
//       }
      
//       // Handle purchases response
//       if (results[1].status === 'fulfilled') {
//         const purchasesData = results[1].value.data;
//         setPurchases(purchasesData.orders || []);
//       } else {
//         console.warn('Purchases fetch failed:', results[1].reason?.message || 'Unknown error');
//         setPurchases([]);
//       }
//     } catch (error) {
//       console.error('Error fetching cart/purchases:', error);
//       setCartItems([]);
//       setPurchases([]);
//     }
//   };




//   // Handle Image Upload to Cloudinary
//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     if (!file.type.startsWith('image/')) {
//       alert('Please upload an image file');
//       return;
//     }

//     if (file.size > 5 * 1024 * 1024) {
//       alert('Image size should be less than 5MB');
//       return;
//     }

//     setImageFile(file);
//     setImagePreview(URL.createObjectURL(file));

//     setUploadingImage(true);
//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'canvas_uploads');

//     try {
//       const response = await fetch(
//         `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
//         {
//           method: 'POST',
//           body: formData
//         }
//       );
//       const data = await response.json();
      
//       if (data.secure_url) {
//         setAuctionForm(prev => ({
//           ...prev,
//           imageUrl: data.secure_url
//         }));
//         alert('Image uploaded successfully!');
//       } else {
//         alert('Failed to upload image');
//       }
//     } catch (error) {
//       console.error('Error uploading image:', error);
//       alert('Failed to upload image. Please try again.');
//     } finally {
//       setUploadingImage(false);
//     }
//   };

//   // Handle Create Auction Form Submission
//   const handleCreateAuction = async (e) => {
//     e.preventDefault();
//     setLoadingCreate(true);
//     setCreateSuccess(false);

//     try {
//       if (!auctionForm.title) {
//         alert('Please enter an artwork title');
//         setLoadingCreate(false);
//         return;
//       }

//       if (!auctionForm.artworkType) {
//         alert('Please select an artwork type');
//         setLoadingCreate(false);
//         return;
//       }

//       if (!auctionForm.startingPrice || parseFloat(auctionForm.startingPrice) <= 0) {
//         alert('Please enter a valid starting price');
//         setLoadingCreate(false);
//         return;
//       }

//       const startDate = new Date();
      
//       if (!auctionForm.endTime) {
//         alert('Please select an end time');
//         setLoadingCreate(false);
//         return;
//       }

//       const endDate = new Date(auctionForm.endTime);
      
//       const minDuration = 2 * 60 * 1000;
//       if (endDate - startDate < minDuration) {
//         alert('⚠️ End time must be at least 2 minutes from now');
//         setLoadingCreate(false);
//         return;
//       }

//       const maxDuration = 7 * 24 * 60 * 60 * 1000;
//       if (endDate - startDate > maxDuration) {
//         alert('⚠️ Auction duration cannot exceed 7 days');
//         setLoadingCreate(false);
//         return;
//       }

//       const artworkData = {
//         title: auctionForm.title,
//         description: auctionForm.description || '',
//         imageUrl: auctionForm.imageUrl || 'https://via.placeholder.com/400',
//         medium: auctionForm.artworkType,
//         category: auctionForm.artworkType,
//         status: 'approved'
//       };

//       const artworkResponse = await api.post('/artworks/create', artworkData);
//       const artworkId = artworkResponse.data._id;

//       const auctionData = {
//         artworkId: artworkId,
//         startingPrice: parseFloat(auctionForm.startingPrice),
//         minimumBidIncrement: parseFloat(auctionForm.minimumBidIncrement) || 50,
//         startTime: startDate.toISOString(),
//         endTime: endDate.toISOString()
//       };

//       await api.post('/auctions/create', auctionData);
      
//       setCreateSuccess(true);

//       setAuctionForm({
//         title: '',
//         description: '',
//         artworkType: '',
//         imageUrl: '',
//         startingPrice: '',
//         minimumBidIncrement: 50,
//         startTime: '',
//         endTime: ''
//       });
//       setImagePreview(null);
//       setImageFile(null);

//       await fetchArtistData();

//       setTimeout(() => {
//         setShowCreateAuction(false);
//         setCreateSuccess(false);
//       }, 2000);

//     } catch (error) {
//       console.error('Error creating auction:', error);
//       const errorMessage = error.response?.data?.error || 'Failed to create auction. Please try again.';
//       alert(`❌ ${errorMessage}`);
//       setCreateSuccess(false);
//     } finally {
//       setLoadingCreate(false);
//     }
//   };

//   // Handle Form Input Changes
//   const handleFormChange = (e) => {
//     const { name, value } = e.target;
    
//     if (name === 'endTime') {
//       const endDate = new Date(value);
//       const now = new Date();
//       const diffMs = endDate - now;
//       const diffMin = diffMs / (1000 * 60);
      
//       if (value && diffMin < 2) {
//         alert('End time must be at least 2 minutes from now');
//         return;
//       }
      
//       if (value && diffMin > 7 * 24 * 60) {
//         alert('End time cannot exceed 7 days from now');
//         return;
//       }
//     }
    
//     setAuctionForm(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Handle Image URL Input
//   const handleImageUrlChange = (e) => {
//     const url = e.target.value;
//     setAuctionForm(prev => ({
//       ...prev,
//       imageUrl: url
//     }));
//     if (url) {
//       setImagePreview(url);
//     } else {
//       setImagePreview(null);
//     }
//   };

//   // Handle Start Auction
//   const handleStartAuction = async (auctionId) => {
//     if (!window.confirm('Start this auction now? Once started, bidders will be able to place real-time bids.')) {
//       return;
//     }

//     try {
//       await api.put(`/auctions/${auctionId}/start`);
//       alert('Auction started successfully!');
//       fetchArtistData();
//     } catch (error) {
//       console.error('Error starting auction:', error);
//       alert(error.response?.data?.error || 'Failed to start auction');
//     }
//   };

//   // Handle Cancel Auction
//   const handleCancelAuction = async (auctionId) => {
//     if (!window.confirm('Are you sure you want to cancel this auction?')) {
//       return;
//     }

//     try {
//       await api.put(`/auctions/${auctionId}/cancel`);
//       alert('Auction cancelled successfully');
//       fetchArtistData();
//     } catch (error) {
//       console.error('Error cancelling auction:', error);
//       alert(error.response?.data?.error || 'Failed to cancel auction');
//     }
//   };

//   const getStatusBadge = (status) => {
//     const badges = {
//       live: { icon: <Clock size={14} />, class: 'badge-live', text: 'Live' },
//       ended: { icon: <CheckCircle size={14} />, class: 'badge-ended', text: 'Ended' },
//       scheduled: { icon: <Calendar size={14} />, class: 'badge-scheduled', text: 'Scheduled' },
//       cancelled: { icon: <XCircle size={14} />, class: 'badge-cancelled', text: 'Cancelled' },
//       pending: { icon: <AlertCircle size={14} />, class: 'badge-pending', text: 'Pending' },
//       approved: { icon: <CheckCircle size={14} />, class: 'badge-approved', text: 'Approved' },
//       rejected: { icon: <XCircle size={14} />, class: 'badge-rejected', text: 'Rejected' },
//       sold: { icon: <CheckCircle size={14} />, class: 'badge-sold', text: 'Sold' },
//       out_of_stock: { icon: <XCircle size={14} />, class: 'badge-out-of-stock', text: 'Out of Stock' }
//     };
//     return badges[status] || { icon: null, class: 'badge-default', text: status };
//   };

//   if (loading) {
//     return (
//       <div className="artist-dashboard-loading">
//         <div className="spinner"></div>
//         <p>Loading your dashboard...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="artist-dashboard">
//       {/* Header */}
//       <div className="dashboard-header">
//         <div className="header-left">
//           <h1>Artist Dashboard</h1>
//           <p>Welcome back, {user?.fullName}</p>
//         </div>
//         <div className="header-right">
//           <button className="btn-add-artwork" onClick={() => setShowAddArtwork(true)}>
//             <Plus size={18} />
//             Add Artwork
//           </button>
//           <button className="btn-create-auction" onClick={() => setShowCreateAuction(true)}>
//             <Plus size={18} />
//             Create Auction
//           </button>
//           <button className="btn-settings">
//             <Settings size={18} />
//           </button>
//           <button className="btn-logout" onClick={logout}>
//             <LogOut size={18} />
//           </button>
//         </div>
//       </div>

//       {/* Stats Cards */}
//       <div className="stats-grid">
//         <div className="stat-card">
//           <div className="stat-icon purple">
//             <Package size={24} />
//           </div>
//           <div className="stat-info">
//             <span className="stat-value">{stats.totalArtworks}</span>
//             <span className="stat-label">Total Artworks</span>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-icon green">
//             <DollarSign size={24} />
//           </div>
//           <div className="stat-info">
//             <span className="stat-value">${stats.earnings.toLocaleString()}</span>
//             <span className="stat-label">Total Earnings</span>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-icon orange">
//             <TrendingUp size={24} />
//           </div>
//           <div className="stat-info">
//             <span className="stat-value">{stats.liveAuctions}</span>
//             <span className="stat-label">Live Auctions</span>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-icon blue">
//             <Users size={24} />
//           </div>
//           <div className="stat-info">
//             <span className="stat-value">{stats.activeBidders}</span>
//             <span className="stat-label">Active Bidders</span>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-icon teal">
//             <CheckCircle size={24} />
//           </div>
//           <div className="stat-info">
//             <span className="stat-value">{stats.soldArtworks}</span>
//             <span className="stat-label">Sold Artworks</span>
//           </div>
//         </div>
//         <div className="stat-card">
//           <div className="stat-icon red">
//             <BarChart3 size={24} />
//           </div>
//           <div className="stat-info">
//             <span className="stat-value">{stats.totalAuctions}</span>
//             <span className="stat-label">Total Auctions</span>
//           </div>
//         </div>
//       </div>

//       {/* Tabs */}
//       <div className="dashboard-tabs">
//         <button 
//           className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
//           onClick={() => setActiveTab('overview')}
//         >
//           Overview
//         </button>
//         <button 
//           className={`tab-btn ${activeTab === 'auctions' ? 'active' : ''}`}
//           onClick={() => setActiveTab('auctions')}
//         >
//           My Auctions
//         </button>
//         <button 
//           className={`tab-btn ${activeTab === 'artworks' ? 'active' : ''}`}
//           onClick={() => setActiveTab('artworks')}
//         >
//           My Artworks
//         </button>
//         <button 
//           className={`tab-btn ${activeTab === 'cart' ? 'active' : ''}`}
//           onClick={() => setActiveTab('cart')}
//         >
//           <ShoppingCart size={16} />
//           My Cart
//           {cartItems.length > 0 && (
//             <span className="tab-badge">{cartItems.length}</span>
//           )}
//         </button>
//         <button 
//           className={`tab-btn ${activeTab === 'purchases' ? 'active' : ''}`}
//           onClick={() => setActiveTab('purchases')}
//         >
//           <ShoppingBag size={16} />
//           My Purchases
//         </button>
//         <button 
//           className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
//           onClick={() => setActiveTab('sales')}
//         >
//           Sales History
//         </button>
//       </div>

//       {/* Tab Content */}
//       <div className="tab-content">
//         {activeTab === 'overview' && (
//           <div className="overview-content">
//             <div className="recent-sales">
//               <h3>Recent Sales</h3>
//               {recentSales.length === 0 ? (
//                 <p className="no-data">No sales yet. Start creating auctions!</p>
//               ) : (
//                 <div className="sales-list">
//                   {recentSales.map((sale, index) => (
//                     <div key={index} className="sale-item">
//                       <img src={sale.auctionId?.artworkId?.imageUrl || 'https://via.placeholder.com/60'} alt="Artwork" />
//                       <div className="sale-info">
//                         <h4>{sale.auctionId?.artworkId?.title || 'Untitled'}</h4>
//                         <p>Sold for ${sale.finalAmount?.toLocaleString()}</p>
//                       </div>
//                       <span className="sale-date">{new Date(sale.createdAt).toLocaleDateString()}</span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {activeTab === 'auctions' && (
//           <div className="auctions-content">
//             {auctions.length === 0 ? (
//               <div className="empty-state">
//                 <Package size={48} />
//                 <h3>No Auctions Yet</h3>
//                 <p>Create your first auction to start selling your art</p>
//                 <button className="btn-create" onClick={() => setShowCreateAuction(true)}>
//                   Create Auction
//                 </button>
//               </div>
//             ) : (
//               <div className="auctions-grid">
//                 {auctions.map((auction) => {
//                   const status = getStatusBadge(auction.status);
//                   return (
//                     <div key={auction._id} className="auction-card">
//                       <img 
//                         src={auction.artworkId?.imageUrl || 'https://via.placeholder.com/300'} 
//                         alt={auction.artworkId?.title}
//                       />
//                       <div className="auction-card-content">
//                         <h4>{auction.artworkId?.title || 'Untitled'}</h4>
//                         <div className="auction-card-stats">
//                           <span>Current Bid: ${auction.currentHighestBid?.toLocaleString() || '0'}</span>
//                           <span>{auction.totalBids || 0} bids</span>
//                         </div>
//                         <div className={`badge ${status.class}`}>
//                           {status.icon}
//                           {status.text}
//                         </div>
//                         <div className="auction-card-actions">
//                           <button className="btn-view"><Eye size={16} /> View</button>
//                           {auction.status === 'scheduled' && (
//                             <button 
//                               className="btn-start" 
//                               onClick={() => handleStartAuction(auction._id)}
//                             >
//                               <Play size={16} /> Start
//                             </button>
//                           )}
//                           {auction.status !== 'ended' && auction.status !== 'cancelled' && (
//                             <button 
//                               className="btn-delete" 
//                               onClick={() => handleCancelAuction(auction._id)}
//                             >
//                               <XCircle size={16} /> Cancel
//                             </button>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         )}




//         {activeTab === 'artworks' && (
//           <div className="artworks-content">
//             {artworks.length === 0 && fixedPriceArtworks.length === 0 ? (
//               <div className="empty-state">
//                 <Package size={48} />
//                 <h3>No Artworks Uploaded</h3>
//                 <p>Upload your first artwork to get started</p>
//                 <button className="btn-create" onClick={() => setShowAddArtwork(true)}>
//                   Add Artwork
//                 </button>
//               </div>
//             ) : (
//               <div className="artworks-grid">
//                 {[...artworks, ...fixedPriceArtworks].map((artwork, index) => {
//                   const status = getStatusBadge(artwork.status);
//                   const isFixedPrice = artwork.isFixedPrice;
                  
//                   // ✅ Unique key with prefix
//                   const prefix = isFixedPrice ? 'fixed-' : 'auction-';
//                   const uniqueKey = artwork._id ? `${prefix}${artwork._id}` : `temp-${index}`;
                  
//                   return (
//                     <div key={uniqueKey} className="artwork-card">
//                       <img 
//                         src={artwork.imageUrl || 'https://via.placeholder.com/300'} 
//                         alt={artwork.title || 'Untitled'} 
//                       />
//                       <div className="artwork-card-content">
//                         <h4>{artwork.title || 'Untitled'}</h4>
//                         <p className="artwork-medium">{artwork.medium || 'N/A'}</p>
//                         {isFixedPrice && (
//                           <p className="artwork-price">
//                             ${artwork.fixedPrice?.toFixed(2) || '0.00'} - 
//                             {artwork.availableQuantity || artwork.quantity || 0} in stock
//                           </p>
//                         )}
//                         <div className={`badge ${status.class}`}>
//                           {status.icon}
//                           {status.text}
//                         </div>
//                         <div className="artwork-card-actions">
//                           <button className="btn-view"><Eye size={16} /> View</button>
//                           <button className="btn-edit"><Edit size={16} /> Edit</button>
//                           <button className="btn-delete"><Trash2 size={16} /> Delete</button>
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         )}





//         {activeTab === 'cart' && (
//           <div className="cart-tab-content">
//             {cartItems.length === 0 ? (
//               <div className="empty-state">
//                 <ShoppingCart size={48} />
//                 <h3>Your cart is empty</h3>
//                 <p>Browse fixed-price artworks and add to cart</p>
//                 <Link to="/collections" className="btn-browse">Browse Artworks</Link>
//               </div>
//             ) : (
//               <div className="cart-items-grid">
//                 {cartItems.map((item) => (
//                   <div key={item._id} className="cart-item-card">
//                     <img src={item.imageUrl || 'https://via.placeholder.com/100'} alt={item.title} />
//                     <div className="cart-item-info">
//                       <h4>{item.title}</h4>
//                       <p>Price: ${item.price}</p>
//                       <p>Quantity: {item.quantity}</p>
//                       <p>Subtotal: ${(item.price * item.quantity).toFixed(2)}</p>
//                     </div>
//                     <Link to="/cart" className="btn-view-cart">View Cart</Link>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'purchases' && (
//           <div className="purchases-tab-content">
//             {purchases.length === 0 ? (
//               <div className="empty-state">
//                 <Package size={48} />
//                 <h3>No purchases yet</h3>
//                 <p>Your purchased artworks will appear here</p>
//               </div>
//             ) : (
//               <div className="purchases-grid">
//                 {purchases.map((order) => (
//                   <div key={order._id} className="purchase-card">
//                     <div className="purchase-header">
//                       <span className="order-id">Order #{order._id.slice(-8)}</span>
//                       <span className={`purchase-status ${order.paymentStatus}`}>
//                         {order.paymentStatus}
//                       </span>
//                     </div>
//                     <div className="purchase-items">
//                       {order.items.map((item, idx) => (
//                         <div key={idx} className="purchase-item">
//                           <img src={item.artworkId?.imageUrl || 'https://via.placeholder.com/60'} alt={item.title} />
//                           <div className="purchase-item-info">
//                             <h4>{item.title}</h4>
//                             <p>Qty: {item.quantity} × ${item.price} = ${item.subtotal.toFixed(2)}</p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                     <div className="purchase-footer">
//                       <span>Total: ${order.totalAmount.toFixed(2)}</span>
//                       <span>Paid: {order.paidAt ? new Date(order.paidAt).toLocaleDateString() : 'N/A'}</span>
//                       <span>Method: {order.paymentMethod || 'N/A'}</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         {activeTab === 'sales' && (
//           <div className="sales-content">
//             {recentSales.length === 0 ? (
//               <div className="empty-state">
//                 <Package size={48} />
//                 <h3>No Sales Yet</h3>
//                 <p>Your sold artworks will appear here</p>
//               </div>
//             ) : (
//               <table className="sales-table">
//                 <thead>
//                   <tr>
//                     <th>Artwork</th>
//                     <th>Buyer</th>
//                     <th>Amount</th>
//                     <th>Date</th>
//                     <th>Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {recentSales.map((sale, index) => (
//                     <tr key={index}>
//                       <td>{sale.auctionId?.artworkId?.title || 'Untitled'}</td>
//                       <td>{sale.winnerId?.fullName || 'Unknown'}</td>
//                       <td>${sale.finalAmount?.toLocaleString()}</td>
//                       <td>{new Date(sale.createdAt).toLocaleDateString()}</td>
//                       <td>
//                         <span className={`status-badge ${sale.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
//                           {sale.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         )}
//       </div>

//       {/* Create Auction Modal */}
//       {showCreateAuction && (
//         <div className="modal-overlay" onClick={() => setShowCreateAuction(false)}>
//           <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2>Create New Auction</h2>
//               <button className="modal-close" onClick={() => setShowCreateAuction(false)}>
//                 <X size={24} />
//               </button>
//             </div>

//             {createSuccess ? (
//               <div className="create-success">
//                 <CheckCircle size={48} color="#27ae60" />
//                 <h3>Auction Created Successfully!</h3>
//                 <p>Your auction has been scheduled. You can start it anytime.</p>
//               </div>
//             ) : (
//               <form onSubmit={handleCreateAuction} className="auction-form">
//                 {/* Artwork Title */}
//                 <div className="form-group">
//                   <label>Artwork Title *</label>
//                   <input
//                     type="text"
//                     name="title"
//                     value={auctionForm.title}
//                     onChange={handleFormChange}
//                     required
//                     placeholder="Enter artwork title"
//                   />
//                 </div>

//                 {/* Artwork Description */}
//                 <div className="form-group">
//                   <label>Description</label>
//                   <textarea
//                     name="description"
//                     value={auctionForm.description}
//                     onChange={handleFormChange}
//                     rows="3"
//                     placeholder="Describe your artwork"
//                   />
//                 </div>

//                 {/* Artwork Type */}
//                 <div className="form-group">
//                   <label>Artwork Type *</label>
//                   <select
//                     name="artworkType"
//                     value={auctionForm.artworkType}
//                     onChange={handleFormChange}
//                     required
//                   >
//                     <option value="">Select artwork type</option>
//                     {artworkTypes.map((type) => (
//                       <option key={type} value={type}>
//                         {type}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Image Upload */}
//                 <div className="form-group">
//                   <label>Artwork Image</label>
//                   <div className="image-upload-container">
//                     <div className="image-upload-options">
//                       <div className="upload-option">
//                         <label className="upload-btn">
//                           <Upload size={18} />
//                           Upload Image
//                           <input
//                             type="file"
//                             accept="image/*"
//                             onChange={handleImageUpload}
//                             disabled={uploadingImage}
//                             style={{ display: 'none' }}
//                           />
//                         </label>
//                         {uploadingImage && <span className="uploading-text">Uploading...</span>}
//                       </div>

//                       <div className="upload-option">
//                         <Link2 size={18} />
//                         <input
//                           type="url"
//                           name="imageUrl"
//                           value={auctionForm.imageUrl}
//                           onChange={handleImageUrlChange}
//                           placeholder="Or enter image URL"
//                           className="url-input"
//                         />
//                       </div>
//                     </div>

//                     {imagePreview && (
//                       <div className="image-preview">
//                         <img src={imagePreview} alt="Preview" />
//                         <button
//                           type="button"
//                           className="remove-image"
//                           onClick={() => {
//                             setImagePreview(null);
//                             setImageFile(null);
//                             setAuctionForm(prev => ({ ...prev, imageUrl: '' }));
//                           }}
//                         >
//                           <X size={16} />
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Price Fields */}
//                 <div className="form-row">
//                   <div className="form-group">
//                     <label>Starting Price ($) *</label>
//                     <input
//                       type="number"
//                       name="startingPrice"
//                       value={auctionForm.startingPrice}
//                       onChange={handleFormChange}
//                       required
//                       min="1"
//                       step="0.01"
//                       placeholder="Enter starting price"
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label>Min Bid Increment ($) *</label>
//                     <input
//                       type="number"
//                       name="minimumBidIncrement"
//                       value={auctionForm.minimumBidIncrement}
//                       onChange={handleFormChange}
//                       required
//                       min="1"
//                       step="1"
//                       placeholder="Enter bid increment"
//                     />
//                   </div>
//                 </div>

//                 {/* Date Fields */}
//                 <div className="form-row">
//                   <div className="form-group" style={{ gridColumn: '1 / -1' }}>
//                     <label>End Date & Time *</label>
//                     <input
//                       type="datetime-local"
//                       name="endTime"
//                       value={auctionForm.endTime}
//                       onChange={handleFormChange}
//                       required
//                       min={new Date(Date.now() + 2 * 60 * 1000).toISOString().slice(0, 16)}
//                       step="60"
//                     />
//                     <small className="form-hint warning">
//                       Must be at least 2 minutes from now (max 7 days)
//                     </small>
//                   </div>
//                 </div>

//                 <div className="modal-actions">
//                   <button 
//                     type="button" 
//                     className="btn-cancel-modal" 
//                     onClick={() => setShowCreateAuction(false)}
//                   >
//                     Cancel
//                   </button>
//                   <button 
//                     type="submit" 
//                     className="btn-submit-modal" 
//                     disabled={loadingCreate || uploadingImage}
//                   >
//                     {loadingCreate ? 'Creating...' : 'Create Auction'}
//                   </button>
//                 </div>
//               </form>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Add Artwork Modal */}
//       <AddArtworkModal 
//         isOpen={showAddArtwork} 
//         onClose={() => setShowAddArtwork(false)} 
//         onSuccess={fetchArtistData}
//       />
//     </div>
//   );
// };

// export default ArtistDashboard;










import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  DollarSign, 
  Users, 
  Calendar, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  BarChart3,
  Settings,
  LogOut,
  X,
  Play,
  Upload,
  Image,
  Link2,
  ShoppingCart,
  ShoppingBag,
  Gavel
} from 'lucide-react';
import CreateAuction from './CreateAuction';
import AddArtworkModal from './AddArtworkModal';
import fallbackArtworkImage from '../../assets/hero.png';
import './CSS/ArtistDashboard.css';

const ArtistDashboard = () => {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [loading, setLoading] = useState(true);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [showCreateAuction, setShowCreateAuction] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showAddArtwork, setShowAddArtwork] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  
  const [stats, setStats] = useState({
    totalArtworks: 0,
    soldArtworks: 0,
    totalAuctions: 0,
    liveAuctions: 0,
    endedAuctions: 0,
    earnings: 0,
    activeBidders: 0
  });
  const [recentSales, setRecentSales] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [artworks, setArtworks] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [fixedPriceArtworks, setFixedPriceArtworks] = useState([]);
  const [earningsHistory, setEarningsHistory] = useState([]);


  

  const [viewingAuction, setViewingAuction] = useState(null); 
  const [auctionBids, setAuctionBids] = useState([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [acceptingBidId, setAcceptingBidId] = useState(null);


  
  const [viewingArtwork, setViewingArtwork] = useState(null);

  // Artwork Types
  const artworkTypes = [
    'Painting',
    'Sculpture',
    'Photography',
    'Digital Art',
    'Sketches',
    'Calligraphy',
    'Mixed Media',
    'Prints',
    'Handcrafted',
    'Other'
  ];

  // Create Auction Form State
  const [auctionForm, setAuctionForm] = useState({
    title: '',
    description: '',
    artworkType: '',
    imageUrl: '',
    startingPrice: '',
    minimumBidIncrement: 50,
    startTime: '',
    endTime: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchArtistData();
    fetchCartAndPurchases();
  }, []);

  useEffect(() => {
    if (!socket) return undefined;

    const refreshArtistDashboard = () => {
      fetchArtistData();
      fetchCartAndPurchases();
    };

    socket.on('payment-completed', refreshArtistDashboard);
    socket.on('fixed-price-payment-completed', refreshArtistDashboard);

    return () => {
      socket.off('payment-completed', refreshArtistDashboard);
      socket.off('fixed-price-payment-completed', refreshArtistDashboard);
    };
  }, [socket]);




  const fetchArtistData = async () => {
    try {
      const results = await Promise.allSettled([
        api.get('/dashboard/artist'),
        api.get('/dashboard/artist/earnings'),
        api.get('/auctions/artist/my-auctions'),
        api.get('/artworks/artist/my-artworks'),
        api.get('/artworks/artist/fixed-price')
      ]);
      
      // Handle Dashboard/Stats
      if (results[0].status === 'fulfilled') {
        const data = results[0].value.data;
        setStats(data.stats || {
          totalArtworks: 0,
          soldArtworks: 0,
          totalAuctions: 0,
          liveAuctions: 0,
          endedAuctions: 0,
          earnings: 0,
          activeBidders: 0
        });
        setRecentSales(data.recentSales || []);
      } else {
        console.warn('Stats fetch failed:', results[0].reason?.message);
        setStats({
          totalArtworks: 0,
          soldArtworks: 0,
          totalAuctions: 0,
          liveAuctions: 0,
          endedAuctions: 0,
          earnings: 0,
          activeBidders: 0
        });
        setRecentSales([]);
      }

      if (results[1].status === 'fulfilled') {
        setEarningsHistory(results[1].value.data.earnings?.history || []);
      } else {
        setEarningsHistory([]);
      }
      
      // Handle Auctions
      if (results[2].status === 'fulfilled') {
        const data = results[2].value.data;
        setAuctions(data.auctions || data || []);
      } else {
        console.warn('Auctions fetch failed:', results[2].reason?.message);
        setAuctions([]);
      }
      
      // ✅ Handle Artworks - Separate into auction and fixed-price
      if (results[3].status === 'fulfilled') {
        const data = results[3].value.data;
        const allArtworks = data.artworks || data || [];
        
        // ✅ Separate by type
        const auctionArtworks = allArtworks.filter(artwork => !artwork.isFixedPrice);
        const fixedPriceArtworks = allArtworks.filter(artwork => artwork.isFixedPrice === true);
        
        setArtworks(auctionArtworks);
        setFixedPriceArtworks(fixedPriceArtworks);
      } else {
        console.warn('Artworks fetch failed:', results[3].reason?.message);
        setArtworks([]);
      }
      
      // ✅ Handle Fixed Price Artworks - Skip if already set from above
      if (results[4].status === 'fulfilled' && results[3].status !== 'fulfilled') {
        const data = results[4].value.data;
        const fixedData = Array.isArray(data) ? data : (data.artworks || []);
        setFixedPriceArtworks(fixedData.filter(a => a.isFixedPrice === true));
      } else if (results[4].status === 'fulfilled' && results[3].status === 'fulfilled') {
        // ✅ If both endpoints returned data, use the filtered ones from above
        // This prevents duplicates
        console.log('Both endpoints returned data, using filtered results');
      } else {
        console.warn('Fixed price artworks fetch failed:', results[4].reason?.message);
        // ✅ Don't override if already set from artworks endpoint
        if (results[3].status !== 'fulfilled') {
          setFixedPriceArtworks([]);
        }
      }
      
    } catch (error) {
      console.error('Error fetching artist data:', error);
      setStats({
        totalArtworks: 0,
        soldArtworks: 0,
        totalAuctions: 0,
        liveAuctions: 0,
        endedAuctions: 0,
        earnings: 0,
        activeBidders: 0
      });
      setAuctions([]);
      setArtworks([]);
      setFixedPriceArtworks([]);
      setRecentSales([]);
    } finally {
      setLoading(false);
    }
  };




  const fetchCartAndPurchases = async () => {
    try {
      const results = await Promise.allSettled([
        api.get('/cart'),
        api.get('/orders/fixed/history')
      ]);
      
      if (results[0].status === 'fulfilled') {
        const cartData = results[0].value.data;
        setCartItems(cartData.cart?.items || []);
      } else {
        console.warn('Cart fetch failed:', results[0].reason?.message || 'Unknown error');
        setCartItems([]);
      }
      
      if (results[1].status === 'fulfilled') {
        const purchasesData = results[1].value.data;
        setPurchases(purchasesData.orders || []);
      } else {
        console.warn('Purchases fetch failed:', results[1].reason?.message || 'Unknown error');
        setPurchases([]);
      }
    } catch (error) {
      console.error('Error fetching cart/purchases:', error);
      setCartItems([]);
      setPurchases([]);
    }
  };


  
  const getDisplayStatus = (auction) => {
    if (
      auction.status === 'live' &&
      auction.endTime &&
      new Date(auction.endTime).getTime() <= Date.now()
    ) {
      return 'ended';
    }
    return auction.status;
  };

  const getStatusBadge = (status) => {
    const badges = {
      live: { icon: <Clock size={14} />, class: 'badge-live', text: 'Live' },
      ended: { icon: <CheckCircle size={14} />, class: 'badge-ended', text: 'Ended' },
      scheduled: { icon: <Calendar size={14} />, class: 'badge-scheduled', text: 'Scheduled' },
      accepted: { icon: <CheckCircle size={14} />, class: 'badge-accepted', text: 'Bid Accepted' },
      cancelled: { icon: <XCircle size={14} />, class: 'badge-cancelled', text: 'Cancelled' },
      pending: { icon: <AlertCircle size={14} />, class: 'badge-pending', text: 'Pending' },
      approved: { icon: <CheckCircle size={14} />, class: 'badge-approved', text: 'Approved' },
      rejected: { icon: <XCircle size={14} />, class: 'badge-rejected', text: 'Rejected' },
      sold: { icon: <CheckCircle size={14} />, class: 'badge-sold', text: 'Sold' },
      out_of_stock: { icon: <XCircle size={14} />, class: 'badge-out-of-stock', text: 'Out of Stock' }
    };
    return badges[status] || { icon: null, class: 'badge-default', text: status };
  };

  // ── View auction details + bid list ──────────────────────────────────────
  const handleViewAuction = async (auction) => {
    setViewingAuction(auction);
    setAuctionBids([]);
    setLoadingBids(true);
    try {
      const response = await api.get(`/bids/history/${auction._id}`);
      const bids = response.data.bids || [];

      // Highest Bid first
      const sorted = [...bids].sort((a, b) => (b.amount || 0) - (a.amount || 0));
      setAuctionBids(sorted);
    } catch (error) {
      console.error('Error fetching bids:', error);
      alert(error.response?.data?.error || 'Failed to load bids for this auction');
    } finally {
      setLoadingBids(false);
    }
  };

  const closeAuctionModal = () => {
    setViewingAuction(null);
    setAuctionBids([]);
  };

  // ── Accept a bid ─────────────────────────────────────────────────────────

  const handleAcceptBid = async (bid) => {
    if (!viewingAuction) return;

    if (
      !window.confirm(
        `Accept ${bid.bidderId?.fullName || 'this bidder'}'s bid of $${bid.amount?.toLocaleString()}? They will be notified to complete payment.`
      )
    ) {
      return;
    }

    setAcceptingBidId(bid._id);
    try {
      const response = await api.put(`/auctions/${viewingAuction._id}/accept-bid`, { bidId: bid._id });
      alert('Bid accepted! The buyer has been notified to complete payment.');

      const updatedAuction = response.data.auction || { ...viewingAuction, acceptedBidId: bid._id, status: 'accepted' };
      setViewingAuction(updatedAuction);
      setAuctionBids((prev) =>
        prev.map((b) => (b._id === bid._id ? { ...b, isAccepted: true } : b))
      );
      await fetchArtistData();
    } catch (error) {
      console.error('Error accepting bid:', error);
      alert(error.response?.data?.error || 'Failed to accept bid');
    } finally {
      setAcceptingBidId(null);
    }
  };

  // Handle Image Upload to Cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'canvas_uploads');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );
      const data = await response.json();
      
      if (data.secure_url) {
        setAuctionForm(prev => ({
          ...prev,
          imageUrl: data.secure_url
        }));
        alert('Image uploaded successfully!');
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle Create Auction Form Submission
  const handleCreateAuction = async (e) => {
    e.preventDefault();
    setLoadingCreate(true);
    setCreateSuccess(false);

    try {
      if (!auctionForm.title) {
        alert('Please enter an artwork title');
        setLoadingCreate(false);
        return;
      }

      if (!auctionForm.artworkType) {
        alert('Please select an artwork type');
        setLoadingCreate(false);
        return;
      }

      if (!auctionForm.startingPrice || parseFloat(auctionForm.startingPrice) <= 0) {
        alert('Please enter a valid starting price');
        setLoadingCreate(false);
        return;
      }

      const startDate = new Date();
      
      if (!auctionForm.endTime) {
        alert('Please select an end time');
        setLoadingCreate(false);
        return;
      }

      const endDate = new Date(auctionForm.endTime);
      
      const minDuration = 2 * 60 * 1000;
      if (endDate - startDate < minDuration) {
        alert('⚠️ End time must be at least 2 minutes from now');
        setLoadingCreate(false);
        return;
      }

      const maxDuration = 7 * 24 * 60 * 60 * 1000;
      if (endDate - startDate > maxDuration) {
        alert('⚠️ Auction duration cannot exceed 7 days');
        setLoadingCreate(false);
        return;
      }

      const artworkData = {
        title: auctionForm.title,
        description: auctionForm.description || '',
        imageUrl: auctionForm.imageUrl || 'https://via.placeholder.com/400',
        medium: auctionForm.artworkType,
        category: auctionForm.artworkType,
        status: 'approved'
      };

      const artworkResponse = await api.post('/artworks/create', artworkData);
      const artworkId = artworkResponse.data._id;

      const auctionData = {
        artworkId: artworkId,
        startingPrice: parseFloat(auctionForm.startingPrice),
        minimumBidIncrement: parseFloat(auctionForm.minimumBidIncrement) || 50,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString()
      };

      await api.post('/auctions/create', auctionData);
      
      setCreateSuccess(true);

      setAuctionForm({
        title: '',
        description: '',
        artworkType: '',
        imageUrl: '',
        startingPrice: '',
        minimumBidIncrement: 50,
        startTime: '',
        endTime: ''
      });
      setImagePreview(null);
      setImageFile(null);

      await fetchArtistData();

      setTimeout(() => {
        setShowCreateAuction(false);
        setCreateSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Error creating auction:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create auction. Please try again.';
      alert(`❌ ${errorMessage}`);
      setCreateSuccess(false);
    } finally {
      setLoadingCreate(false);
    }
  };

  // Handle Form Input Changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'endTime') {
      const endDate = new Date(value);
      const now = new Date();
      const diffMs = endDate - now;
      const diffMin = diffMs / (1000 * 60);
      
      if (value && diffMin < 2) {
        alert('End time must be at least 2 minutes from now');
        return;
      }
      
      if (value && diffMin > 7 * 24 * 60) {
        alert('End time cannot exceed 7 days from now');
        return;
      }
    }
    
    setAuctionForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle Image URL Input
  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setAuctionForm(prev => ({
      ...prev,
      imageUrl: url
    }));
    if (url) {
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  // Handle Start Auction
  const handleStartAuction = async (auctionId) => {
    if (!window.confirm('Start this auction now? Once started, bidders will be able to place real-time bids.')) {
      return;
    }

    try {
      await api.put(`/auctions/${auctionId}/start`);
      alert('Auction started successfully!');
      fetchArtistData();
    } catch (error) {
      console.error('Error starting auction:', error);
      alert(error.response?.data?.error || 'Failed to start auction');
    }
  };

  // Handle Cancel Auction
  const handleCancelAuction = async (auctionId) => {
    if (!window.confirm('Are you sure you want to cancel this auction?')) {
      return;
    }

    try {
      await api.put(`/auctions/${auctionId}/cancel`);
      alert('Auction cancelled successfully');
      fetchArtistData();
    } catch (error) {
      console.error('Error cancelling auction:', error);
      alert(error.response?.data?.error || 'Failed to cancel auction');
    }
  };

  if (loading) {
    return (
      <div className="artist-dashboard-loading">
        <div className="spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="artist-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>Artist Dashboard</h1>
          <p>Welcome back, {user?.fullName}</p>
        </div>
        <div className="header-right">
          <button className="btn-add-artwork" onClick={() => setShowAddArtwork(true)}>
            <Plus size={18} />
            Add Artwork
          </button>
          <button className="btn-create-auction" onClick={() => setShowCreateAuction(true)}>
            <Plus size={18} />
            Create Auction
          </button>
          <button className="btn-settings">
            <Settings size={18} />
          </button>
          <button className="btn-logout" onClick={logout}>
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">
            <Package size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalArtworks}</span>
            <span className="stat-label">Total Artworks</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">${stats.earnings.toLocaleString()}</span>
            <span className="stat-label">Total Earnings</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.liveAuctions}</span>
            <span className="stat-label">Live Auctions</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.activeBidders}</span>
            <span className="stat-label">Active Bidders</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon teal">
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.soldArtworks}</span>
            <span className="stat-label">Sold Artworks</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red">
            <BarChart3 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalAuctions}</span>
            <span className="stat-label">Total Auctions</span>
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
          className={`tab-btn ${activeTab === 'auctions' ? 'active' : ''}`}
          onClick={() => setActiveTab('auctions')}
        >
          My Auctions
        </button>
        <button 
          className={`tab-btn ${activeTab === 'artworks' ? 'active' : ''}`}
          onClick={() => setActiveTab('artworks')}
        >
          My Artworks
        </button>
        <button 
          className={`tab-btn ${activeTab === 'cart' ? 'active' : ''}`}
          onClick={() => setActiveTab('cart')}
        >
          <ShoppingCart size={16} />
          My Cart
          {cartItems.length > 0 && (
            <span className="tab-badge">{cartItems.length}</span>
          )}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'purchases' ? 'active' : ''}`}
          onClick={() => setActiveTab('purchases')}
        >
          <ShoppingBag size={16} />
          My Purchases
        </button>
        <button 
          className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          Sales History
        </button>
        <button 
          className={`tab-btn ${activeTab === 'earnings' ? 'active' : ''}`}
          onClick={() => setActiveTab('earnings')}
        >
          <DollarSign size={16} />
          Earnings History
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="recent-sales">
              <h3>Recent Sales</h3>
              {recentSales.length === 0 ? (
                <p className="no-data">No sales yet. Start creating auctions!</p>
              ) : (
                <div className="sales-list">
                  {recentSales.map((sale, index) => (
                    <div key={index} className="sale-item">
                      <img src={sale.auctionId?.artworkId?.imageUrl || 'https://via.placeholder.com/60'} alt="Artwork" />
                      <div className="sale-info">
                        <h4>{sale.auctionId?.artworkId?.title || 'Untitled'}</h4>
                        <p>Sold for ${sale.finalAmount?.toLocaleString()}</p>
                      </div>
                      <span className="sale-date">{new Date(sale.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'auctions' && (
          <div className="auctions-content">
            {auctions.length === 0 ? (
              <div className="empty-state">
                <Package size={48} />
                <h3>No Auctions Yet</h3>
                <p>Create your first auction to start selling your art</p>
                <button className="btn-create" onClick={() => setShowCreateAuction(true)}>
                  Create Auction
                </button>
              </div>
            ) : (
              <div className="auctions-grid">
                {auctions.map((auction) => {
                  const displayStatus = getDisplayStatus(auction);
                  const status = getStatusBadge(displayStatus);
                  return (
                    <div key={auction._id} className="auction-card">
                      <img 
                        src={auction.artworkId?.imageUrl || 'https://via.placeholder.com/300'} 
                        alt={auction.artworkId?.title}
                      />
                      <div className="auction-card-content">
                        <h4>{auction.artworkId?.title || 'Untitled'}</h4>
                        <div className="auction-card-stats">
                          <span>Current Bid: ${auction.currentHighestBid?.toLocaleString() || '0'}</span>
                          <span>{auction.totalBids || 0} bids</span>
                        </div>
                        <div className={`badge ${status.class}`}>
                          {status.icon}
                          {status.text}
                        </div>
                        <div className="auction-card-actions">
                          <button className="btn-view" onClick={() => handleViewAuction(auction)}>
                            <Eye size={16} /> View
                          </button>
                          {displayStatus === 'scheduled' && (
                            <button 
                              className="btn-start" 
                              onClick={() => handleStartAuction(auction._id)}
                            >
                              <Play size={16} /> Start
                            </button>
                          )}
                          {displayStatus !== 'ended' && displayStatus !== 'cancelled' && displayStatus !== 'accepted' && (
                            <button 
                              className="btn-delete" 
                              onClick={() => handleCancelAuction(auction._id)}
                            >
                              <XCircle size={16} /> Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'artworks' && (
          <div className="artworks-content">
            {artworks.length === 0 && fixedPriceArtworks.length === 0 ? (
              <div className="empty-state">
                <Package size={48} />
                <h3>No Artworks Uploaded</h3>
                <p>Upload your first artwork to get started</p>
                <button className="btn-create" onClick={() => setShowAddArtwork(true)}>
                  Add Artwork
                </button>
              </div>
            ) : (
              <div className="artworks-grid">
                {[...artworks, ...fixedPriceArtworks].map((artwork, index) => {
                  const status = getStatusBadge(artwork.status);
                  const isFixedPrice = artwork.isFixedPrice;
                  
                  const prefix = isFixedPrice ? 'fixed-' : 'auction-';
                  const uniqueKey = artwork._id ? `${prefix}${artwork._id}` : `temp-${index}`;
                  
                  return (
                    <div key={uniqueKey} className="artwork-card">
                      <img 
                        src={artwork.imageUrl || 'https://via.placeholder.com/300'} 
                        alt={artwork.title || 'Untitled'} 
                      />
                      <div className="artwork-card-content">
                        <h4>{artwork.title || 'Untitled'}</h4>
                        <p className="artwork-medium">{artwork.medium || 'N/A'}</p>
                        {isFixedPrice && (
                          <p className="artwork-price">
                            ${artwork.fixedPrice?.toFixed(2) || '0.00'} - 
                            {artwork.availableQuantity || artwork.quantity || 0} in stock
                          </p>
                        )}
                        <div className={`badge ${status.class}`}>
                          {status.icon}
                          {status.text}
                        </div>
                        <div className="artwork-card-actions">
                          <button className="btn-view" onClick={() => setViewingArtwork(artwork)}>
                            <Eye size={16} /> View
                          </button>
                          <button className="btn-edit"><Edit size={16} /> Edit</button>
                          <button className="btn-delete"><Trash2 size={16} /> Delete</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'cart' && (
          <div className="cart-tab-content">
            {cartItems.length === 0 ? (
              <div className="empty-state">
                <ShoppingCart size={48} />
                <h3>Your cart is empty</h3>
                <p>Browse fixed-price artworks and add to cart</p>
                <Link to="/collections" className="btn-browse">Browse Artworks</Link>
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
                      <p>Subtotal: ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</p>
                    </div>
                    <Link to="/cart" className="btn-view-cart">View Cart</Link>
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
              </div>
            ) : (
              <div className="purchases-grid">
                {purchases.map((order) => (
                  <div key={order._id} className="purchase-card">
                    <div className="purchase-header">
                      <span className="order-id">Order #{order._id.slice(-8)}</span>
                      <span className={`purchase-status ${order.paymentStatus}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                    <div className="purchase-items">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="purchase-item">
                          <img src={item.artwork?.imageUrl || item.artworkId?.imageUrl || fallbackArtworkImage} alt={item.title} />
                          <div className="purchase-item-info">
                            <h4>{item.title}</h4>
                            <p>Qty: {item.quantity} × ${item.price} = ${(item.subtotal ?? 0).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="purchase-footer">
                      <span>Total: ${(order.totalAmount ?? 0).toFixed(2)}</span>
                      <span>Paid: {order.paidAt ? new Date(order.paidAt).toLocaleDateString() : 'N/A'}</span>
                      <span>Method: {order.paymentMethod || 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="sales-content">
            {earningsHistory.length === 0 ? (
              <div className="empty-state">
                <Package size={48} />
                <h3>No Sales Yet</h3>
                <p>Your sold artworks will appear here</p>
              </div>
            ) : (
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Artwork</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {earningsHistory.map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.title || sale.artwork?.title || sale.artworkId?.title || 'Untitled'}</td>
                      <td>{sale.type === 'fixed_price' ? 'Fixed Price' : 'Auction'}</td>
                      <td>${(sale.amount || 0).toFixed(2)}</td>
                      <td>{sale.paidAt ? new Date(sale.paidAt).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <span className="status-badge paid">
                          Paid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'earnings' && (
          <div className="sales-content">
            {earningsHistory.length === 0 ? (
              <div className="empty-state">
                <DollarSign size={48} />
                <h3>No Earnings Yet</h3>
                <p>Paid sales will appear here.</p>
              </div>
            ) : (
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Artwork</th>
                    <th>Type</th>
                    <th>Gross</th>
                    <th>Platform Fee</th>
                    <th>Your Earnings</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {earningsHistory.map((sale) => (
                    <tr key={sale.id}>
                      <td>{sale.title || sale.artwork?.title || sale.artworkId?.title || 'Artwork'}{sale.quantity ? ` x${sale.quantity}` : ''}</td>
                      <td>{sale.type === 'fixed_price' ? 'Fixed Price' : 'Auction'}</td>
                      <td>${(sale.amount || 0).toFixed(2)}</td>
                      <td>${(sale.platformFee || 0).toFixed(2)}</td>
                      <td>${(sale.earnings || 0).toFixed(2)}</td>
                      <td>{sale.paidAt ? new Date(sale.paidAt).toLocaleDateString() : 'N/A'}</td>
                      <td><span className="status-badge paid">Paid</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Auction Details / Accept Bid Modal */}
      {viewingAuction && (
        <div className="modal-overlay" onClick={closeAuctionModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{viewingAuction.artworkId?.title || 'Auction Details'}</h2>
              <button className="modal-close" onClick={closeAuctionModal}>
                <X size={24} />
              </button>
            </div>

            <div className="auction-detail-body">
              <div className="auction-detail-summary">
                <img
                  src={viewingAuction.artworkId?.imageUrl || 'https://via.placeholder.com/300'}
                  alt={viewingAuction.artworkId?.title}
                  style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 8 }}
                />
                <p><strong>Status:</strong> {getStatusBadge(getDisplayStatus(viewingAuction)).text}</p>
                <p><strong>Starting Price:</strong> ${viewingAuction.startingPrice?.toLocaleString()}</p>
                <p><strong>Current Highest Bid:</strong> ${viewingAuction.currentHighestBid?.toLocaleString() || '0'}</p>
                <p><strong>Total Bids:</strong> {viewingAuction.totalBids || 0}</p>
                <p><strong>Ends:</strong> {viewingAuction.endTime ? new Date(viewingAuction.endTime).toLocaleString() : 'N/A'}</p>
              </div>

              <div className="auction-detail-bids">
                <h3><Gavel size={18} /> Bid History</h3>
                {loadingBids ? (
                  <p className="no-data">Loading bids...</p>
                ) : auctionBids.length === 0 ? (
                  <p className="no-data">No bids placed on this auction yet.</p>
                ) : (
                  <div className="bid-history-list">
                    {auctionBids.map((bid) => {
                      const isAccepted = bid.isAccepted || viewingAuction.acceptedBidId === bid._id;
                      const alreadyAcceptedOther = viewingAuction.acceptedBidId && !isAccepted;
                      return (
                        <div key={bid._id} className={`bid-history-item ${isAccepted ? 'bid-history-item-accepted' : ''}`}>
                          <div className="bid-history-info">
                            <span className="bid-history-bidder">{bid.bidderId?.fullName || 'Unknown bidder'}</span>
                            <span className="bid-history-amount">${bid.amount?.toLocaleString()}</span>
                            <span className="bid-history-date">
                              {bid.createdAt ? new Date(bid.createdAt).toLocaleString() : ''}
                            </span>
                          </div>
                          {isAccepted ? (
                            <span className="badge badge-accepted">
                              <CheckCircle size={14} /> Accepted
                            </span>
                          ) : (
                            <button
                              className="btn-accept-bid"
                              disabled={acceptingBidId === bid._id || alreadyAcceptedOther}
                              onClick={() => handleAcceptBid(bid)}
                            >
                              {acceptingBidId === bid._id ? 'Accepting...' : 'Accept Bid'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                <p className="form-hint">
                  {viewingAuction.acceptedBidId
                    ? 'A bid has already been accepted for this auction.'
                    : 'Accepting a bid marks it as the winner and notifies that bidder to complete payment.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Artwork Details Modal */}
      {viewingArtwork && (
        <div className="modal-overlay" onClick={() => setViewingArtwork(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{viewingArtwork.title || 'Artwork Details'}</h2>
              <button className="modal-close" onClick={() => setViewingArtwork(null)}>
                <X size={24} />
              </button>
            </div>

            <div className="auction-detail-body">
              <div className="auction-detail-summary">
                <img
                  src={viewingArtwork.imageUrl || 'https://via.placeholder.com/300'}
                  alt={viewingArtwork.title}
                  style={{ width: '100%', maxHeight: 240, objectFit: 'cover', borderRadius: 8 }}
                />
                <p><strong>Status:</strong> {getStatusBadge(viewingArtwork.status).text}</p>
                {viewingArtwork.description && (
                  <p><strong>Description:</strong> {viewingArtwork.description}</p>
                )}
                <p><strong>Medium:</strong> {viewingArtwork.medium || 'N/A'}</p>
                <p><strong>Category:</strong> {viewingArtwork.category || 'N/A'}</p>
                {viewingArtwork.dimensions && (
                  <p><strong>Dimensions:</strong> {viewingArtwork.dimensions}</p>
                )}
                {viewingArtwork.year && (
                  <p><strong>Year:</strong> {viewingArtwork.year}</p>
                )}
                {viewingArtwork.isFixedPrice ? (
                  <>
                    <p><strong>Price:</strong> ${viewingArtwork.fixedPrice?.toFixed(2) || '0.00'}</p>
                    <p>
                      <strong>Stock:</strong>{' '}
                      {viewingArtwork.availableQuantity ?? (viewingArtwork.quantity - (viewingArtwork.soldQuantity || 0))} available
                      {' '}({viewingArtwork.soldQuantity || 0} sold of {viewingArtwork.quantity || 0})
                    </p>
                  </>
                ) : (
                  <p className="form-hint">This artwork is listed for auction, not fixed-price sale.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Auction Modal */}
      {showCreateAuction && (
        <div className="modal-overlay" onClick={() => setShowCreateAuction(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Auction</h2>
              <button className="modal-close" onClick={() => setShowCreateAuction(false)}>
                <X size={24} />
              </button>
            </div>

            {createSuccess ? (
              <div className="create-success">
                <CheckCircle size={48} color="#27ae60" />
                <h3>Auction Created Successfully!</h3>
                <p>Your auction has been scheduled. You can start it anytime.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateAuction} className="auction-form">
                {/* Artwork Title */}
                <div className="form-group">
                  <label>Artwork Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={auctionForm.title}
                    onChange={handleFormChange}
                    required
                    placeholder="Enter artwork title"
                  />
                </div>

                {/* Artwork Description */}
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={auctionForm.description}
                    onChange={handleFormChange}
                    rows="3"
                    placeholder="Describe your artwork"
                  />
                </div>

                {/* Artwork Type */}
                <div className="form-group">
                  <label>Artwork Type *</label>
                  <select
                    name="artworkType"
                    value={auctionForm.artworkType}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select artwork type</option>
                    {artworkTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image Upload */}
                <div className="form-group">
                  <label>Artwork Image</label>
                  <div className="image-upload-container">
                    <div className="image-upload-options">
                      <div className="upload-option">
                        <label className="upload-btn">
                          <Upload size={18} />
                          Upload Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            disabled={uploadingImage}
                            style={{ display: 'none' }}
                          />
                        </label>
                        {uploadingImage && <span className="uploading-text">Uploading...</span>}
                      </div>

                      <div className="upload-option">
                        <Link2 size={18} />
                        <input
                          type="url"
                          name="imageUrl"
                          value={auctionForm.imageUrl}
                          onChange={handleImageUrlChange}
                          placeholder="Or enter image URL"
                          className="url-input"
                        />
                      </div>
                    </div>

                    {imagePreview && (
                      <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                        <button
                          type="button"
                          className="remove-image"
                          onClick={() => {
                            setImagePreview(null);
                            setImageFile(null);
                            setAuctionForm(prev => ({ ...prev, imageUrl: '' }));
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Fields */}
                <div className="form-row">
                  <div className="form-group">
                    <label>Starting Price ($) *</label>
                    <input
                      type="number"
                      name="startingPrice"
                      value={auctionForm.startingPrice}
                      onChange={handleFormChange}
                      required
                      min="1"
                      step="0.01"
                      placeholder="Enter starting price"
                    />
                  </div>

                  <div className="form-group">
                    <label>Min Bid Increment ($) *</label>
                    <input
                      type="number"
                      name="minimumBidIncrement"
                      value={auctionForm.minimumBidIncrement}
                      onChange={handleFormChange}
                      required
                      min="1"
                      step="1"
                      placeholder="Enter bid increment"
                    />
                  </div>
                </div>

                {/* Date Fields */}
                <div className="form-row">
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>End Date & Time *</label>
                    <input
                      type="datetime-local"
                      name="endTime"
                      value={auctionForm.endTime}
                      onChange={handleFormChange}
                      required
                      min={new Date(Date.now() + 2 * 60 * 1000).toISOString().slice(0, 16)}
                      step="60"
                    />
                    <small className="form-hint warning">
                      Must be at least 2 minutes from now (max 7 days)
                    </small>
                  </div>
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-cancel-modal" 
                    onClick={() => setShowCreateAuction(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-submit-modal" 
                    disabled={loadingCreate || uploadingImage}
                  >
                    {loadingCreate ? 'Creating...' : 'Create Auction'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Artwork Modal */}
      <AddArtworkModal 
        isOpen={showAddArtwork} 
        onClose={() => setShowAddArtwork(false)} 
        onSuccess={fetchArtistData}
      />
    </div>
  );
};

export default ArtistDashboard;







