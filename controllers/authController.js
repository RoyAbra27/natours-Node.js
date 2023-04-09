import Jwt from 'jsonwebtoken';
import { promisify } from 'util';
import crypto from 'crypto';
import User from '../models/userModel.js';
import { AppError } from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import Email from '../utils/email.js';

const signToken = (id) =>
  Jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.cookie('jwt', token, cookieOptions);

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

export const signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  newUser.password = undefined;

  // `${req.protocol}://${req.get('host')}/me`;
  const url = 'http://localhost:3000/me';
  await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  createSendToken(user, 200, res);
});

export const logout = (req, res) => {
  res.cookie('jwt', 'null', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
};

export const protect = catchAsync(async (req, res, next) => {
  let token;
  /* This is checking if the user is logged in. If the user is not logged in, it will throw an error. */
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }
  /* Verifying the token. */
  const decodedToken = await promisify(Jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  /* This is checking if the user still exists. If the user does not exist, it will throw an error. */
  const currentUser = await User.findById(decodedToken.id);
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }
  /* This is checking if the user has changed their password after the token was issued. If the user
  has changed their password after the token was issued, it will throw an error. */
  if (currentUser.changedPasswordAfter(decodedToken.iat)) {
    return next(
      new AppError(
        'Password has been changed recently. Please log in again.',
        401
      )
    );
  }
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

/**
 * If the user's role is not included in the roles array, then return a new AppError.
 * @param roles - an array of roles that are allowed to access the route
 */
export const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to preform this action.', 403)
      );
    }
    next();
  };

/* This is the forgot password route. It is checking if the user exists. If the user does not exist, it
will throw an error. It is also creating a reset token and saving it to the database. It is also
creating a reset URL and a message. It is sending an email to the user. If the email is not sent, it
will set the passwordResetToken and passwordResetExpires to undefined and save it to the database.
It will then throw an error. */
export const forgotPassword = catchAsync(async (req, res, next) => {
  /* This is checking if the user exists. If the user does not exist, it will throw an error. */
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There in no user with that email address.', 404));
  }
  /* This is creating a reset token and saving it to the database. It is also creating a reset URL and
  a message. */
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  /* Sending an email to the user. If the email is not sent, it will set the passwordResetToken and
  passwordResetExpires to undefined and save it to the database. It will then throw an error. */
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/reset-password/${resetToken}`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Please try again!',
        500
      )
    );
  }
});

/* This is the reset password route. It is checking if the token is valid and if it has expired. If the
token is valid and has not expired, it will update the user's password. It will then send a new
token to the user. */
export const resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});

/* Checking if the user's password is correct. If the user's password is not correct, it will throw an
error. It is also updating the user's password. It is then sending a new token to the user. */
export const updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, res);
});

export const isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      /* Verifying the token. */
      const decodedToken = await promisify(Jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      /* Checking if the user still exists. If the user does not exist, it will throw an error. */
      const currentUser = await User.findById(decodedToken.id);
      if (!currentUser) {
        return next();
      }
      /* Checking if the user has changed their password after the token was issued. If the user
  has changed their password after the token was issued, it will throw an error. */
      if (currentUser.changedPasswordAfter(decodedToken.iat)) {
        return next();
      }
      res.locals.user = currentUser;
      return next();
    } catch (error) {
      return next();
    }
  }
  next();
};
