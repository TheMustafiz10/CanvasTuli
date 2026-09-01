

import express from 'express';
import { 
  getUserDashboard,
  getArtistDashboard,
  getAdminDashboard,
  getMyBids,
  getWonAuctions,
  getNotifications,
  markNotificationRead,
  getSalesAnalytics,
  getArtistEarnings,
  getRecentOrders,
  getUserStats,
  updateUserStatus,
  getPendingPayments 
} from '../controllers/dashboardController.js';
import { auth, roles } from '../middleware/auth.js';

const router = express.Router();




// User Dashboard (Customer)
router.get('/user', auth, roles('customer'), getUserDashboard);
router.get('/user/bids', auth, roles('customer'), getMyBids);
router.get('/user/won', auth, roles('customer'), getWonAuctions);
router.get('/user/notifications', auth, roles('customer'), getNotifications);
router.put('/user/notifications/:id/read', auth, roles('customer'), markNotificationRead);
router.get('/user/pending-payments', auth, roles('customer'), getPendingPayments);



// Artist Dashboard
router.get('/artist', auth, roles('artist'), getArtistDashboard);
router.get('/artist/sales', auth, roles('artist'), getSalesAnalytics);
router.get('/artist/earnings', auth, roles('artist'), getArtistEarnings);




// Admin Dashboard
router.get('/admin', auth, roles('admin'), getAdminDashboard);
router.get('/admin/orders', auth, roles('admin'), getRecentOrders);
router.get('/admin/stats', auth, roles('admin'), getUserStats);
router.put('/admin/users/:userId', auth, roles('admin'), updateUserStatus);

export default router;