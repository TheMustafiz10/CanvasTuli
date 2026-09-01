
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './CSS/SearchModal.css';

const SearchModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recentSearches, setRecentSearches] = useState(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    return saved ? JSON.parse(saved) : [
      'Abstract paintings',
      'Digital art',
      'Sculptures',
      'Modern art'
    ];
  });
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Save recent searches to localStorage
  useEffect(() => {
    localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Perform search
  const performSearch = async (query) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // Save to recent searches
      setRecentSearches(prev => [query, ...prev.filter(s => s !== query)].slice(0, 5));
      
      // Navigate to bidding page with search query
      navigate(`/bidding?search=${encodeURIComponent(query)}`);
      onClose();
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      performSearch(searchTerm);
    }
  };

  const handleRecentClick = (term) => {
    setSearchTerm(term);
    performSearch(term);
  };

  const handleCategoryClick = (category) => {
    performSearch(category);
  };

  // Clear all recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  if (!isOpen) return null;

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-header">
          <button className="search-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for artworks, artists, styles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button type="button" className="clear-search" onClick={() => setSearchTerm('')}>
                <i className="fas fa-times-circle"></i>
              </button>
            )}
          </div>
          <button type="submit" className="search-submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        
        <div className="search-suggestions">
          {recentSearches.length > 0 && (
            <div className="recent-searches">
              <div className="recent-header">
                <h4>Recent Searches</h4>
                <button className="clear-recent" onClick={clearRecentSearches}>
                  Clear All
                </button>
              </div>
              <div className="recent-tags">
                {recentSearches.map((term, idx) => (
                  <span key={idx} className="recent-tag" onClick={() => handleRecentClick(term)}>
                    <i className="fas fa-clock"></i> {term}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="popular-categories">
            <h4>Popular Categories</h4>
            <div className="category-grid">
              <span className="category-item" onClick={() => handleCategoryClick('Painting')}>
                <i className="fas fa-paint-brush"></i> Paintings
              </span>
              <span className="category-item" onClick={() => handleCategoryClick('Photography')}>
                <i className="fas fa-camera"></i> Photography
              </span>
              <span className="category-item" onClick={() => handleCategoryClick('Sculpture')}>
                <i className="fas fa-cube"></i> Sculptures
              </span>
              <span className="category-item" onClick={() => handleCategoryClick('Digital Art')}>
                <i className="fas fa-laptop"></i> Digital Art
              </span>
              <span className="category-item" onClick={() => handleCategoryClick('Sketch')}>
                <i className="fas fa-pencil-alt"></i> Sketches
              </span>
              <span className="category-item" onClick={() => handleCategoryClick('Handcrafted')}>
                <i className="fas fa-hand-holding-heart"></i> Handcrafted
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;