const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { promisify } = require('util');

const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};


exports.protect = catchAsync(async (req, res, next) => {
    // 1- getting token and check it it's there

    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('You need to login to access this page', 401));
    }

    // 2- verification token 
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3- check if user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(new AppError('The user of this token no longer exists', 401));
    }
    // 4- check if user changed password after the token was issued
    //iat => issued at
    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('Password has been changed recently, please try to login again', 401));
    }
    //grant access to protected routes

    req.user = freshUser;
    next();

});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles is an array
        //the reason this works is that in the previous middleware (protect) we made logged in and set req.user

        if (!roles.includes(req.user.role)) {
            return next(new AppError(`You do not have permission to perform this action`, 403));
        }
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    //1- get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with such email', 404));
    }
    //2- generate random reset token
    const resetToken = user.createPasswordResetToken();
    // await user.save({validateBeforeSave:false})
    //3- send it to user's email

});

exports.resetPassword = (req, res, next) => {

};

exports.signup = catchAsync(async (req, res, next) => {
    //we do that to enforce only the data we want
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });

    const token = signToken(newUser._id);
    res.status(201).json({
        status: 'success',
        token: token,
        data: {
            user: newUser
        }
    });
});



exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //1- check if email and password exists
    // 2- check if user exists and password is correct
    // 3- if all ok send token to client

    if (!email || !password) {
        return next(new AppError('You have to provide an email and a password', 400));
    }

    const user = await User.findOne({ email: { $eq: email } }).select('+password');

    let correct;
    if (user) {
        correct = await user.correctPassword(password, user.password);
    }


    if (!user || !correct) {
        return next(new AppError('This email-password combination is not found in our records', 401));
    }

    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token: token
    });


});