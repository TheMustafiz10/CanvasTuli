
import React from 'react';
import { useNavigate } from 'react-router-dom';

const BidHistory = ({ bids, auction, isAuthenticated, user, onAcceptBid }) => {
  const navigate = useNavigate();
  const isArtist = user?.role === 'artist' && auction?.artistId?._id === user?._id;
  const isLive = auction?.status === 'live';
  const isAccepted = auction?.acceptedBidId;
  const isWinner = auction?.winnerId?._id === user?._id;
  const isAcceptedStatus = auction?.status === 'accepted' || auction?.status === 'ended';

  const handlePayNow = () => {
    // Navigate to payment page with auction ID
    navigate(`/payment/${auction?._id}`);
  };

  return (
    <div className="bid-history">
      <h3>
        Bid History
        <span>{bids.length} bids</span>
      </h3>
      <div className="bid-list">
        {bids.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b5a4a', padding: '1rem 0' }}>
            No bids yet. Be the first!
          </p>
        ) : (
          bids.map((bid, index) => {
            const isAcceptedBid = auction?.acceptedBidId === bid._id;
            return (
              <div key={index} className={`bid-item ${index === 0 ? 'highlight' : ''} ${isAcceptedBid ? 'accepted' : ''}`}>
                <span className="bidder">{bid.bidderId?.fullName || 'Anonymous'}</span>
                <span className="bid-amount-bid">${bid.amount?.toLocaleString()}</span>
                <span className="bid-time">{new Date(bid.createdAt).toLocaleTimeString()}</span>
                
                {/* Accept Bid button - Only for artists on their own live auctions */}
                {isArtist && isLive && !isAccepted && (
                  <button 
                    className="btn-accept-bid"
                    onClick={() => onAcceptBid(bid._id)}
                  >
                    Accept Bid
                  </button>
                )}
                
                {/* Show accepted badge if this bid was accepted */}
                {isAcceptedBid && (
                  <span className="badge-accepted">Accepted</span>
                )}
              </div>
            );
          })
        )}
      </div>
      



      {/* Show "Pay Now" button for the winner */}
      {isAcceptedStatus && isWinner && (
        <div className="pay-now-container">
          <h4>🎉 You won this auction!</h4>
          <p>Your bid of <strong>${auction?.winningBid?.toLocaleString()}</strong> has been accepted.</p>
          <button className="btn-pay-now" onClick={handlePayNow}>
            💳 Pay Now
          </button>
        </div>
      )}
    </div>
  );
};

export default BidHistory;