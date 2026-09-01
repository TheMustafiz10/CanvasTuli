

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import SocketProvider from './context/SocketContext'; 
import Header from './components/homepage/Header';
import Homepage from './components/homepage/Homepage';
import AuctionPage from './components/auction/AuctionPage';
import BiddingPage from './components/auction/BiddingPage';
import ArtistDashboard from './components/artist/ArtistDashboard';
import UserDashboard from './components/dashboard/UserDashboard';
import AuthGuard from './components/auth/AuthGuard';
import ErrorBoundary from './components/ErrorBoundary';
import ArtistsPage from './components/artists/ArtistsPage';
import CollectionsPage from './components/collections/CollectionsPage';
import CartPage from './components/cart/CartPage';
import PaymentPage from './components/payment/PaymentPage';
import AdminDashboard from './components/admin/AdminDashboard';
import LoginPage from './pages/LoginPage';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <div className="app">
              <Header />
              <Toaster position="top-right" />

              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Homepage />} />
                <Route path="/bidding" element={<BiddingPage />} />
                <Route path="/artists" element={<ArtistsPage />} />
                <Route path="/collections" element={<CollectionsPage />} />
      
                <Route path="/login" element={<LoginPage />} />
                



                {/* Auction Route  */}
                <Route 
                  path="/auction/:auctionId" 
                  element={
                    <ErrorBoundary>
                      <AuctionPage />
                    </ErrorBoundary>
                  } 
                />

                {/* Cart Route */}
                <Route path="/cart" element={
                  <AuthGuard>
                    <CartPage />
                  </AuthGuard>
                } />
           
           
                {/* Payment Route */}
                {/* <Route path="/payment/:auctionId" element={
                  <AuthGuard>
                    <PaymentPage />
                  </AuthGuard>
                } /> */}

                <Route path="/payment/success" element={
                  <AuthGuard>
                    <PaymentPage />
                  </AuthGuard>
                } />

                <Route path="/payment/:orderId" element={
                  <AuthGuard>
                    <PaymentPage />
                  </AuthGuard>
                } />

         


                                
                {/* Customer Dashboard - Only customers can access */}
                <Route 
                  path="/dashboard" 
                  element={
                    <AuthGuard allowedRoles={['customer']}>
                      <UserDashboard />
                    </AuthGuard>
                  } 
                />
                
                {/* Artist Dashboard - Only artists can access */}
                <Route 
                  path="/artist/dashboard" 
                  element={
                    <AuthGuard allowedRoles={['artist']}>
                      <ArtistDashboard />
                    </AuthGuard>
                  } 
                />
                
                {/* Admin Dashboard - Only admins can access */}
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <AuthGuard allowedRoles={['admin']}>
                      <AdminDashboard />
                    </AuthGuard>
                  } 
                />
              </Routes>
            </div>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;