// import { AppError } from '../utils/appError.js';
import Review from '../models/reviewModel.js';
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from './handlerFactory.js';

export const getAllReviews = getAll(Review, [{ path: 'tour', select: 'name' }]);

export const getReview = getOne(Review, [{ path: 'tour', select: 'name' }]);

export const createReview = createOne(Review);

export const updateReview = updateOne(Review);

export const deleteReview = deleteOne(Review);

/**
 * This function is called before the createReview function and it sets the user and tour ids in the
 * request body.
 */
export const setTourUserIds = (req, res, next) => {
  req.body.user = req.user.id;
  req.body.tour = req.params.tourId;
  next();
};
