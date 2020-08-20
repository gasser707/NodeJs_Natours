const express = require('express');
const userRouter = express.Router();
const { forgotPassword, resetPassword, updatePassword, protect, restrictTo, logout} = require('../controllers/authController');
const { getAllUsers, getUser, updateUser, deleteUser, updateMe, deleteMe, getMe, uploadUserPhoto, resizeUserPhoto } = require('../controllers/userController');
const { signup, login } = require('../controllers/authController');


userRouter.post('/signup', signup);
userRouter.post('/login', login);
userRouter.get('/logout', logout)
userRouter.post('/forgotPassword', forgotPassword);
userRouter.patch('/resetPassword/:token', resetPassword);

userRouter.use(protect)
userRouter.patch('/updatePassword',updatePassword);
userRouter.get('/me', getMe, getUser);
userRouter.patch('/updateMe', uploadUserPhoto, resizeUserPhoto,updateMe);
userRouter.delete('/deleteMe', deleteMe);

userRouter.use(restrictTo('admin'))
userRouter
    .route('/')
    .get(getAllUsers);

userRouter
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

module.exports = userRouter;