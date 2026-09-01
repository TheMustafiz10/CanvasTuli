

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Search, X, User, Palette, Camera, Laptop, Pencil, Box } from 'lucide-react';
import './CSS/ArtistsPage.css';

const ArtistsPage = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const response = await api.get('/auth/artists');
      setArtists(response.data.users || []);
    } catch (error) {
      console.error('Error fetching artists:', error);
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredArtists = artists.filter(artist =>
    artist.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.artistBio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.artistPortfolio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  //  Get specialty icon based on artist's artwork medium
  const getArtistIcon = (medium) => {
    const icons = {
      'Painting': <Palette size={20} />,
      'Photography': <Camera size={20} />,
      'Sculpture': <Box size={20} />,
      'Digital Art': <Laptop size={20} />,
      'Sketch': <Pencil size={20} />,
    };
    return icons[medium] || <User size={20} />;
  };

  if (loading) return <div className="loading">Loading artists...</div>;

  return (
    <div className="artists-page">
      <div className="artists-header">
        <h1>Our Artists</h1>
        <p>Discover talented artists and their beautiful creations</p>
        <div className="search-wrapper">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Search artists by name, bio, or portfolio..."
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
      </div>

      <div className="artists-stats">
        <span>{filteredArtists.length} artist{filteredArtists.length !== 1 ? 's' : ''} found</span>
      </div>

      <div className="artists-grid">
        {filteredArtists.length === 0 ? (
          <div className="empty-state">
            <User size={48} className="empty-icon" />
            <p>No artists found matching your search</p>
            <button onClick={clearSearch} className="btn-reset">
              Clear Search
            </button>
          </div>
        ) : (
          filteredArtists.map((artist) => (
            <div key={artist._id} className="artist-card">
              <div className="artist-avatar" style={{
                background: `linear-gradient(135deg, ${getArtistColor(artist.fullName || '')}, ${getArtistColor2(artist.fullName || '')})`
              }}>
                {artist.fullName?.charAt(0) || 'A'}
              </div>
              <h3>{artist.fullName || 'Unknown Artist'}</h3>
              <p className="artist-email">{artist.email}</p>
              <p className="artist-role">
                <span className="role-badge">{artist.role?.toUpperCase() || 'ARTIST'}</span>
              </p>
              <p className="artist-bio">{artist.artistBio || 'No bio available'}</p>
              {artist.artistPortfolio && (
                <a href={artist.artistPortfolio} target="_blank" rel="noopener noreferrer" className="portfolio-link">
                  View Portfolio
                </a>
              )}
              <div className="artist-card-actions">
                <Link to={`/artists/${artist._id}`} className="btn-view-artist">
                  View Profile
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};



// Helper functions for consistent avatar colors
const getArtistColor = (name) => {
  const colors = ['#b45f3a', '#8e44ad', '#2980b9', '#27ae60', '#f39c12', '#e74c3c', '#1abc9c'];
  const index = name.length % colors.length;
  return colors[index];
};

const getArtistColor2 = (name) => {
  const colors = ['#8a4528', '#6c3483', '#1a5276', '#1e8449', '#d68910', '#b03a2e', '#148f77'];
  const index = name.length % colors.length;
  return colors[index];
};

export default ArtistsPage;