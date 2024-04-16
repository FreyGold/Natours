const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');
// name, email, photo, password, passConfirm

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'a user must have a name'],
  },
  email: {
    type: String,
    required: [true, 'a user must have an email'],
    lowercase: true,
    unique: true,
    validate: [validator.isEmail, 'invalid Email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['admin', 'user', 'guide', 'lead-guide'],
  },
  password: {
    type: String,
    required: [true, 'a user must have a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'please confirm your password'],
    validate: {
      // remember, this only works on create and saving a new doc
      validator: function (e) {
        return e === this.password;
      },
      message: 'passwords are not the same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});
userSchema.pre(/^find/, async function (next) {
  this.find({ active: { $ne: false } });
});
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  console.log('done');
  this.passwordChangedAt = Date.now() - 5000;
  next();
});
userSchema.methods.correctPassword = async (
  candidatePassword,
  userPassword,
) => {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = async function (JWTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = new Date(this.passwordChangedAt);
    const time = parseInt(changedTimeStamp.getTime() / 1000);
    console.log(JWTTimeStamp, time);
    return JWTTimeStamp < time;
  }
  return false;
};
userSchema.methods.createPassResetToken = async function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.passwordResetExpire = Date.now() + 10 * 60 * 100;
  return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
