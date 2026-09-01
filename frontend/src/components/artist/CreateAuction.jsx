









import React, { useState } from 'react';
import api from '../../services/api';
import './CSS/ArtistDashboard.css';

const CreateAuction = ({ artworks, onAuctionCreated }) => {
  const [formData, setFormData] = useState({
    artworkId: '',
    startingPrice: '',
    minimumBidIncrement: 50,
    endTime: '' 
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const now = new Date();
    const endTime = new Date(formData.endTime);

    // Check if artwork is selected
    if (!formData.artworkId) {
      newErrors.artworkId = 'Please select an artwork';
    }

    // Check starting price
    if (!formData.startingPrice || parseFloat(formData.startingPrice) <= 0) {
      newErrors.startingPrice = 'Starting price must be greater than 0';
    }

    // Check if end time is valid (must be at least 2 minutes from now)
    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    } else {
      const diffMs = endTime - now;
      const diffMin = diffMs / (1000 * 60);
      
      if (diffMin < 2) {
        newErrors.endTime = 'End time must be at least 2 minutes from now';
      }
      if (diffMin > 7 * 24 * 60) {
        newErrors.endTime = 'End time cannot exceed 7 days from now';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Start time is NOW, end time from form
      const now = new Date();
      const endDate = new Date(formData.endTime);
      
      const payload = {
        artworkId: formData.artworkId,
        startingPrice: parseFloat(formData.startingPrice),
        minimumBidIncrement: parseFloat(formData.minimumBidIncrement) || 50,
        startTime: now.toISOString(),  
        endTime: endDate.toISOString()
      };

      console.log('📤 Creating auction with payload:', payload);

      await api.post('/auctions/create', payload);
      
      // Callback to parent to refresh data and close modal
      onAuctionCreated();
      
      // Reset form
      setFormData({
        artworkId: '',
        startingPrice: '',
        minimumBidIncrement: 50,
        endTime: ''
      });
      setErrors({});
      
    } catch (error) {
      console.error('❌ Error creating auction:', error);
      console.error('Error response:', error.response?.data);
      alert(error.response?.data?.error || 'Failed to create auction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Get datetime 2 minutes from now for min attribute
  const getMinEndTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 2);
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="create-auction">
      <h2>Create New Auction</h2>
      
      {/* Show info that auction starts NOW */}
      <div className="auction-start-info">
        <p>🟢 Auction will start <strong>NOW</strong> (current time)</p>
      </div>
      
      <form onSubmit={handleSubmit} className="auction-form">
        <div className="form-group">
          <label>Select Artwork *</label>
          <select
            name="artworkId"
            value={formData.artworkId}
            onChange={handleChange}
            className={errors.artworkId ? 'error' : ''}
            required
          >
            <option value="">Select artwork</option>
            {artworks && artworks.filter(a => a.status === 'approved').map(artwork => (
              <option key={artwork._id} value={artwork._id}>
                {artwork.title} - {artwork.medium || 'N/A'}
              </option>
            ))}
          </select>
          {errors.artworkId && <span className="error-message">{errors.artworkId}</span>}
        </div>

        <div className="form-group">
          <label>Starting Price ($) *</label>
          <input
            type="number"
            name="startingPrice"
            value={formData.startingPrice}
            onChange={handleChange}
            className={errors.startingPrice ? 'error' : ''}
            required
            min="1"
            step="0.01"
            placeholder="Enter starting price"
          />
          {errors.startingPrice && <span className="error-message">{errors.startingPrice}</span>}
        </div>

        <div className="form-group">
          <label>Minimum Bid Increment ($)</label>
          <input
            type="number"
            name="minimumBidIncrement"
            value={formData.minimumBidIncrement}
            onChange={handleChange}
            required
            min="1"
            step="1"
            placeholder="Enter bid increment"
          />
        </div>

        {/* Only End Date & Time - Start is auto-set to NOW */}
        <div className="form-group">
          <label>End Date & Time *</label>
          <input
            type="datetime-local"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            className={errors.endTime ? 'error' : ''}
            required
            min={getMinEndTime()}
            step="60"
          />
          {errors.endTime && <span className="error-message">{errors.endTime}</span>}
          <small className="form-hint warning">
            ⚠️ Must be at least 2 minutes from now (max 7 days)
          </small>
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Auction'}
        </button>
      </form>
    </div>
  );
};

export default CreateAuction;