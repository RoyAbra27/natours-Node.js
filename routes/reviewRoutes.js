import Express from 'express';
import { protect, restrictTo } from '../controllers/authController.js';
import {
  createReview,
  deleteReview,
  getAllReviews,
  getReview,
  setTourUserIds,
  updateReview,
} from '../controllers/reviewController.js';

const router = Express.Router({ mergeParams: true });

router
  .route('/')
  .get(getAllReviews)
  .post(protect, restrictTo('user'), setTourUserIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(protect, restrictTo('admin', 'user'), updateReview)
  .delete(protect, restrictTo('admin', 'user'), deleteReview);

export { router as reviewRouter };
