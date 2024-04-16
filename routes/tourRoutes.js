const express = require('express');
const tourController = require('../controllers/tourControllers');
const authController = require('../controllers/authControllers');
const reviewRoutes = require('../routes/reviewRoutes');
const router = express.Router();

// router.param('id', tourController.checkId);
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
//
router.route('/tour-stats').get(tourController.getTourStats);
//
router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
//
router
  .route('/')
  .get(authController.protect, tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.createNewTour,
  );
//
router
  .route('/:id')
  .get(tourController.getToursById)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour,
  );
router.use('/:tourId/reviews', reviewRoutes);
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.addNewReview,
//   );

module.exports = router;
