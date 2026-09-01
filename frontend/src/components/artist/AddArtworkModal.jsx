



import React, { useState } from 'react';
import api from '../../services/api';
import { X, Upload, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';
import './CSS/AddArtworkModal.css';

const AddArtworkModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    fixedPrice: '',
    quantity: 1,
    imageUrl: '',
    medium: '',
    dimensions: '',
    year: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const categories = [
    'Painting', 'Sculpture', 'Photography', 'Digital Art', 
    'Sketches', 'Calligraphy', 'Mixed Media', 'Prints', 
    'Handcrafted', 'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'quantity') {
      // Allow only whole numbers
      if (value === '' || /^[1-9]\d*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      return;
    }
    
    if (name === 'fixedPrice') {
      // Allow decimal numbers
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
      return;
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuantityChange = (delta) => {
    const currentQty = parseInt(formData.quantity) || 1;
    const newQuantity = Math.max(1, currentQty + delta);
    setFormData(prev => ({ ...prev, quantity: newQuantity }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'canvas_uploads');

    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: 'POST', body: formData }
      );
      const data = await response.json();
      
      if (data.secure_url) {
        setFormData(prev => ({ ...prev, imageUrl: data.secure_url }));
        toast.success('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };





  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.fixedPrice || !formData.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    const quantityNum = parseInt(formData.quantity);
    if (isNaN(quantityNum) || quantityNum < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    const priceNum = parseFloat(formData.fixedPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setLoading(true);
    try {
      await api.post('/artworks/create-fixed', {
        ...formData,
        quantity: quantityNum,
        fixedPrice: priceNum
      });
      toast.success('Artwork added successfully!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating artwork:', error);
      toast.error(error.response?.data?.error || 'Failed to create artwork');
    } finally {
      setLoading(false);
    }
  };


  
  if (!isOpen) return null;

  return (
    <div className="add-artwork-modal-overlay" onClick={onClose}>
      <div className="add-artwork-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Artwork</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-artwork-form">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter artwork title"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Describe your artwork"
            />
          </div>

          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Fixed Price ($) *</label>
            <input
              type="number"
              name="fixedPrice"
              value={formData.fixedPrice}
              onChange={handleChange}
              required
              min="1"
              step="1"
              placeholder="1.00"
            />
          </div>

          {/* ✅ Quantity Section - Fixed Layout */}
          <div className="form-group">
            <label>Available Quantity *</label>
            <div className="quantity-control-wrapper">
              <div className="quantity-control">
                <button 
                  type="button" 
                  className="qty-btn"
                  onClick={() => handleQuantityChange(-1)}
                  disabled={parseInt(formData.quantity) <= 1}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  className="qty-input"
                />
                <button 
                  type="button" 
                  className="qty-btn"
                  onClick={() => handleQuantityChange(1)}
                >
                  <Plus size={16} />
                </button>
              </div>
              <small className="form-hint">Quantity must be a whole number</small>
            </div>
          </div>

          <div className="form-group">
            <label>Artwork Image</label>
            <div className="image-upload-container">
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
            {formData.imageUrl && (
              <div className="image-preview">
                <img src={formData.imageUrl} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Medium</label>
              <input
                type="text"
                name="medium"
                value={formData.medium}
                onChange={handleChange}
                placeholder="e.g., Oil on Canvas"
              />
            </div>
            <div className="form-group">
              <label>Dimensions</label>
              <input
                type="text"
                name="dimensions"
                value={formData.dimensions}
                onChange={handleChange}
                placeholder="e.g., 24x36 inches"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Year</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              placeholder="e.g., 2024"
            />
          </div>

          <button type="submit" className="btn-submit" disabled={loading || uploadingImage}>
            {loading ? 'Adding...' : 'Add Artwork'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddArtworkModal;
