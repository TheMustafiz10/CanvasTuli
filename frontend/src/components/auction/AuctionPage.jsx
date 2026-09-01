


import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import LoginModal from '../auth/LoginModal';
import BidPanel from './BidPanel';
import BidHistory from './BidHistory';
import CountdownTimer from './CountdownTimer';
import AuctionStatus from './AuctionStatus';
import ArtworkDetails from './ArtworkDetails';
import toast from 'react-hot-toast';
import './CSS/AuctionPage.css';

const AuctionPage = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const socket = useSocket();
  const fetchInterval = useRef(null);
  
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidCount, setBidCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showBidConfirmation, setShowBidConfirmation] = useState(false);
  const [showOwnerErrorModal, setShowOwnerErrorModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [auctionEnded, setAuctionEnded] = useState(false);
  const [error, setError] = useState(null);
  const [bidSuccess, setBidSuccess] = useState(false);




  // Fetch auction data
  const fetchAuctionData = async () => {
    try {
      const response = await api.get(`/auctions/${auctionId}`);
      const auctionData = response.data.auction;
      
      // Update status based on current time
      const now = new Date();
      const endTime = new Date(auctionData.endTime);
      const startTime = new Date(auctionData.startTime);
      
      let status = auctionData.status;
      if (status !== 'cancelled' && status !== 'ended' && status !== 'accepted') {
        if (now > endTime) {
          status = 'ended';
        } else if (now >= startTime && now <= endTime) {
          status = 'live';
        } else if (now < startTime) {
          status = 'scheduled';
        }
      }
      
      setAuction({ ...auctionData, status });
      setBids(response.data.recentBids || []);
      setBidCount(response.data.bidCount || 0);
      setError(null);
      
      if (status === 'ended' || status === 'accepted') {
        setAuctionEnded(true);
        if (fetchInterval.current) {
          clearInterval(fetchInterval.current);
          fetchInterval.current = null;
        }
      }
    } catch (error) {
      console.error('Error fetching auction:', error);
      setError('Failed to load auction. Please try again.');
      if (error.response?.status === 404) {
        navigate('/bidding');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctionData();

    fetchInterval.current = setInterval(() => {
      fetchAuctionData();
    }, 30000);
    
    if (socket) {
      socket.emit('join-auction', auctionId);
      
      socket.on('new-bid', (data) => {
        setBids(prev => [data.bid, ...prev]);
        setAuction(prev => ({
          ...prev,
          currentHighestBid: data.auction.currentHighestBid,
          totalBids: data.auction.totalBids
        }));
        setBidCount(prev => prev + 1);
      });

      socket.on('auction-ended', (data) => {
        setAuction(prev => ({ ...prev, status: 'ended' }));
        setAuctionEnded(true);
        if (fetchInterval.current) {
          clearInterval(fetchInterval.current);
          fetchInterval.current = null;
        }
      });

      socket.on('auction-status-changed', (data) => {
        if (data.auctionId === auctionId) {
          fetchAuctionData();
        }
      });

      socket.on('auction-extended', (data) => {
        if (data.auctionId === auctionId) {
          fetchAuctionData();
        }
      });

      socket.on('bid-accepted', (data) => {
        if (data.auctionId === auctionId) {
          fetchAuctionData();
          toast.success('🎉 A bid has been accepted!');
        }
      });

      return () => {
        socket.emit('leave-auction', auctionId);
        socket.off('new-bid');
        socket.off('auction-ended');
        socket.off('auction-status-changed');
        socket.off('auction-extended');
        socket.off('bid-accepted');
        if (fetchInterval.current) {
          clearInterval(fetchInterval.current);
          fetchInterval.current = null;
        }
      };
    }
  }, [auctionId, socket]);


  // Check if current user is the artist/owner
  const isArtist = user?.role === 'artist' && auction?.artistId?._id === user?._id;

  // Handle Place Bid with Owner Check
  const handlePlaceBid = (amount) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // Check if user is the artist/owner
    if (isArtist) {
      setShowOwnerErrorModal(true);
      return;
    }

    if (auction?.status !== 'live') {
      toast.error('This auction is not currently live');
      return;
    }

    // Check if auction already accepted a bid
    if (auction?.acceptedBidId) {
      toast.error('This auction has already accepted a bid');
      return;
    }

    setBidAmount(amount);
    setShowBidConfirmation(true);
  };

  // Confirm Bid with Backend Validation
  const confirmBid = async () => {
    try {
      await api.post(`/bids/place/${auctionId}`, {
        amount: parseFloat(bidAmount)
      });
  
      // Show success toast
      toast.success('🎉 Bid placed successfully!');
      setBidSuccess(true);
      
      setShowBidConfirmation(false);
      setBidAmount('');
      
      // Refresh auction data
      setTimeout(() => {
        fetchAuctionData();
        setBidSuccess(false);
      }, 500);
      
    } catch (error) {
      console.error('Error placing bid:', error);
      
      // Handle owner error from backend
      if (error.response?.data?.error?.includes('Artist cannot bid')) {
        setShowOwnerErrorModal(true);
        setShowBidConfirmation(false);
      } else {
        toast.error(error.response?.data?.error || 'Failed to place bid. Please try again.');
      }
    }
  };

  // Handle Accept Bid
  const handleAcceptBid = async (bidId) => {
    if (!window.confirm('Accept this bid? This will end the auction immediately.')) {
      return;
    }

    try {
      await api.put(`/auctions/${auctionId}/accept-bid`, { bidId });
      toast.success('✅ Bid accepted! The auction has ended.');
      fetchAuctionData();
    } catch (error) {
      console.error('Error accepting bid:', error);
      toast.error(error.response?.data?.error || 'Failed to accept bid');
    }
  };




  // Close Owner Error Modal
  const closeOwnerErrorModal = () => {
    setShowOwnerErrorModal(false);
    setBidAmount('');
  };

  // Handle refresh
  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading) return <div className="loading">Loading auction...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!auction) return <div className="error">Auction not found</div>;

  const currentBid = auction?.currentHighestBid ?? auction?.startingPrice ?? 0;
  const artwork = auction?.artworkId ?? { 
    title: 'Untitled', 
    imageUrl: 'https://via.placeholder.com/600x400', 
    description: 'No description available' 
  };
  const artist = auction?.artistId ?? { fullName: 'Unknown Artist' };





  return (
    <div className="auction-page">
      {auctionEnded && (
        <div className="auction-ended-banner">
          {auction.winnerId && (
            <p>Winner: {auction.winnerId?.fullName || 'Unknown'} with ${auction.winningBid?.toLocaleString()}</p>
          )}
          {auction.acceptedBidId && (
            <p>Bid accepted by artist</p>
          )}
        </div>
      )}
      
      <div className="auction-container">
        <div className="auction-main">
          <ArtworkDetails artwork={artwork} artist={artist} />
          
          <div className="auction-header">
            <AuctionStatus status={auction.status || 'scheduled'} />
            <CountdownTimer endTime={auction.endTime} />
          </div>

          <div className="bid-section">
            <div className="current-bid">
              <div className="bid-label">Current Bid</div>
              <div className="bid-amount">
                <span className="currency">$</span>
                {currentBid.toLocaleString()}
              </div>
              <div className="bid-stats">
                {bidCount} bids · {auction?.totalBids || 0} total bids
              </div>
            </div>



            {/* Show bid panel only if not artist */}
            {!isArtist ? (
              <BidPanel
                currentBid={currentBid}
                minIncrement={auction?.minimumBidIncrement || 50}
                onPlaceBid={handlePlaceBid}
                isLive={auction?.status === 'live'}
                isAuthenticated={isAuthenticated}
                auctionEnded={auctionEnded || auction?.status === 'ended' || auction?.status === 'accepted'}
              />
            ) : (
              <div className="artist-bid-message">
                <p>🎨 You are the owner of this artwork</p>
                <p>You cannot bid on your own auction</p>
              </div>
            )}
          </div>

          <BidHistory 
            bids={bids} 
            auction={auction} 
            isAuthenticated={isAuthenticated}
            user={user}
            onAcceptBid={handleAcceptBid} 
          />
        </div>
      </div>

      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        returnUrl={`/auction/${auctionId}`}
      />

      {/* Confirm Bid Confirmation Modal */}
      {showBidConfirmation && (
        <div className="confirmation-modal">
          <div className="confirmation-content">
            <h3>Confirm Bid</h3>
            <p>You are about to place a bid of ${parseFloat(bidAmount).toLocaleString()}</p>
            <div className="confirmation-actions">
              <button className="btn-cancel" onClick={() => setShowBidConfirmation(false)}>
                Cancel
              </button>
              <button className="btn-confirm" onClick={confirmBid}>
                Confirm Bid
              </button>
            </div>
          </div>
        </div>
      )}

      {/* wner Error Modal */}
      {showOwnerErrorModal && (
        <div className="owner-error-modal-overlay" onClick={closeOwnerErrorModal}>
          <div className="owner-error-modal" onClick={(e) => e.stopPropagation()}>
            <div className="owner-error-icon">🚫</div>
            <h3>You cannot place a bid</h3>
            <p>You are the owner of this auction. Artists cannot bid on their own artworks.</p>
            <button className="owner-error-btn" onClick={closeOwnerErrorModal}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};



export default AuctionPage;