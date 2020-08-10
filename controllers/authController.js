const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const sendEmail = require('../utils/email');
const { promisify } = require('util');
const crypto = require('crypto');

const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user,statusCode, res)=>{

    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now()+ process.env.JWT_COOKIE_EXPIRES_IN *24* 60 *60 * 1000),
        httpOnly:true
    }
    if(process.env.NODE_ENV ==='production') cookieOptions.secure = true

    res.cookie('jwt', token, cookieOptions)
    user.password = undefined
    res.status(statusCode).json({
        status: 'success',
        token: token,
        data: {
            user: user
        }
    });

}


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
    await user.save({ validateBeforeSave: false });
    //3- send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}`;
    const message = `Forgot your password? click here to reset your password:${resetURL}\n
    if you didn't then please ignore this email `;


    try {

        await sendEmail({
            email: user.email,
            subject: 'Reset your password in 10 mins',
            message: message
        });

        res.status(200).json({
            status: 'success',
            message: `Token sent to ${user.email}`
        });


    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpired = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('There was an error sending the email, please try again', 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //1- get user based on the token

    //2- if token has not expired, and there is a user, set the new password 

    //3- update changed password at property for the user

    //4- log the user, send jwt
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    console.log(hashedToken);

    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpired = undefined;

    //we use save to update because we want to run all validators and use save middleware function
    await user.save();
    createSendToken(user, 200, res)
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    //1- get user from db
    //2- check if POSTed current password is correct
    //3- if so, update password
    //log in user , send jwt

    //req.user is legit coz it comes from protect middleware
    const user = await User.findById(req.user._id).select('+password');
    //we used select:false in model to hide it so we show it with +

    if (!user) {
        return next(new AppError('This email-password combination does not exist', 401));
    }

    let correct = await user.correctPassword(req.body.password, user.password);

    if(!correct){
        return next(new AppError('This email-password combination does not exist', 401));
    }

    user.password = req.body.newPassword;
    user.confirmPassword = req.body.confirmPassword;

    await user.save();

    createSendToken(user, 200, res)


});

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

    createSendToken(newUser, 201, res)
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

   createSendToken(user, 200, res)

});