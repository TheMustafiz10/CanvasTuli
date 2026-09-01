/* eslint-disable no-unused-vars */



import React from 'react';
import { Link } from 'react-router-dom';
import Footer from './footer';
import './CSS/homepage.css';

// Dummy artwork data with online images
const featuredArtworks = [
  { id: 1, title: 'Golden Horizon', artist: 'Elena V.', price: '$340', img: 'https://picsum.photos/id/1015/400/300' },
  { id: 2, title: 'Whispering Pines', artist: 'Marcus T.', price: '$280', img: 'https://picsum.photos/id/1025/400/300' },
  { id: 3, title: 'Urban Veil', artist: 'Sophia L.', price: '$490', img: 'https://picsum.photos/id/1039/400/300' },
  { id: 4, title: 'Celestial Flow', artist: 'James K.', price: '$610', img: 'https://picsum.photos/id/1044/400/300' },
];

const trendingArtworks = [
  { id: 5, title: 'Neon Dream', artist: 'Lina R.', price: '$220', img: 'https://picsum.photos/id/1055/400/300' },
  { id: 6, title: 'Echoes of Time', artist: 'David M.', price: '$370', img: 'https://picsum.photos/id/1066/400/300' },
  { id: 7, title: 'Botanical Rhapsody', artist: 'Clara W.', price: '$430', img: 'https://picsum.photos/id/1074/400/300' },
  { id: 8, title: 'Abstract Motion', artist: 'Rafael S.', price: '$510', img: 'https://picsum.photos/id/1084/400/300' },
];

const artists = [
  { name: 'Amara O.', avatar: 'https://i.pravatar.cc/150?img=1', specialty: 'Oil Painting' },
  { name: 'Ben C.', avatar: 'https://i.pravatar.cc/150?img=2', specialty: 'Sculpture' },
  { name: 'Chloe Y.', avatar: 'https://i.pravatar.cc/150?img=3', specialty: 'Digital Art' },
  { name: 'David K.', avatar: 'https://i.pravatar.cc/150?img=4', specialty: 'Photography' },
];

const Homepage = () => {
  return (
    <div className="homepage">

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Discover Art That Speaks to You</h1>
              <p>Explore original paintings, sculptures, and digital art from emerging and established artists.</p>
              <div className="hero-cta">
                <button className="btn btn-primary">Explore Art</button>
                <Link to="/collections" className="btn btn-outline">Sell Art</Link>
              </div>
            </div>
            <div className="hero-image">
              <img src="https://picsum.photos/id/1018/600/400" alt="Hero Artwork" />
            </div>
          </div>
        </section>

        {/* Featured Artwork */}
        <section className="section">
          <div className="section-container">
            <h2 className="section-title">Featured Artwork</h2>
            <div className="art-grid">
              {featuredArtworks.map((art) => (
                <div key={art.id} className="art-card">
                  <img src={art.img} alt={art.title} />
                  <div className="art-info">
                    <h4>{art.title}</h4>
                    <p>{art.artist}</p>
                    <span className="price">{art.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* Browse Categories */}
        <section className="section">
          <div className="section-container">
            <h2 className="section-title">Browse Categories</h2>
            <div className="categories">
              <span className="cat-tag">Paintings</span>
              <span className="cat-tag">Photography</span>
              <span className="cat-tag">Sculpture</span>
              <span className="cat-tag">Digital Art</span>
              <span className="cat-tag">Mixed Media</span>
              <span className="cat-tag">Prints</span>
            </div>
          </div>
        </section>

        {/* Meet the Artists */}
        <section className="section">
          <div className="section-container">
            <h2 className="section-title">Meet the Artists</h2>
            <div className="artist-grid">
              {artists.map((a, idx) => (
                <div key={idx} className="artist-card">
                  <img src={a.avatar} alt={a.name} />
                  <h4>{a.name}</h4>
                  <p>{a.specialty}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trending Now */}
        <section className="section">
          <div className="section-container">
            <h2 className="section-title">
              Trending Now <span className="badge-trend">🔥</span>
            </h2>
            <div className="art-grid">
              {trendingArtworks.map((art) => (
                <div key={art.id} className="art-card">
                  <img src={art.img} alt={art.title} />
                  <div className="art-info">
                    <h4>{art.title}</h4>
                    <p>{art.artist}</p>
                    <span className="price">{art.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Curated Collection Banner */}
        <section className="section curated-section">
          <div className="section-container">
            <div className="curated-banner">
              <div className="banner-content">
                <h3>Curated Collection</h3>
                <p>Handpicked masterpieces for the discerning collector.</p>
                <Link to="/collections" className="btn btn-light">View Collection</Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="section">
          <div className="section-container">
            <h2 className="section-title">How It Works</h2>
            <div className="steps">
              <div className="step">
                <i className="fas fa-compass"></i>
                <h4>Discover</h4>
                <p>Find art you love</p>
              </div>
              <div className="step">
                <i className="fas fa-shopping-bag"></i>
                <h4>Buy</h4>
                <p>Secure checkout</p>
              </div>
              <div className="step">
                <i className="fas fa-heart"></i>
                <h4>Enjoy</h4>
                <p>Love your collection</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="section">
          <div className="section-container">
            <h2 className="section-title">Why Choose Us</h2>
            <div className="features">
              <div>
                <i className="fas fa-shield-alt"></i>
                <span>Authenticity Guaranteed</span>
              </div>
              <div>
                <i className="fas fa-truck"></i>
                <span>Global Shipping</span>
              </div>
              <div>
                <i className="fas fa-hand-holding-heart"></i>
                <span>Support Independent Artists</span>
              </div>
            </div>
          </div>
        </section>

        {/* Art Stories / Stay Inspired */}
        <section className="section stay-inspired-section">
          <div className="section-container">
            <div className="stay-inspired">
              <h2>Stay Inspired</h2>
              <p>Subscribe for stories, new arrivals, and exclusive offers.</p>
              <div className="newsletter-big">
                <input type="email" placeholder="Your email" />
                <button>Subscribe</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Homepage;
