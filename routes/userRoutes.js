const express = require('express');
const userController = require('../controllers/userControllers');
const authController = require('../controllers/authControllers');

const router = express.Router();

router.post('/signup', authController.signup);

router.post('/signin', authController.login);

router.post('/forgotPassword', authController.forgotPassword);

router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);

router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe,
);
router.get(
  '/me',

  userController.getMe,
  userController.getUser,
);
router.delete(
  '/deleteMe',

  userController.getMe,
  userController.deleteMe,
);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
