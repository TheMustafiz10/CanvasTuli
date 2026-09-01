


import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { Search, Filter, X } from 'lucide-react';
import './CSS/BiddingPage.css';

const BiddingPage = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const socket = useSocket();
  const location = useLocation();

  // Read search query from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [location.search]);

  useEffect(() => {
    fetchAuctions();
    
    if (socket) {
      socket.on('auction-created', () => {
        fetchAuctions();
      });
      
      socket.on('auction-status-changed', () => {
        fetchAuctions();
      });
      
      socket.on('auction-ended', () => {
        fetchAuctions();
      });
      
      return () => {
        socket.off('auction-created');
        socket.off('auction-status-changed');
        socket.off('auction-ended');
      };
    }
  }, [socket]);

  const fetchAuctions = async () => {
    try {
      const response = await api.get('/auctions');
      setAuctions(response.data);
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      live: { class: 'badge-live', text: '🔴 Live' },
      scheduled: { class: 'badge-scheduled', text: '⏳ Scheduled' },
      ended: { class: 'badge-ended', text: '⛔ Ended' },
      cancelled: { class: 'badge-cancelled', text: '❌ Cancelled' }
    };
    return badges[status] || { class: 'badge-default', text: status };
  };

  // Filter auctions
  const filteredAuctions = auctions.filter(auction => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      auction.artworkId?.title?.toLowerCase().includes(searchLower) ||
      auction.artistId?.fullName?.toLowerCase().includes(searchLower) ||
      auction.artworkId?.category?.toLowerCase().includes(searchLower) ||
      auction.artworkId?.medium?.toLowerCase().includes(searchLower) ||
      auction.artworkId?.description?.toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || auction.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  if (loading) return <div className="loading">Loading auctions...</div>;

  return (
    <div className="bidding-page">
      <div className="bidding-header">
        <h1>Live Auctions</h1>
        <p>Discover and bid on amazing artworks</p>
      </div>

      {/* Search and Filters */}
      <div className="search-filter-container">
        <div className="search-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search auctions, artworks, artists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={clearSearch}>
              <X size={18} />
            </button>
          )}
        </div>

        <div className="filter-wrapper">
          <Filter size={20} className="filter-icon" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Auctions</option>
            <option value="live">🔴 Live</option>
            <option value="scheduled">⏳ Scheduled</option>
            <option value="ended">⛔ Ended</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="results-count">
        Found {filteredAuctions.length} auction{filteredAuctions.length !== 1 ? 's' : ''}
      </div>

      {/* Auction Grid */}
      <div className="auctions-grid">
        {filteredAuctions.length === 0 ? (
          <div className="empty-state">
            <p>No auctions found matching your criteria</p>
            <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); }} className="btn-reset">
              Reset Filters
            </button>
          </div>
        ) : (
          filteredAuctions.map((auction) => {
            const status = getStatusBadge(auction.status);
            return (
              <Link 
                to={`/auction/${auction._id}`} 
                key={auction._id} 
                className="auction-card-link"
              >
                <div className="auction-card">
                  <img 
                    src={auction.artworkId?.imageUrl || 'https://via.placeholder.com/300'} 
                    alt={auction.artworkId?.title}
                    className="auction-image"
                  />
                  <div className="auction-card-content">
                    <h3>{auction.artworkId?.title || 'Untitled'}</h3>
                    <p className="artist-name">By {auction.artistId?.fullName || 'Unknown'}</p>
                    <div className="auction-card-stats">
                      <span className="current-bid">
                        ${auction.currentHighestBid?.toLocaleString() || '0'}
                      </span>
                      <span className="bid-count">{auction.totalBids || 0} bids</span>
                    </div>
                    <div className={`badge ${status.class}`}>
                      {status.text}
                    </div>
                    <div className="auction-time">
                      {auction.status === 'live' ? (
                        <span>Ends: {new Date(auction.endTime).toLocaleString()}</span>
                      ) : auction.status === 'scheduled' ? (
                        <span>Starts: {new Date(auction.startTime).toLocaleString()}</span>
                      ) : (
                        <span>Ended</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
};

export default BiddingPage;