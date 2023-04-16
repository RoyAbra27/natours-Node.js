import multer from 'multer';
import sharp from 'sharp';
import { AppError } from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import User from '../models/userModel.js';
import { deleteOne, getAll, getOne, updateOne } from './handlerFactory.js';

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Please upload only images ', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadUserPhoto = upload.single('photo');
export const resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

export const getAllUsers = getAll(User);

export const getUser = getOne(User);

export const updateUserAdmin = updateOne(User);

export const deleteUser = deleteOne(User);

/**
 * If the user is logged in, then set the user's id to the request's id parameter.
 */
export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

/**
 * It takes an object and an array of allowed fields, and returns a new object with only those allowed
 * fields.
 * @param obj - the object to filter
 * @param allowedFields - an array of strings that are allowed to be in the new object
 */
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const updateLoggedUser = catchAsync(async (req, res, next) => {
  /* Checking if the user is trying to update the password or passwordConfirm fields. If they are, it
  will throw an error. */
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use the correct route.',
        400
      )
    );
  }
  /* Filtering the body of the request to only allow the name and email fields to be updated. */
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  /* Updating the user with the id of the logged user. It is using the filteredBody object to update
  the user. */
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
    returnDocument: 'after',
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

export const deactivateUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
