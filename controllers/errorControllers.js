const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDublicateFieldsDB = (err) => {
  const value = err.keyValue.name;
  const message = `Duplicate field value: ${value}, Please use another value!`;
  return new AppError(message, 400);
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
  });
};
const handleJWTError = (err) => new AppError('invalid token', 400);
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'something went wrong! ',
    });
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name == 'CastError') error = handleCastErrorDB(error);
    if (err.name == 'JsonWebTokenError') error = handleJWTError(error);
    if (err.code == 11000) error = handleDublicateFieldsDB(error);
    sendErrorProd(error, res);
  }
};
