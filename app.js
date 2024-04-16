const express = require('express');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorControllers');
const app = express();
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const usersRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssProtect = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
//
//
//
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
/////// Global Middlewares
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
///Rate limit
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

///Security HTTP Headers
app.use(helmet());

///Mongo Sanitize Queries
app.use(mongoSanitize());

///Xss Protection
app.use(xssProtect());

///Prevent Parameter Pollution
app.use(
  hpp({
    whitelist: ['duration', 'price', 'difficulty'],
  }),
);

/////// Functions

///// Tours Funcs
///// Users Funcs

/////// Routing
// app.use('/', (req, res) => {
//   res.status(200).render('base', {
//     tour: 'The Forest',
//     user: 'Ahmed',
//   });
// });
//// Tours
app.use('/api/v1/tours', tourRouter);

//// Users
app.use('/api/v1/users', usersRouter);

//// Reviews
app.use('/api/v1/reviews', reviewRouter);

//// Bookings
app.use('/api/v1/booking', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});
/// return this when you
// app.use(globalErrorHandler);
/////// Server Start
module.exports = app;
