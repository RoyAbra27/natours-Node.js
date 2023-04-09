import { APIFeatures } from '../utils/apiFeatures.js';
import { AppError } from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';

// Global handle functions for the controllers

/**
 * It takes a Mongoose model as an argument, and returns a function that takes a request, response, and
 * next function as arguments, and deletes a document from the database based on the id in the request
 * parameters.
 * @param Model - The model that we want to delete a document from.
 */
export const deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

/**
 * It takes a Mongoose model as an argument, and returns a function that takes a request, response, and
 * next function as arguments, and returns a response with the updated document.
 * @param Model - The model that we want to update.
 */
export const updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      returnDocument: 'after',
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

/**
 * It creates a new document in the database and returns it to the client
 * @param Model - The model that we want to create a document for.
 */
export const createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        newDoc,
      },
    });
  });

/**
 * It takes a model and an array of populate options and returns a function that takes a request,
 * response and next function and returns a document with the given id and populates it with the given
 * options
 * @param Model - The model you want to query
 * @param popOptions - an array of strings that are the names of the fields that you want to populate.
 */
export const getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions)
      popOptions.forEach((element) => {
        query = query.populate(element);
      });
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

/**
 * It takes in a model, and an array of options to populate, and returns a function that takes in a
 * request, response, and next, and returns a response with the populated data
 * @param Model - The model that you want to query
 * @param popOptions - an array of strings that are the names of the fields that you want to populate.
 */
export const getAll = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    /* Checking if the request has a tourId in the params, and if it does, it sets the filter to be the
    tourId.  JUST FOR GETTING REVIEWS*/
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    if (popOptions)
      popOptions.forEach((element) => {
        features.query = features.query.populate(element);
      });
    const doc = await features.query;

    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        doc,
      },
    });
  });
