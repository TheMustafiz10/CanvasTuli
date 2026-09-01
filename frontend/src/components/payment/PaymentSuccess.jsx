


import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import './CSS/PaymentPage.css';




const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');
    
    if (sessionId) {
      toast.success('🎉 Payment successful!');
    }
  }, [location]);




  return (
    <div className="payment-success">
      <CheckCircle size={64} color="#27ae60" />
      <h2>Payment Successful! ✅</h2>
      <p>Your payment has been confirmed</p>
      <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
    </div>
  );
};




export default PaymentSuccess;