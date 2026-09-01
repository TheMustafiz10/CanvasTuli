


import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './CSS/RegisterModal.css';

const RegisterModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

    if (result.success) {
      onClose();
      // Redirect based on role
      if (result.user.role === 'artist') {
        navigate('/artist/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="register-modal-overlay" onClick={onClose}>
      <div className="register-modal" onClick={(e) => e.stopPropagation()}>
        <button className="register-modal-close" onClick={onClose}>×</button>
        
        <div className="register-modal-header">
          <h2>Create Account</h2>
          <p>Join the art auction community</p>
        </div>

        {error && (
          <div className="register-error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Min 6 characters"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>

          <div className="form-group">
            <label>I want to</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-option ${formData.role === 'customer' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'customer' }))}
              >
                <i className="fas fa-user"></i>
                Bid on Art
              </button>
              <button
                type="button"
                className={`role-option ${formData.role === 'artist' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, role: 'artist' }))}
              >
                <i className="fas fa-paint-brush"></i>
                Sell Art
              </button>
            </div>
          </div>

          <button type="submit" className="register-submit-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="register-switch">
          <p>
            Already have an account?
            <button 
              className="register-switch-btn"
              onClick={onClose}
            >
              Sign In
            </button>
          </p>
        </div>

        <button className="register-continue-browsing" onClick={onClose}>
          Continue Browsing
        </button>
      </div>
    </div>
  );
};

export default RegisterModal;