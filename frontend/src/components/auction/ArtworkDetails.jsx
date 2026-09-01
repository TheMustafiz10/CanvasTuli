


// src/components/auction/ArtworkDetails.jsx
import React from 'react';

const ArtworkDetails = ({ artwork, artist }) => {
  // ✅ Safe fallback values
  const safeArtwork = artwork || { 
    title: 'Untitled', 
    imageUrl: 'https://via.placeholder.com/600x400', 
    description: 'No description available',
    medium: 'N/A',
    dimensions: 'N/A',
    year: 'N/A',
    category: 'N/A'
  };
  
  const safeArtist = artist || { fullName: 'Unknown Artist' };

  return (
    <div className="artwork-details">
      <img 
        src={safeArtwork.imageUrl || 'https://via.placeholder.com/600x400'} 
        alt={safeArtwork.title || 'Artwork'}
        className="artwork-image"
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/600x400';
        }}
      />
      <div className="artwork-info">
        <h1 className="artwork-title">{safeArtwork.title || 'Untitled'}</h1>
        <p className="artwork-artist">
          By <span>{safeArtist.fullName || 'Unknown Artist'}</span>
        </p>
        <p className="artwork-description">{safeArtwork.description || 'No description available'}</p>
        <div className="artwork-meta">
          <span><strong>Medium:</strong> {safeArtwork.medium || 'N/A'}</span>
          <span><strong>Dimensions:</strong> {safeArtwork.dimensions || 'N/A'}</span>
          <span><strong>Year:</strong> {safeArtwork.year || 'N/A'}</span>
          <span><strong>Category:</strong> {safeArtwork.category || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
};

export default ArtworkDetails;