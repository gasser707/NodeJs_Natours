const express = require('express');
const multer = require('multer');
const userRouter = express.Router();
const { forgotPassword, resetPassword, updatePassword, protect, restrictTo, logout} = require('../controllers/authController');
const { getAllUsers, getUser, updateUser, deleteUser, updateMe, deleteMe, getMe } = require('../controllers/userController');
const { signup, login } = require('../controllers/authController');

const upload = multer({ dest: 'public/img/users' });

userRouter.post('/signup', signup);
userRouter.post('/login', login);
userRouter.get('/logout', logout)
userRouter.post('/forgotPassword', forgotPassword);
userRouter.patch('/resetPassword/:token', resetPassword);


//starting here we protect all routes
userRouter.use(protect)
userRouter.patch('/updatePassword',updatePassword);
userRouter.get('/me', upload.single('photo'),getMe, getUser);
userRouter.patch('/updateMe', updateMe);
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