const express = require('express');
const bookingController = require('../controllers/bookingController');
const authController = require('../controllers/authControllers');

const router = express.Router();

router.get(
  '/checkout-session/:tourId',
  authController.protect,
  bookingController.getCheckoutSession,
);

module.exports = router;
