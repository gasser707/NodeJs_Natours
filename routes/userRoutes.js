const express = require('express');
const userRouter = express.Router();

const { getAllUsers, getUser, updateUser, deleteUser, createUser } = require('../controllers/userController');
const { signup, login } = require('../controllers/authController');


userRouter.post('/signup', signup);
userRouter.post('/login', login);


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