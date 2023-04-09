/* eslint-disable import/no-extraneous-dependencies */
import './utils/config.js';
import Express from 'express';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import { fileURLToPath } from 'url';
import path from 'path';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import { tourRouter } from './routes/tourRoutes.js';
import { userRouter } from './routes/userRoutes.js';
import { globalErrorHandler } from './controllers/errorController.js';
import { reviewRouter } from './routes/reviewRoutes.js';
import { viewRouter } from './routes/viewRoutes.js';
import { bookingRouter } from './routes/bookingRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = Express();

/* Setting the view engine to pug and the views to the views folder. */
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

/* Serving the static files in the public folder. */
app.use(Express.static(path.join(__dirname, 'public')));

/* A security package that sets some HTTP headers. */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
  })
);

/* Checking if the environment is development, if it is, it will use morgan to log the requests. */
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

/* Limiting the number of requests to 100 per hour. */
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests, Please try again later.',
});
app.use('/api', limiter);

/* A middleware that will parse the body of the request and make it available in the request object. */
app.use(Express.json({ limit: '10kb' }));

app.use(cookieParser());

/* A middleware that will sanitize the request body, query string, and parameters. It will remove the $
and . characters from the request. */
app.use(ExpressMongoSanitize());

/* A middleware that will prevent the parameter pollution. */
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
app.use(compression());
// ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/booking', bookingRouter);

/* A middleware that will catch all the errors that are not caught by the other middlewares. */
app.use(globalErrorHandler);

export default app;
