



// src/components/cart/CartPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import './CSS/CartPage.css';

const CartPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState({ items: [], totalItems: 0 });
  const [subtotal, setSubtotal] = useState(0);
  const [platformFee, setPlatformFee] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [updatingItem, setUpdatingItem] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchCart();
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      setCart(response.data.cart);
      setSubtotal(response.data.subtotal);
      setPlatformFee(response.data.platformFee);
      setTotal(response.data.total);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };


  

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    

    
    const item = cart.items.find(i => i._id === itemId);
    if (!item) return;


    
    if (newQuantity > item.availableQuantity) {
      toast.error(`Only ${item.availableQuantity} units available`);
      return;
    }

    // Optimistic update - update UI immediately
    setUpdatingItem(itemId);
    



    // Update local state immediately (no waiting for API)
    const updatedItems = cart.items.map(i => {
      if (i._id === itemId) {
        const newSubtotal = item.price * newQuantity;
        return { ...i, quantity: newQuantity, subtotal: newSubtotal };
      }
      return i;
    });



    let newSubtotal = 0;
    updatedItems.forEach(i => {
      newSubtotal += i.price * i.quantity;
    });
    const newPlatformFee = Math.round(newSubtotal * 0.05 * 100) / 100;
    const newTotal = Math.round((newSubtotal + newPlatformFee) * 100) / 100;

    // Update state immediately (UI updates instantly)
    setCart({ ...cart, items: updatedItems });
    setSubtotal(Math.round(newSubtotal * 100) / 100);
    setPlatformFee(newPlatformFee);
    setTotal(newTotal);





    
    try {
      await api.put(`/cart/item/${itemId}`, { quantity: newQuantity });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update quantity');
      fetchCart();
    } finally {
      setUpdatingItem(null);
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm('Remove this item from cart?')) return;
    
    // Optimistic update - remove item immediately
    const updatedItems = cart.items.filter(i => i._id !== itemId);
    let newSubtotal = 0;
    updatedItems.forEach(i => {
      newSubtotal += i.price * i.quantity;
    });
    const newPlatformFee = Math.round(newSubtotal * 0.05 * 100) / 100;
    const newTotal = Math.round((newSubtotal + newPlatformFee) * 100) / 100;

    setCart({ ...cart, items: updatedItems });
    setSubtotal(Math.round(newSubtotal * 100) / 100);
    setPlatformFee(newPlatformFee);
    setTotal(newTotal);

    try {
      await api.delete(`/cart/item/${itemId}`);
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
      fetchCart(); 
    }
  };

  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setCheckoutLoading(true);
    try {
      const orderResponse = await api.post('/orders/fixed/create');
      const orderId = orderResponse.data.order._id;
      
      const checkoutResponse = paymentMethod === 'bkash'
        ? await api.post('/payments/bkash/create', { orderId })
        : await api.post('/orders/fixed/checkout', { orderId });
      
      const paymentUrl = checkoutResponse.data.url || checkoutResponse.data.paymentUrl;
      if (!paymentUrl) {
        throw new Error('Payment gateway URL was not returned');
      }
      window.location.assign(paymentUrl);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.error || 'Failed to proceed to checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading cart...</div>;
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <Link to="/collections" className="back-link">
            <ArrowLeft size={20} />
            Continue Shopping
          </Link>
          <h1>My Cart</h1>
          <span className="cart-count">{cart.totalItems} items</span>
        </div>

        {cart.items.length === 0 ? (
          <div className="empty-cart">
            <ShoppingCart size={64} />
            <h2>Your cart is empty</h2>
            <p>Browse our collection and add some amazing artworks!</p>
            <Link to="/collections" className="btn-browse">
              Browse Artworks
            </Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cart.items.map((item) => (
                <div key={item._id} className="cart-item">
                  <img
                    src={item.imageUrl || 'https://via.placeholder.com/100'}
                    alt={item.title}
                    className="cart-item-image"
                  />
                  <div className="cart-item-details">
                    <h3>{item.title}</h3>
                    <p className="item-price">${item.price.toFixed(2)}</p>
                    <p className="item-available">Available: {item.availableQuantity}</p>
                  </div>
                  <div className="cart-item-controls">
                    <div className="quantity-control">
                      <button
                        className="qty-btn"
                        onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1 || updatingItem === item._id}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                        disabled={item.quantity >= item.availableQuantity || updatingItem === item._id}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <p className="item-subtotal">${item.subtotal.toFixed(2)}</p>
                    <button
                      className="btn-remove"
                      onClick={() => handleRemoveItem(item._id)}
                      disabled={updatingItem === item._id}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal ({cart.totalItems} items)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Platform Fee (5%)</span>
                <span>${platformFee.toFixed(2)}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="payment-method-options">
                <button
                  type="button"
                  className={`payment-method-btn ${paymentMethod === 'stripe' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('stripe')}
                >
                  <CreditCard size={18} /> Stripe
                </button>
                <button
                  type="button"
                  className={`payment-method-btn ${paymentMethod === 'bkash' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('bkash')}
                >
                  <span className="bkash-logo">bKash</span>
                </button>
              </div>
              <button
                className="btn-checkout"
                onClick={handleCheckout}
                disabled={checkoutLoading || cart.items.length === 0}
              >
                <CreditCard size={20} />
                {checkoutLoading ? 'Processing...' : `Pay with ${paymentMethod === 'bkash' ? 'bKash' : 'Stripe'}`}
              </button>
              <p className="payment-note">Secure payment via Stripe or bKash</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;