import Express from 'express';
import { isLoggedIn, protect } from '../controllers/authController.js';
import {
  getOverview,
  getTour,
  getLoginForm,
  getAccount,
  getMyBookings,
} from '../controllers/viewsController.js';
import { createBookingCheckout } from '../controllers/bookingController.js';

const router = Express.Router();

router.get('/me', protect, getAccount);
router.get('/my-bookings', protect, getMyBookings);

router.get('/', createBookingCheckout, isLoggedIn, getOverview);
router.get('/tour/:slug', isLoggedIn, getTour);
router.get('/login', isLoggedIn, getLoginForm);

export { router as viewRouter };
