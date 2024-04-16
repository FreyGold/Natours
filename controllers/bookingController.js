const Tour = require('../models/tourModels');
const stripe = require('stripe')(
  'sk_test_51P5vO5RsQxGdQtL97wBFUypMzbAiAQnMJzcXCrGWirvc6MVa4cDQ9g2Uz1CBLD5heYIVzdtO9FSvannjMcwsagkU00OgMi7BT4',
);
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) get current tour
  const tour = await Tour.findById(req.params.tourId);
  // 2) create Stripe Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
          },
          unit_amount: tour.price * 100,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour`,
  });

  res.status(200).json({
    status: 'success',
    session,
  });
});
