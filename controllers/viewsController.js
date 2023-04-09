import Booking from '../models/bookingModel.js';
import Tour from '../models/tourModel.js';
import { AppError } from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

export const getOverview = catchAsync(async (req, res, next) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

export const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug })
    .populate({
      path: 'guides',
      select: '-__v -passwordChangedAt',
    })
    .populate({
      path: 'reviews',
      select: 'review rating user',
    });
  if (!tour) {
    return next(new AppError('There is no such tour.', 404));
  }
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

export const getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Login',
  });
};

export const getAccount = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

export const getMyBookings = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });
  const tourIDs = bookings.map((el) => el.tour);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  res.status(200).render('overview', {
    title: 'My Tours',
    tours,
  });
});
