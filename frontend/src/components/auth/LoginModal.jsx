



import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './CSS/AuthModal.css';

const LoginModal = ({ isOpen, onClose, returnUrl }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('customer');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (isRegister) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      result = await register({ email, password, fullName, role });
    } else {
      result = await login(email, password);
    }

    if (result.success) {
      onClose();
      if (result.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (result.user.role === 'artist') {
        navigate('/artist/dashboard');
      } else if (returnUrl) {
        navigate(returnUrl);
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error || 'Authentication failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>×</button>
        
        <div className="auth-modal-header">
          <h2>{isRegister ? 'Create Account' : 'Login Required'}</h2>
          <p>{isRegister ? 'Join the art auction community' : 'Please log in to participate in live bidding'}</p>
        </div>

        {error && (
          <div className="auth-error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label>I want to</label>
                <div className="role-selector">
                  <button
                    type="button"
                    className={`role-option ${role === 'customer' ? 'active' : ''}`}
                    onClick={() => setRole('customer')}
                  >
                    <i className="fas fa-user"></i> Bid on Art
                  </button>
                  <button
                    type="button"
                    className={`role-option ${role === 'artist' ? 'active' : ''}`}
                    onClick={() => setRole('artist')}
                  >
                    <i className="fas fa-paint-brush"></i> Sell Art
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={isRegister ? "Min 6 characters" : "Enter your password"}
              minLength={isRegister ? "6" : undefined}
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                {isRegister ? 'Creating Account...' : 'Logging In...'}
              </>
            ) : (
              isRegister ? 'Create Account' : 'Log In'
            )}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button 
              className="auth-switch-btn"
              onClick={() => {
                setIsRegister(!isRegister);
                setError('');
              }}
              type="button"
            >
              {isRegister ? 'Log In' : 'Create Account'}
            </button>
          </p>
        </div>

        <button className="auth-continue-browsing" onClick={onClose}>
          Continue Browsing
        </button>
      </div>
    </div>
  );
};

export default LoginModal;