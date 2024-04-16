const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authControllers');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user', 'admin'),
    reviewController.setUserTourId,
    reviewController.createNewReview,
  );

router
  .route('/:id')
  .delete(reviewController.deleteReview)
  .patch(reviewController.updateReview);
router;

module.exports = router;
