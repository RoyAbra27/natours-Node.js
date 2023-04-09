import Stripe from 'stripe';
import Tour from '../models/tourModel.js';
// import { AppError } from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import Booking from '../models/bookingModel.js';
import {
  createOne,
  deleteOne,
  getAll,
  getOne,
  updateOne,
} from './handlerFactory.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getCheckoutSession = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);
  const session = await stripe.checkout.sessions.create({
    success_url: `http://localhost:3000/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `http://localhost:3000/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
  });
  res.status(200).json({
    status: 'success',
    session,
    url: session.url,
  });
});

export const createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();
  await Booking.create({ tour, user, price });
  res.redirect(req.originalUrl.split('?')[0]);
});

export const getAllBookings = getAll(Booking);

export const getBooking = getOne(Booking);

export const createBooking = createOne(Booking);

export const updateBooking = updateOne(Booking);

export const deleteBooking = deleteOne(Booking);
