import Express from 'express';
import { protect, restrictTo } from '../controllers/authController.js';
import {
  getCheckoutSession,
  getAllBookings,
  getBooking,
  createBooking,
  deleteBooking,
  updateBooking,
} from '../controllers/bookingController.js';

const router = Express.Router();

router.use(protect);

router.get('/checkout-session/:tourId', getCheckoutSession);

router.use(restrictTo('admin', 'lead-guide'));

router.route('/').get(getAllBookings).post(createBooking);

router.route('/:id').get(getBooking).patch(updateBooking).delete(deleteBooking);

export { router as bookingRouter };
