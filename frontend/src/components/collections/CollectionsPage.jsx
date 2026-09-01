




import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Search, Filter, ShoppingCart, Plus, Minus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import './CSS/CollectionsPage.css';

const CollectionsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState(['all']);
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartCount, setCartCount] = useState(0);





  useEffect(() => {
    fetchCategories();
    fetchArtworks();
    if (isAuthenticated) {
      fetchCartCount();
    }
  }, [isAuthenticated]);




  const fetchCategories = async () => {
    try {
      const response = await api.get('/artworks/fixed-price/categories');
      setCategories(['all', ...(response.data.categories || [])]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };


  const fetchArtworks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const response = await api.get(`/artworks/fixed-price?${params.toString()}`);
      console.log('Artworks response:', response.data); // ✅ Debug log
      
      setArtworks(response.data.artworks || []);
    } catch (error) {
      console.error('Error fetching artworks:', error);
      setError(error.response?.data?.error || 'Failed to load artworks');
      toast.error('Failed to load artworks');
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const response = await api.get('/cart/count');
      setCartCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching cart count:', error);
    }
  };



  // ✅ Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchArtworks();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory]);

  const handleAddToCart = async (artwork) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    setSelectedArtwork(artwork);
    setQuantity(1);
    setShowCartModal(true);
  };

  const confirmAddToCart = async () => {
    if (!selectedArtwork) return;
    
    setAddingToCart(true);
    try {
      await api.post('/cart/add', {
        artworkId: selectedArtwork._id,
        quantity: quantity
      });
      
      toast.success(`${selectedArtwork.title} added to cart! 🛒`);
      setShowCartModal(false);
      fetchCartCount();
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.error || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  if (loading) {
    return (
      <div className="collections-loading">
        <div className="spinner"></div>
        <p>Loading artworks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="collections-error">
        <h3>Error loading artworks</h3>
        <p>{error}</p>
        <button onClick={fetchArtworks} className="btn-retry">Retry</button>
      </div>
    );
  }

  return (
    <div className="collections-page">
      {/* Header */}
      <div className="collections-header">
        <div className="header-content">
          <h1>Art Collections</h1>
          <p>Discover and purchase amazing artworks from talented artists</p>
        </div>
        <div className="header-actions">
          <Link to="/cart" className="cart-link">
            <ShoppingCart size={24} />
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="filter-section">
        <div className="search-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search artworks by title, artist, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              <X size={18} />
            </button>
          )}
        </div>

        <div className="filter-wrapper">
          <Filter size={20} className="filter-icon" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
          {(searchTerm || selectedCategory !== 'all') && (
            <button className="clear-filters" onClick={handleClearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count">
        Found {artworks.length} artwork{artworks.length !== 1 ? 's' : ''}
      </div>

      {/* Artworks Grid */}
      <div className="artworks-grid">
        {artworks.length === 0 ? (
          <div className="empty-state">
            <p>No artworks found matching your criteria</p>
            <button onClick={handleClearFilters} className="btn-reset">
              Reset Filters
            </button>
          </div>
        ) : (
          artworks.map((artwork) => (
            <div key={artwork._id} className="artwork-card">
              <div className="artwork-image-wrapper">
                <img 
                  src={artwork.imageUrl || 'https://via.placeholder.com/400'} 
                  alt={artwork.title}
                  className="artwork-image"
                />
                {artwork.inStock ? (
                  <span className="stock-badge in-stock">In Stock</span>
                ) : (
                  <span className="stock-badge out-of-stock">Out of Stock</span>
                )}
              </div>
              
              <div className="artwork-content">
                <h3>{artwork.title}</h3>
                <p className="artwork-artist">By {artwork.artistId?.fullName || 'Unknown'}</p>
                <p className="artwork-category">{artwork.category || 'Uncategorized'}</p>
                
                <div className="artwork-meta">
                  <span className="artwork-price">${artwork.fixedPrice?.toFixed(2)}</span>
                  <span className="artwork-stock">{artwork.availableQuantity || 0} available</span>
                </div>
                
                <button 
                  className={`btn-add-to-cart ${!artwork.inStock ? 'disabled' : ''}`}
                  onClick={() => handleAddToCart(artwork)}
                  disabled={!artwork.inStock}
                >
                  <ShoppingCart size={18} />
                  {artwork.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Modal */}
      {showCartModal && selectedArtwork && (
        <div className="cart-modal-overlay" onClick={() => setShowCartModal(false)}>
          <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cart-modal-header">
              <h3>Add to Cart</h3>
              <button className="modal-close" onClick={() => setShowCartModal(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="cart-modal-content">
              <img 
                src={selectedArtwork.imageUrl || 'https://via.placeholder.com/150'} 
                alt={selectedArtwork.title}
                className="modal-artwork-image"
              />
              <h4>{selectedArtwork.title}</h4>
              <p className="modal-artwork-price">${selectedArtwork.fixedPrice?.toFixed(2)}</p>
              
              <div className="quantity-selector">
                <label>Quantity:</label>
                <div className="quantity-control">
                  <button 
                    className="qty-btn"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button 
                    className="qty-btn"
                    onClick={() => setQuantity(Math.min(selectedArtwork.availableQuantity || 10, quantity + 1))}
                    disabled={quantity >= (selectedArtwork.availableQuantity || 10)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="max-qty">Max: {selectedArtwork.availableQuantity || 0}</span>
              </div>
              
              <div className="modal-total">
                <span>Total:</span>
                <span>${(selectedArtwork.fixedPrice * quantity).toFixed(2)}</span>
              </div>
              
              <button 
                className="btn-confirm-cart"
                onClick={confirmAddToCart}
                disabled={addingToCart || quantity > (selectedArtwork.availableQuantity || 0)}
              >
                {addingToCart ? 'Adding...' : `Add ${quantity} to Cart`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollectionsPage;