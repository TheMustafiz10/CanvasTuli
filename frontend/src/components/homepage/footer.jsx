/* eslint-disable no-unused-vars */



import React from 'react';
import './CSS/footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-col">
          <h4>Canvas Tulika</h4>
          <p>Where Creativity Meets Canvas</p>
          <div className="social-icons">
            <a href="#"><i className="fab fa-instagram"></i></a>
            <a href="#"><i className="fab fa-twitter"></i></a>
            <a href="#"><i className="fab fa-pinterest"></i></a>
            <a href="#"><i className="fab fa-youtube"></i></a>
          </div>
        </div>
        <div className="footer-col">
          <h4>Explore</h4>
          <a href="#">Paintings</a>
          <a href="#">Sculptures</a>
          <a href="#">Digital Art</a>
          <a href="#">Photography</a>
        </div>
        <div className="footer-col">
          <h4>Support</h4>
          <a href="#">Help Center</a>
          <a href="#">Returns</a>
          <a href="#">Contact</a>
          <a href="#">Privacy</a>
        </div>
        <div className="footer-col">
          <h4>Stay Inspired</h4>
          <div className="newsletter">
            <input type="email" placeholder="Email" />
            <button><i className="fas fa-arrow-right"></i></button>
          </div>
          <p className="copy">&copy; 2026 Canvas Tulika</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;