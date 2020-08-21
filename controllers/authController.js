const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const appError = require('../utils/appError');
const Email = require('../utils/email');
const { promisify } = require('util');
const crypto = require('crypto');

const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode,req, res) => {

    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure:req.secure || req.headers('x-forwarded-proto')==='https'
    };
    

    res.cookie('jwt', token, cookieOptions);
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token: token,
        data: {
            user: user
        }
    });

};


exports.protect = catchAsync(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return next(new appError('You need to login to access this page', 401));
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(new appError('The user of this token no longer exists', 401));
    }

    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new appError('Password has been changed recently, please try to login again', 401));
    }
    req.user = freshUser;
    res.locals.user = freshUser;
    next();

});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new appError(`You do not have permission to perform this action`, 403));
        }
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new appError('There is no user with such email', 404));
    }
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}`;

    try {

        await new Email(user, resetURL).sendPasswordReset();

        res.status(200).json({
            status: 'success',
            message: `Token sent to ${user.email}`
        });


    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpired = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new appError('There was an error sending the email, please try again', 500));
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {

    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

    if (!user) {
        return next(new appError('Token is invalid or has expired', 400));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpired = undefined;
    await user.save();
    createSendToken(user, 200,req, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
        return next(new appError('This email-password combination does not exist', 401));
    }

    let correct = await user.correctPassword(req.body.password, user.password);

    if (!correct) {
        return next(new appError('This email-password combination does not exist', 401));
    }

    user.password = req.body.newPassword;
    user.confirmPassword = req.body.confirmPassword;

    await user.save();

    createSendToken(user, 200,req, res);
});

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        passwordChangedAt: req.body.passwordChangedAt,
        role: req.body.role
    });
    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 201, req, res);

});



exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new appError('You have to provide an email and a password', 400));
    }

    const user = await User.findOne({ email: { $eq: email } }).select('+password');

    let correct;
    if (user) {
        correct = await user.correctPassword(password, user.password);
    }


    if (!user || !correct) {
        return next(new appError('This email-password combination is not found in our records', 401));
    }

    createSendToken(user, 200,req, res);

});

exports.isLoggedIn = async (req, res, next) => {
    let token;
    try {
        if (req.cookies.jwt) {
            token = req.cookies.jwt;
            const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
            const freshUser = await User.findById(decoded.id);
            if (!freshUser) {
                return next();
            }

            if (freshUser.changedPasswordAfter(decoded.iat)) {
                return next();
            }

            res.locals.user = freshUser;
            next();

        }
        if (!token) {
            return next();
        }
    } catch (err) {
        next();
    }



};

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    });
    res.status(200).json({ status: 'success' });
};
