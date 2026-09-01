


// eslint-disable-next-line no-unused-vars
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import SearchModal from './SearchModal';
import LoginModal from '../auth/LoginModal';
import { Search, User, LayoutDashboard, LogOut, UserCircle, Settings } from 'lucide-react';
import './CSS/header.css';

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const themes = [
    { value: 'light', label: 'Light', icon: 'fa-sun' },
    { value: 'dark', label: 'Dark', icon: 'fa-moon' },
    { value: 'sepia', label: 'Sepia', icon: 'fa-image' },
    { value: 'system', label: 'System', icon: 'fa-desktop' },
  ];

  const getCurrentThemeLabel = () => {
    const found = themes.find(t => t.value === theme);
    return found ? found.label : 'Light';
  };

  const getCurrentThemeIcon = () => {
    const found = themes.find(t => t.value === theme);
    return found ? found.icon : 'fa-sun';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignIn = () => {
    setShowLoginModal(true);
  };

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      setIsProfileDropdownOpen(!isProfileDropdownOpen);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleDashboardNavigation = () => {
    setIsProfileDropdownOpen(false);
    if (user?.role === 'admin') {
      navigate('/admin/dashboard');
    } else if (user?.role === 'artist') {
      navigate('/artist/dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleProfileNavigation = () => {
    setIsProfileDropdownOpen(false);
    navigate('/profile');
  };

  const getInitials = () => {
    if (!user?.fullName) return 'U';
    return user.fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header className="header">
        <div className="header-container">
          {/* Logo */}
          <div className="logo-area" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span className="logo-icon">
              <i className="fas fa-palette"></i>
            </span>
            <span className="logo-text">Canvas Tulika</span>
          </div>

          {/* Navigation */}
          <nav className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
            <Link to="/">Explore</Link>
            <Link to="/artists">Artists</Link>
            <Link to="/collections">Collections</Link>
            <Link to="/bidding" className="bid-link">
              <i className="fas fa-gavel"></i> Bidding
            </Link>
          </nav>

          {/* Actions */}
          <div className="header-actions">
            <button 
              className="search-btn" 
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Theme Dropdown */}
            <div className="theme-dropdown">
              <button 
                className="theme-dropdown-toggle"
                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                aria-label="Toggle theme"
              >
                <i className={`fas ${getCurrentThemeIcon()}`}></i>
                <span>{getCurrentThemeLabel()}</span>
                <i className={`fas fa-chevron-down ${isThemeDropdownOpen ? 'open' : ''}`}></i>
              </button>
              
              {isThemeDropdownOpen && (
                <div className="theme-dropdown-menu">
                  {themes.map((t) => (
                    <button
                      key={t.value}
                      className={`theme-option ${theme === t.value ? 'active' : ''}`}
                      onClick={() => {
                        toggleTheme(t.value);
                        setIsThemeDropdownOpen(false);
                      }}
                    >
                      <i className={`fas ${t.icon}`}></i>
                      <span>{t.label}</span>
                      {theme === t.value && <i className="fas fa-check check-icon"></i>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Icon with Dropdown */}
            <div className="profile-dropdown" ref={dropdownRef}>
              {isAuthenticated ? (
                <>
                  <button 
                    className="profile-btn"
                    onClick={handleProfileClick}
                    aria-label="Profile"
                  >
                    <div className="avatar">
                      {getInitials()}
                    </div>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="profile-dropdown-menu">
                      <div className="dropdown-header">
                        <div className="dropdown-avatar">
                          {getInitials()}
                        </div>
                        <div className="dropdown-user-info">
                          <span className="dropdown-user-name">{user?.fullName || 'User'}</span>
                          <span className="dropdown-user-email">{user?.email}</span>
                          <span className={`dropdown-user-role ${user?.role}`}>
                            {user?.role?.toUpperCase() || 'USER'}
                          </span>
                        </div>
                      </div>

                      <div className="dropdown-divider"></div>

                      <button 
                        className="dropdown-item"
                        onClick={handleDashboardNavigation}
                      >
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                      </button>

                      <button 
                        className="dropdown-item"
                        onClick={handleProfileNavigation}
                      >
                        <UserCircle size={18} />
                        <span>Profile</span>
                      </button>

                      <button 
                        className="dropdown-item"
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          // Navigate to settings
                        }}
                      >
                        <Settings size={18} />
                        <span>Settings</span>
                      </button>

                      <div className="dropdown-divider"></div>

                      <button 
                        className="dropdown-item dropdown-logout"
                        onClick={handleLogout}
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button 
                  className="profile-btn"
                  onClick={handleProfileClick}
                  aria-label="Sign In"
                >
                  <User size={20} />
                </button>
              )}
            </div>

            {/* Sign In / Logout Button - Hidden when authenticated (using profile dropdown instead) */}
            {!isAuthenticated && (
              <button className="sign-in-btn" onClick={handleSignIn}>
                <i className="fas fa-user-circle"></i>
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </header>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        returnUrl={window.location.pathname}
      />
    </>
  );
};

export default Header;