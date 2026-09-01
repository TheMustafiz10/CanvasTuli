


// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import api from '../../services/api';
// import { CreditCard, CheckCircle, XCircle, Loader, ArrowLeft } from 'lucide-react';
// import toast from 'react-hot-toast';
// import './CSS/PaymentPage.css';




// const PaymentPage = () => {
//   const { orderId } = useParams();  
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { isAuthenticated, user } = useAuth();
//   const [loading, setLoading] = useState(true);
//   const [processing, setProcessing] = useState(false);
//   const [order, setOrder] = useState(null);
//   const [auction, setAuction] = useState(null);
//   const [paymentMethod, setPaymentMethod] = useState('stripe');
//   const [orderType, setOrderType] = useState('auction'); // 'auction' or 'fixed'

//   useEffect(() => {
//     if (!isAuthenticated) {
//       navigate('/login');
//       return;
//     }
    

//     // Check if coming from success page
//     const params = new URLSearchParams(location.search);
//     const sessionId = params.get('session_id');
//     if (sessionId) {
//       handlePaymentSuccess(sessionId);
//       return;
//     }
    
//     fetchOrderDetails();
//   }, [orderId, isAuthenticated]);

//   const fetchOrderDetails = async () => {
//     try {
//       setLoading(true);
      
//       // First try to get auction details
//       let auctionData = null;
//       let orderData = null;
      
//       try {
//         const auctionRes = await api.get(`/auctions/${orderId}`);
//         auctionData = auctionRes.data.auction;
//         console.log('Auction found:', auctionData);
//       } catch (e) {
//         console.log('Not an auction ID, trying order ID');
//       }
      
//       // Try to find the order
//       try {
//         const orderRes = await api.get(`/payments/status/${orderId}`);
//         orderData = orderRes.data;
//         console.log('✅ Order found:', orderData);
//       } catch (e) {
//         console.log('Order not found as payment status');
//       }
      
//       // If no order found, try fixed price orders
//       if (!orderData) {
//         try {
//           const fixedRes = await api.get(`/orders/fixed/${orderId}`);
//           orderData = fixedRes.data.order;
//           setOrderType('fixed');
//           console.log('Fixed price order found:', orderData);
//         } catch (e) {
//           console.log('No fixed price order found');
//         }
//       }
      
//       // If we have auction but no order, try to get order from auction
//       if (auctionData && !orderData) {
//         try {
//           const orderRes = await api.get(`/payments/status/${auctionData._id}`);
//           orderData = orderRes.data;
//           console.log('✅ Order found via auction:', orderData);
//         } catch (e) {
//           console.log('No order found for this auction');
//         }
//       }
      
//       setAuction(auctionData);
//       setOrder(orderData);
      
//       if (!auctionData && !orderData) {
//         toast.error('No order or auction found');
//         navigate('/dashboard');
//         return;
//       }
      
//     } catch (error) {
//       console.error('Error fetching order details:', error);
//       toast.error('Failed to load payment details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStripePayment = async () => {
//     if (!order && !auction) {
//       toast.error('No order found to process payment');
//       return;
//     }

//     setProcessing(true);
//     try {
//       const payload = {
//         orderId: order?.orderId || order?._id || orderId
//       };
      
//       console.log('📤 Creating checkout session with payload:', payload);
      
//       const response = await api.post('/payments/create-checkout-session', payload);
      
//       if (response.data.url) {
//         // Redirect to Stripe Checkout
//         window.location.href = response.data.url;
//       } else {
//         toast.error('Failed to create checkout session');
//       }
//     } catch (error) {
//       console.error('Payment error:', error);
//       const errorMsg = error.response?.data?.error || 'Failed to initiate payment';
//       toast.error(errorMsg);
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handleBkashPayment = async () => {
//     if (!order && !auction) {
//       toast.error('No order found to process payment');
//       return;
//     }

//     setProcessing(true);
//     try {
//       const payload = {
//         orderId: order?.orderId || order?._id || orderId
//       };
      
//       const response = await api.post('/payment/bkash/create', payload);
      
//       if (response.data.paymentUrl) {
//         window.location.href = response.data.paymentUrl;
//       } else {
//         toast.info('bKash payment initiated. Please check your phone.');
//       }
//     } catch (error) {
//       console.error('bKash payment error:', error);
//       toast.error(error.response?.data?.error || 'Failed to initiate bKash payment');
//     } finally {
//       setProcessing(false);
//     }
//   };

//   const handlePaymentSuccess = async (sessionId) => {
//     try {
//       toast.success('✅ Payment successful!');
//       setTimeout(() => {
//         navigate('/dashboard');
//       }, 2000);
//     } catch (error) {
//       console.error('Payment verification error:', error);
//       toast.error('Payment verification failed');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="payment-loading">
//         <Loader size={40} className="spinner" />
//         <p>Loading payment details...</p>
//       </div>
//     );
//   }

//   if (!auction && !order) {
//     return (
//       <div className="payment-error">
//         <XCircle size={48} />
//         <h2>No payment found</h2>
//         <p>This order does not exist or has been completed.</p>
//         <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
//       </div>
//     );
//   }

//   // Determine if user is the winner
//   const isWinner = auction?.winnerId?._id === user?._id || 
//                    order?.winnerId?._id === user?._id ||
//                    order?.userId === user?._id;
  
//   const isPaid = order?.paymentStatus === 'paid';
//   const amount = order?.finalAmount || order?.totalAmount || auction?.winningBid || 0;
//   const platformFee = order?.platformFee || (amount * 0.05);

//   if (isPaid) {
//     return (
//       <div className="payment-success">
//         <CheckCircle size={64} color="#27ae60" />
//         <h2>Payment Already Completed ✅</h2>
//         <p>This order has already been paid.</p>
//         <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
//       </div>
//     );
//   }

//   if (!isWinner) {
//     return (
//       <div className="payment-error">
//         <XCircle size={48} />
//         <h2>Access Denied</h2>
//         <p>You are not authorized to make this payment.</p>
//         <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
//       </div>
//     );
//   }

//   const totalAmount = amount + platformFee;

//   return (
//     <div className="payment-page">
//       <div className="payment-container">
//         <button className="back-button" onClick={() => navigate(-1)}>
//           <ArrowLeft size={20} />
//           Back
//         </button>
        
//         <div className="payment-header">
//           <h1>💳 Complete Your Payment</h1>
//           <p>You won the auction! Complete your payment to secure the artwork.</p>
//         </div>

//         <div className="payment-details">
//           <div className="payment-artwork">
//             <img 
//               src={auction?.artworkId?.imageUrl || 'https://via.placeholder.com/200'} 
//               alt={auction?.artworkId?.title || 'Artwork'}
//               onError={(e) => { e.target.src = 'https://via.placeholder.com/200'; }}
//             />
//             <div className="payment-artwork-info">
//               <h2>{auction?.artworkId?.title || 'Artwork'}</h2>
//               <p>by {auction?.artistId?.fullName || 'Unknown Artist'}</p>
//               <div className="payment-amount">
//                 <span>Winning Bid:</span>
//                 <strong>${amount.toFixed(2)}</strong>
//               </div>
//               <div className="payment-breakdown">
//                 <div className="breakdown-row">
//                   <span>Subtotal</span>
//                   <span>${amount.toFixed(2)}</span>
//                 </div>
//                 <div className="breakdown-row">
//                   <span>Platform Fee (5%)</span>
//                   <span>${platformFee.toFixed(2)}</span>
//                 </div>
//                 <div className="breakdown-row total">
//                   <span>Total Amount</span>
//                   <span>${totalAmount.toFixed(2)}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="payment-methods">
//           <h3>Select Payment Method</h3>
          
//           <div className="payment-method-options">
//             <button
//               className={`payment-method-btn ${paymentMethod === 'stripe' ? 'active' : ''}`}
//               onClick={() => setPaymentMethod('stripe')}
//             >
//               <CreditCard size={24} />
//               <span>Stripe</span>
//             </button>
//             <button
//               className={`payment-method-btn ${paymentMethod === 'bkash' ? 'active' : ''}`}
//               onClick={() => setPaymentMethod('bkash')}
//             >
//               <span className="bkash-logo">bKash</span>
//             </button>
//           </div>

//           <button 
//             className="btn-pay"
//             onClick={paymentMethod === 'stripe' ? handleStripePayment : handleBkashPayment}
//             disabled={processing}
//           >
//             {processing ? (
//               <>
//                 <Loader size={20} className="spinner" />
//                 Processing...
//               </>
//             ) : (
//               `Pay $${totalAmount.toFixed(2)} via ${paymentMethod === 'stripe' ? 'Stripe' : 'bKash'}`
//             )}
//           </button>
          
//           <p className="payment-secure">🔒 Secure payment processed via Stripe</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PaymentPage;





















import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { CreditCard, CheckCircle, XCircle, Loader, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import './CSS/PaymentPage.css';





const PaymentPage = () => {
  const { orderId } = useParams();  
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState(null);
  const [auction, setAuction] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [orderType, setOrderType] = useState('auction');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');
    if (sessionId || params.get('type') === 'bkash') {
      handlePaymentSuccess(sessionId);
      return;
    }
    
    fetchOrderDetails();
  }, [orderId, isAuthenticated]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);

      if (!orderId || orderId === 'null' || orderId === 'undefined') {
        toast.error('No payment order was selected');
        navigate('/dashboard');
        return;
      }
      
      let auctionData = null;
      let orderData = null;
      
      try {
        const auctionRes = await api.get(`/auctions/${orderId}`);
        auctionData = auctionRes.data.auction;
        console.log('Auction found:', auctionData);
      } catch (e) {
        console.log('Not an auction ID, trying order ID');
      }
      
      try {
        const orderRes = await api.get(`/payments/status/${orderId}`);
        orderData = orderRes.data;
        console.log('Order found:', orderData);
      } catch (e) {
        console.log('Order not found as payment status');
      }
      
      if (!orderData && !auctionData) {
        try {
          const fixedRes = await api.get(`/orders/fixed/${orderId}`);
          orderData = fixedRes.data.order;
          setOrderType('fixed');
          console.log('Fixed price order found:', orderData);
        } catch (e) {
          console.log('No fixed price order found');
        }
      }
      
      if (auctionData && !orderData) {
        try {
          const orderRes = await api.get(`/payments/status/${auctionData._id}`);
          orderData = orderRes.data;
          console.log('Order found via auction:', orderData);
        } catch (e) {
          console.log('No order found for this auction');
        }
      }
      
      setAuction(auctionData);
      setOrder(orderData);
      if (!auctionData && orderData?.auctionId) {
        setAuction(orderData.auctionId);
      }
      
      if (!auctionData && !orderData) {
        toast.error('No order or auction found');
        navigate('/dashboard');
        return;
      }
      
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = async () => {
    if (!order && !auction) {
      toast.error('No order found to process payment');
      return;
    }

    setProcessing(true);
    try {
      const actualOrderId = order?._id || orderId;
      
      console.log('Creating checkout session for order:', actualOrderId);
      
      const checkoutEndpoint = orderType === 'fixed'
        ? '/payments/fixed-price-checkout'
        : '/payments/create-checkout-session';
      const response = await api.post(checkoutEndpoint, {
        orderId: actualOrderId
      });
      
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        toast.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Payment error:', error);
      const errorMsg = error.response?.data?.error || 'Failed to initiate payment';
      toast.error(errorMsg);
    } finally {
      setProcessing(false);
    }
  };



  const handleBkashPayment = async () => {
    if (!order && !auction) {
      toast.error('No order found to process payment');
      return;
    }

    setProcessing(true);
    try {
      const actualOrderId = order?._id || orderId;
      
      const response = await api.post('/payments/bkash/create', {
        orderId: actualOrderId
      });
      
      const paymentUrl = response.data.paymentUrl || response.data.bkashURL || response.data.paymentURL;
      if (paymentUrl) {
        window.location.assign(paymentUrl);
      } else {
        console.error('bKash response did not include a payment URL:', response.data);
        toast.error('bKash did not return a payment gateway URL. Please try again.');
      }
    } catch (error) {
      console.error('bKash payment error:', error);
      toast.error(error.response?.data?.error || 'Failed to initiate bKash payment');
    } finally {
      setProcessing(false);
    }
  };




  const handlePaymentSuccess = async (sessionId) => {
    try {
      if (sessionId) {
        await api.post('/payments/confirm-stripe-payment', { sessionId });
      }
      toast.success('Payment successful!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Payment verification failed');
    }
  };


  

  if (loading) {
    return (
      <div className="payment-loading">
        <Loader size={40} className="spinner" />
        <p>Loading payment details...</p>
      </div>
    );
  }

  if (!auction && !order) {
    return (
      <div className="payment-error">
        <XCircle size={48} />
        <h2>No payment found</h2>
        <p>This order does not exist or has been completed.</p>
        <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
      </div>
    );
  }

  const isWinner = auction?.winnerId?._id === user?._id || 
                   order?.winnerId?._id === user?._id ||
                   (orderType === 'fixed' && order?.userId === user?._id);
  
  const isPaid = order?.paymentStatus === 'paid';
  const amount = order?.finalAmount || order?.totalAmount || auction?.winningBid || 0;
  const platformFee = order?.platformFee || (amount * 0.05);

  if (isPaid) {
    return (
      <div className="payment-success">
        <CheckCircle size={64} color="#27ae60" />
        <h2>Payment Already Completed</h2>
        <p>This order has already been paid.</p>
        <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
      </div>
    );
  }

  if (!isWinner) {
    return (
      <div className="payment-error">
        <XCircle size={48} />
        <h2>Access Denied</h2>
        <p>You are not authorized to make this payment.</p>
        <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
      </div>
    );
  }

  const totalAmount = amount + platformFee;

  return (
    <div className="payment-page">
      <div className="payment-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
          Back
        </button>
        
        <div className="payment-header">
          <h1>Complete Your Payment</h1>
          <p>You won the auction! Complete your payment to secure the artwork.</p>
        </div>

        <div className="payment-details">
          <div className="payment-artwork">
            <img 
              src={auction?.artworkId?.imageUrl || 'https://via.placeholder.com/200'} 
              alt={auction?.artworkId?.title || 'Artwork'}
              onError={(e) => { e.target.src = 'https://via.placeholder.com/200'; }}
            />
            <div className="payment-artwork-info">
              <h2>{auction?.artworkId?.title || 'Artwork'}</h2>
              <p>by {auction?.artistId?.fullName || 'Unknown Artist'}</p>
              <div className="payment-amount">
                <span>Winning Bid:</span>
                <strong>${amount.toFixed(2)}</strong>
              </div>
              <div className="payment-breakdown">
                <div className="breakdown-row">
                  <span>Subtotal</span>
                  <span>${amount.toFixed(2)}</span>
                </div>
                <div className="breakdown-row">
                  <span>Platform Fee (5%)</span>
                  <span>${platformFee.toFixed(2)}</span>
                </div>
                <div className="breakdown-row total">
                  <span>Total Amount</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="payment-methods">
          <h3>Select Payment Method</h3>
          
          <div className="payment-method-options">
            <button
              className={`payment-method-btn ${paymentMethod === 'stripe' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('stripe')}
            >
              <CreditCard size={24} />
              <span>Stripe</span>
            </button>
            <button
              className={`payment-method-btn ${paymentMethod === 'bkash' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('bkash')}
            >
              <span className="bkash-logo">bKash</span>
            </button>
          </div>

          <button 
            className="btn-pay"
            onClick={paymentMethod === 'stripe' ? handleStripePayment : handleBkashPayment}
            disabled={processing}
          >
            {processing ? (
              <>
                <Loader size={20} className="spinner" />
                Processing...
              </>
            ) : (
              `Pay $${totalAmount.toFixed(2)} via ${paymentMethod === 'stripe' ? 'Stripe' : 'bKash'}`
            )}
          </button>
          
          <p className="payment-secure">Secure payment processed via Stripe</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;