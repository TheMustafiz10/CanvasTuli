
import React, { useState } from 'react';
import './CSS/AuctionPage.css';

const BidPanel = ({ currentBid, minIncrement, onPlaceBid, isLive, isAuthenticated, auctionEnded }) => {
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');
  
  const minimumBid = currentBid + minIncrement;

  const quickBids = [50, 100, 250, 500];

  const handleQuickBid = (amount) => {
    const newBid = currentBid + amount;
    setBidAmount(newBid.toString());
    setError('');
  };

  const handleSubmit = () => {
    const amount = parseFloat(bidAmount);
    
    // Validate bid amount
    if (!bidAmount || isNaN(amount)) {
      setError('Please enter a valid bid amount');
      return;
    }
    
    if (amount < minimumBid) {
      setError(`Bid must be at least $${minimumBid.toLocaleString()}`);
      return;
    }
    
    setError('');
    onPlaceBid(amount);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setBidAmount(value);
    setError('');
  };

  return (
    <div className="bid-panel">
      <div className="bid-panel-header">
        <div className="minimum-bid">
          Minimum next bid: <span>${minimumBid.toLocaleString()}</span>
        </div>
        {isLive && (
          <div className="bid-status-live">
            <span className="live-dot"></span> Live
          </div>
        )}
      </div>

      <div className="bid-input-group">
        <div className="bid-input-wrapper">
          <span className="currency">$</span>
          <input
            type="number"
            value={bidAmount}
            onChange={handleInputChange}
            placeholder={minimumBid.toString()}
            min={minimumBid}
            step="1"
            disabled={!isLive || !isAuthenticated || auctionEnded}
          />
        </div>
        <button 
          className="btn-place-bid"
          onClick={handleSubmit}
          disabled={!isLive || !isAuthenticated || !bidAmount || parseFloat(bidAmount) < minimumBid || auctionEnded}
        >
          {auctionEnded ? 'Auction Ended' : 'Place Bid'}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bid-error-message">
          ⚠️ {error}
        </div>
      )}

      <div className="quick-bids">
        <span className="quick-bids-label">Quick Bids:</span>
        {quickBids.map((amount) => (
          <button
            key={amount}
            className="quick-bid-btn"
            onClick={() => handleQuickBid(amount)}
            disabled={!isLive || !isAuthenticated || auctionEnded}
          >
            +${amount}
          </button>
        ))}
      </div>

      {!isAuthenticated && (
        <div className="login-prompt">
          <p>🔒 Please log in to place a bid</p>
        </div>
      )}

      {auctionEnded && (
        <div className="auction-status-message ended">
          ⛔ This auction has ended
        </div>
      )}

      {!isLive && !auctionEnded && (
        <div className="auction-status-message scheduled">
          ⏳ This auction is not yet live
        </div>
      )}
    </div>
  );
};

export default BidPanel;