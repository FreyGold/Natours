// 1- Create review controller and implement (get Review By id), (get all reviews), (add new review (post))
// 2- Create review Router and implement the routes
const Review = require('../models/reviewModels');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const handler = require('../controllers/handlerFactory');

exports.setUserTourId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// exports.getReviewById = catchAsync(async (req, res, next) => {
//   const review = await Review.findById(req.params.id);
//   if (!review) return next(new AppError('no review by this id exists', 404));
//   res.status(200).json({
//     status: 'success',
//     data: {
//       review,
//     },
//   });
// });

exports.createNewReview = handler.createOne(Review);
exports.getAllReviews = handler.getAll(Review);
exports.deleteReview = handler.deleteOne(Review);
exports.updateReview = handler.updateOne(Review);
