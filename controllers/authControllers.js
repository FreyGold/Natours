const { promisify } = require('util');
const Email = require('../utils/email');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

const createSendCookie = (user, status, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  };
  if (process.env.NODE_ENV == 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(status).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    name: req.body.name,
  });

  // const token = signToken(newUser._id);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  //   data: {
  //     user: newUser,
  //   },
  // });
  const url = 0;
  await new Email(newUser, url).sendWelcome();
  createSendCookie(newUser, 200, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('please provide email and password!', 400));
  }
  ///
  const user = await User.findOne({ email: email }).select('+password');
  let correct;
  if (user) {
    correct = await user.correctPassword(password, user.password);
  }
  if (!user || !correct) {
    return next(new AppError('incorrect email or password!', 401));
  }
  ///
  createSendCookie(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // check if there is a token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  //// check token
  if (!token) {
    return next(
      new AppError(
        'You are not logged in!, please sign in to have access',
        401,
      ),
    );
  }
  ///// verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  ///// check if users still exists
  const userExists = await User.findById(decoded.id);
  if (!userExists) {
    return next(new AppError('user no longer exist', 401));
  }
  ////check if password changed after token
  if (await userExists.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('Password recently changed, please login again!', 401),
    );
  }
  /// grant access
  req.user = userExists;
  next();
});
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("you don't have permission", 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //get user based on POSTed email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(
      new AppError(
        'if you entered a right email you will recive a message',
        200,
      ),
    );
  }
  //generate random reset token
  const token = await user.createPassResetToken();
  await user.save({ validateBeforeSave: false });
  //send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${token}`;
  const message = `submit the new pass to the ${resetURL}, ignore if u didn't request reset`;
  try {
    await new Email(user).sendPasswordReset(resetURL);

    res.status(200).json({
      status: 'success',
      message: 'token sent to mail!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new AppError('there was an error sending this email', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpire: { $gt: Date.now() },
  });
  //set new pass if token and user are valid
  if (!user) {
    return next(new AppError('token is invalid or expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpire = undefined;
  await user.save();
  //update changedPasswordAt proberty for user
  //login user and send JWT token
  createSendCookie(user, 200, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  // get user
  const user = await User.findById(req.user.id).select('+password');
  // check if POSTed pass is correct
  const correct = await user.correctPassword(
    req.body.currentPassword,
    user.password,
  );
  if (!correct) return next(new AppError('incorrect current password'));
  // update password if correct
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // log user and send JWT
  const JWTtoken = signToken(user._id);
  res.status(200).json({
    status: 'success',
    JWTtoken,
  });
});
