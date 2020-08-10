const express = require('express');
const userRouter = express.Router();
const {forgotPassword, resetPassword,updatePassword, protect} = require('../controllers/authController')
const { getAllUsers, getUser, updateUser, deleteUser, createUser, updateMe,deleteMe } = require('../controllers/userController');
const { signup, login } = require('../controllers/authController');


userRouter.post('/signup', signup);
userRouter.post('/login', login);

userRouter.post('/forgotPassword', forgotPassword)
userRouter.patch('/resetPassword/:token', resetPassword)
userRouter.patch('/updatePassword', protect,updatePassword)

userRouter.patch('/updateMe', protect, updateMe)
userRouter.delete('/deleteMe', protect, deleteMe)


userRouter
    .route('/')
    .get(getAllUsers)
    .post(createUser);

userRouter
    .route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);


module.exports = userRouter;